import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/type";
import { Appointment, AppointmentRecord, Doctor, Patient, Service, } from '../models/index';
import { Op, Sequelize } from "sequelize";
import AppointmentService from "../services/appointmentService";
import { AppointmentAttributes } from "../models/Appointment";
import NotificationService from "../services/notificationService";
import { formatTime } from "../utils/date";

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const existingAppointment = await Appointment.findOne({
            where: {
                appointmentDate: req.body.appointment.appointmentDate,
                appointmentTime: req.body.appointment.appointmentTime,
                status: {
                    [Op.ne]: "Cancelled",
                },
            },
        });

        if (existingAppointment) {
            return res.status(409).json({
                message:
                    "The selected appointment time has reached its maximum capacity. Please choose another time slot.",
            });
        }

        const appointmentDate = new Date(req.body.appointment.appointmentDate);

        const dayOfWeek = appointmentDate.toLocaleDateString("en-US", {
            weekday: "long",
            timeZone: "Asia/Manila",
        });

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

        const message = `New appointment has been submitted for ${isValid.serviceName} on ${appointment.appointmentDate} at ${formatTime(appointment.appointmentTime)}.`;

        NotificationService.sendAdminNotification({
            appointmentId: appointment.id,
            message
        })

        NotificationService.sendStaffNotification({
            appointmentId: appointment.id,
            message
        })
        
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

export const getAppointmentByReferenceNumber = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const appointment = await Appointment.findOne({
            where: {
                referenceNumber: req.params.referenceNumber
            },
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
                    model: Patient,
                    attributes: {
                        exclude: ["password", "verificationCode", "verificationCodeExpiresAt"],
                    },
                    as: 'patient'
                },
                {
                    model: AppointmentRecord,
                    as: 'appointmentRecord'
                }
            ],
        });

        if(!appointment) return res.status(404).json({ message: "Appointment not found." });

        res.status(200).json({ appointment })

    }catch(err){
        next(err);
    }
}

