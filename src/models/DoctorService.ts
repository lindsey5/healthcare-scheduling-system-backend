import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface DoctorServiceAttributes {
    id: number;
    doctorId: number;
    serviceId: number;
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
    },
    {
        sequelize,
        modelName: "DoctorService",
        tableName: "doctor_services",
        timestamps: false,
    }
);

export default DoctorService;