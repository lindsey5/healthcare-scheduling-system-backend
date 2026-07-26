import { NextFunction, Request, Response } from "express";
import Patient from "../models/Patient";
import { sendVerificationCode } from "../services/emailService";
import { generateAccessToken, generateRefreshToken, verifyPassword } from "../utils/auth";

export const registerPatient = async (req: Request, res: Response, next: NextFunction) => {
    try{
        
        const isExisting = await Patient.findOne({
            where: {
                email: req.body.email,
            }
        })

        if(isExisting && (!isExisting.verificationCode || !isExisting.verificationCodeExpiresAt) && isExisting.isVerified){
            return res.status(409).json({ message: 'Email is already registered' })
        }

        const verification = await sendVerificationCode(req.body.email);

        if(!verification){
            return res.status(400).json({
                message: "We couldn't send the verification code. Please try again in a few moments."
            });
        }

        const { expiresAt, verificationCode } = verification;

        if(isExisting){
            await Patient.update({
                verificationCode,
                verificationCodeExpiresAt: expiresAt
            }, {
                where: {
                    id: isExisting.toJSON().id
                }
            })
            
        }else {
            await Patient.create({
                ...req.body,
                verificationCode,
                verificationCodeExpiresAt: expiresAt
            })
        }

        return res.status(201).json({ 
            message: "Registration successful. A verification code has been sent to your email."
        });

    }catch(err){
        next(err);
    }
}

export const verifyPatient = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const { email, verificationCode } = req.body;

        const patient = await Patient.findOne({
            where: {
                email
            }
        })

       if (!patient) {
            return res.status(404).json({
                message: "No account was found with the provided email address."
            });
        }

        if((!patient?.toJSON().verificationCode || !patient.verificationCodeExpiresAt) && patient.toJSON().isVerified){
            return res.status(400).json({ message: "This email is already verified" });
        }

        if (
            patient.toJSON().verificationCodeExpiresAt &&
            patient.toJSON().verificationCodeExpiresAt! < new Date()
        ) {
            return res.status(400).json({
                message: "Your verification code has expired. Please request a new one."
            });
        }

        if (verificationCode !== patient.toJSON().verificationCode) {
            return res.status(400).json({
                message: "The verification code you entered is incorrect."
            });
        }

        await patient.update({
            verificationCode: null,
            verificationCodeExpiresAt: null,
            isVerified: true
        });

        return res.status(200).json({
            message: "Your email has been successfully verified. You can now sign in to your account."
        });

    }catch(err){
        next(err);
    }
}

export const loginPatient = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const { email, password } = req.body;

        const patient = await Patient.findOne({
            where: { email, isVerified: true }
        })

        if(!patient){
            return res.status(404).json({ message: 'Account not found' });
        }

        const isMatch = await verifyPassword(password, patient.password);

        if(!isMatch){
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const refreshToken = generateRefreshToken(patient.id);
        const accessToken = generateAccessToken(patient.id, "patient");
        
        return res.status(200).json({
            patient,
            refreshToken,
            accessToken
        })
    }catch(err){
        next(err);
    }
}