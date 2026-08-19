import { Server } from "socket.io";
import dotenv from 'dotenv';
import { initPatientNotificationNamespace } from "./namespaces/patient-notification.namespace";
import { initAdminNotificationNamespace } from "./namespaces/admin-notification.namespace";
import { initStaffNotificationNamespace } from "./namespaces/staff-notification.namespace";
import { initConversationNamespace } from "./namespaces/conversation.namespace";
dotenv.config();

const origins = process.env.ORIGIN || 'http://localhost:5173';

export function registerSockets(io: Server) {
    initPatientNotificationNamespace(io);
    initAdminNotificationNamespace(io);
    initStaffNotificationNamespace(io);
    initConversationNamespace(io);
}

export default function initializeSocket(server: any) {
    const io = new Server(server, {
        cors: {
            origin: origins,
            methods: ["GET", "POST"],
            allowedHeaders: ["Authorization"],
            credentials: true,
        },
    });

    registerSockets(io);
}