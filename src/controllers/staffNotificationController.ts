import { NextFunction, Response } from "express";
import {
    Appointment,
    AppointmentRecord,
    Doctor,
    Patient,
    StaffNotification,
    Service,
} from "../models/index";
import { AuthRequest } from "../types/type";

export const getStaffNotifications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const {
            count: total,
            rows: staffNotifications,
        } = await StaffNotification.findAndCountAll({
            where: {
                staffId: req.user.id,
            },
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            include: [
                {
                    model: Appointment,
                    as: "appointment",
                    include: [
                        {
                            model: AppointmentRecord,
                            as: "appointmentRecord",
                        },
                        {
                            model: Service,
                            as: "service",
                        },
                        {
                            model: Doctor,
                            as: "doctor",
                        },
                        {
                            model: Patient,
                            as: "patient",
                        },
                    ],
                },
            ],
        });

        const unread = await StaffNotification.count({
            where: {
                staffId: req.user.id,
                isRead: false,
            },
        });

        return res.status(200).json({
            staffNotifications,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
            unread,
        });
    } catch (err) {
        next(err);
    }
};


export const readStaffNotification = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const staffNotification = await StaffNotification.findByPk(
            Number(req.params.id)
        );

        if (!staffNotification) {
            return res.status(404).json({
                message: "Notification not found.",
            });
        }

        if (staffNotification.staffId !== req.user.id) {
            return res.status(403).json({
                message: "Unauthorized",
            });
        }

        staffNotification.isRead = true;

        await staffNotification.save();

        return res.status(200).json({
            message: "Notification successfully marked as read.",
        });
    } catch (err) {
        next(err);
    }
};


export const readAllStaffNotifications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await StaffNotification.update(
            {
                isRead: true,
            },
            {
                where: {
                    staffId: req.user.id,
                    isRead: false,
                },
            }
        );

        return res.status(200).json({
            message: "All notifications successfully marked as read.",
        });
    } catch (err) {
        next(err);
    }
};