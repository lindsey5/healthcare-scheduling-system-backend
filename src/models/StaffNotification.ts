import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface StaffNotificationAttributes {
    id: number;
    appointmentId: string;
    staffId: number;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

interface StaffNotificationCreationAttributes
    extends Optional<
        StaffNotificationAttributes,
        "id" | "isRead" | "createdAt"
    > {}

class StaffNotification
    extends Model<
        StaffNotificationAttributes,
        StaffNotificationCreationAttributes
    >
    implements StaffNotificationAttributes
{
    declare id: number;
    declare appointmentId: string;
    declare staffId: number;
    declare message: string;
    declare isRead: boolean;
    declare createdAt: Date;
}

StaffNotification.init(
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

        staffId: {
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
        modelName: "StaffNotification",
        tableName: "staff_notifications",
        timestamps: false,
    }
);

export default StaffNotification;