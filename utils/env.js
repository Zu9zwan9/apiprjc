const dotenv = require('dotenv');
require('dotenv').config();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL
const SITE_NAME = process.env.SITE_NAME;

module.exports = {
    SENDGRID_EMAIL,
    SENDGRID_API_KEY,
    SITE_NAME
}