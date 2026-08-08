require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { bufferCommands: false }).then(async () => {
    const schedules = await mongoose.connection.collection('visitschedules').find({}).toArray();
    console.log(schedules);
    process.exit(0);
});
