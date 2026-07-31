import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Patient } from "../models";
import { AuthRequest } from "../types/type";
import Admin from "../models/Admin";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access token required",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;

        const patient = await Patient.findOne({
            where: {
                id: decoded.id,
                isVerified: true,
            },
            attributes: { exclude: ["password"] },
        })

        if(patient){
            req.user = {
                ...patient.toJSON(),
                role: 'patient'
            }
        }

        const admin = await Admin.findOne({
            where: {
                id: decoded.id,
            },
            attributes: { exclude: ["password"] },
        })

        if(admin){
            req.user = {
                ...admin.toJSON(),
                role: 'admin'
            }
        }

        if (!patient && !admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        next();
    } catch (error: any) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: error.message || "Unauthorized",
        });
    }
};

export const authorize = (...allowedRoles: string[]) => {
    return (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden: insufficient permissions",
            });
        }

        next();
    };
};