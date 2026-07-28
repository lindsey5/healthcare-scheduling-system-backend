import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface DoctorAttributes {
    id: number;
    firstname: string;
    lastname: string;
    status: "Active" | "Inactive";
}

interface DoctorCreationAttributes
    extends Optional<DoctorAttributes, "id"> {}

class Doctor extends Model<DoctorAttributes, DoctorCreationAttributes> {
    declare id: number;
    declare firstname: string;
    declare lastname: string;
    declare status: "Active" | "Inactive";
}

Doctor.init(
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

        status: {
            type: DataTypes.ENUM("Active", "Inactive"),
            allowNull: false,
            defaultValue: "Active",
        },
    },
    {
        sequelize,
        modelName: "Doctor",
        tableName: "doctors",
        timestamps: false,
    }
);

export default Doctor;