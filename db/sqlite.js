const sqlite3 = require('better-sqlite3');
let db = new sqlite3('./time-tracker-demo.db', { verbose: console.log });

exports.sqlite = db;