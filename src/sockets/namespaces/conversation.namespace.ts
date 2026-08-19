import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import socketConnection, { AuthenticatedSocket } from "../socketConnection";
import { Conversation, Message } from '../../models/index';
dotenv.config();

export let conversationNamespace: Namespace;

export function initConversationNamespace(io: SocketIOServer) {
    conversationNamespace = io.of("/conversation");

    socketConnection({
        namespace: conversationNamespace, 
        message: "User connected to conversation namespace",
        events: {
            "conversation:start": async (socket: AuthenticatedSocket) => {
                const sockets = await conversationNamespace.fetchSockets();

                const availableSocket = sockets.find(s => s.data.user.role === "staff");

                if (!availableSocket) {
                    socket.emit("conversation:status", false);
                    return;
                }

                const staffConversation = await Conversation.findOne({
                    where: {
                        assignedStaffId: socket.data.user.id
                    }
                })

                const conversation = await Conversation.findOne({
                    where: {
                        patientId: socket.data.user.id,
                        status: "Waiting",
                    },
                });

                if (!conversation || staffConversation) {
                    socket.emit("conversation:status", false);
                    return;
                }

                conversation.status = "Active";
                conversation.assignedStaffId = conversation?.assignedStaffId;

                await conversation.save();

                // Tell patient
                socket.emit("conversation:status", true);

                // Tell staff
                availableSocket.emit("conversation:new", conversation.id);
            },
            "message:send": async (socket: AuthenticatedSocket, {
                conversationId,
                message,
                senderType
            } : {
                message: string;
                conversationId: number;
                senderType: "Patient" | "Staff";
            }) => {
                const conversation = await Conversation.findOne({
                    where: {
                        id: conversationId,
                    }
                });

                if(!conversation) return;

                if(conversation.assignedStaffId !== socket.data.user.id && conversation.patientId !== socket.data.user.id) return;

                const newMessage = await Message.create({
                    conversationId,
                    message,
                    senderId: socket.data.user.id,
                    senderType
                })

                const to = senderType === 'Patient' ? conversation.assignedStaffId : conversation.patientId;

                conversationNamespace
                    .to(`${to}-${senderType === 'Patient' ? 'staff' : 'patient'}`)
                    .emit("message:new", newMessage)
            }
        }
    })
}