import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { Patient } from '../models/index';
import { generateAccessToken, generateRefreshToken } from "../utils/auth";
import { Admin } from '../models/index';
import Staff from "../models/Staff";

export const refreshAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
        return res
            .status(401)
            .json({ success: false, message: "Refresh token required" });
        }

        const decoded: any = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || "test-jwt-refresh-secret-key",
        );

        let user;

        if(decoded.role === 'patient'){
            const patient = await Patient.findByPk(decoded.id);

            user = patient ? {
                id: patient.id,
                firstname: patient.firstname,
                lastname: patient.lastname,
                email: patient.email,
                createdAt: patient.createdAt,
                role: 'patient'
            } : undefined;
        }

        if(decoded.role === 'admin'){
            const admin = await Admin.findByPk(decoded.id);

            user = admin ? {
                id: admin.id,
                firstname: admin.firstname,
                lastname: admin.lastname,
                email: admin.email,
                createdAt: admin.createdAt,
                role: 'admin'
            } : undefined;
        }
        
        if(decoded.role === 'staff'){
            const staff = await Staff.findByPk(decoded.id);

            user = staff ? {
                id: staff.id,
                firstname: staff.firstname,
                lastname: staff.lastname,
                email: staff.email,
                createdAt: staff.createdAt,
                role: 'staff'
            } : undefined
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newAccessToken = generateAccessToken(user.id, user.role);
        const newRefreshToken = generateRefreshToken(user.id, user.role);

        res.status(200).json({
            user,
            token: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
};