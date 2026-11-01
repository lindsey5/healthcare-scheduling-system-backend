import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface AppointmentDateClosureAttributes {
    id: number;
    closureDate: string;
    startTime: string | null;
    endTime: string | null;
    reason: string | null;
    createdAt: Date;
}

interface AppointmentDateClosureCreationAttributes
    extends Optional<
        AppointmentDateClosureAttributes,
        "id" | "startTime" | "endTime" | "reason" | "createdAt"
    > {}

class AppointmentDateClosure extends Model<
    AppointmentDateClosureAttributes,
    AppointmentDateClosureCreationAttributes
> {
    declare id: number;
    declare closureDate: string;
    declare startTime: string | null;
    declare endTime: string | null;
    declare reason: string | null;
    declare createdAt: Date;
}

AppointmentDateClosure.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        closureDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            unique: true,
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        reason: {
            type: DataTypes.STRING(255),
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
        modelName: "AppointmentDateClosure",
        tableName: "appointment_date_closures",
        updatedAt: false,
    }
);

export default AppointmentDateClosure;
