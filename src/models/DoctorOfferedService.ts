import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

interface DoctorOfferedServiceAttributes {
    doctorId: number;
    serviceId: number;
}

class DoctorOfferedService extends Model<DoctorOfferedServiceAttributes>
    implements DoctorOfferedServiceAttributes
{
    declare doctorId: number;
    declare serviceId: number;
}

DoctorOfferedService.init(
    {
        doctorId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: "doctors",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        serviceId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: "services",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        sequelize,
        modelName: "DoctorOfferedService",
        tableName: "doctor_offered_services",
        timestamps: false,
    }
);

export default DoctorOfferedService;
