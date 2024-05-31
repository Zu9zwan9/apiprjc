require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,  // Use 587 for TLS
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SENDGRID_USER,  // SendGrid API key user
        pass: process.env.SENDGRID_API_KEY  // SendGrid API key
    }
});

function sendEmail(to, subject, text, html) {
    const mailOptions = {
        from: process.env.SENDGRID_VERIFIED_SENDER, // This should be the email verified with SendGrid
        to: to,
        subject: subject,
        text: text,
        html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

module.exports = sendEmail;
