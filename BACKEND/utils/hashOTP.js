const bcrypt = require('bcrypt');

const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

const verifyOTP = async (otp, hashedOTP) => {
    return await bcrypt.compare(otp, hashedOTP);
};

module.exports = { hashOTP, verifyOTP };
