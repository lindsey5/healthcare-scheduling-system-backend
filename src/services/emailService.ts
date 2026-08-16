import { BrevoClient } from '@getbrevo/brevo';
import dotenv from "dotenv";
import { appointmentUpdateTemplate, resetPasswordTemplate, verificationCodeTemplate } from '../templates/emailTemplates';

dotenv.config();

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

export const sendVerificationCode = async (email: string) => {
    try {
        const verificationCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                name: "Bagumbayan Healthcare Scheduling System",
                email: process.env.EMAIL_USER!,
            },

            to: [
                {
                    email,
                },
            ],

            subject:
                "Bagumbayan Healthcare Scheduling System - Verification Code",

            htmlContent: verificationCodeTemplate(verificationCode),
        });

        console.log("Verification email sent successfully to", email);

        return {
            verificationCode,
            expiresAt,
        };
    } catch (error) {
        console.error("Error sending verification email:", error);

        return null;
    }
};

export const sendAppointmentUpdate = async ({
    email,
    prevStatus,
    newStatus,
    referenceNumber,
}: {
    email: string;
    prevStatus: string;
    newStatus: string;
    referenceNumber: string;
}) => {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                name: "Bagumbayan Healthcare Scheduling System",
                email: process.env.EMAIL_USER!,
            },

            to: [
                {
                    email,
                },
            ],

            subject:
                `Appointment Status Update - ${referenceNumber}`,

            htmlContent: appointmentUpdateTemplate({
                prevStatus,
                newStatus,
                referenceNumber,
            }),
        });

        console.log(
            "Appointment update email sent successfully to",
            email
        );

        return true;

    } catch (error) {
        console.error(
            "Error sending appointment update email:",
            error
        );

        return false;
    }
};

export const sendResetPassword = async (
    email: string,
    resetUrl: string
) => {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                name: "Bagumbayan Healthcare Scheduling System",
                email: process.env.EMAIL_USER!,
            },

            to: [
                {
                    email,
                },
            ],

            subject: "Reset Your Password",

            htmlContent: resetPasswordTemplate(resetUrl),
        });

        console.log(
            "Password reset email sent successfully to",
            email
        );

        return true;

    } catch (err) {
        console.error(
            "Failed to send password reset email:",
            err
        );

        return null;
    }
};