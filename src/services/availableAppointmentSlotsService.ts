import { Op } from "sequelize";
import {
    Appointment,
    AppointmentDateClosure,
    Doctor,
    Service,
    DoctorService,
} from "../models";
import DoctorSchedule from "../models/DoctorSchedule";
import { isAppointmentTimeClosed } from "../utils/appointmentDateClosure";

export type AppointmentPeriod = "morning" | "afternoon";

type AvailableSlotQuery = {
    appointmentDate: string;
    serviceId: number;
    doctorId: number;
    period: AppointmentPeriod;
};

const getAvailableAppointmentSlots = async ({
    appointmentDate,
    serviceId,
    doctorId,
    period,
}: AvailableSlotQuery): Promise<string[]> => {
    const now = new Date();
    const manilaNow = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
    );
    const today = new Date(
        manilaNow.getFullYear(),
        manilaNow.getMonth(),
        manilaNow.getDate()
    );
    const selectedDate = new Date(`${appointmentDate}T00:00:00`);
    const selectedDay = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
    );

    if (selectedDay < today) {
        return [];
    }

    const closedDate = await AppointmentDateClosure.findOne({
        where: { closureDate: appointmentDate },
    });

    if (closedDate?.startTime === null && closedDate.endTime === null) {
        return [];
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
        return [];
    }

    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
    });
    const doctorSchedule = await DoctorSchedule.findOne({
        where: {
            doctorId,
            day: dayOfWeek,
        },
    });

    if (!doctorSchedule) {
        return [];
    }

    const appointments = await Appointment.findAll({
        where: {
            appointmentDate,
            doctorId,
            serviceId,
            status: { [Op.ne]: "Cancelled" },
        },
        attributes: ["appointmentTime"],
    });
    const bookedTimes = new Set(
        appointments.map((appointment) => appointment.appointmentTime)
    );

    const current = new Date(selectedDate);
    const [startHour, startMinute] = doctorSchedule.startTime
        .split(":")
        .map(Number);
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date(selectedDate);
    const [endHour, endMinute] = doctorSchedule.endTime
        .split(":")
        .map(Number);
    end.setHours(endHour, endMinute, 0, 0);

    const isToday = selectedDay.getTime() === today.getTime();
    const slots: string[] = [];

    while (current < end) {
        if (
            current.getHours() === 11 ||
            (current.getHours() === 12 && current.getMinutes() === 0)
        ) {
            current.setMinutes(current.getMinutes() + 30);
            continue;
        }

        const slotStart = current.toTimeString().slice(0, 8);
        const isMorning = current.getHours() < 12;
        const matchesPeriod =
            period === "morning" ? isMorning : !isMorning;

        if (isToday && current <= manilaNow) {
            current.setMinutes(current.getMinutes() + 30);
            continue;
        }

        if (!matchesPeriod) {
            current.setMinutes(current.getMinutes() + 30);
            continue;
        }

        const isClosed = closedDate
            ? isAppointmentTimeClosed(closedDate, slotStart)
            : false;

        if (!bookedTimes.has(slotStart) && !isClosed) {
            slots.push(slotStart);
        }

        current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
};

