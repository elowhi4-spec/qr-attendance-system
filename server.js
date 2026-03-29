const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("attendance.db");

// CREATE TABLE
db.run(`
CREATE TABLE IF NOT EXISTS attendance(
id TEXT,
section TEXT,
time TEXT,
date TEXT
)
`);

// SAVE ATTENDANCE
app.post("/attendance", (req, res) => {
    const { id, section, time } = req.body;
    const date = new Date().toLocaleDateString();

    db.run(
        "INSERT INTO attendance(id,section,time,date) VALUES(?,?,?,?)",
        [id, section, time, date]
    );

    res.send("saved");
});

// GET ALL DATA
app.get("/attendance", (req, res) => {
    db.all("SELECT * FROM attendance", (err, rows) => {
        res.json(rows);
    });
});


// ✅ EXPORT TO EXCEL (CSV)
app.get("/export", (req, res) => {

    db.all("SELECT * FROM attendance", (err, rows) => {

        let csv = "ID,Section,Time,Date\n";

        rows.forEach(row => {
            csv += `${row.id},${row.section},${row.time},${row.date}\n`;
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=attendance.csv");

        res.send(csv);
    });

});


// ✅ EXPORT TO WORD
app.get("/export-word", (req, res) => {

    db.all("SELECT * FROM attendance", (err, rows) => {

        let content = "ATTENDANCE LIST\n\n";

        rows.forEach(row => {
            content += `${row.id} - ${row.section} - ${row.time} - ${row.date}\n`;
        });

        res.setHeader("Content-Type", "application/msword");
        res.setHeader("Content-Disposition", "attachment; filename=attendance.doc");

        res.send(content);
    });

});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});

// RESET ATTENDANCE
app.post("/reset", (req, res)=>{
    db.run("DELETE FROM attendance", [], function(err){
        if(err) return res.status(500).send("Error resetting");
        res.send("Attendance reset!");
    });
});