import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/type";
import { Appointment, AppointmentRecord, } from '../models/index';

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