import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { hashPassword } from "../utils/auth";

interface StaffAttributes {
    id: number;

    firstname: string;
    lastname: string;
    email: string;
    password: string;

    createdAt: Date;
}

interface StaffCreationAttributes
    extends Optional<
        StaffAttributes,
        "id"
    > {}

class Staff extends Model<StaffAttributes, StaffCreationAttributes> {
    declare id: number;

    declare firstname: string;
    declare lastname: string;
    declare email: string;
    declare password: string;

    declare createdAt: Date;
}

Staff.init(
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
        modelName: "Staff",
        tableName: "staff",
        timestamps: false,

        hooks: {
            beforeCreate: async (staff) => {
                if (staff.password) {
                    staff.password = await hashPassword(staff.password);
                }
            },

            beforeUpdate: async (staff) => {
                if (staff.changed("password")) {
                    staff.password = await hashPassword(staff.password);
                }
            },
        },
    }
);

export default Staff;