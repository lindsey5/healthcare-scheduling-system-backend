import { Op } from "sequelize";
import dotenv from "dotenv";
import EmailJob from "../models/EmailJob";
import { sequelize } from "../config/db";
import { deliverEmailJob } from "../services/emailService";

dotenv.config();

const POLL_INTERVAL_MS = Number(process.env.EMAIL_WORKER_POLL_INTERVAL_MS) || 1000;
const MAX_ATTEMPTS = Number(process.env.EMAIL_WORKER_MAX_ATTEMPTS) || 5;
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;
const RETRY_DELAY_MS = 1000;

const wait = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

const claimNextJob = async () => {
    const transaction = await sequelize.transaction();

    try {
        const now = new Date();
        const staleLock = new Date(now.getTime() - LOCK_TIMEOUT_MS);
        const job = await EmailJob.findOne({
            where: {
                [Op.or]: [
                    {
                        status: "queued",
                        availableAt: { [Op.lte]: now },
                    },
                    {
                        status: "processing",
                        lockedAt: { [Op.lte]: staleLock },
                    },
                ],
            },
            order: [["createdAt", "ASC"], ["id", "ASC"]],
            transaction,
            lock: transaction.LOCK.UPDATE,
            skipLocked: true,
        });

        if (!job) {
            await transaction.commit();
            return null;
        }

        if (job.attempts >= MAX_ATTEMPTS) {
            job.status = "failed";
            job.payload = null;
            job.lockedAt = null;
            job.lastError ??= "Email job exceeded the maximum retry count.";
            await job.save({ transaction });
            await transaction.commit();
            return null;
        }

        job.status = "processing";
        job.attempts += 1;
        job.lockedAt = now;
        await job.save({ transaction });
        await transaction.commit();

        return job;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const markSent = async (job: EmailJob) => {
    job.status = "sent";
    job.payload = null;
    job.lockedAt = null;
    job.lastError = null;
    await job.save();
};

const markFailedOrRetry = async (job: EmailJob, error: unknown) => {
    const errorMessage =
        error instanceof Error ? error.message : "Unknown email delivery error";
    job.lastError = errorMessage.slice(0, 2000);
    job.lockedAt = null;

    if (job.attempts >= MAX_ATTEMPTS) {
        job.status = "failed";
        job.payload = null;
        console.error(
            `Email job ${job.id} failed after ${job.attempts} attempts: ${job.lastError}`
        );
    } else {
        job.status = "queued";
        job.availableAt = new Date(
            Date.now() + RETRY_DELAY_MS * 2 ** (job.attempts - 1)
        );
        console.warn(
            `Email job ${job.id} failed; retry ${job.attempts + 1}/${MAX_ATTEMPTS} scheduled: ${job.lastError}`
        );
    }

    await job.save();
};

const processNextJob = async () => {
    const job = await claimNextJob();

    if (!job) {
        return false;
    }

    try {
        if (!job.payload) {
            throw new Error("Email job payload is missing.");
        }

        await deliverEmailJob(job.type, job.payload);
        await markSent(job);
        console.info(`Email job ${job.id} sent.`);
    } catch (error) {
        await markFailedOrRetry(job, error);
    }

    return true;
};

const shutdown = async () => {
    console.info("Email worker shutting down.");
    await sequelize.close();
    process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

const run = async () => {
    await sequelize.authenticate();
    console.info("Email worker connected to PostgreSQL.");

    while (true) {
        try {
            const processed = await processNextJob();
            if (!processed) {
                await wait(POLL_INTERVAL_MS);
            }
        } catch (error) {
            console.error("Email worker encountered an error:", error);
            await wait(POLL_INTERVAL_MS);
        }
    }
};

run().catch((error) => {
    console.error("Email worker could not start:", error);
    process.exitCode = 1;
});
