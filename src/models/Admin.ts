import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { hashPassword } from "../utils/auth";

interface AdminAttributes {
    id: number;

    firstname: string;
    lastname: string;
    email: string;
    password: string;

    createdAt: Date;
}

interface AdminCreationAttributes
    extends Optional<
        AdminAttributes,
        "id"
    > {}

class Admin extends Model<AdminAttributes, AdminCreationAttributes> {
    declare id: number;

    declare firstname: string;
    declare lastname: string;
    declare email: string;
    declare password: string;

    declare createdAt: Date;
}

Admin.init(
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

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "Admin",
        tableName: "admins",
        timestamps: false,

        hooks: {
            beforeCreate: async (admin) => {
                if (admin.password) {
                    admin.password = await hashPassword(admin.password);
                }
            },

            beforeUpdate: async (admin) => {
                if (admin.changed("password")) {
                    admin.password = await hashPassword(admin.password);
                }
            },
        },
    }
);

export default Admin;