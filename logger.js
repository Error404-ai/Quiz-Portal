import fs from 'fs';
import path from 'path';

// Make sure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream
const logStream = fs.createWriteStream(path.join(logsDir, 'app.log'), { flags: 'a' });

export const logger = {
  debug: (message) => {
    const logMessage = `[DEBUG][${new Date().toISOString()}] ${message}\n`;
    logStream.write(logMessage);
    process.stdout.write(logMessage);
  },
  error: (message) => {
    const logMessage = `[ERROR][${new Date().toISOString()}] ${message}\n`;
    logStream.write(logMessage);
    process.stdout.write(logMessage);
  }
};