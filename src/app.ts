import express from "express";
import cors from 'cors';
import morgan from 'morgan';
import patientRoutes from "./routes/patientRoutes";

const app = express();

const origin = process.env.origin;

app.use(cors({
    origin,
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/patients', patientRoutes);

export default app;