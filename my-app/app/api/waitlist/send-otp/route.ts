import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 });
    }

    // Database connection
    const sql = neon(process.env.DATABASE_URL);

    // Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist_otps (
        email VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL
      )
    `;

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert the OTP
    await sql`
      INSERT INTO waitlist_otps (email, otp, expires_at)
      VALUES (${email}, ${otp}, ${expiresAt.toISOString()})
      ON CONFLICT (email) DO UPDATE 
      SET otp = ${otp}, expires_at = ${expiresAt.toISOString()}
    `;

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || '"Conexion" <noreply@conexion.app>',
      to: email,
      subject: 'Your verification code for Conexion',
      text: `Your Conexion verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\n— The Conexion Team`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Conexion OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ece8;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0ece8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;color:#1a1a1a;letter-spacing:-0.5px;">
                Cone<span style="color:#d4916a;font-style:italic;">x</span>ion
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:44px 40px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">

              <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#d4916a;">Verification Code</p>
              <h1 style="margin:0 0 20px 0;font-size:24px;font-weight:700;color:#1a1a1a;line-height:1.3;">Confirm your email address</h1>
              <p style="margin:0 0 32px 0;font-size:15px;line-height:1.7;color:#555555;">
                Use the code below to verify your email and join the Conexion waitlist. It expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center" style="background-color:#f8f4f0;border:2px dashed #d4916a;border-radius:12px;padding:28px 20px;">
                    <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#999999;">One-Time Password</p>
                    <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:10px;color:#1a1a1a;font-family:'Courier New',Courier,monospace;">${otp}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px 0;font-size:13px;line-height:1.6;color:#888888;">
                If you didn't request this code, you can safely ignore this email. Someone may have entered your address by mistake.
              </p>

              <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 24px 0;" />
              <p style="margin:0;font-size:14px;color:#888888;">
                Best regards,<br />
                <strong style="color:#1a1a1a;">The Conexion Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                © ${new Date().getFullYear()} Conexion. All rights reserved.
              </p>
              <p style="margin:6px 0 0 0;font-size:12px;color:#bbbbbb;">
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };

    if (process.env.EMAIL_USER) {
      await transporter.sendMail(mailOptions);
    } else {
      console.warn("EMAIL_USER not set, skipping OTP email sending. OTP is:", otp);
    }

    const isDev = !process.env.EMAIL_USER;
    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      ...(isDev ? { devOtp: otp } : {})
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
