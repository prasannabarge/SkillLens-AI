// Middleware barrel export
module.exports = {
    auth: require('./auth'),
    upload: require('./upload'),
    validators: require('./validators'),
    errorHandler: require('./errorHandler'),
};
