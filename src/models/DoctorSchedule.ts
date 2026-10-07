import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export type DayOfWeek =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

interface DoctorScheduleAttributes {
    id: number;
    doctorId: number;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
}

interface DoctorScheduleCreationAttributes
    extends Optional<DoctorScheduleAttributes, "id"> {}

class DoctorSchedule extends Model<
    DoctorScheduleAttributes,
    DoctorScheduleCreationAttributes
> {
    declare id: number;
    declare doctorId: number;
    declare day: DayOfWeek;
    declare startTime: string;
    declare endTime: string;
}

DoctorSchedule.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "doctors",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        day: {
            type: DataTypes.ENUM(
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
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
    },
    {
        sequelize,
        modelName: "DoctorSchedule",
        tableName: "doctor_schedules",
        timestamps: false,
    }
);

export default DoctorSchedule;