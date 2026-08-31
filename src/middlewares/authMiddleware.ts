import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Patient } from "../models";
import { AuthRequest } from "../types/type";
import Admin from "../models/Admin";
import Staff from "../models/Staff";
import { Op } from "sequelize";

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

        switch (decoded.role) {
            case "patient": {
                const patient = await Patient.findOne({
                    where: {
                        id: decoded.id,
                        isVerified: true,
                        isActive: true
                    },
                    attributes: {
                        exclude: ["password"],
                    },
                });

                if (!patient) {
                    res.status(401).json({
                        success: false,
                        message: "Patient not found",
                    });
                    return;
                }

                req.user = {
                    ...patient.toJSON(),
                    role: "patient",
                };

                next();
                return;
            }

            case "admin": {
                const admin = await Admin.findOne({
                    where: {
                        id: decoded.id,
                    },
                    attributes: {
                        exclude: ["password"],
                    },
                });

                if (!admin) {
                    res.status(401).json({
                        success: false,
                        message: "Admin not found",
                    });
                    return;
                }

                req.user = {
                    ...admin.toJSON(),
                    role: "admin",
                };

                next();
                return;
            }

            case "staff": {
                const staff = await Staff.findByPk(decoded.id, {
                    attributes: {
                        exclude: ["password"],
                    },
                });

                if (!staff) {
                    res.status(401).json({
                        success: false,
                        message: "Staff not found",
                    });
                    return;
                }

                req.user = {
                    ...staff.toJSON(),
                    role: "staff",
                };

                next();
                return;
            }
        }
    } catch (error: any) {
        console.log(error);
        return res.status(401).json({
            message: error.message || "Unauthorized",
        });
    }
};

type Role = "admin" | "staff" | "patient";

export const authorize = (...allowedRoles: Role[]) => {
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