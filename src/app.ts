import express from "express";
import cors from 'cors';
import morgan from 'morgan';
import patientRoutes from "./routes/patientRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import serviceRoutes from "./routes/serviceRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import staffRoutes from "./routes/staffRoutes";
import patientNotificationRoutes from "./routes/patientNoficationRoutes";
import adminNotificationRoutes from "./routes/adminNotificationRoutes";

const app = express();

const origins = process.env.ORIGINS?.split(",") || ['http://localhost:5173'];

app.use(cors({
    origin: origins,
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/staffs', staffRoutes);
app.use('/api/patient-notifications', patientNotificationRoutes);
app.use('/api/admin-notifications', adminNotificationRoutes);
app.use(errorHandler);

export default app;