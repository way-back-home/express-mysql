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
  id: string;
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
  console.log("Connected to the database ✅");
});

// app.post("/sync-notes", (req, res) => {
//   const notes: Note[] = req.body.notes;
//   if (!notes || notes.length === 0) {
//     return res.status(400).send("No notes to sync ❌");
//   }

//   // Insert notes into the database
//   notes.forEach((note) => {
//     const {id, Title, Description, Date } = note;

//     // Check if the note already exists (using a unique identifier like `id` or `Date`)
//     const query =
//       "INSERT INTO notes (note_id, Title, Description, Date, synced) VALUES (?, ?, ?, ?, 1)";

//     db.query(query, [id, Title, Description, Date], (err: any, result: any) => {
//       if (err) {
//         console.error("Error inserting note:", err);
//         return res.status(500).send("Failed to sync notes ❌");
//       }
//     });
//   });

//   res.status(200).send("Notes synced successfully ✅");
// });

app.post("/sync-notes", (req, res) => {
  const notes: Note[] = req.body.notes;
  if (!notes || notes.length === 0) {
    return res.status(400).send("No notes to sync ❌");
  }

  let insertedCount = 0;

  notes.forEach((note, index) => {
    const { id, Title, Description, Date } = note;

    const checkQuery = "SELECT * FROM notes WHERE Title = ?";
    db.query(checkQuery, [Title], (checkErr: any, results: any[]) => {
      if (checkErr) {
        console.error("Error checking for existing note:", checkErr);
        return res.status(500).send("Failed to check notes ❌");
      }

      if (results.length === 0) {
        const insertQuery =
          "INSERT INTO notes (note_id, Title, Description, Date, synced) VALUES (?, ?, ?, ?, 1)";
        db.query(insertQuery, [id, Title, Description, Date], (insertErr: any) => {
          if (insertErr) {
            console.error("Error inserting note:", insertErr);
            return res.status(500).send("Failed to sync notes ❌");
          }

          insertedCount++;
          // Send success response only after last note
          if (index === notes.length - 1) {
            res.status(200).send(`Notes synced successfully ✅ (${insertedCount} new)`);
          }
        });
      } else if (index === notes.length - 1) {
        // If last note, still send response even if no insert was needed
        res.status(200).send(`Notes synced successfully ✅ (${insertedCount} new)`);
      }
    });
  });
});

// show 
app.get("/notes", (req, res) => {
  db.query("SELECT * FROM notes", (err: any, results: Note[]) => {
    if (err) {
      console.error("Error fetching notes:", err);
      return res.status(500).send("Failed to fetch notes");
    }
    res.json(results);
  });
});

// delete
app.delete("/notes/:id", (req, res) => {
  const noteId = req.params.id;

  db.query("DELETE FROM notes WHERE note_id = ?", [noteId], (err: any, result: any) => {
    if (err) {
      console.error("Error deleting note:", err);
      return res.status(500).send("Failed to delete note");
    }

    res.status(200).send("Note deleted from server");
  });
});

// edit 
app.put("/notes/:id", (req, res) => {
  const noteId = req.params.id;
  const { Title, Description, Date } = req.body;

  // Update query
  const query =
    "UPDATE notes SET Title = ?, Description = ?, Date = ? WHERE id = ?";
  db.query(query, [Title, Description, Date, noteId], (err: any, result: any) => {
    if (err) {
      console.error("Error updating note:", err);
      return res.status(500).send("Failed to update note");
    }
    res.status(200).send("Note updated on server");
  });
});



app.listen(port, () => {
  console.log(`Sandbox listening on port ${port}`);
});
