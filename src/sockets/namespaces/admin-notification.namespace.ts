import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import socketConnection from "../socketConnection";
import AdminNotification from "../../models/AdminNotification";
dotenv.config();

export let adminNotificationNamespace: Namespace;

export function initAdminNotificationNamespace(io: SocketIOServer) {
    adminNotificationNamespace = io.of("/admin-notification");

    socketConnection({
        namespace: adminNotificationNamespace, 
        message: "User connected to admin notification namespace",
    })
}

export function emitAdminNotification(notification : AdminNotification, to : string) {
    if(!adminNotificationNamespace) return;

    console.log("Admin notification sent.")
    adminNotificationNamespace.to(to).emit("admin-notification", notification)
}