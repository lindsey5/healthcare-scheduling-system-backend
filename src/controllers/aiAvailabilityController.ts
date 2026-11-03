import { NextFunction, Request, Response } from "express";
import { getServiceAvailabilityForDate } from "../services/availableAppointmentSlotsService";

const isValidDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
};

export const getAiServiceAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { serviceName, appointmentDate, doctorId, period } = req.body as {
            serviceName?: unknown;
            appointmentDate?: unknown;
            doctorId?: unknown;
            period?: unknown;
        };

        if (
            typeof serviceName !== "string" ||
            serviceName.trim().length === 0 ||
            serviceName.length > 100
        ) {
            return res.status(400).json({
                message: "A valid service name is required.",
            });
        }

        if (
            typeof appointmentDate !== "string" ||
            !isValidDate(appointmentDate)
        ) {
            return res.status(400).json({
                message: "Appointment date must be a valid YYYY-MM-DD date.",
            });
        }

        if (
            doctorId !== undefined &&
            (typeof doctorId !== "number" ||
                !Number.isInteger(doctorId) ||
                doctorId <= 0)
        ) {
            return res.status(400).json({
                message: "Doctor ID must be a positive integer.",
            });
        }

        if (
            period !== undefined &&
            period !== "all" &&
            period !== "morning" &&
            period !== "afternoon"
        ) {
            return res.status(400).json({
                message: "Period must be all, morning, or afternoon.",
            });
        }

        const availability = await getServiceAvailabilityForDate({
            serviceName,
            appointmentDate,
            ...(doctorId !== undefined ? { doctorId } : {}),
            period: period ?? "all",
        });

        return res.status(200).json(availability);
    } catch (error) {
        next(error);
    }
};
