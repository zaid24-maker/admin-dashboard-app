const mongoose = require('mongoose');

const getConnectionUri = () => {
    const configuredUri = process.env.MONGO_URI;

    // This network blocks DNS SRV records, which prevents mongodb+srv URLs from
    // resolving. Use Atlas' equivalent standard connection string locally.
    if (!configuredUri?.includes('@cluster0.qiotzbf.mongodb.net')) {
        return configuredUri;
    }

    const credentials = configuredUri.match(/^mongodb\+srv:\/\/([^@]+)@/)?.[1];
    if (!credentials) return configuredUri;

    const database = new URL(configuredUri).pathname.replace(/^\//, '') || 'admin-dashboard';
    const hosts = [
        'ac-ov3fitm-shard-00-00.qiotzbf.mongodb.net:27017',
        'ac-ov3fitm-shard-00-01.qiotzbf.mongodb.net:27017',
        'ac-ov3fitm-shard-00-02.qiotzbf.mongodb.net:27017'
    ].join(',');

    return `mongodb://${credentials}@${hosts}/${database}?tls=true&authSource=admin&replicaSet=atlas-1odxxy-shard-0&retryWrites=true&w=majority`;
};

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn('WARN: MONGO_URI is missing, skipping DB connect');
            return;
        }
        const conn = await mongoose.connect(getConnectionUri(), { family: 4 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
