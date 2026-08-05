import { NextFunction, Request, Response } from "express";
import { Appointment, AppointmentRecord, Doctor, Patient, PatientNotification, Service } from "../models/index";
import { AuthRequest } from "../types/type";

export const getPatientNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit; 

        const { count: total, rows: patientNotifications } = await PatientNotification.findAndCountAll({
            where: { patientId: req.user.id },
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
                        }
                    ],
                    as: 'appointment'
                },
            ]
        })

        const unread = await PatientNotification.count({
            where: {
                patientId: req.user.id,
                isRead: false
            }
        })

        return res.status(200).json({
            patientNotifications,
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

export const readPatientNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const patientNotification = await PatientNotification.findByPk(Number(req.params.id));

        if(!patientNotification) return res.status(404).json({ message: "Notification not found." });

        if(patientNotification.patientId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        patientNotification.isRead = true;

        await patientNotification.save();

        res.status(200);

    }catch(err){
        next(err);
    }
}

export const readAllPatientNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        await PatientNotification.update({
            isRead: true
        }, 
        {
            where: {
                patientId: req.user.id,
                isRead: false,
            }
        })

        res.status(200).json({ message: "All notifications successfully marked as read." });

    }catch(err){
        next(err);
    }
}