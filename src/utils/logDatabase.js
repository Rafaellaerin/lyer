const fs = require('fs');
const path = require('path');

// Paths to the JSON files
const logFiles = {
  banned: path.join(__dirname, '../data/logUserBanned.json'), // Log file for banned users
  unbanned: path.join(__dirname, '../data/logUserUnbanned.json'), // Log file for unbanned users
};

/**
 * Ensures the JSON file exists and has valid content.
 * If not, creates or recreates the file with a default structure.
 * @param {string} type - Log type ("banned" or "unbanned").
 */
function initializeLogFile(type) {
  if (!logFiles[type]) {
    throw new Error(`Invalid log type: ${type}`); // Error if type is invalid
  }

  // Check if the file exists
  if (!fs.existsSync(logFiles[type])) {
    // Create the file with a default structure
    fs.writeFileSync(logFiles[type], JSON.stringify({ logChannelId: null }, null, 2));
    console.log(`File created: ${logFiles[type]}`); // Log file creation
  } else {
    // Verify if the file is empty or corrupted
    try {
      const data = fs.readFileSync(logFiles[type], 'utf8');
      if (!data || JSON.parse(data).logChannelId === undefined) {
        throw new Error('File is empty or corrupted');
      }
    } catch (error) {
      // Recreate the file with a default structure
      fs.writeFileSync(logFiles[type], JSON.stringify({ logChannelId: null }, null, 2));
      console.warn(`File corrected: ${logFiles[type]}`); // Log file correction
    }
  }
}

/**
 * Loads the content of the JSON file.
 * @param {string} type - Log type ("banned" or "unbanned").
 * @returns {Object} - Content of the JSON file.
 */
function loadLog(type) {
  initializeLogFile(type); // Ensure the file is initialized
  return JSON.parse(fs.readFileSync(logFiles[type], 'utf8')); // Return file content as an object
}

/**
 * Saves content to the JSON file.
 * @param {string} type - Log type ("banned" or "unbanned").
 * @param {Object} data - Data to be saved.
 */
function saveLog(type, data) {
  if (!logFiles[type]) {
    throw new Error(`Invalid log type: ${type}`); // Error if type is invalid
  }
  fs.writeFileSync(logFiles[type], JSON.stringify(data, null, 2)); // Write data to the file
}

module.exports = { loadLog, saveLog };
