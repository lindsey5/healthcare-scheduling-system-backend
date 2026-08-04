import { NextFunction, Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import Staff from "../models/Staff";
import { generateAccessToken, generateRefreshToken, verifyPassword } from "../utils/auth";
import { AuthRequest } from "../types/type";

export const createStaff = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const isExisting = await Staff.findOne({
            where: {
                email: req.body.email,
            },
        });

        if (isExisting) {
            return res.status(409).json({
                message: "Email already used.",
            });
        }

        const staff = await Staff.create(req.body);

        res.status(201).json({
            staff,
            message: "New staff successfully created.",
        });
    } catch (err) {
        next(err);
    }
};

export const loginStaff = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const staff = await Staff.findOne({
            where: {
                email,
            },
        });

        if (!staff) {
            return res.status(404).json({
                message: "Account not found",
            });
        }

        const isMatch = await verifyPassword(password, staff.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password",
            });
        }

        const refreshToken = generateRefreshToken(staff.id, "staff");
        const accessToken = generateAccessToken(staff.id, "staff");

        return res.status(200).json({
            user: {
                id: staff.id,
                firstname: staff.firstname,
                lastname: staff.lastname,
                email: staff.email,
                createdAt: staff.createdAt,
                role: "staff",
            },
            token: {
                refreshToken,
                accessToken,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getStaffs = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const search = String(req.query.search || "");

        const where: any = {};

        if (search) {
            where[Op.or] = [
                Sequelize.where(
                    Sequelize.fn(
                        "CONCAT",
                        Sequelize.col("firstname"),
                        " ",
                        Sequelize.col("lastname")
                    ),
                    {
                        [Op.like]: `%${search}%`,
                    }
                ),
                {
                    firstname: {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    lastname: {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    email: {
                        [Op.like]: `%${search}%`,
                    },
                },
            ];
        }

        const staffs = await Staff.findAll({
            where,
            attributes: {
                exclude: ["password"],
            },
        });

        return res.status(200).json({
            staffs,
        });
    } catch (err) {
        next(err);
    }
};

export const updateStaff = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        const isExisting = await Staff.findOne({
            where: {
                email: req.body.email,
                id: {
                    [Op.ne]: id,
                },
            },
            attributes: {
                exclude: ["password"],
            },
        });

        if (isExisting) {
            return res.status(409).json({
                message: "Email already used.",
            });
        }

        const staff = await Staff.findByPk(id);

        if (!staff) {
            return res.status(404).json({
                message: "Staff not found",
            });
        }

        staff.set(req.body);

        await staff.save();

        res.status(200).json({
            staff,
            message: "Staff successfully updated",
        });
    } catch (err) {
        next(err);
    }
};

export const deleteStaff = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        const staff = await Staff.findByPk(id);

        if (!staff) {
            return res.status(404).json({
                message: "Staff not found.",
            });
        }

        await staff.destroy();

        res.status(200).json({
            message: "Staff successfully deleted",
        });
    } catch (err) {
        next(err);
    }
};