'use strict';

const Schmervice = require('schmervice');
const Util = require('util');
const Sendemail = Util.promisify(require('sendemail').email);

const internals = {};

module.exports = class EmailService extends Schmervice.Service {

    send(context, recipient, data) {

        const envelope = {
            email: recipient.email,
            subject: this.configure(context),
            templateVars: data
        };

        return Sendemail(context, envelope);
    }

    configure(context) {

        switch (context) {
            case 'password-reset':
                return 'Password Reset';
                break;
            default:
                return 'Hello';
        }
    }
};
