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
      subject: 'Welcome to the Conexion Waitlist!',
      text: `You have successfully joined the Conexion waitlist! You are #${count} on the waitlist. We will let you know when you can access the platform.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #d4916a;">Welcome to the Conexion Waitlist!</h2>
          <p>You have successfully joined the Conexion waitlist.</p>
          <p>You are number <strong>#${count}</strong> in line.</p>
          <p>We're excited to have you on board and will notify you as soon as you can access the platform.</p>
          <br/>
          <p>Best regards,<br/><strong>The Conexion Team</strong></p>
        </div>
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
