/**
 * Server Entry Point
 * Enhanced with graceful shutdown and health monitoring
 */

require('dotenv').config();

const app = require('./app');
const config = require('./config');
const { connectDB, getConnectionStatus } = require('./config/database');

const PORT = config.server.port;

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 SkillLens Backend Server                             ║
║                                                           ║
║   Server:      http://localhost:${PORT}                     ║
║   Environment: ${config.env.padEnd(20)}                   ║
║   Database:    ${getConnectionStatus().padEnd(20)}                   ║
║                                                           ║
║   API Docs:    http://localhost:${PORT}/health              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
            `);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n📤 ${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async (err) => {
        if (err) {
          console.error('Error during server shutdown:', err);
          process.exit(1);
        }

        console.log('✅ HTTP server closed');

        try {
          // Close MongoDB connection
          const { closeConnection } = require('./config/database');
          await closeConnection();
          console.log('✅ MongoDB connection closed');
          console.log('👋 Graceful shutdown completed');
          process.exit(0);
        } catch (dbError) {
          console.error('Error closing database:', dbError);
          process.exit(1);
        }
      });

      // Force shutdown after timeout
      setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
      }, 10000); // 10 seconds timeout
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('💥 Uncaught Exception:', err);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
