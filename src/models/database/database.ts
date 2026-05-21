import * as SQLite from 'expo-sqlite'

const DATABASE_NAME = 'jourture.db'

let db: SQLite.SQLiteDatabase | null = null

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync(DATABASE_NAME)
  }
  return db
}

export const initializeDatabase = (): void => {
  const database = getDatabase()

  database.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `)

  database.execSync(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      target_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      achieved_at TEXT,
      created_at TEXT NOT NULL
    );
  `)

  database.execSync(`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY NOT NULL,
      goal_id TEXT NOT NULL,
      log_date TEXT NOT NULL,
      content TEXT NOT NULL,
      extra_activities TEXT,
      image_uris TEXT NOT NULL DEFAULT '[]',
      claude_response TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
    );
  `)
}
