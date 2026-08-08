import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from "dotenv";
import socketConnection from "../socketConnection";
import StaffNotification from "../../models/StaffNotification";

dotenv.config();

export let staffNotificationNamespace: Namespace;

export function initStaffNotificationNamespace(
    io: SocketIOServer
) {
    staffNotificationNamespace = io.of("/staff-notification");

    socketConnection({
        namespace: staffNotificationNamespace,
        message: "User connected to staff notification namespace",
    });
}

export function emitStaffNotification(
    notification: StaffNotification,
    to: string
) {
    if (!staffNotificationNamespace) return;

    console.log("Staff notification sent.");

    staffNotificationNamespace
        .to(to)
        .emit("staff-notification", notification);
}