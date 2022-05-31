require('dotenv').config();
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_BOT_NUMBER = 'whatsapp:+14155238886';
const LIVNE_PHONE_NUMBER = process.env.LIVNE_PHONE_NUMBERr;
const SENDER_NUMBER = LIVNE_PHONE_NUMBER;

const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

send_message(validate_phone_number("0525563127"), "shalom")

function send_message(recipent, content) {
    client.messages.create({
        from: SENDER_NUMBER,
        to: recipent,
        body: content
    })
}

/**
 * validates the string to be in the 'whatsapp:num' format
 * @param {String} number The number as written by the user
 * @returns {String} the number in the required format
 */
function validate_phone_number(number) {
    var valid_number = number
    valid_number = valid_number.replace(/[-+()\s]/g, '');
    if (valid_number.charAt(0) == "0") {
        valid_number = valid_number.slice(1);
    }
    return `whatsapp:+972${valid_number}`
}