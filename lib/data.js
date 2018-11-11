/**
 * Library for storing and editing data
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for data handlers
const lib = {};

// Define base directory
lib.baseDir = path.join(__dirname, '../.data/');

/**
 * Create file with data in the dir
 * @param {string} dir 
 * @param {string} file 
 * @param {object} data 
 * @param {(error: string | boolean) => void} callback 
 */
lib.create = (dir, file, data, callback) => {
  // 1. Create the file, if exist return error
  // 2. Write to the file
  // 3. Close the file

  // 1. Open or create the file to writing
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDesc) => {
    if (!err && fileDesc) {
      //Convert data to struing
      const stringData = JSON.stringify(data);

      // 2. Write data to file and close it
      fs.writeFile(fileDesc, stringData, (writeError) => {
        if (!writeError) {
          // 3. Close
          fs.close(fileDesc, (closeError) => {
            if (!closeError) {
              callback(false);
            } else {
              callback('Error closing new file')
            }
          });
        } else {
          callback('Error writing to the new file');
        }
      });

    } else {
      callback('Could not create new file, it could already exist');
    }
  });
};

/**
 * Read file in the dir
 * @param {string} dir 
 * @param {string} file 
 * @param {(error: string | boolean, data: any) => void} callback 
 */
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8', (err, data) => {
    if (!err && data) {
      callback(err, helpers.parseJsonToObject(data));
    } else {
      callback(err, data);
    }
  });
};

/**
 * Update file with data in the dir
 * @param {string} dir 
 * @param {string} file 
 * @param {object} data 
 * @param {(error: string | boolean) => void} callback 
 */
lib.update = (dir, file, data, callback) => {
  // 1. Open file to read and write
  // 2. Truncate the file
  // 3. Write to the file
  // 4. Close the file

  // 1. Open a file for writing
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDesc) => {
    if (!err && fileDesc) {
      // Convert data to string
      const stringData = JSON.stringify(data);

      // 2. Truncate(clear) the file
      fs.truncate(fileDesc, (truncateErr) => {
        if (!truncateErr) {
          // 3. Write data to file
          fs.writeFile(fileDesc, stringData, (writeErr) => {
            if (!writeErr) {
              // 4. Close the file
              fs.close(fileDesc, (closeErr) => {
                if (!closeErr) {
                  callback(false);
                } else {
                  callback('Error closing existing file');
                }
              });
            } else {
              callback('Error writing to the file');
            }
          });
        } else {
          callback('Error truncating the file');
        }
      });
    } else {
      callback('Could not open the file to updating, it may not exist yet');
    }
  });
};

/**
 * Delete the file in the dir
 * @param {string} dir 
 * @param {string} file 
 * @param {(error: string | boolean) => void} callback 
 */
lib.delete = (dir, file, callback) => {
  // Delete the file
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting existing file');
    }
  });
};

/**
 * Get all files in the directory
 * @param {string} dir 
 * @param {(error: string | boolean, data: string[]) => void} callback
 */
lib.list = (dir, callback) => {
  fs.readdir(`${lib.baseDir}${dir}`, (err, data) => {
    if (!err && data.length > 0) {
      const trimedFilesName = [];
      for (let i = 0, l = data.length; i < l; i++) {
        trimedFilesName.push(data[i].replace('.json', ''));
      }
      callback(false, trimedFilesName);
    } else {
      callback(err, data);
    }
  });
}

module.exports = lib;
