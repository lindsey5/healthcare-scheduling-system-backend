import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/type";
import { Appointment, AppointmentRecord, Doctor, Service, } from '../models/index';
import { Op } from "sequelize";
import AppointmentService from "../services/appointmentService";
import { AppointmentAttributes } from "../models/Appointment";

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const existingAppointments = await Appointment.count({
            where: {
                appointmentDate: req.body.appointment.appointmentDate,
                appointmentTime: req.body.appointment.appointmentTime,
                status: {
                    [Op.ne]: "Cancelled",
                },
            },
        });

        if (existingAppointments >= 2) {
            return res.status(409).json({
                message:
                    "The selected appointment time has reached its maximum capacity. Please choose another time slot.",
            });
        }

        const appointmentDate = new Date(req.body.appointment.appointmentDate);

        const dayOfWeek = appointmentDate.toLocaleDateString("en-CA", {
            weekday: "long",
            timeZone: "Asia/Manila",
        });

        console.log(dayOfWeek)

        const isValid = await Service.findOne({
            where: {
                id: Number(req.body.appointment.serviceId),
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

export const updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const id = req.params.id;
        const status = req.body.status as AppointmentAttributes['status'];

        const appointment = await Appointment.findByPk(String(id));

        if(!appointment) return res.status(404).json({ message: "Appointment not found." });

        const allowedTransitions: Record<string, string[]> = {
            Pending: ["Approved", "Rejected", "Cancelled"],
            Approved: ["Checked In", "Reschedule", "No Show", "Cancelled"],
            "Checked In": ["Completed"],
            "Completed" : [],
            "Cancelled" : [],
            "Rejected" : [],
            "Rescheduled" : ["Completed"]
        };

        const currentStatus = appointment.status;

        const allowedNextStatuses = allowedTransitions[currentStatus] || [];

        if (!allowedNextStatuses.includes(status)) {

            return res.status(400).json({
                success: false,
                message: `Cannot update order status from ${currentStatus} to ${status}. Please reload the page`,
            });
        }

        appointment.status = status;

        await appointment.save();

        return res.status(200).json({
            appointment,
            message: `Appointment status successfully updated to ${status}`
        })

    } catch (err) {
        next(err);
    }
}

export const cancelAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const id = req.params.id;

        const appointment = await Appointment.findByPk(String(id));

        if(!appointment) return res.status(404).json({ message: "Appointment not found" });

        if(appointment.patientId !== req.user.id) return res.status(401).json({ message: "You are not authorized to access this appointment." })

        const allowedTransitions: Record<string, string[]> = {
            Pending: ["Approved", "Rejected", "Cancelled"],
            Approved: ["Checked In", "Reschedule", "No Show", "Cancelled"],
            "Checked In": ["Completed"],
            "Completed" : [],
            "Cancelled" : [],
            "Rejected" : [],
            "Rescheduled" : ["Completed"]
        };

        const currentStatus = appointment.status;

        const allowedNextStatuses = allowedTransitions[currentStatus] || [];

        if (!allowedNextStatuses.includes("Cancelled")) {

            return res.status(400).json({
                success: false,
                message: `Cannot cancel appointment. Please reload the page`,
            });
        }

        appointment.status = "Cancelled";
        await appointment.save();

        return res.status(200).json({ 
            appointment,
            message: "Appointment successfully cancelled"
        })

    } catch (err) {
        next(err);
    }
}

export const getAvailableTimeSlot = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
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

        // Don't allow past dates
        if (selectedDay < today) {
            return res.status(200).json({
                availableTimes: [],
            });
        }

        // Get all non-cancelled appointments for the selected date
        const appointments = await Appointment.findAll({
            where: {
                appointmentDate,
                status: {
                    [Op.ne]: "Cancelled",
                },
            },
            order: [["appointmentTime", "ASC"]],
        });

        // Count appointments per time slot
        const bookedTimesCount = appointments.reduce<Record<string, number>>(
            (acc, appointment) => {
                const time = appointment.appointmentTime;

                acc[time] = (acc[time] || 0) + 1;

                return acc;
            },
            {}
        );

        const slots: string[] = [];

        // Clinic hours: 7:00 AM - 4:00 PM
        const current = new Date(selectedDate);
        current.setHours(7, 0, 0, 0);

        const end = new Date(selectedDate);
        end.setHours(16, 0, 0, 0);

        const isToday = selectedDay.getTime() === today.getTime();

        const currentManilaTime = manilaNow.toTimeString().slice(0, 8);

        while (current < end) {
            const slotStart = current.toTimeString().slice(0, 8);

            // Hide past time slots when booking today
            if (isToday && slotStart <= currentManilaTime) {
                current.setHours(current.getHours() + 1);
                continue;
            }

            // Allow a maximum of 2 appointments per time slot
            if ((bookedTimesCount[slotStart] ?? 0) < 2) {
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