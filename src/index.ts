import app from './app';
import dotenv from 'dotenv';
import { createServer } from "http";
import { connectDB } from './config/db';
import initializeSocket from './sockets/socket';
import cron from 'node-cron';
import { queueAppointmentReminders } from './services/appointmentReminderService';
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();

    let schedulingReminders = false;
    const scheduleReminders = async () => {
        if (schedulingReminders) return;
        schedulingReminders = true;
        try {
            await queueAppointmentReminders();
        } catch (error) {
            console.error('Appointment reminder scan failed:', error);
        } finally {
            schedulingReminders = false;
        }
    };
    cron.schedule('* * * * *', scheduleReminders, { timezone: 'Asia/Manila' });
    await scheduleReminders();


    const server = createServer(app);
    initializeSocket(server);

    server.listen(PORT, () => {
        console.log("Server running on port", PORT);
    });
};

startServer().catch((error) => {
    console.error("Server could not start:", error);
    process.exitCode = 1;
});
