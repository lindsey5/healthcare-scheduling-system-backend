import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface AppointmentRescheduleAttributes {
    id: number;

    appointmentId: string;

    oldDoctorId: number | null;
    newDoctorId: number | null;

    oldAppointmentDate: Date;
    newAppointmentDate: Date;

    oldAppointmentTime: string;
    newAppointmentTime: string;

    reason: string;

    rescheduledByType: "Admin" | "Staff";
    rescheduledByAdminId: number | null;
    rescheduledByStaffId: number | null;

    createdAt: Date;
}

interface AppointmentRescheduleCreationAttributes
    extends Optional<
        AppointmentRescheduleAttributes,
        | "id"
        | "createdAt"
        | "oldDoctorId"
        | "newDoctorId"
        | "rescheduledByAdminId"
        | "rescheduledByStaffId"
    > {}

class AppointmentReschedule extends Model<
    AppointmentRescheduleAttributes,
    AppointmentRescheduleCreationAttributes
> {
    declare id: number;

    declare appointmentId: string;

    declare oldDoctorId: number | null;
    declare newDoctorId: number | null;

    declare oldAppointmentDate: Date;
    declare newAppointmentDate: Date;

    declare oldAppointmentTime: string;
    declare newAppointmentTime: string;

    declare reason: string;

    declare rescheduledByType: "Admin" | "Staff";
    declare rescheduledByAdminId: number | null;
    declare rescheduledByStaffId: number | null;

    declare createdAt: Date;
}

AppointmentReschedule.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        appointmentId: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        oldDoctorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        newDoctorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        oldAppointmentDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        newAppointmentDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        oldAppointmentTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        newAppointmentTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        rescheduledByType: {
            type: DataTypes.ENUM("Admin", "Staff"),
            allowNull: false,
        },

        rescheduledByAdminId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        rescheduledByStaffId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "AppointmentReschedule",
        tableName: "appointment_reschedules",
        timestamps: false,
    }
);

export default AppointmentReschedule;