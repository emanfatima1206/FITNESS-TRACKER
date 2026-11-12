import mongoose from "mongoose";

const connectDb = async () => {
    const DB_NAME = "FitnessTracker_db";
    const primaryUri = process.env.MONGO_URI
        ? (process.env.MONGO_URI.includes(DB_NAME) ? process.env.MONGO_URI : `${process.env.MONGO_URI.replace(/\/$/, '')}/${DB_NAME}`)
        : `mongodb://127.0.0.1:27017/${DB_NAME}`;
    const fallbackUri = `mongodb://127.0.0.1:27017/${DB_NAME}`;

    try {
        console.log(`Connecting to MongoDB (primary)...`);
        const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 4000 });
        console.log(`Connected database: ${conn.connection.name} (${conn.connection.host})`);
        return conn;
    } catch (primaryError) {
        console.warn(`Primary MongoDB connection failed (${primaryError.message}). Trying local fallback: ${fallbackUri}...`);
        try {
            const fallbackConn = await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 5000 });
            console.log(`Connected to fallback local database: ${fallbackConn.connection.name} (${fallbackConn.connection.host})`);
            return fallbackConn;
        } catch (fallbackError) {
            console.error("FATAL: Could not connect to primary or fallback MongoDB:", fallbackError.message);
            process.exit(1);
        }
    }
};

export default connectDb;
