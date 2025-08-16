import nodemailer from 'nodemailer';

export async function sendBookingNotification(to: string, propertyTitle: string, bookingDetails: any) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: `New Booking for ${propertyTitle}`,
    text: `You have a new booking:\n\n${JSON.stringify(bookingDetails, null, 2)}`,
  };

  await transporter.sendMail(mailOptions);
}