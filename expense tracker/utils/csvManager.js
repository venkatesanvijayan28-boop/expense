const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Mutex } = require('async-mutex');

const dataDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Mutexes for file operations to prevent race conditions
const fileMutexes = {};

function getMutex(filename) {
    if (!fileMutexes[filename]) {
        fileMutexes[filename] = new Mutex();
    }
    return fileMutexes[filename];
}

// Ensure CSV file exists with correct headers
async function ensureFileExists(filename, headers) {
    const filePath = path.join(dataDir, filename);
    const mutex = getMutex(filename);
    const release = await mutex.acquire();

    try {
        if (!fs.existsSync(filePath)) {
            const csvWriter = createCsvWriter({
                path: filePath,
                header: headers
            });
            await csvWriter.writeRecords([]); // Create empty file with headers
        }
    } finally {
        release();
    }
}

// Read all records from a CSV file
async function readRecords(filename) {
    const filePath = path.join(dataDir, filename);
    const mutex = getMutex(filename);
    const release = await mutex.acquire();
    const results = [];

    try {
        if (!fs.existsSync(filePath)) return results;
        
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (err) => reject(err));
        });
    } finally {
        release();
    }
}

// Write records (overwrite file)
async function writeRecords(filename, headers, records) {
    const filePath = path.join(dataDir, filename);
    const mutex = getMutex(filename);
    const release = await mutex.acquire();

    try {
        const csvWriter = createCsvWriter({
            path: filePath,
            header: headers
        });
        await csvWriter.writeRecords(records);
    } finally {
        release();
    }
}

// Append a single record
async function appendRecord(filename, headers, record) {
    const records = await readRecords(filename);
    records.push(record);
    await writeRecords(filename, headers, records);
}

// Update a record by ID
async function updateRecord(filename, headers, id, updatedData) {
    const records = await readRecords(filename);
    const index = records.findIndex(r => r.id === id);
    
    if (index !== -1) {
        records[index] = { ...records[index], ...updatedData };
        await writeRecords(filename, headers, records);
        return records[index];
    }
    return null;
}

// Delete a record by ID
async function deleteRecord(filename, headers, id) {
    const records = await readRecords(filename);
    const newRecords = records.filter(r => r.id !== id);
    
    if (records.length !== newRecords.length) {
        await writeRecords(filename, headers, newRecords);
        return true;
    }
    return false;
}

module.exports = {
    ensureFileExists,
    readRecords,
    writeRecords,
    appendRecord,
    updateRecord,
    deleteRecord
};
