'use strict';

const Boom = require('boom');
const Joi = require('joi');
const SecurePassword = require('secure-password');
const Uuid = require('uuid');

//new instance of SecurePassword using the default config
const Pwd = new SecurePassword();

const internals = {};

module.exports = (server, options) => {

    return {
        method: 'POST',
        path: '/users/request-reset',
        config: {
            description: 'Request password reset for a user',
            tags: ['api'],
            validate: {
                payload: {
                    email: Joi.string().email().required()
                }
            },
            auth: false
        },
        handler: async (request) => {

            const Users = request.models().Users;
            const emailService = request.services().emailService;
            const Payload = request.payload;

            const rawResetToken = Buffer.from(Uuid({ rng: Uuid.nodeRNG }));

            const hash = Pwd.hashSync(rawResetToken);

            const updatedUsers = await Users.query()
                .patch({ 'password': null, resetToken: hash.toString('utf8') })
                .where({ 'email': Payload.email })
                .returning('*');

            const resetUrl = options.siteUrl + '/reset-password/' + rawResetToken;

            if (updatedUsers.length === 1) {
                await emailService.send('password-reset', updatedUsers[0], { resetUrl });
                return 'Check your email for a reset link';
            }

            return Boom.internal('Unable to complete password reset');
            // send token to user via email here. This functionality
            // intentionally left out, as it is dependent on
            // infrastructure and front end implementation.

            // return 'Raw Reset Token, for testing only *' + rawResetToken + '* TODO: Implement email sending';
        }
    };
};
