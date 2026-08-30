import { NextFunction, Request, Response } from "express";
import { Service } from '../models/index';
import { Op } from "sequelize";
import { createAudit } from "../services/auditService";
import { AuthRequest } from "../types/type";

export const createService = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { serviceName, dayOfWeek, startTime, endTime } = req.body;

        const clinicStart = "08:00:00";
        const clinicEnd = "16:00:00";

        // Validate clinic hours
        if (
            startTime < clinicStart ||
            startTime > clinicEnd ||
            endTime < clinicStart ||
            endTime > clinicEnd
        ) {
            return res.status(400).json({
                message:
                    "Service time must be between 8:00 AM and 4:00 PM.",
            });
        }

        // Validate end time is after start time
        if (endTime <= startTime) {
            return res.status(400).json({
                message:
                    "End time must be later than the start time.",
            });
        }

        const isExisting = await Service.findOne({
            where: {
                serviceName,
                dayOfWeek,
                status: "Active"
            },
        });

        if (isExisting) {
            return res.status(409).json({
                message:
                    "A service with the same name already exists for the selected day.",
            });
        }

        const service = await Service.create(req.body);

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
                endTime: service.endTime
            },
            severity: "WARNING",
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
        })

        return res.status(201).json({
            service,
            message: "Service successfully created.",
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
            where: {
                ...whereClause,
                status: 'Active'
            }
        })

        return res.status(200).json({ services });

    }catch(err){
        next(err);
    }
};

export const updateService = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { serviceName, dayOfWeek, startTime, endTime } = req.body;

        const clinicStart = "08:00:00";
        const clinicEnd = "16:00:00";

        // Validate clinic hours
        if (
            startTime < clinicStart ||
            startTime > clinicEnd ||
            endTime < clinicStart ||
            endTime > clinicEnd
        ) {
            return res.status(400).json({
                message:
                    "Service time must be between 8:00 AM and 4:00 PM.",
            });
        }

        // Validate end time is after start time
        if (endTime <= startTime) {
            return res.status(400).json({
                message:
                    "End time must be later than the start time.",
            });
        }

        const isExisting = await Service.findOne({
            where: {
                serviceName,
                dayOfWeek,
                status: "Active",
                id: {
                    [Op.ne]: Number(req.params.id)
                },
            },
        });

        if (isExisting) {
            return res.status(409).json({
                message:
                    "A service with the same name already exists for the selected day.",
            });
        }

        const service = await Service.findByPk(Number(req.params.id));

        if(!service){
            return res.status(404).json({
                message: "Service not found"
            })
        }

        const oldValues = service;

        service.set(req.body);

        await service.save();

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
                endTime: oldValues.endTime
            },
            newValues: {
                serviceName: service.serviceName,
                dayOfWeek: service.dayOfWeek,
                startTime: service.startTime,
                endTime: service.endTime
            },
            severity: "WARNING",
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
        })

        return res.status(201).json({
            service,
            message: "Service successfully updated.",
        });
    } catch (err) {
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