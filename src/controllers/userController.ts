import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { sendVerificationCode } from "../services/emailService";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyPassword,
} from "../utils/auth";

export const registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const isExisting = await User.findOne({
            where: {
                email: req.body.email,
            },
        });

        if (
            isExisting &&
            (!isExisting.get('verificationCode') ||
                !isExisting.get('verificationCodeExpiresAt')) &&
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
            await User.update(
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
            await User.create({
                ...req.body,
                verificationCode,
                verificationCodeExpiresAt: expiresAt,
            });
        }

        return res.status(201).json({
            message:
                "A verification code has been sent to your email.",
        });
    } catch (err) {
        next(err);
    }
};

export const verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, verificationCode } = req.body;

        const user = await User.findOne({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: "No account was found with the provided email address.",
            });
        }

        if (
            (!user.verificationCode || !user.verificationCodeExpiresAt) &&
            user.isVerified
        ) {
            return res.status(400).json({
                message: "This email is already verified",
            });
        }

        if (
            user.verificationCodeExpiresAt &&
            user.verificationCodeExpiresAt < new Date()
        ) {
            return res.status(400).json({
                message:
                    "Your verification code has expired. Please request a new one.",
            });
        }

        if (verificationCode !== user.verificationCode) {
            return res.status(400).json({
                message:
                    "The verification code you entered is incorrect.",
            });
        }

        await user.update({
            verificationCode: null,
            verificationCodeExpiresAt: null,
            isVerified: true,
        });

        return res.status(200).json({
            message:"Account successfully created.",
        });
    } catch (err) {
        next(err);
    }
};

export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: {
                email,
                isVerified: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: "Account not found",
            });
        }

        const isMatch = await verifyPassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password",
            });
        }

        const refreshToken = generateRefreshToken(user.id);
        const accessToken = generateAccessToken(user.id, "user");

        return res.status(200).json({
            user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                createdAt: user.createdAt
            },
            token: {
                refreshToken,
                accessToken,
            }
        });
    } catch (err) {
        next(err);
    }
};