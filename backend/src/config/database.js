/**
 * MongoDB Database Connection
 * Enhanced with retry logic, connection pooling, and event handling
 */

const mongoose = require('mongoose');

// Connection options for MongoDB Atlas
const connectionOptions = {
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4
};

/**
 * Connect to MongoDB with retry logic
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries in ms
 */
const connectDB = async (retries = 5, delay = 5000) => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllens';

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`\n📡 Connecting to MongoDB (Attempt ${attempt}/${retries})...`);

            const conn = await mongoose.connect(MONGODB_URI, connectionOptions);

            console.log(`✅ MongoDB Connected Successfully!`);
            console.log(`   Host: ${conn.connection.host}`);
            console.log(`   Database: ${conn.connection.name}`);
            console.log(`   Port: ${conn.connection.port}`);

            // Set up connection event handlers
            setupConnectionHandlers();

            return conn;
        } catch (error) {
            console.error(`❌ MongoDB Connection Error (Attempt ${attempt}/${retries}):`, error.message);

            if (attempt === retries) {
                console.error('\n💥 Failed to connect to MongoDB after all retry attempts');
                console.error('Please check:');
                console.error('  1. MongoDB URI in .env file');
                console.error('  2. Network connectivity');
                console.error('  3. MongoDB Atlas IP whitelist');
                console.error('  4. Database user credentials\n');
                process.exit(1);
            }

            console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

/**
 * Set up MongoDB connection event handlers
 */
const setupConnectionHandlers = () => {
    const db = mongoose.connection;

    db.on('connected', () => {
        console.log('🔗 Mongoose connected to MongoDB');
    });

    db.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err.message);
    });

    db.on('disconnected', () => {
        console.warn('⚠️ Mongoose disconnected from MongoDB');
    });

    db.on('reconnected', () => {
        console.log('🔄 Mongoose reconnected to MongoDB');
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
        try {
            await db.close();
            console.log('\n👋 MongoDB connection closed due to app termination');
            process.exit(0);
        } catch (err) {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
        }
    });
};

/**
 * Check if database is connected
 * @returns {boolean}
 */
const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

/**
 * Get database connection status
 * @returns {string}
 */
const getConnectionStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Close database connection
 */
const closeConnection = async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
};

module.exports = {
    connectDB,
    isConnected,
    getConnectionStatus,
    closeConnection,
};
