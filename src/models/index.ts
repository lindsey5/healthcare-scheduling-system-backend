import Appointment from "./Appointment";
import AppointmentRecord from "./AppointmentRecord";
import Doctor from "./Doctor";
import DoctorService from "./DoctorService";
import Patient from "./Patient";
import Service from "./Service";

Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });

Appointment.hasOne(AppointmentRecord, { foreignKey: 'appointmentId', as: 'appointRecord' });

Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Doctor.hasMany(DoctorService, { foreignKey: 'doctorId', as: 'doctorServices' });

Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

DoctorService.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
DoctorService.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

AppointmentRecord.belongsTo(Appointment, { foreignKey: "appointmentId", as: "appointment" });

export { 
    Patient, 
    Doctor, 
    Appointment, 
    Service, 
    DoctorService 
}
