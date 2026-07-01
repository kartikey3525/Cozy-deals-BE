const springedge = require('springedge');
const apikey = '6on957rb36978j0rl148a6j226v03jmr' 
const { msg } = require('../../config/message')

exports.sendSmsFromSpringedge = async (mobile, smsBody, otp) => {
    try {
        var params = {
            'sender': 'SEDEMO',
            'apikey': apikey,
            'to': [
                mobile  //Moblie Numbers 919876543212
            ],
            'message': "Hello $var, This is a test message from spring edge ", //`Hello ${otp}, This is a otp test message from spring edge`,//"Hello $var, This is a test message from spring edge "
            'format': 'json'
        };

        const response = await new Promise((resolve, reject) => {
            springedge.messages.send(params, 5000, function (err, response) {
                if (err) {
                    return reject({ msg: 'fail', error: err });
                }
                resolve({ msg: 'ok', ...response });
            });
        });

        return response
    } catch (error) {
        console.log(error.message)
    }
};