import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface MessageAttributes {
    id: number;
    conversationId: number;
    senderId: number;
    senderType: "Patient" | "Staff";
    message: string;
    unread: boolean;
    createdAt: Date;
}

interface MessageCreationAttributes
    extends Optional<MessageAttributes, "id" | "createdAt" | "unread"> {}

class Message extends Model<
    MessageAttributes,
    MessageCreationAttributes
> {
    declare id: number;

    declare conversationId: number;

    declare senderId: number;
    declare senderType: "Patient" | "Staff";

    declare message: string;

    declare unread: boolean;

    declare createdAt: Date;
}

Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        conversationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        senderType: {
            type: DataTypes.ENUM("Patient", "Staff"),
            allowNull: false,
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        unread: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "Message",
        tableName: "messages",
        timestamps: false,
    }
);

export default Message;