import { Op, UniqueConstraintError } from "sequelize";
import { Appointment, Patient } from "../models";
import EmailJob from "../models/EmailJob";
import { appointmentStartAt, isReminderDue, manilaDate } from "../utils/appointmentReminder";

export const queueAppointmentReminders = async (now = new Date()) => {
    const firstDate = manilaDate(now);
    const secondDate = manilaDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));

    const appointments = await Appointment.findAll({
        where: {
            appointmentDate: { [Op.between]: [firstDate, secondDate] },
            status: { [Op.in]: ["Approved", "Rescheduled"] },
        },
        include: [{ model: Patient, as: "patient", required: true, where: { isActive: true } }],
    });

    for (const appointment of appointments) {
        const start = appointmentStartAt(appointment.appointmentDate, appointment.appointmentTime);
        if (!isReminderDue(start, now)) continue;

        const startAt = start.toISOString();
        const patient = (appointment as Appointment & { patient: Patient }).patient;
        try {
            await EmailJob.create({
                type: "appointment_reminder",
                dedupeKey: `appointment-reminder:${appointment.id}:${startAt}`,
                payload: { to: patient.email, appointmentId: appointment.id, appointmentStartAt: startAt },
            });
        } catch (error) {
            if (!(error instanceof UniqueConstraintError)) throw error;
        }
    }
};
