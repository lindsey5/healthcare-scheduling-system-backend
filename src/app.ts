import express from "express";
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from "./routes/userRoutes";

const app = express();

const origin = process.env.origin;

app.use(cors({
    origin,
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/users', userRoutes);

export default app;