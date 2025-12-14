// db/init.js
const db = require('./database');

db.serialize(() => {
  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      profile_color TEXT DEFAULT '#000000',
      avatar TEXT,
      failed_attempts INTEGER DEFAULT 0,
      lock_until INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      expires INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      display_name TEXT,
      text TEXT,
      created_at INTEGER,
      edited_at INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      ip TEXT,
      success INTEGER,
      timestamp INTEGER
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id INTEGER,
      expires INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      display_name TEXT,
      message TEXT,
      timestamp INTEGER
    );

    CREATE TABLE IF NOT EXISTS book_recs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      book_title TEXT,
      author TEXT,
      description TEXT,
      created_at INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

  `, (err) => {
    if (err) {
      console.error('DB init error:', err);
    } else {
      console.log('Database tables created successfully');

      // Now safely add the bio column if it doesn't exist
      db.all(`PRAGMA table_info(users)`, (err, rows) => {
        if (err) return console.error('PRAGMA error:', err);

        const columnExists = rows.some(col => col.name === 'bio');
        if (!columnExists) {
          db.run(`ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''`, err => {
            if (err) return console.error('ALTER TABLE error:', err);
            console.log('Added bio column to users table');
          });
        } else {
          console.log('bio column already exists');
        }
      });
    }
  });
});
