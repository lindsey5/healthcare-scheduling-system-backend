import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface AdminNotificationAttributes {
    id: number;
    appointmentId: string;
    adminId: number;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

interface AdminNotificationCreationAttributes
    extends Optional<
        AdminNotificationAttributes,
        "id" | "isRead" | "createdAt"
    > {}

class AdminNotification
    extends Model<
        AdminNotificationAttributes,
        AdminNotificationCreationAttributes
    >
    implements AdminNotificationAttributes
{
    declare id: number;
    declare appointmentId: string;
    declare adminId: number;
    declare message: string;
    declare isRead: boolean;
    declare createdAt: Date;
}

AdminNotification.init(
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

        adminId: {
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
        modelName: "AdminNotification",
        tableName: "admin_notifications",
        timestamps: false,
    }
);

export default AdminNotification;