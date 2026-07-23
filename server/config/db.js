const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn('WARN: MONGO_URI is missing, skipping DB connect');
            return;
        }
        const conn = await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
