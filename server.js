const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const xlsx = require('xlsx');
const port = 80;
const app = express()
app.use(express.json());
app.use(cookieParser());

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/data_caddy';
mongoose.connect(mongoDBURL, {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

var TournamentRowSchema = mongoose.Schema({
    player: String,
    finish: Number,
    tournament: String,
    course: String,
    dates: String,
    Round: String,
    sgOtt: Number,
    sgApp: Number,
    sgArg: Number,
    sgPutt: Number,
    sgT2G: Number,
    sgTot: Number,
    drAcc: Number,
    drDist: Number,
    longDr: Number,
    gir: Number,
    sandSaves: Number,
    scrambling: Number,
    puttsPerGir: Number,
    totPutts: Number,
    eagles: Number,
    birdies: Number,
    pars: Number,
    bogeys: Number,
    doubleBogeys: Number,
    other: Number
});

var TournamentRow = mongoose.model('TournamentRow', TournamentRowSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public_html'));

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON array
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        // Remove header row if it exists
        if (data.length > 0 && Array.isArray(data[0])) {
            data.shift();
        }

        // Map Excel columns to schema fields and insert rows into the database using promises
        const mappedData = data.map(row => ({
            player: row[0],
            finish: row[1],
            tournament: row[2],
            course: row[3],
            dates: row[4],
            Round: row[5],
            sgOtt: row[6],
            sgApp: row[7],
            sgArg: row[8],
            sgPutt: row[9],
            sgT2G: row[10],
            sgTot: row[11],
            drAcc: row[12],
            drDist: row[13],
            longDr: row[14],
            gir: row[15],
            sandSaves: row[16],
            scrambling: row[17],
            puttsPerGir: row[18],
            totPutts: row[19],
            eagles: row[20],
            birdies: row[21],
            pars: row[22],
            bogeys: row[23],
            doubleBogeys: row[24],
            other: row[25]
        }));

        await TournamentRow.insertMany(mappedData);

        console.log('Data inserted successfully.');
        res.send('File uploaded and data inserted successfully.');
    } catch (error) {
        console.error(error);
        res.send('Internal Server Error');
    }
});

app.get('/get/golferProf/:PLAYER', (req, res) => {

    let playerName = req.params.PLAYER;

    let p = TournamentRow.find({'player':playerName}).exec();

    p.then((document) => {
        res.json(document);
    })
    .catch((error) => {
        res.send('there was an error');
    });
});

app.listen(port, () =>
console.log(
    `Example app listening at http://127.0.0.1:${port}` // Change this ip address
));