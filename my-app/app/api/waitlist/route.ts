import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 });
    }

    // Database connection
    const sql = neon(process.env.DATABASE_URL);

    // Verify OTP
    const otpResult = await sql`
      SELECT * FROM waitlist_otps 
      WHERE email = ${email} AND otp = ${otp}
    `;

    if (otpResult.length === 0) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const otpData = otpResult[0];
    if (new Date() > new Date(otpData.expires_at)) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // OTP is valid, delete it
    await sql`DELETE FROM waitlist_otps WHERE email = ${email}`;

    // Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert email or get existing
    let user;
    try {
      const result = await sql`
        INSERT INTO waitlist (email) 
        VALUES (${email}) 
        RETURNING id
      `;
      user = result[0];
    } catch (e: any) {
      // Unique violation
      if (e.code === '23505') {
        const existing = await sql`SELECT id FROM waitlist WHERE email = ${email}`;
        user = existing[0];
      } else {
        throw e;
      }
    }

    // Get total count
    const countResult = await sql`SELECT COUNT(*) as count FROM waitlist`;
    const count = countResult[0].count;

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
      subject: `You're #${count} on the Conexion waitlist`,
      text: `Welcome to Conexion!\n\nYou've been added to the waitlist. Your position is #${count}.\n\nWe're building an encrypted peer-to-peer network — an entirely new way to experience human connection in your browser. We'll send you an exclusive invite when it's your turn.\n\nSee you soon,\nThe Conexion Team`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the Conexion Waitlist</title>
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

              <!-- Success badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#fdf0e8;border-radius:100px;padding:6px 14px;">
                    <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#d4916a;">Registration Confirmed</p>
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 16px 0;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.3;">You're officially on the list.</h1>
              <p style="margin:0 0 32px 0;font-size:15px;line-height:1.7;color:#555555;">
                Welcome to Conexion. We're building an encrypted peer-to-peer network — an entirely new way to experience human connection, right in your browser.
              </p>

              <!-- Waitlist number highlight -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#fdf0e8 0%,#fae8d8 100%);border-radius:12px;padding:28px 24px;border-left:4px solid #d4916a;">
                    <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#c07a50;">Your Waitlist Position</p>
                    <p style="margin:0;font-size:52px;font-weight:800;color:#1a1a1a;line-height:1;letter-spacing:-1px;">#${count}</p>
                    <p style="margin:10px 0 0 0;font-size:13px;color:#888888;">You joined ahead of everyone who comes after you.</p>
                  </td>
                </tr>
              </table>

              <!-- What's next -->
              <p style="margin:0 0 12px 0;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#999999;">What happens next</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f2f2f2;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;vertical-align:top;padding-top:1px;">
                          <p style="margin:0;font-size:16px;">&#128274;</p>
                        </td>
                        <td>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;">Private beta access</p>
                          <p style="margin:4px 0 0 0;font-size:13px;color:#777777;">We'll send your invite when it's your turn — no spam, ever.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f2f2f2;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;vertical-align:top;padding-top:1px;">
                          <p style="margin:0;font-size:16px;">&#127760;</p>
                        </td>
                        <td>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;">Encrypted P2P network</p>
                          <p style="margin:4px 0 0 0;font-size:13px;color:#777777;">Your conversations are end-to-end encrypted — we never see them.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;vertical-align:top;padding-top:1px;">
                          <p style="margin:0;font-size:16px;">&#10024;</p>
                        </td>
                        <td>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;">Real human connection</p>
                          <p style="margin:4px 0 0 0;font-size:13px;color:#777777;">Match with people who share your interests, instantly.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 24px 0;" />
              <p style="margin:0;font-size:14px;color:#888888;">
                See you on the other side,<br />
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

    // If EMAIL_USER is not set, we skip sending email so the app doesn't crash during dev
    if (process.env.EMAIL_USER) {
      await transporter.sendMail(mailOptions);
    } else {
      console.warn("EMAIL_USER not set, skipping email sending.");
    }

    return NextResponse.json({ success: true, count, waitlistNumber: user.id });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
