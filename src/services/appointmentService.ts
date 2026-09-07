import { col, fn, literal, Op, Order, WhereOptions } from "sequelize";
import { AppointmentAttributes } from "../models/Appointment";
import { Appointment, Doctor, Service, AppointmentRecord, Patient, AppointmentReschedule } from '../models/index';

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
                    required: false,
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
                    as: 'patient',
                    required: false,
                },
                {
                    model: AppointmentRecord,
                    as: 'appointmentRecord',
                    required: false,
                },
                {
                    model: AppointmentReschedule,
                    as: 'appointmentReschedules',
                    required: false,
                }
            ],
            // Important when searching included models
            // while using limit/offset.
            subQuery: false,

            // Prevent duplicated appointments from affecting count.
            distinct: true,
            order,
            limit,
            offset,
        });

        return { total, appointments }
    }

    static getMonthlyAppointmentsByYear = async (year: number) => {
        const result = await Appointment.findAll({
            attributes: [
                [
                    fn("DATE_PART", "month", col("createdAt")),
                    "month",
                ],
                [
                    fn("COUNT", col("id")),
                    "totalAppointments",
                ],
            ],
            where: {
                createdAt: {
                    [Op.between]: [
                        new Date(year, 0, 1),
                        new Date(year, 11, 31, 23, 59, 59, 999),
                    ],
                },
            },
            group: [
                fn("DATE_PART", "month", col("createdAt")),
            ],
            order: [
                [
                    fn("DATE_PART", "month", col("createdAt")),
                    "ASC",
                ],
            ],
            raw: true,
        });

        const monthlyAppointments = monthNames.map((month) => ({
            month,
            totalAppointments: 0,
        }));

        result.forEach((item: any) => {
            monthlyAppointments[Number(item.month) - 1].totalAppointments =
                Number(item.totalAppointments);
        });

        return monthlyAppointments;
    };
}