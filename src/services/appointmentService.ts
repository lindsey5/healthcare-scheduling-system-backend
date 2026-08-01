import { WhereOptions } from "sequelize";
import { AppointmentAttributes } from "../models/Appointment";
import { Appointment, Doctor, Service, AppointmentRecord, Patient } from '../models/index';

export default class AppointmentService {
    static getAppointments = async ({
        where,
        limit,
        offset
    } : {
        where: WhereOptions<AppointmentAttributes>;
        limit: number,
        offset: number
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
                    as: 'patient'
                },
                {
                    model: AppointmentRecord,
                    as: 'appointmentRecord'
                }
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        return { total, appointments }
    }
}