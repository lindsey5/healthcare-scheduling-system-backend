import { col, fn, Op, Order, WhereOptions } from "sequelize";
import { AppointmentAttributes } from "../models/Appointment";
import { Appointment, Doctor, Service, AppointmentRecord, Patient } from '../models/index';

const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export default class AppointmentService {
    static getAppointments = async ({
        where,
        limit,
        offset,
        order
    } : {
        where: WhereOptions<AppointmentAttributes>;
        limit: number;
        offset: number;
        order: Order;
    }) => {
        const { count : total, rows: appointments } = await Appointment.findAndCountAll({
            where,
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
            order,
            limit,
            offset,
        });

        return { total, appointments }
    }

    static getMonthlyAppointmentsByYear = async (year: number) => {
        const result = await Appointment.findAll({
            attributes: [
                [fn("MONTH", col("createdAt")), "month"],
                [fn("COUNT", col("id")), "totalAppointments"],
            ],
            where: {
                createdAt: {
                    [Op.between]: [
                        new Date(year, 0, 1),
                        new Date(year, 11, 31, 23, 59, 59, 999),
                    ],
                },
            },
            group: [fn("MONTH", col("createdAt"))],
            order: [[fn("MONTH", col("createdAt")), "ASC"]],
            raw: true,
        });

        const monthlyAppointments = monthNames.map((month) => ({
            month,
            totalAppointments: 0,
        }));

        result.forEach((item: any) => {
            monthlyAppointments[item.month - 1].totalAppointments = Number(
                item.totalAppointments
            );
        });

        return monthlyAppointments;
    };
}