export const getServiceAvailabilityForDate = async ({
    serviceName,
    appointmentDate,
    doctorId,
    period = "all",
}: {
    serviceName: string;
    appointmentDate: string;
    doctorId?: number;
    period?: "all" | AppointmentPeriod;
}) => {
    const selectedDate = new Date(`${appointmentDate}T00:00:00`);
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
    });
    const normalizeServiceName = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const requestedName = normalizeServiceName(serviceName);
    const activeServices = await Service.findAll({
        where: {
            status: "Active",
        },
    });

    const serviceNames = [
        ...new Set(activeServices.map((service) => service.serviceName)),
    ];
    const exactNames = serviceNames.filter(
        (name) => normalizeServiceName(name) === requestedName
    );
    const matchingNames = exactNames.length > 0
        ? exactNames
        : serviceNames.filter((name) => {
            const normalizedName = normalizeServiceName(name);
            return (
                normalizedName.includes(requestedName) ||
                requestedName.includes(normalizedName)
            );
        });

    if (matchingNames.length === 0) {
        return {
            serviceName,
            appointmentDate,
            dayOfWeek,
            serviceExists: false,
            serviceAvailable: false,
            availableServiceDays: [],
            doctors: [],
        };
    }

    if (matchingNames.length > 1) {
        return {
            serviceName,
            appointmentDate,
            dayOfWeek,
            serviceExists: true,
            serviceAvailable: false,
            matchingServiceNames: matchingNames,
            availableServiceDays: [],
            doctors: [],
        };
    }

    const matchingServiceName = matchingNames[0];
    const matchingServices = activeServices.filter(
        (service) => service.serviceName === matchingServiceName
    );
    const service = matchingServices.find(
        (item) => item.dayOfWeek === dayOfWeek
    );

    if (!service) {
        return {
            serviceName: matchingServiceName,
            appointmentDate,
            dayOfWeek,
            serviceExists: true,
            serviceAvailable: false,
            availableServiceDays: [
                ...new Set(matchingServices.map((item) => item.dayOfWeek)),
            ],
            doctors: [],
        };
    }

    const doctorServiceRows = await DoctorService.findAll({
        where: { serviceId: service.id },
        attributes: ["doctorId"],
    });

    const doctorIds = [
        ...new Set(doctorServiceRows.map((row) => row.doctorId)),
    ];
    const activeDoctors = await Doctor.findAll({
        where: {
            id: { [Op.in]: doctorIds },
            status: "Active",
        },
        attributes: ["id"],
    });
    const activeDoctorIds = activeDoctors.map((doctor) => doctor.id);
    const scheduledDoctors = await DoctorSchedule.findAll({
        where: {
            doctorId: { [Op.in]: activeDoctorIds },
            day: dayOfWeek,
        },
        attributes: ["doctorId"],
    });
    const scheduledDoctorIds = new Set(
        scheduledDoctors.map((schedule) => schedule.doctorId)
    );
    const availableDoctors = activeDoctors.filter((doctor) =>
        scheduledDoctorIds.has(doctor.id)
    );

    if (doctorId !== undefined && !availableDoctors.some(
        (doctor) => doctor.id === doctorId
    )) {
        return {
            serviceName: service.serviceName,
            appointmentDate,
            dayOfWeek,
            serviceExists: true,
            serviceAvailable: true,
            availableServiceDays: [
                ...new Set(matchingServices.map((item) => item.dayOfWeek)),
            ],
            selectedDoctorAvailable: false,
            doctors: availableDoctors.map((doctor) => ({
                doctorId: doctor.id,
                doctorName: `${doctor.firstname} ${doctor.lastname}`,
            })),
        };
    }

    const doctorsToCheck = doctorId === undefined
        ? availableDoctors
        : availableDoctors.filter((doctor) => doctor.id === doctorId);
    const doctors = await Promise.all(doctorsToCheck.map(async (doctor) => {
        const [morningTimes, afternoonTimes] = await Promise.all([
            period === "afternoon"
                ? Promise.resolve([])
                : getAvailableAppointmentSlots({
                    appointmentDate,
                    serviceId: service.id,
                    doctorId: doctor.id,
                    period: "morning",
                }),
            period === "morning"
                ? Promise.resolve([])
                : getAvailableAppointmentSlots({
                    appointmentDate,
                    serviceId: service.id,
                    doctorId: doctor.id,
                    period: "afternoon",
                }),
        ]);
        const availableTimes = [...morningTimes, ...afternoonTimes];
        return {
            doctorId: doctor.id,
            doctorName: `${doctor.firstname} ${doctor.lastname}`,
            availableSlots: availableTimes.length,
            ...(doctorId !== undefined ? { availableTimes } : {}),
        };
    }));

    return {
        serviceName: service.serviceName,
        appointmentDate,
        dayOfWeek,
        serviceExists: true,
        serviceAvailable: true,
        availableServiceDays: [
            ...new Set(matchingServices.map((item) => item.dayOfWeek)),
        ],
        selectedDoctorAvailable: doctorId === undefined
            ? undefined
            : doctors[0]?.availableSlots > 0,
        doctors: doctorId === undefined
            ? doctors.filter((doctor) => doctor.availableSlots > 0)
            : doctors,
    };
};

export default getAvailableAppointmentSlots;
