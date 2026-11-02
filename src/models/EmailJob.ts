import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export type EmailJobType =
    | "verification_code"
    | "appointment_update"
    | "password_reset"
    | "appointment_rescheduled";

export type EmailJobPayload = {
    to: string;
    verificationCode?: string;
    previousStatus?: string;
    newStatus?: string;
    referenceNumber?: string;
    reason?: string;
    resetUrl?: string;
    previousDate?: string;
    previousTime?: string;
    newDate?: string;
    newTime?: string;
    doctorName?: string;
};

export type EmailJobStatus = "queued" | "processing" | "sent" | "failed";

interface EmailJobAttributes {
    id: number;
    type: EmailJobType;
    payload: EmailJobPayload | null;
    status: EmailJobStatus;
    attempts: number;
    availableAt: Date;
    lockedAt: Date | null;
    lastError: string | null;
    createdAt: Date;
    updatedAt: Date;
}

type EmailJobCreationAttributes = Optional<
    EmailJobAttributes,
    | "id"
    | "status"
    | "attempts"
    | "availableAt"
    | "lockedAt"
    | "lastError"
    | "createdAt"
    | "updatedAt"
>;

class EmailJob extends Model<EmailJobAttributes, EmailJobCreationAttributes> {
    declare id: number;
    declare type: EmailJobType;
    declare payload: EmailJobPayload | null;
    declare status: EmailJobStatus;
    declare attempts: number;
    declare availableAt: Date;
    declare lockedAt: Date | null;
    declare lastError: string | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

EmailJob.init(
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        payload: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("queued", "processing", "sent", "failed"),
            allowNull: false,
            defaultValue: "queued",
        },
        attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        availableAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        lockedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        lastError: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "EmailJob",
        tableName: "email_jobs",
        indexes: [
            {
                fields: ["status", "availableAt"],
            },
            {
                fields: ["status", "lockedAt"],
            },
        ],
    }
);

export default EmailJob;
