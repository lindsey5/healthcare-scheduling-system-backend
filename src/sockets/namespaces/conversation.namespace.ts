import type { Server as SocketIOServer, Namespace } from "socket.io";
import dotenv from 'dotenv';
import socketConnection, { AuthenticatedSocket } from "../socketConnection";
import { Conversation, Message, Patient } from '../../models/index';
import { Op } from "sequelize";
import sequelize from "sequelize/lib/sequelize";
dotenv.config();

export let conversationNamespace: Namespace;

export function initConversationNamespace(io: SocketIOServer) {
    conversationNamespace = io.of("/conversation");

    socketConnection({
        namespace: conversationNamespace, 
        message: "User connected to conversation namespace",
        events: {
            "conversation:start": startConversation,
            "message:send": sendMessage,
            "conversation:end": endConversation
        }
    })
}

const endConversation = async (socket: AuthenticatedSocket, conversationId: number) => {
    const role = socket.data.user.role;
    const conversation = await Conversation.findByPk(conversationId);

    if(!conversation) return;

    const to = role === 'patient' ? conversation.assignedStaffId : conversation.patientId;

    conversation.assignedStaffId = null;
    conversation.status = "Closed";

    await conversation.save();

    conversationNamespace.
        to(`${to}-${role === 'patient' ? 'staff' : 'patient'}`)
        .emit("conversation:end", conversation.id)
}

const startConversation = async (socket: AuthenticatedSocket) => {
    const sockets = await conversationNamespace.fetchSockets();

    const availableSockets = sockets.filter(s => s.data.user.role === "staff");

    const conversation = await Conversation.findOne({
        where: {
            patientId: socket.data.user.id,
            status: { [Op.in] : ['Closed', 'Waiting']}
        },
    });

    if (!conversation) {
        socket.emit("conversation:status", false);
        return;
    }

    if (!availableSockets.length) {
        conversation.status = "Waiting";
        await conversation.save();
        socket.emit("conversation:status", false);
        return;
    }

    for(const availableSocket of availableSockets){
        const staffConversation = await Conversation.findAll({
            where: {
                assignedStaffId: availableSocket.data.user.id
            }
        })

        if (staffConversation.length > 4) {
            socket.emit("conversation:status", false);
            continue;
        }

        conversation.status = "Active";
        conversation.assignedStaffId = availableSocket.data.user.id;

        await conversation.save();

        // Tell patient
        socket.emit("conversation:status", true);

        const conversationWithPatient = await Conversation.findByPk(conversation.id, {
            include: [
                {
                    model: Patient,
                    as: "patient",
                },
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM messages AS m
                            WHERE m.conversationId = ${conversation.id}
                            AND m.unread = true
                            AND m.senderType = 'Patient'
                        )`),
                        "unread",
                    ],
                ],
            },
        });

        if(!conversationWithPatient) return;

        // Tell staff
        availableSocket.emit("conversation:new", conversationWithPatient);

        return;
    }
}

const sendMessage = async (socket: AuthenticatedSocket, {
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