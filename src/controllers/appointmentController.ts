import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/type";
import { Appointment, AppointmentDateClosure, AppointmentRecord, AppointmentReschedule, Doctor, Patient, Service, } from '../models/index';
import { Op, Sequelize } from "sequelize";
import AppointmentService from "../services/appointmentService";
import { AppointmentAttributes } from "../models/Appointment";
import NotificationService from "../services/notificationService";
import { formatTime } from "../utils/date";
import { sendAppointmentUpdate, sendRescheduleUpdate } from "../services/emailService";
import { createAudit } from "../services/auditService";
import { isAppointmentTimeClosed } from "../utils/appointmentDateClosure";
import getAvailableAppointmentSlots from "../services/availableAppointmentSlotsService";

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const closedDate = await AppointmentDateClosure.findOne({
            where: {
                closureDate: req.body.appointment.appointmentDate,
            },
        });

        if (
            closedDate &&
            isAppointmentTimeClosed(
                closedDate,
                req.body.appointment.appointmentTime
            )
        ) {
            return res.status(409).json({
                message: "The selected appointment time is closed.",
            });
        }

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
                },
                {
                    model: AppointmentReschedule,
                    as: 'appointmentReschedules'
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

export const updateAppointmentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const id = req.params.id;
        const status = req.body.status as AppointmentAttributes['status'];
        const statusReason =
            typeof req.body.reason === "string" ? req.body.reason.trim() : "";

        const appointment = await Appointment.findByPk(String(id), {
            include: [
                {
                    model: Patient,
                    as: 'patient'
                }
            ]
        });

        if(!appointment) return res.status(404).json({ message: "Appointment not found." });

        if (status === "Cancelled" || status === "Rejected") {
            if (!statusReason) {
                return res.status(400).json({
                    message: "A reason is required to cancel or reject an appointment.",
                });
            }

            if (statusReason.length > 1000) {
                return res.status(400).json({
                    message: "The reason must be 1000 characters or fewer.",
                });
            }
        }

        const allowedTransitions: Record<string, string[]> = {
            Pending: ["Approved", "Rejected"],
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
                message: `Cannot update order status from ${currentStatus} to ${status}. Please reload the page`,
            });
        }

        appointment.status = status;
        appointment.statusReason =
            status === "Cancelled" || status === "Rejected"
                ? statusReason
                : null;

        await appointment.save();

        await NotificationService.sendPatientNotification({
            appointmentId: appointment.id,
            message:
                statusReason && (status === "Cancelled" || status === "Rejected")
                    ? `${appointment.referenceNumber} has been ${status.toLowerCase()}: ${statusReason}`
                    : `${appointment.referenceNumber} has been updated from ${currentStatus} to ${status}`,
            patientId: appointment.patientId
        })

        await sendAppointmentUpdate({
            referenceNumber: appointment.referenceNumber,
            email: (appointment as any).patient.email,
            prevStatus: currentStatus,
            newStatus: status,
            reason: statusReason || undefined,
        })

        await createAudit({
            userId: req.user.id,
            userType: req.user.role,
            action: "UPDATE",
            entity: "Appointment",
            entityId: appointment.id,
            oldValues: {
                status: currentStatus,
                statusReason: appointment.statusReason,
            },
            newValues: {
                status: appointment.status,
                statusReason: appointment.statusReason,
            },
            severity: "INFO",
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
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
        const statusReason =
            typeof req.body.reason === "string" ? req.body.reason.trim() : "";

        const appointment = await Appointment.findByPk(String(id));

        if(!appointment) return res.status(404).json({ message: "Appointment not found" });

        if(appointment.patientId !== req.user.id) return res.status(401).json({ message: "You are not authorized to access this appointment." })

        if (appointment.status !== 'Pending') {
            return res.status(400).json({
                message: `Cannot cancel appointment. Please reload the page`,
            });
        }

        if (!statusReason) {
            return res.status(400).json({
                message: "A reason is required to cancel an appointment.",
            });
        }

        if (statusReason.length > 1000) {
            return res.status(400).json({
                message: "The reason must be 1000 characters or fewer.",
            });
        }

        appointment.status = "Cancelled";
        appointment.statusReason = statusReason;
        await appointment.save();

        const message = `${appointment.referenceNumber} has been cancelled: ${statusReason}`;

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
        const appointmentDate =
            req.query.appointmentDate as string;

        const serviceId =
            req.query.serviceId as string;

        const doctorId =
            req.query.doctorId as string;
        const period =
            req.query.period as string;

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

        if (!doctorId) {
            return res.status(400).json({
                message: "Doctor ID is required.",
            });
        }

        if (period !== "morning" && period !== "afternoon") {
            return res.status(400).json({
                message: "Period must be either morning or afternoon.",
            });
        }

        const service = await Service.findByPk(serviceId);

        if (!service) {
            return res.status(404).json({
                message: "Service not found.",
            });
        }

        const availableTimes = await getAvailableAppointmentSlots({
            appointmentDate,
            serviceId: Number(serviceId),
            doctorId: Number(doctorId),
            period,
        });

        return res.status(200).json({
            availableTimes,
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
                status: { [Op.in] : ['Approved', 'Rescheduled']}
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
                status: { [Op.in] : ['Approved', 'Rescheduled']}
            },
        });

        return res.status(200).json({
            upcomingAppointments,
        });
    } catch (err) {
        next(err);
    }
};

