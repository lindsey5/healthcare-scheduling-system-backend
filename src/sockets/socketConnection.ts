import { Namespace, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Patient } from "../models";
import Admin from "../models/Admin";
import Staff from "../models/Staff";

dotenv.config();

type SocketEvents = {
    [eventName: string]: (data?: any) => void | Promise<void>;
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
    namespace.on("connection", async (socket: Socket) => {
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

            // Save authenticated user on socket
            socket.data.user = {
                id: userId,
                role: decoded.role,
            };

            // Join personal room
            socket.join(`${userId}-${decoded.role}`);

            console.log(message, {
                id: userId,
                role: decoded.role
            });

            if (events) {
                for (const [eventName, callback] of Object.entries(events)) {
                    socket.on(eventName, callback);
                }
            }
        } catch (err: any) {
            console.error("Socket connection error:", err.message);
            socket.disconnect(true);
        }
    });
}