import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/type";
import { Conversation, Message, Patient, Staff } from "../models/index";
import { Op } from "sequelize";
import sequelize from "sequelize/lib/sequelize";

export const getPatientConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let conversation = await Conversation.findOne({
            where: {
                patientId: req.user.id     
            },
            include: [
                {
                    model: Patient,
                    as: 'patient'
                },
                {
                    model: Staff,
                    as: 'staff'
                }
            ],
        })

        if(!conversation){
            conversation = await Conversation.create({
                patientId: req.user.id,
                status: "Waiting"
            })
        }

        const { count: total, rows } = await Message.findAndCountAll({
            where: {
                conversationId: conversation.id,
            },
            include:[
                {
                    model: Patient,
                    as: "patientSender",
                    attributes: [
                        "id",
                        "firstname",
                        "lastname",
                        "email",
                    ],
                },
                {
                    model: Staff,
                    as: "staffSender",
                    attributes: [
                        "id",
                        "firstname",
                        "lastname",
                        "email",
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset
        })

        const messages = rows.reverse();

        return res.status(200).json({
            messages,
            conversation,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
        })

    }catch(err){
        next(err);
    }
}

export const getStaffConversationById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const id = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const conversation = await Conversation.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Patient,
                    as: 'patient'
                },
                {
                    model: Staff,
                    as: 'staff'
                }
            ],
        })

        if(!conversation){
            return res.status(404).json({ message: "No conversation yet" });
        }

        if(conversation.assignedStaffId !== req.user.id){
            return res.status(403).json({ message: "Unauthorized" });
        }

        const { count: total, rows } = await Message.findAndCountAll({
            where: {
                conversationId: conversation.id
            },
            include:[
                {
                    model: Patient,
                    as: "patientSender",
                    attributes: [
                        "id",
                        "firstname",
                        "lastname",
                        "email",
                    ],
                },
                {
                    model: Staff,
                    as: "staffSender",
                    attributes: [
                        "id",
                        "firstname",
                        "lastname",
                        "email",
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset
        })

        const messages = rows.reverse();

        return res.status(200).json({
            messages,
            conversation,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
        })

    }catch(err){
        next(err);
    }
}

export const getStaffConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const conversations = await Conversation.findAll({
            where: {
                assignedStaffId: req.user.id
            },
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
                            WHERE m.conversationId = Conversation.id
                            AND m.unread = true
                            AND m.senderType = 'Patient'
                        )`),
                        "unreadCount",
                    ],
                ],
            },
        })

        res.status(200).json({ conversations });

    }catch(err){
        next(err);
    }
}

export const getStaffUnreadMessagesById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const conversation = await Conversation.findByPk(Number(req.params.id));

        if(!conversation) return res.status(404).json({ message: "Conversation not found" });

        if(conversation.assignedStaffId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        const unread = await Message.count({
            where: {
                conversationId: conversation.id,
                senderId: { [Op.ne] : req.user.id },
                unread: true,
            }
        })

        res.status(200).json({ unread });

    }catch(err){
        next(err);
    }
}

export const readAllMessagesById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const conversation = await Conversation.findByPk(Number(req.params.id));

        if(!conversation) return res.status(404).json({ message: "Conversation not found" });

        if(conversation.assignedStaffId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        await Message.update({ unread: false }, { 
            where: { 
                conversationId: conversation.id,
                senderId: { [Op.ne] : req.user.id }
            }
        })

        res.status(200).json({});

    }catch(err){
        next(err);
    }
} 

export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const conversations = await Conversation.findAll({
            include: [
                {
                    model: Patient,
                    as: "patient",
                },
                {
                    model: Message,
                    as: "messages",
                    separate: true,
                    limit: 1,
                    order: [["createdAt", "DESC"]],
                },
            ],

            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM messages AS m
                            WHERE m.conversationId = Conversation.id
                            AND m.unread = true
                            AND m.senderType = 'Patient'
                        )`),
                        "unreadCount",
                    ],
                ],
            },
        });

        return res.status(200).json({
            conversations
        })

    }catch(err){
        next(err);
    }
}

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const id = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count: total, rows } = await Message.findAndCountAll({
            where:{
                conversationId: id
            },
            order: [["createdAt", "DESC"]],
            limit,
            offset
        })

        const messages = rows.reverse();

        return res.status(200).json({
            messages,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
        })

    }catch(err){
        next(err);
    }
}

export const getUnreadMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const conversation = await Conversation.findOne({
            where: { patientId: req.user.id } 
        });

        if(!conversation) return res.status(404).json({ message: "Conversation not found" });

        const unread = await Message.count({
            where: {
                conversationId: conversation.id,
                senderId: { [Op.ne] : req.user.id },
                unread: true,
            }
        })

        res.status(200).json({ unread });
    }catch(err){
        next(err);
    }
}

export const handleReadAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const conversation = await Conversation.findOne({
            where:
                req.user.role === "patient"
                    ? { patientId: req.user.id }
                    : { assignedStaffId: req.user.id },
        });

        if(!conversation) return res.status(404).json({ message: "Conversation not found" });

        await Message.update({ unread: false }, { 
            where: { 
                conversationId: conversation.id,
                senderId: { [Op.ne] : req.user.id }
            }
        })

        res.status(200).json({});

    }catch(err){
        next(err);
    }
} 

export const endConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const conversation = await Conversation.findByPk(Number(req.params.id));

        if(!conversation) return res.status(404).json({ message: "Conversation not found" });

        if(conversation.assignedStaffId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        conversation.status = 'Closed';
        await conversation.save();

        return res.status(200).json({ message: "Conversation successfully end" });
    }catch(err){
        next(err);
    }
}