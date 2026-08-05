import Appointment from "./Appointment";
import AppointmentRecord from "./AppointmentRecord";
import Doctor from "./Doctor";
import DoctorService from "./DoctorService";
import Patient from "./Patient";
import PatientNotification from "./PatientNotification";
import Service from "./Service";

Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Patient.hasMany(PatientNotification, { foreignKey: 'patientId', as: "patientNotification" });

Appointment.hasOne(AppointmentRecord, { foreignKey: 'appointmentId', as: 'appointRecord' });

Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Doctor.hasMany(DoctorService, { foreignKey: 'doctorId', as: 'doctorServices' });

Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.hasOne(AppointmentRecord, { foreignKey: "appointmentId", as: "appointmentRecord" });
Appointment.hasOne(PatientNotification, { foreignKey: 'appointmentId', as: 'patientNotification' });

DoctorService.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
DoctorService.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

AppointmentRecord.belongsTo(Appointment, { foreignKey: "appointmentId", as: "appointment" });

PatientNotification.belongsTo(Appointment, { foreignKey: "appointmentId", as: "appointment" });
PatientNotification.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });

export { 
    Patient, 
    Doctor, 
    Appointment, 
    AppointmentRecord,
    Service, 
    DoctorService,
    PatientNotification
}
