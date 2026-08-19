import Admin from "./Admin";
import AdminNotification from "./AdminNotification";
import Appointment from "./Appointment";
import AppointmentRecord from "./AppointmentRecord";
import AppointmentReschedule from "./AppointmentReschedule";
import Conversation from "./Conversation";
import Doctor from "./Doctor";
import DoctorService from "./DoctorService";
import Message from "./Message";
import Patient from "./Patient";
import PatientNotification from "./PatientNotification";
import Service from "./Service";
import Staff from "./Staff";
import StaffNotification from "./StaffNotification";

Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Patient.hasMany(PatientNotification, { foreignKey: 'patientId', as: "patientNotifications" });
Patient.hasMany(Conversation, { foreignKey: "patientId", as: "patientConversations" });

Admin.hasMany(AdminNotification, { foreignKey: "adminId", as: "adminNotifications" });

Staff.hasMany(StaffNotification, { foreignKey: "staffId", as: "staffNotifications"});
Staff.hasMany(Conversation, { foreignKey: "patientId", as: "staffConversations" });

Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Doctor.hasMany(DoctorService, { foreignKey: 'doctorId', as: 'doctorServices' });

Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Appointment.hasOne(AppointmentRecord, { foreignKey: "appointmentId", as: "appointmentRecord" });
Appointment.hasOne(PatientNotification, { foreignKey: 'appointmentId', as: 'patientNotification' });
Appointment.hasOne(AdminNotification, { foreignKey: "appointmentId", as: "adminNotification" });
Appointment.hasOne(StaffNotification, { foreignKey: "appointmentId", as: "staffNotification" });
Appointment.hasMany(AppointmentReschedule, { foreignKey: "appointmentId", as: "appointmentReschedules" })

AppointmentReschedule.belongsTo(Appointment, { foreignKey: "appointmentId", as: "appointment" });

DoctorService.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
DoctorService.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

AppointmentRecord.belongsTo(Appointment, { foreignKey: "appointmentId", as: "appointment" });

PatientNotification.belongsTo(Appointment, { foreignKey: "appointmentId", as: "appointment" });
PatientNotification.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });

AdminNotification.belongsTo(Appointment, { foreignKey: "appointmentId", as: "appointment" });
AdminNotification.belongsTo(Admin, { foreignKey: "adminId", as: "admin" });

StaffNotification.belongsTo(Appointment, { foreignKey: "appointmentId", as: "appointment" });
StaffNotification.belongsTo(Staff, { foreignKey: "staffId", as: "staff" });

Conversation.hasMany(Message, { foreignKey: "conversationId", as: 'messages' });
Conversation.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });
Conversation.belongsTo(Staff, { foreignKey: "assignedStaffId", as: "staff" });

Message.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });

export { 
    Patient, 
    Admin,
    Staff,
    Doctor, 
    Appointment, 
    AppointmentRecord,
    AppointmentReschedule,
    Service, 
    DoctorService,
    PatientNotification,
    AdminNotification,
    StaffNotification,
    Conversation,
    Message
}
