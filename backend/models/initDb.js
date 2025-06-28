const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath =
  process.env.DATABASE_URL || path.join(__dirname, "../../database.sqlite3");

const db = new sqlite3.Database(dbPath);

// 유저 테이블(멘토/멘티 공용)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('mentor', 'mentee')) NOT NULL,
    bio TEXT,
    image BLOB,
    imageType TEXT,
    skills TEXT
  )`);

  // 매칭 요청 테이블
  db.run(`CREATE TABLE IF NOT EXISTS match_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mentorId INTEGER NOT NULL,
    menteeId INTEGER NOT NULL,
    message TEXT,
    status TEXT CHECK(status IN ('pending', 'accepted', 'rejected', 'cancelled')) NOT NULL DEFAULT 'pending',
    FOREIGN KEY (mentorId) REFERENCES users(id),
    FOREIGN KEY (menteeId) REFERENCES users(id)
  )`);
});

module.exports = db;
