import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/type";
import { Appointment, AppointmentRecord, Doctor, Service, } from '../models/index';
import { Op } from "sequelize";

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const appointment = await Appointment.create({
            ...req.body.appointment,
            patientId: req.user.id
        });

        const appointmentRecord = await AppointmentRecord.create({
            ...req.body.appointmentRecord,
            appointmentId: appointment.id
        });
        
        res.status(200).json({
            appointment: {
                ...appointment.toJSON(),
                appointmentRecord
            },
            message: "Appointment successfully submitted",
        });
        
    }catch(err){
        next(err);
    }
}

export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try{



    }catch(err){
        next(err);
    }
}

export const getMyAppointments = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const search = (req.query.search as string) || "";
        const status = req.query.status as string;

        const where: any = {
            patientId: req.user.id,
        };

        if (search) {
            where[Op.or] = [
                {
                    referenceNumber: {
                        [Op.like]: `%${search}%`,
                    },
                },
            ];
        }

        if (status && status !== "All") {
            where.status = status;
        }

        const { count : total, rows: appointments } = await Appointment.findAndCountAll({
            where,
            include: [
                {
                    model: Doctor,
                    as: "doctor",
                },
                {
                    model: Service,
                    as: "service",
                },
                {
                    model: AppointmentRecord,
                    as: 'appointmentRecord'
                }
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        return res.status(200).json({
            appointments,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        next(err);
    }
};