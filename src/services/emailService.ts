import { BrevoClient } from "@getbrevo/brevo";
import { randomInt } from "crypto";
import dotenv from "dotenv";
import type { Transaction } from "sequelize";
import {
    appointmentRescheduledTemplate,
    appointmentUpdateTemplate,
    resetPasswordTemplate,
    verificationCodeTemplate,
} from "../templates/emailTemplates";
import {
    type EmailJobPayload,
    type EmailJobType,
} from "../models/EmailJob";
import { enqueueEmail } from "./emailQueueService";

dotenv.config();

const getBrevoClient = () => {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        throw new Error("BREVO_API_KEY is required to send queued emails.");
    }

    return new BrevoClient({ apiKey });
};

const getSender = () => {
    const email = process.env.EMAIL_USER;

    if (!email) {
        throw new Error("EMAIL_USER is required to send queued emails.");
    }

    return {
        name: "Bagumbayan Healthcare Scheduling System",
        email,
    };
};

const requiredValue = (value: string | undefined, field: string) => {
    if (!value) {
        throw new Error(`Email job is missing ${field}.`);
    }

    return value;
};

export const deliverEmailJob = async (
    type: EmailJobType,
    payload: EmailJobPayload
) => {
    const to = requiredValue(payload.to, "recipient");
    let subject: string;
    let htmlContent: string;

    switch (type) {
        case "verification_code":
            subject =
                "Bagumbayan Healthcare Scheduling System - Verification Code";
            htmlContent = verificationCodeTemplate(
                requiredValue(payload.verificationCode, "verification code")
            );
            break;
        case "appointment_update":
            subject = `Appointment Status Update - ${requiredValue(
                payload.referenceNumber,
                "reference number"
            )}`;
            htmlContent = appointmentUpdateTemplate({
                prevStatus: requiredValue(payload.previousStatus, "previous status"),
                newStatus: requiredValue(payload.newStatus, "new status"),
                referenceNumber: requiredValue(
                    payload.referenceNumber,
                    "reference number"
                ),
                reason: payload.reason,
            });
            break;
        case "password_reset":
            subject = "Reset Your Password";
            htmlContent = resetPasswordTemplate(
                requiredValue(payload.resetUrl, "reset URL")
            );
            break;
        case "appointment_rescheduled":
            subject = "Your Appointment Has Been Rescheduled";
            htmlContent = appointmentRescheduledTemplate({
                referenceNumber: requiredValue(
                    payload.referenceNumber,
                    "reference number"
                ),
                previousDate: requiredValue(payload.previousDate, "previous date"),
                previousTime: requiredValue(payload.previousTime, "previous time"),
                newDate: requiredValue(payload.newDate, "new date"),
                newTime: requiredValue(payload.newTime, "new time"),
                doctorName: requiredValue(payload.doctorName, "doctor name"),
                reason: requiredValue(payload.reason, "reschedule reason"),
            });
            break;
    }

    await getBrevoClient().transactionalEmails.sendTransacEmail({
        sender: getSender(),
        to: [{ email: to }],
        subject,
        htmlContent,
    });
};

export const sendVerificationCode = async (
    email: string,
    transaction?: Transaction
) => {
    const verificationCode = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await enqueueEmail(
        "verification_code",
        { to: email, verificationCode },
        transaction
    );

    return { verificationCode, expiresAt };
};

export const sendAppointmentUpdate = async ({
    email,
    prevStatus,
    newStatus,
    referenceNumber,
    reason,
}: {
    email: string;
    prevStatus: string;
    newStatus: string;
    referenceNumber: string;
    reason?: string;
}) => {
    await enqueueEmail("appointment_update", {
        to: email,
        previousStatus: prevStatus,
        newStatus,
        referenceNumber,
        reason,
    });

    return true;
};

export const sendResetPassword = async (
    email: string,
    resetUrl: string,
    transaction?: Transaction
) => {
    await enqueueEmail(
        "password_reset",
        { to: email, resetUrl },
        transaction
    );

    return true;
};

export const sendRescheduleUpdate = async (
    email: string,
    {
        referenceNumber,
        previousDate,
        previousTime,
        newDate,
        newTime,
        doctorName,
        reason,
    }: {
        referenceNumber: string;
        previousDate: string;
        previousTime: string;
        newDate: string;
        newTime: string;
        doctorName: string;
        reason: string;
    }
) => {
    await enqueueEmail("appointment_rescheduled", {
        to: email,
        referenceNumber,
        previousDate,
        previousTime,
        newDate,
        newTime,
        doctorName,
        reason,
    });

    return true;
};
