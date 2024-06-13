import sqlite3 from "sqlite3";

export function connectDb(db_path: string): sqlite3.Database {
  return new sqlite3.Database(db_path, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the database.");
  });
}
export default connectDb;