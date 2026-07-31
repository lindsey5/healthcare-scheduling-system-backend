import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/type";
import { Appointment, AppointmentRecord, Doctor, Service, } from '../models/index';
import { Op } from "sequelize";
import AppointmentService from "../services/appointmentService";

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const isExisting = await Appointment.findOne({
            where: {
                appointmentDate: req.body.appointment.appointmentDate,
                appointmentTime: req.body.appointment.appointmentTime,
                status: {
                    [Op.ne]: "Cancelled",
                },
            },
        });

        if (isExisting) {
            return res.status(409).json({
                message: "The selected appointment time is already booked. Please choose another time slot.",
            });
        }

        const appointmentDate = new Date(req.body.appointmentDate);

        const dayOfWeek = appointmentDate.toLocaleDateString("en-US", {
            weekday: "long",
            timeZone: "Asia/Manila",
        });

        const isValid = await Service.findOne({
            where: {
                id: req.body.appointment.serviceId,
                dayOfWeek,
            },
        });

        if (!isValid) {
            return res.status(400).json({
                message: "The selected service is not available on the chosen appointment date.",
            });
        }

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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const search = (req.query.search as string) || "";
        const status = req.query.status as string;

        const where: any = {};

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

        const { total, appointments } = await AppointmentService.getAppointments({
            where,
            limit,
            offset
        });

        return res.status(200).json({
            appointments,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
        });

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

        const { total, appointments } = await AppointmentService.getAppointments({
            where,
            limit,
            offset
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

export const getAvailableTimeSlot = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointmentDate = req.query.appointmentDate as string;

        if (!appointmentDate) {
            return res.status(400).json({
                message: "Appointment date is required.",
            });
        }

        // Current Manila date and time
        const manilaNow = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Manila",
            })
        );

        const today = new Date(
            manilaNow.getFullYear(),
            manilaNow.getMonth(),
            manilaNow.getDate()
        );

        // Selected appointment date
        const selectedDate = new Date(appointmentDate);
        const selectedDay = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
        );

        // Hide past dates
        if (selectedDay < today) {
            return res.status(200).json({
                availableTimes: [],
            });
        }

        // Get booked appointments (excluding cancelled)
        const appointments = await Appointment.findAll({
            where: {
                appointmentDate,
                status: {
                    [Op.ne]: "Cancelled",
                },
            },
            order: [["appointmentTime", "ASC"]],
        });

        const bookedTimes = new Set(
            appointments.map((appointment) => appointment.appointmentTime)
        );

        const slots: string[] = [];

        // Clinic hours: 7:00 AM - 4:00 PM
        const current = new Date(selectedDate);
        current.setHours(7, 0, 0, 0);

        const end = new Date(selectedDate);
        end.setHours(16, 0, 0, 0);

        const isToday = selectedDay.getTime() === today.getTime();

        const currentManilaTime = manilaNow
            .toTimeString()
            .slice(0, 8);

        // Generate 1-hour time slots
        while (current < end) {
            const slotStart = current.toTimeString().slice(0, 8);

            // Hide past time slots if booking today
            if (isToday && slotStart <= currentManilaTime) {
                current.setHours(current.getHours() + 1);
                continue;
            }

            if (!bookedTimes.has(slotStart)) {
                slots.push(slotStart);
            }

            current.setHours(current.getHours() + 1);
        }

        return res.status(200).json({
            availableTimes: slots,
        });
    } catch (err) {
        next(err);
    }
};