import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import socketConnection from "../socketConnection";
import { PatientNotification } from "../../models/index";
dotenv.config();

export let patientNotificationNamespace: Namespace;

export function initPatientNotificationNamespace(io: SocketIOServer) {
    patientNotificationNamespace = io.of("/patient-notification");

    socketConnection({
        namespace: patientNotificationNamespace, 
        message: "User connected to patient notification namespace",
    })
}

export function emitPatientNotification(notification : PatientNotification, to : string) {
    if(!patientNotificationNamespace) return;

    console.log("Patient notification sent.")
    patientNotificationNamespace.to(to).emit("patient-notification", notification)
}