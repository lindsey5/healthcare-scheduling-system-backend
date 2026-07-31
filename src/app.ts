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

const app = express();

const origin = process.env.origin;

app.use(cors({
    origin,
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
app.use(errorHandler);

export default app;