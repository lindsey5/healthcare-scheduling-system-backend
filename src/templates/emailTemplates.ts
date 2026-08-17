
export const verificationCodeTemplate = (verificationCode: string) => `
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
`

export const appointmentUpdateTemplate = ({
    prevStatus,
    newStatus,
    referenceNumber,
}: {
    prevStatus: string;
    newStatus: string;
    referenceNumber: string;
}) => `
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

                <h3 style="
                    color:#1E3D15;
                    margin-top:0;
                ">
                    Appointment Status Update
                </h3>

                <p style="line-height:1.6;color:#555;">
                    Your appointment has been updated from
                    <strong>${prevStatus}</strong>
                    to
                    <strong>${newStatus}</strong>.
                </p>

                <div style="
                    background:#F8F8F8;
                    border-radius:10px;
                    padding:20px;
                    margin:25px 0;
                ">
                    <p style="margin:8px 0;color:#555;">
                        <strong>Reference Number:</strong>
                        ${referenceNumber}
                    </p>

                    <p style="margin:8px 0;color:#555;">
                        <strong>Previous Status:</strong>
                        ${prevStatus}
                    </p>

                    <p style="margin:8px 0;color:#555;">
                        <strong>New Status:</strong>
                        ${newStatus}
                    </p>
                </div>

                <p style="
                    line-height:1.6;
                    color:#666;
                ">
                    Please log in to the Bagumbayan Healthcare
                    Scheduling System to view your appointment
                    details.
                </p>

            </div>

            <div style="
                background:#F8F8F8;
                text-align:center;
                padding:18px;
                font-size:13px;
                color:#777;
            ">
                © ${new Date().getFullYear()}
                Bagumbayan Healthcare Scheduling System
                <br/>
                Barangay Bagumbayan Health Center
            </div>

        </div>
    </div>
`;

export const resetPasswordTemplate = (resetUrl: string) => `
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

                <h3 style="
                    color:#1E3D15;
                    margin-top:0;
                ">
                    Reset Your Password
                </h3>

                <p style="
                    line-height:1.6;
                    color:#555;
                ">
                    We received a request to reset the password
                    for your
                    <strong>Bagumbayan Healthcare Scheduling System</strong>
                    account.
                </p>

                <p style="
                    line-height:1.6;
                    color:#555;
                ">
                    Click the button below to create a new password.
                </p>

                <div style="
                    text-align:center;
                    margin:30px 0;
                ">
                    <a
                        href="${resetUrl}"
                        style="
                            display:inline-block;
                            background:#1E3D15;
                            color:#fff;
                            text-decoration:none;
                            padding:14px 28px;
                            border-radius:8px;
                            font-weight:bold;
                            font-size:16px;
                        "
                    >
                        Reset Password
                    </a>
                </div>

                <p style="
                    line-height:1.6;
                    color:#666;
                ">
                    This password reset link will expire in
                    <strong>15 minutes</strong>.
                </p>

                <p style="
                    line-height:1.6;
                    color:#666;
                ">
                    If you did not request a password reset, you can
                    safely ignore this email. Your password will remain
                    unchanged.
                </p>

                <p style="
                    line-height:1.6;
                    color:#888;
                    font-size:13px;
                    margin-top:25px;
                ">
                    If the button above does not work, copy and paste
                    the following link into your browser:
                </p>

                <p style="
                    word-break:break-all;
                    font-size:13px;
                    color:#1E3D15;
                ">
                    ${resetUrl}
                </p>

            </div>

            <div style="
                background:#F8F8F8;
                text-align:center;
                padding:18px;
                font-size:13px;
                color:#777;
            ">
                © ${new Date().getFullYear()}
                Bagumbayan Healthcare Scheduling System
                <br/>
                Barangay Bagumbayan Health Center
            </div>

        </div>
    </div>
`;


export const appointmentRescheduledTemplate = ({
    referenceNumber,
    previousDate,
    previousTime,
    newDate,
    newTime,
    doctorName,
    reason,
}: {
    referenceNumber: string;
    previousDate: string;
    previousTime: string;
    newDate: string;
    newTime: string;
    doctorName: string;
    reason: string;
}) => `
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

                <h3 style="
                    color:#1E3D15;
                    margin-top:0;
                ">
                    Appointment Rescheduled
                </h3>

                <p style="
                    line-height:1.6;
                    color:#555;
                ">
                    Your appointment has been <strong>rescheduled</strong>.
                    Please review your updated appointment details below.
                </p>

                <div style="
                    background:#FFF8E1;
                    border-left:4px solid #1E3D15;
                    border-radius:8px;
                    padding:16px;
                    margin:25px 0;
                ">
                    <p style="margin:0;color:#555;line-height:1.6;">
                        <strong>Reason:</strong> ${reason}
                    </p>
                </div>

                <div style="
                    background:#F8F8F8;
                    border-radius:10px;
                    padding:20px;
                    margin:25px 0;
                ">
                    <p style="
                        margin:8px 0;
                        color:#555;
                    ">
                        <strong>Reference Number:</strong>
                        ${referenceNumber}
                    </p>

                    <p style="
                        margin:8px 0;
                        color:#555;
                    ">
                        <strong>Doctor:</strong>
                        ${doctorName}
                    </p>
                </div>

                <p style="
                    margin:20px 0 10px;
                    color:#777;
                    font-weight:bold;
                ">
                    Previous Appointment
                </p>

                <div style="
                    background:#F8F8F8;
                    border-radius:10px;
                    padding:15px;
                ">
                    <p style="margin:6px 0;color:#666;">
                        <strong>Date:</strong> ${previousDate}
                    </p>

                    <p style="margin:6px 0;color:#666;">
                        <strong>Time:</strong> ${previousTime}
                    </p>
                </div>

                <p style="
                    margin:20px 0 10px;
                    color:#1E3D15;
                    font-weight:bold;
                ">
                    New Appointment
                </p>

                <div style="
                    background:#E8F5E9;
                    border:1px solid #C8E6C9;
                    border-radius:10px;
                    padding:15px;
                ">
                    <p style="margin:6px 0;color:#555;">
                        <strong>Date:</strong> ${newDate}
                    </p>

                    <p style="margin:6px 0;color:#555;">
                        <strong>Time:</strong> ${newTime}
                    </p>

                    <p style="margin:6px 0;color:#555;">
                        <strong>Doctor:</strong> ${doctorName}
                    </p>
                </div>

                <p style="
                    line-height:1.6;
                    color:#666;
                    margin-top:25px;
                ">
                    Please log in to the Bagumbayan Healthcare Scheduling
                    System to view your updated appointment details.
                </p>

            </div>

            <div style="
                background:#F8F8F8;
                text-align:center;
                padding:18px;
                font-size:13px;
                color:#777;
            ">
                © ${new Date().getFullYear()}
                Bagumbayan Healthcare Scheduling System
                <br/>
                Barangay Bagumbayan Health Center
            </div>

        </div>
    </div>
`;