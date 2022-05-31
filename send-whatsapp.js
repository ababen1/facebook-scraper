const TWILIO_ACCOUNT_SID = "ACb12533796453cde5c5fdcaddeffa3f67";
const TWILIO_AUTH_TOKEN = "210551e9d514e1bff4e29929ac92d953";
const TWILIO_BOT_NUMBER = 'whatsapp:+14155238886';
const SENDER_NUMBER = TWILIO_BOT_NUMBER;

const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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