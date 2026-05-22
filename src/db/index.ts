import config from "../config/env";
import { Pool } from "pg";
export const pool = new Pool({
  connectionString: config.connection_string,
});

//  Table create
export const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL UNIQUE PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'contributor',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL UNIQUE PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        reporter_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        `);
    console.log("The table is created successfully");
  } catch (error) {
    console.log(error);
  }
};
