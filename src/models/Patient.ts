import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { hashPassword } from "../utils/auth";

interface PatientAttributes {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    password: string;

    verificationCode?: string | null;
    verificationCodeExpiresAt?: Date | null;
    isVerified: boolean;

    createdAt: Date;
}

interface PatientCreationAttributes
    extends Optional<
        PatientAttributes,
        | "id"
        | "createdAt"
        | "verificationCode"
        | "verificationCodeExpiresAt"
        | "isVerified"
    > {}

class Patient
    extends Model<PatientAttributes, PatientCreationAttributes>
    implements PatientAttributes
{
    public id!: number;
    public firstname!: string;
    public lastname!: string;
    public email!: string;
    public password!: string;

    public verificationCode!: string | null;
    public verificationCodeExpiresAt!: Date | null;
    public isVerified!: boolean;

    public createdAt!: Date;
}

Patient.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        verificationCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        verificationCodeExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        isVerified: {
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
        modelName: "Patient",
        tableName: "patients",
        timestamps: false,

        hooks: {
            beforeCreate: async (patient) => {
                if (patient.password) {
                    patient.password = await hashPassword(patient.password);
                }
            },

            beforeUpdate: async (patient) => {
                if (patient.changed("password")) {
                    patient.password = await hashPassword(patient.password);
                }
            },
        },
    }
);

export default Patient;