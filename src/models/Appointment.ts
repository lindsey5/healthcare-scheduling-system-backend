import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface AppointmentAttributes {
    id: string;

    patientId: number;
    serviceId: number;
    doctorId: number;

    appointmentDate: Date;
    appointmentTime: string;

    status:
        | "Pending"
        | "Approved"
        | "Checked In"
        | "Completed"
        | "Cancelled"
        | "No Show"
        | "Rescheduled";

    purposeOfVisit: string | null;

    createdAt: Date;
}

interface AppointmentCreationAttributes
    extends Optional<
        AppointmentAttributes,
        "id" | "status" | "createdAt" | "purposeOfVisit"
    > {}

class Appointment
    extends Model<
        AppointmentAttributes,
        AppointmentCreationAttributes
    >
    implements AppointmentAttributes
{
    declare id: string;

    declare patientId: number;
    declare serviceId: number;
    declare doctorId: number;

    declare appointmentDate: Date;
    declare appointmentTime: string;

    declare status:
        | "Pending"
        | "Approved"
        | "Checked In"
        | "Completed"
        | "Cancelled"
        | "No Show"
        | "Rescheduled";

    declare purposeOfVisit: string | null;

    declare createdAt: Date;
}

Appointment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },

        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        appointmentDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        appointmentTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM(
                "Pending",
                "Approved",
                "Checked In",
                "Completed",
                "Cancelled",
                "No Show",
                "Rescheduled"
            ),
            allowNull: false,
            defaultValue: "Pending",
        },

        purposeOfVisit: {
            type: DataTypes.TEXT,
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
        modelName: "Appointment",
        tableName: "appointments",
        timestamps: false,
    }
);

export default Appointment;