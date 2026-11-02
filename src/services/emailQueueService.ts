import type { Transaction } from "sequelize";
import EmailJob, { type EmailJobPayload, type EmailJobType } from "../models/EmailJob";

export const enqueueEmail = (
    type: EmailJobType,
    payload: EmailJobPayload,
    transaction?: Transaction
) =>
    EmailJob.create(
        {
            type,
            payload,
        },
        { transaction }
    );
