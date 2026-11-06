import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export type AppointmentCapacityDay =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday";

interface AppointmentCapacityAttributes {
    dayOfWeek: AppointmentCapacityDay;
    morningCapacity: number;
    afternoonCapacity: number;
}

interface AppointmentCapacityCreationAttributes
    extends Optional<AppointmentCapacityAttributes, never> {}

class AppointmentCapacity extends Model<
    AppointmentCapacityAttributes,
    AppointmentCapacityCreationAttributes
> implements AppointmentCapacityAttributes {
    declare dayOfWeek: AppointmentCapacityDay;
    declare morningCapacity: number;
    declare afternoonCapacity: number;
}

AppointmentCapacity.init(
    {
        dayOfWeek: {
            type: DataTypes.ENUM(
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
            ),
            primaryKey: true,
            allowNull: false,
        },
        morningCapacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        afternoonCapacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "AppointmentCapacity",
        tableName: "appointment_capacities",
        timestamps: false,
    }
);

export default AppointmentCapacity;
