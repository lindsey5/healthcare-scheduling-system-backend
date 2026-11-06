import { Op, Transaction } from "sequelize";
import { Appointment, AppointmentCapacity } from "../models";
import type { AppointmentCapacityDay } from "../models/AppointmentCapacity";

const WEEKDAYS: AppointmentCapacityDay[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];

export type AppointmentPeriod = "morning" | "afternoon";

export const getAppointmentDayOfWeek = (
    appointmentDate: string
): AppointmentCapacityDay | null => {
    const parsedDate = new Date(`${appointmentDate}T00:00:00.000Z`);
    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== appointmentDate
    ) {
        return null;
    }

    const weekday = parsedDate.getUTCDay();
    return weekday === 0 || weekday === 6
        ? null
        : WEEKDAYS[weekday - 1];
};

export const getAppointmentPeriod = (appointmentTime: string): AppointmentPeriod =>
    appointmentTime < "12:00:00" ? "morning" : "afternoon";

export const getRemainingAppointmentCapacity = async ({
    appointmentDate,
    period,
    transaction,
    excludeAppointmentId,
    lock = false,
}: {
    appointmentDate: string;
    period: AppointmentPeriod;
    transaction?: Transaction;
    excludeAppointmentId?: string;
    lock?: boolean;
}) => {
    const dayOfWeek = getAppointmentDayOfWeek(appointmentDate);
    if (!dayOfWeek) {
        return 0;
    }

    const capacityOptions = {
        where: { dayOfWeek },
        ...(transaction ? { transaction } : {}),
        ...(lock && transaction
            ? { lock: transaction.LOCK.UPDATE }
            : {}),
    };
    const dailyCapacity = await AppointmentCapacity.findOne(capacityOptions);
    if (!dailyCapacity) {
        throw new Error(`Appointment capacity is not configured for ${dayOfWeek}.`);
    }

    const appointmentTimeCondition =
        period === "morning"
            ? { [Op.lt]: "12:00:00" }
            : { [Op.gte]: "12:00:00" };
    const bookedCount = await Appointment.count({
        where: {
            appointmentDate,
            appointmentTime: appointmentTimeCondition,
            status: { [Op.notIn]: ["Cancelled", "Rejected"] },
            ...(excludeAppointmentId
                ? { id: { [Op.ne]: excludeAppointmentId } }
                : {}),
        },
        ...(transaction ? { transaction } : {}),
    });

    const capacity =
        period === "morning"
            ? dailyCapacity.morningCapacity
            : dailyCapacity.afternoonCapacity;
    return Math.max(0, capacity - bookedCount);
};
