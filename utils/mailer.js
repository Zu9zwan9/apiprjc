require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_API_KEY
    }
});

const sendEmail = (to, subject, text, html) => {
    const mailOptions = {
        from: process.env.SENDGRID_EMAIL,
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
