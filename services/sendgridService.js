const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY, SENDGRID_EMAIL } = require("../utils/env");
sgMail.setApiKey(SENDGRID_API_KEY);

const sendSendgridEmail = async (mail) => {
    return await sgMail.send({
        ...mail,
        from: SENDGRID_EMAIL,
        replyTo: SENDGRID_EMAIL,
    });
}

module.exports = {
    sendSendgridEmail
}
