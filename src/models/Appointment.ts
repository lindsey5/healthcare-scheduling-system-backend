import { randomUUID } from "crypto";
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface AppointmentAttributes {
    id: string;
    referenceNumber: string;

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

    purposeOfVisit: string;

    createdAt: Date;
}

interface AppointmentCreationAttributes
    extends Optional<
        AppointmentAttributes,
        | "id"
        | "referenceNumber"
        | "status"
        | "createdAt"
        | "purposeOfVisit"
    > {}

class Appointment
    extends Model<
        AppointmentAttributes,
        AppointmentCreationAttributes
    >
    implements AppointmentAttributes
{
    declare id: string;
    declare referenceNumber: string;

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

    declare purposeOfVisit: string;

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

        referenceNumber: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
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
            allowNull: false,
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

        hooks: {
            beforeValidate: (appointment) => {
                if (!appointment.referenceNumber) {
                    const now = new Date();

                    const date =
                        now.getFullYear().toString() +
                        String(now.getMonth() + 1).padStart(2, "0") +
                        String(now.getDate()).padStart(2, "0");

                    // Example: APP-20260729-A1B2C3D4
                    const unique = randomUUID()
                        .replace(/-/g, "")
                        .substring(0, 8)
                        .toUpperCase();

                    appointment.referenceNumber = `APP-${date}-${unique}`;
                }
            },
        },
    }
);

export default Appointment;