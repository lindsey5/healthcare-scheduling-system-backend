import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface ResetTokenAttributes {
    id: number;
    resetToken: string;
    patientId: number;
    expiresAt: Date;
}

interface ResetTokenCreationAttributes
    extends Optional<ResetTokenAttributes, "id"> {}

class ResetToken extends Model<
    ResetTokenAttributes,
    ResetTokenCreationAttributes
> {
    declare id: number;
    declare resetToken: string;
    declare patientId: number;
    declare expiresAt: Date;
}

ResetToken.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        resetToken: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "ResetToken",
        tableName: "reset_tokens",
        timestamps: false,
    }
);

export default ResetToken;