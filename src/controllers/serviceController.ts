import { NextFunction, Request, Response } from "express";
import { Doctor, DoctorService, Service } from '../models/index';
import { Op } from "sequelize";
import { createAudit } from "../services/auditService";
import { AuthRequest } from "../types/type";
import { sequelize } from "../config/db";

type DoctorServiceScheduleInput = {
    doctorId: number;
    startTime: string;
    endTime: string;
};

const isValidServiceDay = (day: unknown) =>
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(
        String(day)
    );

const isValidServiceTime = (time: unknown): time is string =>
    typeof time === "string" &&
    /^(?:08|09|10|11|12|13|14|15|16):(?:00|30):00$/.test(time);

const getServicePayloadError = (
    serviceName: unknown,
    dayOfWeek: unknown,
    startTime: unknown,
    endTime: unknown,
    doctors: unknown
) => {
    if (typeof serviceName !== "string" || !serviceName.trim() || serviceName.length > 100) {
        return "Service name is required and must not exceed 100 characters.";
    }

    if (!isValidServiceDay(dayOfWeek)) {
        return "Select a valid service day.";
    }

    if (
        !isValidServiceTime(startTime) ||
        !isValidServiceTime(endTime) ||
        startTime < "08:00:00" ||
        endTime > "16:00:00" ||
        startTime >= endTime
    ) {
        return "Select valid service hours between 8:00 AM and 4:00 PM.";
    }

    if (!Array.isArray(doctors)) {
        return "Doctor assignments must be an array.";
    }

    const doctorIds = new Set<number>();
    for (const assignment of doctors) {
        if (
            !assignment ||
            typeof assignment !== "object" ||
            !Number.isInteger(assignment.doctorId) ||
            assignment.doctorId <= 0 ||
            doctorIds.has(assignment.doctorId) ||
            !isValidServiceTime(assignment.startTime) ||
            !isValidServiceTime(assignment.endTime) ||
            assignment.startTime < "08:00:00" ||
            assignment.endTime > "16:00:00" ||
            assignment.startTime < startTime ||
            assignment.endTime > endTime ||
            assignment.startTime >= assignment.endTime
        ) {
            return "Each assigned doctor must have a unique ID and a schedule within the service hours.";
        }

        doctorIds.add(assignment.doctorId);
    }

    for (let index = 0; index < doctors.length; index += 1) {
        const current = doctors[index];
        for (let otherIndex = index + 1; otherIndex < doctors.length; otherIndex += 1) {
            const other = doctors[otherIndex];
            if (
                current.startTime < other.endTime &&
                other.startTime < current.endTime
            ) {
                return "Doctor schedules for the same service cannot overlap.";
            }
        }
    }

    return null;
};

const serviceIncludes = [
    {
        model: DoctorService,
        as: "doctorServices",
        include: [{
            model: Doctor,
            as: "doctor",
            where: { status: "Active" },
            required: true,
        }],
    },
];

export const createService = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { serviceName, dayOfWeek, startTime, endTime, doctors } = req.body;
    const payloadError = getServicePayloadError(
        serviceName,
        dayOfWeek,
        startTime,
        endTime,
        doctors
    );
    if (payloadError) {
        return res.status(400).json({ message: payloadError });
    }

    const assignments = doctors as DoctorServiceScheduleInput[];
    const transaction = await sequelize.transaction();
    let transactionCommitted = false;

    try {
        const isExisting = await Service.findOne({
            where: {
                serviceName: serviceName.trim(),
                dayOfWeek,
                status: "Active"
            },
        });

        if (isExisting) {
            await transaction.rollback();
            return res.status(409).json({
                message:
                    "A service with the same name already exists for the selected day.",
            });
        }

        const doctorCount = await Doctor.count({
            where: {
                id: { [Op.in]: assignments.map(({ doctorId }) => doctorId) },
                status: "Active",
            },
            transaction,
        });
        if (doctorCount !== assignments.length) {
            await transaction.rollback();
            return res.status(400).json({
                message: "One or more selected doctors are unavailable.",
            });
        }

        const service = await Service.create({
            serviceName: serviceName.trim(),
            dayOfWeek,
            startTime,
            endTime,
            status: "Active",
        }, { transaction });
        await DoctorService.bulkCreate(
            assignments.map((assignment) => ({
                ...assignment,
                serviceId: service.id,
            })),
            { transaction }
        );
        await transaction.commit();
        transactionCommitted = true;

        await createAudit({
            userId: req.user.id,
            userType: req.user.role,
            action: "CREATE",
            entity: "Service",
            entityId: service.id,
            oldValues: {},
            newValues: {
                serviceName: service.serviceName,
                dayOfWeek: service.dayOfWeek,
                startTime: service.startTime,
                endTime: service.endTime,
                doctorServiceSchedules: assignments,
            },
            severity: "WARNING",
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
        })

        return res.status(201).json({
            service: await Service.findByPk(service.id, { include: serviceIncludes }),
            message: "Service successfully created.",
        });
    } catch (err) {
        if (!transactionCommitted) {
            await transaction.rollback();
        }
        next(err);
    }
};

