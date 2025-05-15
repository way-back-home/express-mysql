import express from "express";
const mysql = require("mysql2");
const MysqlError = require("mysql2").MysqlError;
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());
app.use(express.json());

// type
type Note = {
  Title: string;
  Description: string;
  Date: string;
};

// MySQL database connection
const db = mysql.createConnection({
  // host: "sql.freedb.tech",
  // user: "freedb_root@",
  // password: "*PcgM&xjwrdK6Vw",
  // port: "3306",
  // database: "freedb_notes-db",

  host: "yamanote.proxy.rlwy.net",
  user: "root",
  password: "RAHMsDlbUpPCxwCzIuFZpkqQlRNsNioN",
  port: 35165,
  database: "railway",
});

// Connect to MySQL
db.connect((err: typeof MysqlError | null) => {
  if (err) throw err;
  console.log("Connected to the database");
});

app.post("/sync-notes", (req, res) => {
  const notes: Note[] = req.body.notes;
  if (!notes || notes.length === 0) {
    return res.status(400).send("No notes to sync");
  }

  // Insert notes into the database
  notes.forEach((note) => {
    const { Title, Description, Date } = note;

    // Check if the note already exists (using a unique identifier like `id` or `Date`)
    const query =
      "INSERT INTO notes (Title, Description, Date, synced) VALUES (?, ?, ?, 1)";

    db.query(query, [Title, Description, Date], (err: any, result: any) => {
      if (err) {
        console.error("Error inserting note:", err);
        return res.status(500).send("Failed to sync notes");
      }
    });
  });

  res.status(200).send("Notes synced successfully");
  console.log("Notes synced successfully");
});

app.listen(port, () => {
  console.log(`Sandbox listening on port ${port}`);
});
