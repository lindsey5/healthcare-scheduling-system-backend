import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { hashPassword } from "../utils/auth";

interface UserAttributes {
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

interface UserCreationAttributes
    extends Optional<
        UserAttributes,
        "id"
    > {}

class User extends Model<UserAttributes, UserCreationAttributes> {
    declare id: number;
    declare firstname: string;
    declare lastname: string;
    declare email: string;
    declare password: string;

    declare verificationCode: string | null;
    declare verificationCodeExpiresAt: Date | null;
    declare isVerified: boolean;

    declare createdAt: Date;
}

User.init(
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
        modelName: "User",
        tableName: "users",
        timestamps: false,

        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await hashPassword(user.password);
                }
            },

            beforeUpdate: async (user) => {
                if (user.changed("password")) {
                    user.password = await hashPassword(user.password);
                }
            },
        },
    }
);

export default User;