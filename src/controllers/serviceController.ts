import { NextFunction, Request, Response } from "express";
import { Service, Appointment } from '../models/index';
import { Op } from "sequelize";

export const createService = async (req: Request, res: Response, next: NextFunction) => {
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
            where: whereClause
        })

        return res.status(200).json({ services });

    }catch(err){
        next(err);
    }
};

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
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

        service.set(req.body);

        await service.save();

        return res.status(201).json({
            service,
            message: "Service successfully updated.",
        });
    } catch (err) {
        next(err);
    }
};