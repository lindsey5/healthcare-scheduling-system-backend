import { NextFunction, Request, Response } from "express";
import { Patient } from '../models/index';
import { sendVerificationCode } from "../services/emailService";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyPassword,
} from "../utils/auth";
import { Op, Sequelize } from "sequelize";
import { AuthRequest } from "../types/type";

export const registerPatient = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const isExisting = await Patient.findOne({
            where: {
                email: req.body.email,
            },
        });

        if (
            isExisting &&
            (!isExisting.verificationCode ||
                !isExisting.verificationCodeExpiresAt) &&
            isExisting.isVerified
        ) {
            return res.status(409).json({
                message: "Email is already registered",
            });
        }

        const verification = await sendVerificationCode(req.body.email);

        if (!verification) {
            return res.status(400).json({
                message:
                    "We couldn't send the verification code. Please try again in a few moments.",
            });
        }

        const { expiresAt, verificationCode } = verification;

        if (isExisting) {
            await Patient.update(
                {
                    verificationCode,
                    verificationCodeExpiresAt: expiresAt,
                },
                {
                    where: {
                        id: isExisting.id,
                    },
                }
            );
        } else {
            await Patient.create({
                ...req.body,
                verificationCode,
                verificationCodeExpiresAt: expiresAt,
            });
        }

        return res.status(201).json({
            message: "A verification code has been sent to your email.",
        });

    } catch (err) {
        next(err);
    }
};

export const resendVerificationCode = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const email = req.body.email;

        const patient = await Patient.findOne({
            where: { email },
        });

        if (!patient) {
            return res.status(400).json({
                message: "We couldn't find an account with this email address.",
            });
        }

        if (patient.isVerified) {
            return res.status(400).json({
                message: "This email address has already been verified.",
            });
        }

        const verification = await sendVerificationCode(email);

        if (!verification) {
            return res.status(400).json({
                message:
                    "We couldn't resend your verification code. Please try again in a few moments.",
            });
        }

        const { expiresAt, verificationCode } = verification;

        patient.verificationCode = verificationCode;
        patient.verificationCodeExpiresAt = expiresAt;

        await patient.save();

        return res.status(200).json({
            message:
                "A new verification code has been sent to your email address.",
        });
    } catch (err) {
        next(err);
    }
}

export const verifyPatient = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, verificationCode } = req.body;

        const patient = await Patient.findOne({
            where: {
                email,
            },
        });

        if (!patient) {
            return res.status(404).json({
                message: "No account was found with the provided email address.",
            });
        }

        if (
            (!patient.verificationCode ||
                !patient.verificationCodeExpiresAt) &&
            patient.isVerified
        ) {
            return res.status(400).json({
                message: "This email is already verified",
            });
        }

        if (
            patient.verificationCodeExpiresAt &&
            patient.verificationCodeExpiresAt < new Date()
        ) {
            return res.status(400).json({
                message:
                    "Your verification code has expired. Please request a new one.",
            });
        }

        if (verificationCode !== patient.verificationCode) {
            return res.status(400).json({
                message:
                    "The verification code you entered is incorrect.",
            });
        }

        await patient.update({
            verificationCode: null,
            verificationCodeExpiresAt: null,
            isVerified: true,
        });

        const refreshToken = generateRefreshToken(patient.id, "patient");
        const accessToken = generateAccessToken(patient.id, "patient");

        return res.status(200).json({
            user: {
                id: patient.id,
                firstname: patient.firstname,
                lastname: patient.lastname,
                email: patient.email,
                createdAt: patient.createdAt,
                role: 'patient'
            },
            token: {
                refreshToken,
                accessToken,
            },
            message: "Account successfully created.",
        });

    } catch (err) {
        next(err);
    }
};


export const loginPatient = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const patient = await Patient.findOne({
            where: {
                email,
                isVerified: true,
            },
        });

        if (!patient) {
            return res.status(404).json({
                message: "Account not found",
            });
        }

        const isMatch = await verifyPassword(password, patient.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password",
            });
        }

        const refreshToken = generateRefreshToken(patient.id, "patient");
        const accessToken = generateAccessToken(patient.id, "patient");

        return res.status(200).json({
            user: {
                id: patient.id,
                firstname: patient.firstname,
                lastname: patient.lastname,
                email: patient.email,
                createdAt: patient.createdAt,
                role: 'patient'
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

export const getPatients = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const search = (req.query.search as string) || "";

        const where: any = { isVerified: true };

        if(search) {
            where[Op.or] = [
                Sequelize.where(
                    Sequelize.fn(
                        "CONCAT",
                        Sequelize.col("firstname"),
                        " ",
                        Sequelize.col("lastname")
                    ),
                    {
                        [Op.like]: `%${search}%`,
                    }
                ),
                { firstname: { [Op.like] : `%${search}%`} },
                { lastname: { [Op.like] : `%${search}%`} },
                { email: { [Op.like] : `%${search}%`} }
            ]
        }

        const { count: total, rows: patients }  = await Patient.findAndCountAll({
            where,
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            attributes: {
                exclude: ["password"],
            },
        })

        return res.status(200).json({
            patients,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total
        });

    }catch(err){
        next(err);
    }
}

export const getTotalPatients = async (req: Request, res:Response, next: NextFunction) => {
    try{
        const total = await Patient.count({ where: { isVerified: true }});

        return res.status(200).json({ total });

    }catch(err){
        next(err);
    }
}

export const updatePatientOwn = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const { firstname, lastname } = req.body;

        const patient = await Patient.findOne({
            where: {
                id: req.user.id,
                isVerified: true
            }
        })

        if(!patient) return res.status(404).json({ message: "Account not found." })

        patient.firstname = firstname;
        patient.lastname = lastname;

        await patient.save();

        return res.status(200).json({ 
            user: {
                id: patient.id,
                firstname: patient.firstname,
                lastname: patient.lastname,
                email: patient.email,
                createdAt: patient.createdAt,
                role: 'patient'
            }, 
            message: "Profile successfully updated."
        })

    }catch(err){
        next(err);
    }
}

export const patientChangePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const { newPassword, currentPassword } = req.body;

        const patient = await Patient.findOne({
            where: {
                id: req.user.id,
                isVerified: true
            }
        });

        if(!patient) return res.status(404).json({ message: "Account not found." });

        const isMatch = await verifyPassword(currentPassword, patient.password);

        if(!isMatch) return res.status(403).json({ message: "Current password is incorrect"})

        const isSamePassword = await verifyPassword(newPassword, patient.password);

        if(isSamePassword) return res.status(400).json({  message: "New password must be different from current password", });

        patient.password = newPassword;

        await patient.save();

        return res.status(200).json({ 
            message: "Password successfully changed", 
        });

    }catch(err){
        next(err);
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const { email } = req.body;

        const patient = await Patient.findOne({
            where: {
                email,
                isVerified: true
            }
        })

        if(!patient) return res.status(404).json({ message: "Email not found." });

        


    }catch(err){
        next(err);
    }
}