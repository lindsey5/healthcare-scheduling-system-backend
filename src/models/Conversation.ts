import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface ConversationAttributes {
    id: number;
    patientId: number;
    assignedStaffId: number | null;
    status: "Waiting" | "Active" | "Closed";
    createdAt: Date;
    acceptedAt: Date | null;
    closedAt: Date | null;
}

interface ConversationCreationAttributes
    extends Optional<
        ConversationAttributes,
        "id" | "assignedStaffId" | "acceptedAt" | "closedAt" | "createdAt"
    > {}

class Conversation extends Model<
    ConversationAttributes,
    ConversationCreationAttributes
> {
    declare id: number;

    declare patientId: number;
    declare assignedStaffId: number | null;

    declare status: "Waiting" | "Active" | "Closed";

    declare createdAt: Date;
    declare acceptedAt: Date | null;
    declare closedAt: Date | null;
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

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        acceptedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        closedAt: {
            type: DataTypes.DATE,
            allowNull: true,
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