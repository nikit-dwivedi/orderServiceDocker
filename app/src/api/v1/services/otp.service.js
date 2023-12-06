const sgMail = require('@sendgrid/mail');
const { get } = require('./axios.service');
require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const textlocalapi = process.env.TEXTLOCALAPI;

const sendMail = async (email, otp) => {
    try {
        const msg = {
            to: email,
            from: 'nikitdwivedi@fabloplatforms.com',
            templateId: '',
            dynamicTemplateData: {
                otp: otp,
            },
        }
        await sgMail.send(msg)
    } catch (error) {
        console.log(error);
    }
}
const sendSms = async (number, otp) => {
    try {
        let resposne = await get(`https://api.textlocal.in/send/?apikey=${textlocalapi}=&numbers=${number}&sender=FABLOP&message=` +
            encodeURIComponent(
                `Greetings from Fablo, ${otp} is your verification code to login into Fablo Platforms.`
            ))
    } catch (error) {
        console.log(error)
    }
}

module.exports = { sendMail, sendSms }


