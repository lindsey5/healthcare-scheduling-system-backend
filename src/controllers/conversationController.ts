import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/type";
import { Conversation } from "../models";
import { Op } from "sequelize";

export const createConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const hasActiveConversation = await Conversation.findOne({
            where: {
                patientId: req.user.id,
                status: { [Op.in] : ['Waiting', 'Active']}
            }
        })

        if(hasActiveConversation){
            return res.status(400).json({ message: "You already have an active conversation" })
        }

    }catch(err){
        next(err);
    }
}  

export const deleteConversation = async (req: Request, res: Response, next: NextFunction) => {
    try{


    }catch(err){
        next(err);
    }
}