export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const search = (req.query.search as string) || "";
        const status = req.query.status;

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const sort = (req.query.sort as string) || "createdAt";
        const order =
            (req.query.order as string)?.toUpperCase() === "ASC"
                ? "ASC"
                : "DESC";

        const where: any = {};

        const today = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Manila",
            })
        )
            .toISOString()
            .split("T")[0];

        await Appointment.update(
            { status: "No Show" },
            {
                where: {
                    appointmentDate: {
                        [Op.lt]: today,
                    },
                    status: {
                        [Op.in]: ["Pending", "Approved"],
                    },
                },
            }
        );

        if (search) {
           where[Op.or] = [
            {
                referenceNumber: {
                    [Op.like]: `%${search}%`,
                },
            },
            Sequelize.where(
                Sequelize.fn(
                    "CONCAT",
                    Sequelize.col("doctor.firstname"),
                    " ",
                    Sequelize.col("doctor.lastname")
                ),
                {
                    [Op.like]: `%${search}%`,
                }
            ),
            Sequelize.where(
                Sequelize.fn(
                    "CONCAT",
                    Sequelize.col("patient.firstname"),
                    " ",
                    Sequelize.col("patient.lastname")
                ),
                {
                    [Op.like]: `%${search}%`,
                }
            ),
            {
                "$doctor.firstname$": {
                    [Op.like]: `%${search}%`,
                },
            },
            {
                "$doctor.lastname$": {
                    [Op.like]: `%${search}%`,
                },
            },
            {
                "$patient.firstname$": {
                    [Op.like]: `%${search}%`,
                },
            },
            {
                "$patient.lastname$": {
                    [Op.like]: `%${search}%`,
                },
            },
            {
                "$service.serviceName$": {
                    [Op.like]: `%${search}%`,
                },
            },
        ];
        }

        if (startDate || endDate) {
            where.appointmentDate = {
                ...(startDate && { [Op.gte]: startDate }),
                ...(endDate && { [Op.lte]: endDate }),
            };
        }

        if (status && status !== "All") {
            where.status = status;
        }

        const { total, appointments } = await AppointmentService.getAppointments({
            where,
            limit,
            offset,
            order: [[ sort, order]],
        });

        return res.status(200).json({
            appointments,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        next(err);
    }
};

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
        const sort = (req.query.sort as string) || "createdAt";

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const order =
            (req.query.order as string)?.toUpperCase() === "ASC"
                ? "ASC"
                : "DESC";

        const today = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Manila",
            })
        )
            .toISOString()
            .split("T")[0];

        await Appointment.update(
            { status: "No Show" },
            {
                where: {
                    appointmentDate: {
                        [Op.lt]: today,
                    },
                    status: {
                        [Op.in]: ["Pending", "Approved"],
                    },
                },
            }
        );

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
            Sequelize.where(
                Sequelize.fn(
                    "CONCAT",
                    Sequelize.col("doctor.firstname"),
                    " ",
                    Sequelize.col("doctor.lastname")
                ),
                {
                    [Op.like]: `%${search}%`,
                }
            ),
            Sequelize.where(
                Sequelize.fn(
                    "CONCAT",
                    Sequelize.col("patient.firstname"),
                    " ",
                    Sequelize.col("patient.lastname")
                ),
                {
                    [Op.like]: `%${search}%`,
                }
            ),
            {
                "$doctor.firstname$": {
                    [Op.like]: `%${search}%`,
                },
            },
            {
                "$doctor.lastname$": {
                    [Op.like]: `%${search}%`,
                },
            },
            {
                "$patient.firstname$": {
                    [Op.like]: `%${search}%`,
                },
            },
            {
                "$patient.lastname$": {
                    [Op.like]: `%${search}%`,
                },
            },
            {
                "$service.serviceName$": {
                    [Op.like]: `%${search}%`,
                },
            },
        ];
        }

        if (startDate || endDate) {
            where.appointmentDate = {
                ...(startDate && { [Op.gte]: startDate }),
                ...(endDate && { [Op.lte]: endDate }),
            };
        }

        if (status && status !== "All") {
            where.status = status;
        }

        const { total, appointments } = await AppointmentService.getAppointments({
            where,
            limit,
            offset,
            order: [[sort, order]]
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

        await NotificationService.sendPatientNotification({
            appointmentId: appointment.id,
            message: `${appointment.referenceNumber} has been updated from ${currentStatus} to ${status}`,
            patientId: appointment.patientId
        })

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

        if (appointment.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel appointment. Please reload the page`,
            });
        }

        appointment.status = "Cancelled";
        await appointment.save();

        const message = `${appointment.referenceNumber} has been cancelled`;

        NotificationService.sendAdminNotification({
            appointmentId: appointment.id,
            message
        })

        NotificationService.sendStaffNotification({
            appointmentId: appointment.id,
            message
        })

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
        const serviceId = req.query.serviceId as string;

        if (!appointmentDate) {
            return res.status(400).json({
                message: "Appointment date is required.",
            });
        }

        if (!serviceId) {
            return res.status(400).json({
                message: "Service ID is required.",
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

        // Get service
        const service = await Service.findByPk(serviceId);

        if (!service) {
            return res.status(404).json({
                message: "Service not found.",
            });
        }

        // Get all non-cancelled appointments for the selected date and service
        const appointments = await Appointment.findAll({
            where: {
                appointmentDate,
                serviceId,
                status: {
                    [Op.ne]: "Cancelled",
                },
            },
            order: [["appointmentTime", "ASC"]],
        });

        // Store booked time slots
        const bookedTimes = new Set(
            appointments.map((appointment) => appointment.appointmentTime)
        );

        const slots: string[] = [];

        // Use service schedule
        const current = new Date(selectedDate);
        const [startHour, startMinute] = service.startTime
            .split(":")
            .map(Number);
        current.setHours(startHour, startMinute, 0, 0);

        const end = new Date(selectedDate);
        const [endHour, endMinute] = service.endTime
            .split(":")
            .map(Number);
        end.setHours(endHour, endMinute, 0, 0);

        const isToday = selectedDay.getTime() === today.getTime();

        while (current < end) {
            // Skip lunch break (11:00 AM - 12:30 PM)
            if (
                current.getHours() === 11 ||
                (current.getHours() === 12 &&
                    current.getMinutes() === 0)
            ) {
                current.setMinutes(current.getMinutes() + 30);
                continue;
            }

            const slotStart = current.toTimeString().slice(0, 8);

            // Hide past time slots if booking today
            if (isToday && current <= manilaNow) {
                current.setMinutes(current.getMinutes() + 30);
                continue;
            }

            // Only one appointment allowed per slot
            if (!bookedTimes.has(slotStart)) {
                slots.push(slotStart);
            }

            // Move to next 30-minute interval
            current.setMinutes(current.getMinutes() + 30);
        }

        return res.status(200).json({
            availableTimes: slots,
        });
    } catch (err) {
        next(err);
    }
};

export const getPatientUpcomingAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const today = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Manila",
            })
        )
            .toISOString()
            .split("T")[0];

        const upcomingAppointments = await Appointment.count({
            where: {
                patientId: req.user.id,
                appointmentDate: {
                    [Op.gt]: today,
                },
                status: "Approved",
            },
        });

        return res.status(200).json({
            upcomingAppointments,
        });
    } catch(err) {
        next(err);
    }
}

export const getPatientPendingAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const pendingAppointments = await Appointment.count({
            where: {
                patientId: req.user.id,
                status: "Pending"
            }
        })

        return res.status(200).json({
            pendingAppointments
        })

    } catch(err) {
        next(err);
    }
}

export const getPatientCompletedAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const completedAppointments = await Appointment.count({
            where: {
                patientId: req.user.id,
                status: "Completed"
            }
        })

        return res.status(200).json({
            completedAppointments
        })

    } catch(err) {
        next(err);
    }
}

export const getTodayAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get today's date in Asia/Manila (YYYY-MM-DD)
        const today = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Manila",
            })
        )
            .toISOString()
            .split("T")[0];

        const todayAppointments = await Appointment.count({
            where: {
                appointmentDate: today,
                status: {
                    [Op.ne]: "Cancelled",
                },
            },
        });

        return res.status(200).json({
            todayAppointments,
        });
    } catch (err) {
        next(err);
    }
};

export const getPendingAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pendingAppointments = await Appointment.count({
            where: {
                status: "Pending"
            }
        })

        return res.status(200).json({
            pendingAppointments
        })

    } catch(err) {
        next(err);
    }
}

export const getCompletedAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const completedAppointments = await Appointment.count({
            where: {
                status: "Completed"
            }
        })

        return res.status(200).json({
            completedAppointments
        })

    } catch(err) {
        next(err);
    }
}

export const getUpcomingAppointments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const today = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Manila",
            })
        )
            .toISOString()
            .split("T")[0];

        const upcomingAppointments = await Appointment.count({
            where: {
                appointmentDate: {
                    [Op.gt]: today,
                },
                status: "Approved",
            },
        });

        return res.status(200).json({
            upcomingAppointments,
        });
    } catch (err) {
        next(err);
    }
};

export const getCancelledAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cancelledAppointments = await Appointment.count({
            where: {
                status: "Cancelled"
            }
        })

        return res.status(200).json({
            cancelledAppointments
        })

    } catch(err) {
        next(err);
    }
}

export const getMonthlyAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const year = Number(req.query.year) || new Date().getFullYear();
        const monthlyAppointments = await AppointmentService.getMonthlyAppointmentsByYear(year);

        res.status(200).json({
            monthlyAppointments,
        })
    }catch(err){
        next(err);
    }
}