export const getCancelledAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const rescheduleAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const id = String(req.params.id);

        const { newDoctorId, newAppointmentDate, newAppointmentTime, reason } = req.body;
        
        const appointment = await Appointment.findByPk(id, {
            include: [
                {
                    model: Service,
                    as: 'service'
                },
                {
                    model: Patient,
                    as: "patient"
                },
                {
                    model: Doctor,
                    as: 'doctor'
                }
            ]
        });

        if(!appointment) return res.status(404).json({ message: 'Appointment not found.' });

        const closedDate = await AppointmentDateClosure.findOne({
            where: { closureDate: newAppointmentDate },
        });

        if (
            closedDate &&
            isAppointmentTimeClosed(closedDate, newAppointmentTime)
        ) {
            return res.status(409).json({
                message: "The selected appointment time is closed.",
            });
        }

        const oldValues = appointment;

        const dayOfWeek = new Date(newAppointmentDate).toLocaleDateString("en-US", {
            weekday: "long",
            timeZone: "Asia/Manila",
        });

        const service = await Service.findOne({
            where: {
                id: Number(appointment.serviceId),
            },
        });

        if (service && service.dayOfWeek !== dayOfWeek) {
            return res.status(400).json({
                message: `${(appointment as any).service.serviceName} is only available on ${service.dayOfWeek}`,
            });
        }

        const doctorChanged =
            newDoctorId !== undefined &&
            newDoctorId !== null &&
            newDoctorId !== appointment.doctorId;

        const rescheduledByType = req.user.id === 'admin' ? 'Admin' : 'Staff';

        await AppointmentReschedule.create({
            appointmentId: appointment.id,
            oldAppointmentDate: appointment.appointmentDate,
            newAppointmentDate,
            oldAppointmentTime: appointment.appointmentTime,
            newAppointmentTime,
            oldDoctorId: doctorChanged ? appointment.doctorId : null,
            newDoctorId: doctorChanged ? newDoctorId : null,
            rescheduledByType,
            rescheduledByAdminId: rescheduledByType === 'Admin' ? req.user.id : null,
            rescheduledByStaffId: rescheduledByType !== 'Admin' ? req.user.id : null,
            reason,
        })

        if(doctorChanged){
            appointment.doctorId = newDoctorId
        }

        const prevDate = appointment.appointmentDate;
        const prevTime = appointment.appointmentTime;

        appointment.appointmentDate = newAppointmentDate;
        appointment.appointmentTime = newAppointmentTime;
        appointment.status = "Rescheduled";

        await appointment.save();

        await NotificationService.sendPatientNotification({
            appointmentId: appointment.id,
            message: `${appointment.referenceNumber} has been Rescheduled`,
            patientId: appointment.patientId
        })

        await sendRescheduleUpdate((appointment as any).patient.email, {
            doctorName: `${(appointment as any).doctor.firstname} ${(appointment as any).doctor.lastname}`,
            previousDate: String(prevDate),
            newDate: newAppointmentDate,
            previousTime: prevTime,
            newTime: newAppointmentTime,
            reason,
            referenceNumber: appointment.referenceNumber
        })

        await createAudit({
            userId: req.user.id,
            userType: req.user.role,
            action: "RESCHEDULE",
            entity: "Appointment",
            entityId: appointment.id,
            oldValues: {
                doctorId: oldValues.doctorId,
                appointmentDate: oldValues.appointmentDate,
                appointmentTime: oldValues.appointmentTime,
                status: oldValues.status,
            },
            newValues: {
                doctorId: appointment.doctorId,
                appointmentDate: appointment.appointmentDate,
                appointmentTime: appointment.appointmentTime,
                status: appointment.status,
            },
            severity: "INFO",
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
        })

        res.status(200).json({
            message: "Appointment successfully rescheduled",
            appointment
        })

    }catch(err){
        next(err);
    }
}