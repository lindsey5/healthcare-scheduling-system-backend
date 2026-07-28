import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface ServiceAttributes {
    id: number;
    serviceName: string;
    dayOfWeek:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
    startTime: string;
    endTime: string;
    duration: number; // Duration in minutes
    createdAt: Date;
}

interface ServiceCreationAttributes
    extends Optional<ServiceAttributes, "id" | "createdAt"> {}

class Service
    extends Model<ServiceAttributes, ServiceCreationAttributes>
    implements ServiceAttributes
{
    declare id: number;

    declare serviceName: string;

    declare dayOfWeek:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"

    declare startTime: string;
    declare endTime: string;
    declare duration: number;

    declare createdAt: Date;
}

Service.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        serviceName: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        dayOfWeek: {
            type: DataTypes.ENUM(
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
            ),
            allowNull: false,
        },

        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 30,
            comment: "Duration in minutes",
            validate: {
                min: 5,
            },
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "Service",
        tableName: "services",
        timestamps: false,
    }
);

export default Service;