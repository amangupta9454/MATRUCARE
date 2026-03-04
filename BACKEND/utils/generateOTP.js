const crypto = require('crypto');

const generateOTP = () => {
    // Generate 6-8 character alphanumeric OTP
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 characters
};

module.exports = generateOTP;
