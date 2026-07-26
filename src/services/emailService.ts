import { BrevoClient } from '@getbrevo/brevo';
import dotenv from "dotenv";

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

            htmlContent: `
            <div style="
                font-family: Arial, Helvetica, sans-serif;
                background:#f3f4f6;
                padding:40px 20px;
            ">
                <div style="
                    max-width:500px;
                    margin:auto;
                    background:#fff;
                    border-radius:12px;
                    overflow:hidden;
                    box-shadow:0 4px 12px rgba(0,0,0,.08);
                ">

                    <div style="
                        background:#1E3D15;
                        color:white;
                        text-align:center;
                        padding:24px;
                    ">
                        <h2 style="margin:0;">
                            Bagumbayan Healthcare Scheduling System
                        </h2>
                    </div>

                    <div style="padding:32px;">
                        <h3 style="color:#1E3D15;margin-top:0;">
                            Email Verification
                        </h3>

                        <p style="line-height:1.6;color:#555;">
                            Thank you for registering with the
                            <strong>Bagumbayan Healthcare Scheduling System</strong>.
                            Please use the verification code below to verify your
                            email address.
                        </p>

                        <div style="
                            text-align:center;
                            margin:30px 0;
                        ">
                            <span style="
                                display:inline-block;
                                padding:18px 36px;
                                background:#E8F5E9;
                                color:#1E3D15;
                                border:2px dashed #1E3D15;
                                border-radius:10px;
                                font-size:34px;
                                font-weight:bold;
                                letter-spacing:8px;
                            ">
                                ${verificationCode}
                            </span>
                        </div>

                        <p style="line-height:1.6;color:#666;">
                            This verification code will expire in
                            <strong>15 minutes</strong>.
                            Please do not share this code with anyone.
                        </p>
                    </div>

                    <div style="
                        background:#F8F8F8;
                        text-align:center;
                        padding:18px;
                        font-size:13px;
                        color:#777;
                    ">
                        © ${new Date().getFullYear()} Bagumbayan Healthcare Scheduling System
                        <br/>
                        Barangay Bagumbayan Health Center
                    </div>

                </div>
            </div>
            `,
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