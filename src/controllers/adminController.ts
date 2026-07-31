import { NextFunction, Request, Response } from "express";
import Admin from "../models/Admin";
import { generateAccessToken, generateRefreshToken, verifyPassword } from "../utils/auth";

export const createAdmin = async (req : Request, res: Response, next: NextFunction) =>{
    try{
        const isExisting = await Admin.findOne({
            where: {
                email: req.body.email
            }
        });

        if(isExisting){
            return res.status(409).json({
                message: "Email already used."
            })
        }

        const admin = await Admin.create(req.body);

        res.status(201).json({
            admin,
            message: "New admin successfully created."
        })

    }catch(err){
        next(err);
    }
}

export const loginAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({
            where: {
                email,
            },
        });

        if (!admin) {
            return res.status(404).json({
                message: "Account not found",
            });
        }

        const isMatch = await verifyPassword(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password",
            });
        }

        const refreshToken = generateRefreshToken(admin.id, "admin");
        const accessToken = generateAccessToken(admin.id, "admin");

        return res.status(200).json({
            user: {
                id: admin.id,
                firstname: admin.firstname,
                lastname: admin.lastname,
                email: admin.email,
                createdAt: admin.createdAt,
                role: 'admin'
            },
            token: {
                refreshToken,
                accessToken,
            },
        });

    } catch (err) {
        next(err);
    }
};