require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const res = await User.updateMany({}, { role: 'Admin' });
        console.log(`Successfully elevated ${res.modifiedCount} users to Admin!`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
