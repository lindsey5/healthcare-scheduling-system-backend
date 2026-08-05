import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface PatientNotificationAttributes {
    id: number;
    appointmentId: string;
    patientId: number;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

interface PatientNotificationCreationAttributes
    extends Optional<
        PatientNotificationAttributes,
        "id" | "isRead" | "createdAt"
    > {}

class PatientNotification
    extends Model<
        PatientNotificationAttributes,
        PatientNotificationCreationAttributes
    >
    implements PatientNotificationAttributes
{
    declare id: number;
    declare appointmentId: string;
    declare patientId: number;
    declare message: string;
    declare isRead: boolean;
    declare createdAt: Date;
}

PatientNotification.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        appointmentId: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "PatientNotification",
        tableName: "patient_notifications",
        timestamps: false,
    }
);

export default PatientNotification;