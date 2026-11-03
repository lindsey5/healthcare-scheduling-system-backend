import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import type Doctor from "./Doctor";

interface DoctorServiceAttributes {
    id: number;
    doctorId: number;
    serviceId: number;
    startTime: string;
    endTime: string;
}

interface DoctorServiceCreationAttributes
    extends Optional<DoctorServiceAttributes, "id"> {}

class DoctorService extends Model<
    DoctorServiceAttributes,
    DoctorServiceCreationAttributes
> {
    declare id: number;
    declare doctorId: number;
    declare serviceId: number;
    declare startTime: string;
    declare endTime: string;
    declare doctor: Doctor;
}

DoctorService.init(
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
        },

        serviceId: {
            type: DataTypes.INTEGER,
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
        modelName: "DoctorService",
        tableName: "doctor_services",
        timestamps: false,
    }
);

export default DoctorService;