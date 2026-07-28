import { NextFunction, Request, Response } from "express";
import { Service, Appointment } from '../models/index';
import { Op } from "sequelize";

export const createService = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            serviceName,
            dayOfWeek,
            startTime,
            endTime,
        } = req.body;

        const OPEN_TIME = "07:00:00";
        const CLOSE_TIME = "16:00:00";

        if (startTime < OPEN_TIME || endTime > CLOSE_TIME) {
            return res.status(400).json({
                message:
                    "Services can only be scheduled between 7:00 AM and 4:00 PM.",
            });
        }

        if (startTime >= endTime) {
            return res.status(400).json({
                message: "The start time must be earlier than the end time.",
            });
        }

        const overlappingService = await Service.findOne({
            where: {
                dayOfWeek,
                [Op.and]: [
                    {
                        startTime: {
                            [Op.lt]: endTime,
                        },
                    },
                    {
                        endTime: {
                            [Op.gt]: startTime,
                        },
                    },
                ],
            },
        });

        if (overlappingService) {
            return res.status(409).json({
                message:
                    "The selected schedule overlaps with an existing service. Please choose a different time.",
            });
        }

        const isExisting = await Service.findOne({
            where: {
                serviceName,
                dayOfWeek,
            },
        });

        if (isExisting) {
            return res.status(409).json({
                message:
                    "A service with the same name already exists for the selected day.",
            });
        }

        const service = await Service.create(req.body);

        return res.status(201).json({
            service,
            message: "Service successfully created",
        });
    } catch (err) {
        next(err);
    }
};

export const getServices = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const dayOfWeek = req.query.dayOfWeek as "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday";

        const whereClause = dayOfWeek ? { dayOfWeek } : undefined;

        const services = await Service.findAll({
            where: whereClause
        })

        return res.status(200).json({ services });

    }catch(err){
        next(err);
    }
}

export const getAvailableTimeSlot = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);
        const appointmentDate = req.query.appointmentDate as string;

        if (!appointmentDate) {
            return res.status(400).json({
                message: "Appointment date is required.",
            });
        }

        const service = await Service.findByPk(id);

        if (!service) {
            return res.status(404).json({
                message: "Service not found.",
            });
        }

        // Get current Manila date
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

        // Convert appointment date to date only
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

        const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
        });

        if (service.dayOfWeek !== dayOfWeek) {
            return res.status(200).json({
                availableTimes: [],
            });
        }

        const appointments = await Appointment.findAll({
            where: {
                serviceId: id,
                appointmentDate,
            },
            order: [["appointmentTime", "ASC"]],
        });

        const bookedTimes = new Set(
            appointments.map((a) => a.appointmentTime)
        );

        const slots: string[] = [];

        const current = new Date(`1970-01-01T${service.startTime}`);
        const end = new Date(`1970-01-01T${service.endTime}`);

        // Check if selected date is today
        const isToday =
            selectedDay.getTime() === today.getTime();

        const currentManilaTime = manilaNow
            .toTimeString()
            .slice(0, 8);

        while (current <= end) {
            const slotStart = current
                .toTimeString()
                .slice(0, 8);

            // Remove past slots if appointment is today
            if (isToday && slotStart <= currentManilaTime) {
                current.setMinutes(
                    current.getMinutes() + service.duration
                );
                continue;
            }

            if (!bookedTimes.has(slotStart)) {
                slots.push(slotStart);
            }

            current.setMinutes(
                current.getMinutes() + service.duration
            );
        }

        return res.status(200).json({
            availableTimes: slots,
        });

    } catch (err) {
        next(err);
    }
};