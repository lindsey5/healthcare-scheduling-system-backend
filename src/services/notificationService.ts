import { Admin, AdminNotification, Appointment, AppointmentRecord, Doctor, Patient, PatientNotification, Service} from '../models/index';
import { emitAdminNotification } from '../sockets/namespaces/admin-notification.namespace';
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
        appointmentId,
        message
    } : 
    {
        appointmentId: string;
        message: string;
    }) {
        try{

            const admins = await Admin.findAll();

            for(const admin of admins) {
                const notification = await AdminNotification.create({
                    adminId: admin.id,
                    appointmentId,
                    message,
                })


                const notificationWithRelations = await AdminNotification.findByPk(
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

                if(!notificationWithRelations) continue;

                emitAdminNotification(notificationWithRelations, `${admin.id}-admin`)
            }


        }catch(err : any){
            throw new Error(err.message)
        }

    }
}