import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/type";
import AppointmentCapacity, {
    AppointmentCapacityDay,
} from "../models/AppointmentCapacity";
import { createAudit } from "../services/auditService";

const DAYS: AppointmentCapacityDay[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];

export const getAppointmentCapacities = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const capacities = await AppointmentCapacity.findAll({
            order: [["dayOfWeek", "ASC"]],
        });

        return res.status(200).json({ capacities });
    } catch (error) {
        next(error);
    }
};

export const updateAppointmentCapacity = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const dayOfWeek = req.params.dayOfWeek as AppointmentCapacityDay;
        const { morningCapacity, afternoonCapacity } = req.body as {
            morningCapacity: unknown;
            afternoonCapacity: unknown;
        };
        const isValidCapacity = (value: unknown): value is number =>
            typeof value === "number" &&
            Number.isSafeInteger(value) &&
            value >= 0 &&
            value <= 2147483647;

        if (!DAYS.includes(dayOfWeek)) {
            return res.status(400).json({
                message: "A valid weekday is required.",
            });
        }

        if (
            !isValidCapacity(morningCapacity) ||
            !isValidCapacity(afternoonCapacity)
        ) {
            return res.status(400).json({
                message:
                    "Morning and afternoon capacities must be non-negative whole numbers.",
            });
        }

        const capacity = await AppointmentCapacity.findByPk(dayOfWeek);
        if (!capacity) {
            return res.status(404).json({
                message: `Appointment capacity for ${dayOfWeek} was not found.`,
            });
        }

        const oldValues = {
            morningCapacity: capacity.morningCapacity,
            afternoonCapacity: capacity.afternoonCapacity,
        };
        await capacity.update({ morningCapacity, afternoonCapacity });

        await createAudit({
            userId: req.user.id,
            userType: req.user.role,
            action: "UPDATE",
            entity: "AppointmentCapacity",
            entityId: dayOfWeek,
            severity: "INFO",
            oldValues,
            newValues: { morningCapacity, afternoonCapacity },
            ipAddress: req.ip ?? "Unknown",
            userAgent: req.headers["user-agent"] ?? "Unknown",
        });

        return res.status(200).json({
            message: `${dayOfWeek} appointment capacity updated.`,
            capacity,
        });
    } catch (error) {
        next(error);
    }
};
