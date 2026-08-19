import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/type";
import { Conversation, Message, Patient, Staff } from "../models/index";

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

        const { count: total, rows: messages } = await Message.findAndCountAll({
            where: {
                conversationId: conversation.id
            },
            order: [["createdAt", "ASC"]],
            limit,
            offset
        })

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

export const getStaffConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const conversation = await Conversation.findOne({
            where: {
                assignedStaffId: req.user.id     
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

        const { count: total, rows: messages } = await Message.findAndCountAll({
            where: {
                conversationId: conversation.id
            },
            order: [["createdAt", "ASC"]],
            limit,
            offset
        })

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