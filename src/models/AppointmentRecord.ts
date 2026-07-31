import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface AppointmentRecordAttributes {
    id: number;
    appointmentId: string;

    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;

    birthDate: Date;
    gender: "Male" | "Female";
    civilStatus: "Single" | "Married" | "Widowed" | "Separated";

    contactNumber: string;
    email: string | null;
    completeAddress: string;

    emergencyContactPerson: string | null;
    emergencyContactNumber: string | null;
}

interface AppointmentRecordCreationAttributes
    extends Optional<
        AppointmentRecordAttributes,
        | "id"
        | "middleName"
        | "suffix"
        | "email"
        | "emergencyContactPerson"
        | "emergencyContactNumber"
    > {}

class AppointmentRecord extends Model<
    AppointmentRecordAttributes,
    AppointmentRecordCreationAttributes
> {
    declare id: number;
    declare appointmentId: string;

    declare firstName: string;
    declare middleName: string | null;
    declare lastName: string;
    declare suffix: string | null;

    declare birthDate: Date;
    declare gender: "Male" | "Female";
    declare civilStatus: "Single" | "Married" | "Widowed" | "Separated";

    declare contactNumber: string;
    declare email: string | null;
    declare completeAddress: string;

    declare emergencyContactPerson: string | null;
    declare emergencyContactNumber: string | null;
}

AppointmentRecord.init(
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

        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        middleName: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        suffix: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        birthDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        gender: {
            type: DataTypes.ENUM("Male", "Female"),
            allowNull: false,
        },

        civilStatus: {
            type: DataTypes.ENUM(
                "Single",
                "Married",
                "Widowed",
                "Separated"
            ),
            allowNull: false,
        },

        contactNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        completeAddress: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        emergencyContactPerson: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        emergencyContactNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "AppointmentRecord",
        tableName: "appointment_records",
        timestamps: false,
    }
);

export default AppointmentRecord;