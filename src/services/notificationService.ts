import { Appointment, AppointmentRecord, Doctor, Patient, PatientNotification, Service} from '../models/index';
import { emitPatientNotification } from '../sockets/namespaces/patient-notification.namespace';

export default class NotificationService {
    static async sendPatientNotification ({
        patientId,
        appointmentId,
        message
    } : 
    {
        patientId: number;
        appointmentId: string;
        message: string;

    }) {
        const notification = await PatientNotification.create({
            patientId,
            appointmentId,
            message,
        });

        const notificationWithRelations = await PatientNotification.findByPk(
            notification.id,
            {
                include: [
                    {
                        model: Appointment,
                        as: "appointment",
                        include: [
                            {
                                model: AppointmentRecord,
                                as: "appointmentRecord",
                            },
                            {
                                model: Service,
                                as: "service",
                            },
                            {
                                model: Doctor,
                                as: "doctor",
                            },
                            {
                                model: Patient,
                                as: 'patient'
                            }
                        ],
                    },
                ],
            }
        );

        if(!notificationWithRelations) return;

        emitPatientNotification(notificationWithRelations, `${patientId}-patient`);
    }

    static async sendAdminNotification ({
        appointmentId
    } : 
    {
        appointmentId: string;
        message: string;
    }) {

    }
}