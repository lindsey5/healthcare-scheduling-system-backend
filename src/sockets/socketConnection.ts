import { Namespace, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Patient, Admin, Staff } from "../models/index";

dotenv.config();

export type SocketUser = {
    id: number;
    role: "patient" | "admin" | "staff";
};

export type SocketEvents = {
    [eventName: string]: (
        socket: AuthenticatedSocket,
        data?: any
    ) => void | Promise<void>;
};

export type AuthenticatedSocket = Socket & {
    data: {
        user: SocketUser;
    };
};

export default function socketConnection({
    namespace,
    message,
    events,
}: {
    namespace: Namespace;
    message: string;
    events?: SocketEvents;
}) {
    namespace.on("connection", async (socket) => {
        try {
            const authHeader = socket.handshake.auth?.token;

            if (!authHeader?.startsWith("Bearer ")) {
                throw new Error("Access token required.");
            }

            const token = authHeader.split(" ")[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_ACCESS_SECRET as string
            ) as JwtPayload;

            let userId: number;

            switch (decoded.role) {
                case "patient": {
                    const patient = await Patient.findByPk(decoded.id);

                    if (!patient) {
                        throw new Error("Unauthorized user.");
                    }

                    userId = patient.id;
                    break;
                }

                case "admin": {
                    const admin = await Admin.findByPk(decoded.id);

                    if (!admin) {
                        throw new Error("Unauthorized user.");
                    }

                    userId = admin.id;
                    break;
                }

                case "staff": {
                    const staff = await Staff.findByPk(decoded.id);

                    if (!staff) {
                        throw new Error("Unauthorized user.");
                    }

                    userId = staff.id;
                    break;
                }

                default:
                    throw new Error("Invalid role.");
            }

            const user: SocketUser = {
                id: userId,
                role: decoded.role,
            };

            socket.data.user = user;

            // Personal room
            socket.join(`${userId}-${decoded.role}`);

            console.log(message, user);

            if (events) {
                for (const [eventName, callback] of Object.entries(events)) {
                    socket.on(eventName, (data) => {
                        callback(socket, data);
                    });
                }
            }

        } catch (err: any) {
            console.error(
                "Socket connection error:",
                err.message
            );

            socket.disconnect(true);
        }
    });
}