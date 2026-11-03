import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface ConversationAttributes {
    id: number;
    patientId: number;
    assignedStaffId: number | null;
    status: "Waiting" | "Active" | "Closed";
    recordingConsentAt: Date | null;
    createdAt: Date;
}

interface ConversationCreationAttributes
    extends Optional<
        ConversationAttributes,
        "id" | "assignedStaffId" | "recordingConsentAt" | "createdAt"
    > {}

class Conversation extends Model<
    ConversationAttributes,
    ConversationCreationAttributes
> {
    declare id: number;

    declare patientId: number;
    declare assignedStaffId: number | null;

    declare status: "Waiting" | "Active" | "Closed";
    declare recordingConsentAt: Date | null;

    declare createdAt: Date;
}

Conversation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        assignedStaffId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM("Waiting", "Active", "Closed"),
            allowNull: false,
            defaultValue: "Waiting",
        },

        recordingConsentAt: {
            type: DataTypes.DATE,
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
        modelName: "Conversation",
        tableName: "conversations",
        timestamps: false,
    }
);

export default Conversation;