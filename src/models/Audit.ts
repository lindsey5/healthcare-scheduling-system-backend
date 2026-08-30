import {
    DataTypes,
    Model,
} from "sequelize";
import { sequelize } from "../config/db";

interface AuditAttributes {
    id: number;

    userId: number;
    userType: "Admin" | "Staff";

    action: string;
    entity: string;
    entityId: string;

    severity: "INFO" | "WARNING" | "CRITICAL";

    oldValues: object;
    newValues: object;

    ipAddress: string;
    userAgent: string;

    createdAt?: Date;
    updatedAt?: Date;
}

interface AuditCreationAttributes {
    userId: number;
    userType: "Admin" | "Staff";

    action: string;
    entity: string;
    entityId: string;

    severity: "INFO" | "WARNING" | "CRITICAL";

    oldValues: object;
    newValues: object;

    ipAddress: string;
    userAgent: string;
}

class Audit
    extends Model<AuditAttributes, AuditCreationAttributes>
    implements AuditAttributes
{
    declare id: number;

    declare userId: number;
    declare userType: "Admin" | "Staff";

    declare action: string;
    declare entity: string;
    declare entityId: string;

    declare severity: "INFO" | "WARNING" | "CRITICAL";

    declare oldValues: object;
    declare newValues: object;

    declare ipAddress: string;
    declare userAgent: string;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Audit.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        userType: {
            type: DataTypes.ENUM(
                "Admin",
                "Staff"
            ),
            allowNull: false,
        },

        action: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        entity: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        entityId: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        severity: {
            type: DataTypes.ENUM(
                "INFO",
                "WARNING",
                "CRITICAL"
            ),
            allowNull: false,
        },

        oldValues: {
            type: DataTypes.JSON,
            allowNull: false,
        },

        newValues: {
            type: DataTypes.JSON,
            allowNull: false,
        },

        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },

        userAgent: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "audits",
        timestamps: true,
    }
);

export default Audit;