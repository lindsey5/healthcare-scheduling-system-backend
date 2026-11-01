import { NextFunction, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import { AuthRequest } from "../types/type";
import AppointmentDateClosure from "../models/AppointmentDateClosure";

export const getAppointmentDateClosures = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const closures = await AppointmentDateClosure.findAll({
            order: [["closureDate", "ASC"]],
        });

        return res.status(200).json({ closures });
    } catch (error) {
        next(error);
    }
};

export const createAppointmentDateClosure = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const closureDate = req.body.closureDate;
        const reason =
            typeof req.body.reason === "string"
                ? req.body.reason.trim()
                : "";

        const parsedDate =
            typeof closureDate === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(closureDate)
                ? new Date(`${closureDate}T00:00:00.000Z`)
                : null;

        if (
            !parsedDate ||
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== closureDate
        ) {
            return res.status(400).json({
                message: "A valid appointment closure date is required.",
            });
        }

        if (reason.length > 255) {
            return res.status(400).json({
                message: "The closure reason must be 255 characters or fewer.",
            });
        }

        const existingClosure = await AppointmentDateClosure.findOne({
            where: { closureDate },
        });

        if (existingClosure) {
            return res.status(409).json({
                message: "This date is already closed for appointments.",
            });
        }

        const closure = await AppointmentDateClosure.create({
            closureDate,
            reason: reason || null,
        });

        return res.status(201).json({
            message: "Date closed for appointments.",
            closure,
        });
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({
                message: "This date is already closed for appointments.",
            });
        }

        next(error);
    }
};

export const deleteAppointmentDateClosure = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "A valid appointment closure ID is required.",
            });
        }

        const closure = await AppointmentDateClosure.findByPk(id);

        if (!closure) {
            return res.status(404).json({
                message: "Appointment date closure not found.",
            });
        }

        await closure.destroy();

        return res.status(200).json({
            message: "Date reopened for appointments.",
        });
    } catch (error) {
        next(error);
    }
};