export const getServices = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const dayOfWeek = req.query.dayOfWeek;

        const days = typeof dayOfWeek === "string"
            ? dayOfWeek.split(",").filter(Boolean)
            : [];

        const whereClause = days.length > 0
            ? {
                dayOfWeek: {
                    [Op.in]: days,
                },
            }
            : {};

        const services = await Service.findAll({
            where: {
                ...whereClause,
                status: "Active",
            },
            include: serviceIncludes,
            order: [["serviceName", "ASC"]],
        });

        return res.status(200).json({ services });
    } catch (err) {
        next(err);
    }
};

export const updateService = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { serviceName, dayOfWeek, startTime, endTime, doctors } = req.body;
    const payloadError = getServicePayloadError(
        serviceName,
        dayOfWeek,
        startTime,
        endTime,
        doctors
    );
    if (payloadError) {
        return res.status(400).json({ message: payloadError });
    }

    const assignments = doctors as DoctorServiceScheduleInput[];
    const transaction = await sequelize.transaction();
    let transactionCommitted = false;

    try {
        const isExisting = await Service.findOne({
            where: {
                serviceName: serviceName.trim(),
                dayOfWeek,
                status: "Active",
                id: {
                    [Op.ne]: Number(req.params.id)
                },
            },
        });

        if (isExisting) {
            await transaction.rollback();
            return res.status(409).json({
                message:
                    "A service with the same name already exists for the selected day.",
            });
        }

        const service = await Service.findByPk(Number(req.params.id), { transaction });

        if(!service){
            await transaction.rollback();
            return res.status(404).json({
                message: "Service not found"
            })
        }

        const doctorCount = await Doctor.count({
            where: {
                id: { [Op.in]: assignments.map(({ doctorId }) => doctorId) },
                status: "Active",
            },
            transaction,
        });
        if (doctorCount !== assignments.length) {
            await transaction.rollback();
            return res.status(400).json({
                message: "One or more selected doctors are unavailable.",
            });
        }

        const oldValues = {
            serviceName: service.serviceName,
            dayOfWeek: service.dayOfWeek,
            startTime: service.startTime,
            endTime: service.endTime,
        };
        const oldDoctorSchedules = await DoctorService.findAll({
            where: { serviceId: service.id },
            transaction,
        });

        service.set({
            serviceName: serviceName.trim(),
            dayOfWeek,
            startTime,
            endTime,
        });

        await service.save({ transaction });
        await DoctorService.destroy({
            where: { serviceId: service.id },
            transaction,
        });
        await DoctorService.bulkCreate(
            assignments.map((assignment) => ({
                ...assignment,
                serviceId: service.id,
            })),
            { transaction }
        );
        await transaction.commit();
        transactionCommitted = true;

        await createAudit({
            userId: req.user.id,
            userType: req.user.role,
            action: "UPDATE",
            entity: "Service",
            entityId: service.id,
            oldValues: {
                serviceName: oldValues.serviceName,
                dayOfWeek: oldValues.dayOfWeek,
                startTime: oldValues.startTime,
                endTime: oldValues.endTime,
                doctorServiceSchedules: oldDoctorSchedules,
            },
            newValues: {
                serviceName: service.serviceName,
                dayOfWeek: service.dayOfWeek,
                startTime: service.startTime,
                endTime: service.endTime,
                doctorServiceSchedules: assignments,
            },
            severity: "WARNING",
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
        })

        return res.status(201).json({
            service: await Service.findByPk(service.id, { include: serviceIncludes }),
            message: "Service successfully updated.",
        });
    } catch (err) {
        if (!transactionCommitted) {
            await transaction.rollback();
        }
        next(err);
    }
};

export const deleteService = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const id = req.params.id;

        const service = await Service.findByPk(Number(id));

        if(!service) return res.status(404).json({ message: "Service not found" });

        service.status = 'Deleted';
        await service.save();

        await createAudit({
            userId: req.user.id,
            userType: req.user.role,
            action: "DELETE",
            entity: "Service",
            entityId: service.id,
            oldValues: {
                serviceName: service.serviceName,
                dayOfWeek: service.dayOfWeek,
                startTime: service.startTime,
                endTime: service.endTime
            },
            newValues: {},
            severity: "CRITICAL",
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
        })

        return res.status(200).json({ message: "Service successfully deleted" });

    }catch(err){
        next(err);
    }
}