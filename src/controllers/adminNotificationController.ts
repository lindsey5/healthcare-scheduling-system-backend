import { NextFunction, Response } from "express";
import { Appointment, AppointmentRecord, Doctor, Patient, AdminNotification, Service } from "../models/index";
import { AuthRequest } from "../types/type";

export const getAdminNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit; 

        const { count: total, rows: adminNotifications } = await AdminNotification.findAndCountAll({
            where: { adminId: req.user.id },
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            include: [
                {
                    model: Appointment,
                    include: [
                        {
                            model: AppointmentRecord,
                            as: 'appointmentRecord'
                        },
                        {
                            model: Service,
                            as: "service",
                        },
                        {
                            model: Doctor,
                            as: 'doctor'
                        },
                        {
                            model: Patient,
                            as: 'patient'
                        }
                    ],
                    as: 'appointment'
                },
            ]
        })

        const unread = await AdminNotification.count({
            where: {
                adminId: req.user.id,
                isRead: false
            }
        })

        return res.status(200).json({
            adminNotifications,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
            unread
        })

    }catch(err){
        next(err);
    }
}

export const readAdminNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const adminNotification = await AdminNotification.findByPk(Number(req.params.id));

        if(!adminNotification) return res.status(404).json({ message: "Notification not found." });

        if(adminNotification.adminId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        adminNotification.isRead = true;

        await adminNotification.save();

        res.status(200);

    }catch(err){
        next(err);
    }
}

export const readAllAdminNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        await AdminNotification.update({
            isRead: true
        }, 
        {
            where: {
                adminId: req.user.id,
                isRead: false,
            }
        })

        res.status(200).json({ message: "All notifications successfully marked as read." });

    }catch(err){
        next(err);
    }
}