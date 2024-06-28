// comment
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const xlsx = require('xlsx');
const port = 80;
const app = express();

app.use(express.json());
app.use(cookieParser());

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/data_caddy';
mongoose.connect(mongoDBURL, {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

// Converts names from ___ to fanduel format
const TO_FD = {
  'Robert MacIntyre': 'Robert Macintyre',
  'Nicolai Højgaard': 'Nicolai Hojgaard',
  'S.H. Kim': 'Seonghyeon Kim'
};

const FD_TO_PGA = {
  'Robert Macintyre': 'Robert MacIntyre',
  'Nicolai Højgaard': 'Nicolai Højgaard',
  'Seonghyeon Kim': 'S.H. Kim'
};

const FD_TO_TOURNAMENT = {
  'Robert Macintyre': 'Robert MacIntyre',
  'Seonghyeon Kim': 'S.H. Kim',
  'Nicolai Højgaard': 'Nicolai Hojgaard'
};

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

var salariesSchema = mongoose.Schema({
    player: String,
    fdSalary: Number,
    dkSalary: Number
})
var salaries = mongoose.model('salaries', salariesSchema);

var pgatourSchema = mongoose.Schema({
    player: String,
    sgPutt: Number,
    sgPuttRank: Number,
    sgArg: Number,
    sgArgRank: Number,
    sgApp: Number,
    sgAppRank: Number,
    sgOtt: Number,
    sgOttRank: Number,
    sgT2G: Number,
    sgT2GRank: Number,
    sgTot: Number,
    sgTotRank: Number,
    drDist: Number,
    drDistRank: Number,
    drAcc: Number,
    drAccRank:Number,
    gir: Number,
    girRank: Number,
    sandSave: Number,
    sandSaveRank: Number,
    scrambling: Number,
    scramblingRank: Number,
    app50_75: Number,
    app50_75Rank: Number,
    app75_100: Number,
    app75_100Rank: Number,
    app100_125: Number,
    app100_125Rank: Number,
    app125_150: Number,
    app125_150Rank: Number,
    app150_175: Number,
    app150_175Rank: Number,
    app175_200: Number,
    app175_200Rank: Number,
    app200_up: Number,
    app200_upRank: Number,
    bob: Number,
    bobRank: Number,
    bogAvd: Number,
    bogAvdRank: Number,
    par3Scoring: Number,
    par3ScoringRank: Number,
    par4Scoring: Number,
    par4ScoringRank: Number,
    par5Scoring: Number,
    par5ScoringRank: Number,
    prox: Number,
    proxRank: Number,
    roughProx: Number,
    roughProxRank: Number,
    puttingBob: Number,
    puttingBobRank: Number,
    threePuttAvd: Number,
    threePuttAvdRank: Number,
    bonusPutt: Number,
    bonusPuttRank: Number,
});

var pgatour = mongoose.model('pgatour', pgatourSchema);

var courseHistorySchema = mongoose.Schema({
    player: String,
    minus1: Number,
    minus2: Number,
    minus3: Number,
    minus4: Number,
    minus5: Number
});

var courseHistory = mongoose.model('courseHistory', courseHistorySchema);

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

app.post('/uploadSalaries', upload.single('file'), async (req, res) => {
    try {
      // Clear existing entries
      await salaries.deleteMany({});
  
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
  
      for (const row of data) {
        const player = row.player;
        const fdSalary = row.fdSalary;
        const dkSalary = row.dkSalary;
  
        await salaries.create({ player, fdSalary, dkSalary });
      }
  
      res.status(200).send('File uploaded successfully.');
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.post('/uploadPgaStats', upload.single('file'), async (req, res) => {
    try {
      // Clear existing entries
      await pgatour.deleteMany({});
  
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
  
      for (const row of data) {
        const player = row.player;
        const sgPutt = row.sgPutt;
        const sgPuttRank = row.sgPuttRank;
        const sgArg = row.sgArg;
        const sgArgRank = row.sgArgRank;
        const sgApp = row.sgApp;
        const sgAppRank = row.sgAppRank;
        const sgOtt = row.sgOtt;
        const sgOttRank = row.sgOttRank;
        const sgT2G = row.sgT2G;
        const sgT2GRank = row.sgT2GRank;
        const sgTot = row.sgTot;
        const sgTotRank = row.sgTotRank;
        const drDist = row.drDist;
        const drDistRank = row.drDistRank;
        const drAcc = row.drAcc;
        const drAccRank = row.drAccRank;
        const gir = row.gir;
        const girRank = row.girRank;
        const sandSave = row.sandSave;
        const sandSaveRank = row.sandSaveRank;
        const scrambling = row.scrambling;
        const scramblingRank = row.scramblingRank;
        const app50_75 = row.app50_75;
        const app50_75Rank = row.app50_75Rank;
        const app75_100 = row.app75_100;
        const app75_100Rank = row.app75_100Rank;
        const app100_125 = row.app100_125;
        const app100_125Rank = row.app100_125Rank;
        const app125_150 = row.app125_150;
        const app125_150Rank = row.app125_150Rank;
        const app150_175 = row.app150_175;
        const app150_175Rank = row.app150_175Rank;
        const app175_200 = row.app175_200;
        const app175_200Rank = row.app175_200Rank;
        const app200_up = row.app200_up;
        const app200_upRank = row.app200_upRank;
        const bob = row.bob;
        const bobRank = row.bobRank;
        const bogAvd = row.bogAvd;
        const bogAvdRank = row.bogAvdRank;
        const par3Scoring = row.par3Scoring;
        const par3ScoringRank = row.par3ScoringRank;
        const par4Scoring = row.par4Scoring;
        const par4ScoringRank = row.par4ScoringRank;
        const par5Scoring = row.par5Scoring;
        const par5ScoringRank = row.par5ScoringRank;
        const prox = row.prox;
        const proxRank = row.proxRank;
        const roughProx = row.roughProx;
        const roughProxRank = row.roughProxRank;
        const puttingBob = row.puttingBob;
        const puttingBobRank = row.puttingBobRank;
        const threePuttAvd = row.threePuttAvd;
        const threePuttAvdRank = row.threePuttAvdRank;
        const bonusPutt = row.bonusPutt;
        const bonusPuttRank = row.bonusPuttRank;
  
        await pgatour.create({
          player, sgPutt, sgPuttRank, sgArg, sgArgRank,
          sgApp, sgAppRank, sgOtt, sgOttRank, sgT2G, sgT2GRank,
          sgTot, sgTotRank, drDist, drDistRank, drAcc, drAccRank,
          gir, girRank, sandSave, sandSaveRank, scrambling, scramblingRank,
          app50_75, app50_75Rank, app75_100, app75_100Rank, app100_125, app100_125Rank,
          app125_150, app125_150Rank, app150_175, app150_175Rank, app175_200, app175_200Rank,
          app200_up, app200_upRank, bob, bobRank, bogAvd, bogAvdRank,
          par3Scoring, par3ScoringRank, par4Scoring, par4ScoringRank, par5Scoring, par5ScoringRank,
          prox, proxRank, roughProx, roughProxRank, puttingBob, puttingBobRank,
          threePuttAvd, threePuttAvdRank, bonusPutt, bonusPuttRank
        });
      }
  
      res.status(200).send('File uploaded successfully.');
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).send('Internal Server Error');
    }
});

app.post('/uploadCourseHistory', upload.single('file'), async (req, res) => {
    try {
      // Clear existing entries
      await courseHistory.deleteMany({});
  
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Include headers
  
      // Get the headers from the first row of the sheet
      const headers = data[0];
  
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const entry = { player: row[0] }; // The first column is always 'player'
  
        // Map each header (excluding the first one) to the corresponding field in the MongoDB schema
        for (let j = 1; j < headers.length; j++) {
          const header = headers[j];
          const field = `minus${j}`; // Construct field name like "minus1", "minus2", etc.
  
          // Set the entry's field using the header and value from the row
          entry[field] = row[j];
        }
  
        // Create the course history entry in MongoDB
        await courseHistory.create(entry);
      }
  
      res.status(200).send('File uploaded successfully.');
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).send('Internal Server Error');
    }
  });

app.get('/get/golferProf/:PLAYER/:ROUND', (req, res) => {

    let playerName = FD_TO_TOURNAMENT[req.params.PLAYER] || req.params.PLAYER;
    let playerName2 = req.params.PLAYER;
    let roundView = req.params.ROUND;

    let p;

    if (roundView == 'event'){
        p = TournamentRow.find({$or: [{'player': playerName}, {'player': playerName2}], 'Round': 'Event'}).exec();
    } else if (roundView == 'all'){
        p = TournamentRow.find({$or: [{'player': playerName}, {'player': playerName2}]}).exec();
    } else {
        p = TournamentRow.find({$or: [{'player': playerName}, {'player': playerName2}], 'Round': { $ne: 'Event' } }).exec();
    }

    p.then((document) => {
        res.json(document);
    })
    .catch((error) => {
        res.send('there was an error');
    });
});

app.get('/get/profOverview/', (req, res) => {
    let p = TournamentRow.find({ 'Round': { $ne: 'Event' } }).exec();

    p.then((document) => {
        res.json(document);
    })
    .catch((error) => {
        res.send('There was an error');
    })
});

app.get('/get/playerListGp/', (req, res) => {
  let p = salaries.find({}).exec();

  p.then((document) => {
    res.json(document);
  })
  .catch((error) => {
      res.send('There was an error');
  })
});

app.get('/get/profOverview/:PLAYER', async (req, res) => {

  let currPlayerTournament = FD_TO_TOURNAMENT[req.params.PLAYER] || req.params.PLAYER;
  let currPlayerPga = FD_TO_PGA[req.params.PLAYER] || req.params.PLAYER;

  const tournamentRowResults = await TournamentRow.find({'player': currPlayerTournament, 'Round': { $ne: 'Event' }});

  tournamentRowResults.forEach(result => {
    if (TO_FD[result.player]) {
      result.player = TO_FD[result.player];
    }
  });

  const pgatourResults = await pgatour.find({player: currPlayerPga});

  pgatourResults.forEach(result => {
    if (TO_FD[result.player]) {
      result.player = TO_FD[result.player];
    }
  });

  const combinedResults = {
    tournaments: tournamentRowResults,
    pgatour: pgatourResults
  }

  res.json(combinedResults);
});

app.get('/get/trendsSheet/', async (req, res) => {
  try {
    // Perform salariesResults query first
    const salariesResults = await salaries.find({});

    if (salariesResults.length === 0) {
      // No player found in salariesResults, return empty result
      res.json([]);
      return;
    }

    // Bring in names from salaries in lower case
    const playerNames = salariesResults.map(result => result.player);

    // Convert player names to what is seen in tournament files
    const convertedPlayerNames = playerNames.map(name => FD_TO_TOURNAMENT[name] || name);

    // Perform subsequent queries using the filtered player names
    const tournamentRowResults = await TournamentRow.find({ player: { $in: convertedPlayerNames }, 'Round': { $ne: 'Event' } });

    // Convert player names in pgatourResults to the appropriate conversion if they are in NAME_CONV, otherwise keep them as is
    tournamentRowResults.forEach(result => {
      if (TO_FD[result.player]) {
        result.player = TO_FD[result.player];
      }
    });

    // Combine the results into a single JSON object
    const combinedResults = {
      salaries: salariesResults,
      tournamentRow: tournamentRowResults,
    };

    // Send the combined results as JSON
    res.json(combinedResults);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/get/flagSheet/', async (req, res) => {
  try {
    // Perform salariesResults query first
    const salariesResults = await salaries.find({});

    if (salariesResults.length === 0) {
      // No player found in salariesResults, return empty result
      res.json([]);
      return;
    }

    // Extract player names from salariesResults
    const playerNames = salariesResults.map(result => result.player);

    // Create a new player names list with converted names to pgaTour
    const convertedPlayerNames = playerNames.map(name => FD_TO_PGA[name] || name);

    // Perform subsequent queries using the filtered player names
    const pgatourResults = await pgatour.find({ player: { $in: convertedPlayerNames } });

    // Convert player names in pgatourResults to the appropriate conversion if they are in NAME_CONV, otherwise keep them as is
    pgatourResults.forEach(result => {
      if (TO_FD[result.player]) {
        result.player = TO_FD[result.player];
      }
    });

    // Combine the results into a single JSON object
    const combinedResults = {
      salaries: salariesResults,
      pgatour: pgatourResults,
    };

    // Send the combined results as JSON
    res.json(combinedResults);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/get/modelSheet/', async (req, res) => {
  try {
    // Perform salariesResults query first
    const salariesResults = await salaries.find({});

    if (salariesResults.length === 0) {
      // No player found in salariesResults, return empty result
      res.json([]);
      return;
    }

    // Extract player names from salariesResults
    const playerNames = salariesResults.map(result => result.player);

    const convertedPlayerNamesPga = playerNames.map(name => FD_TO_PGA[name] || name);

    const convertedPlayerNamesTournament = playerNames.map(name => FD_TO_TOURNAMENT[name] || name);


    // Perform subsequent queries using the filtered player names
    const tournamentRowResults = await TournamentRow.find({ player: { $in: convertedPlayerNamesTournament }, 'Round': { $ne: 'Event' } });
    const pgatourResults = await pgatour.find({ player: { $in: convertedPlayerNamesPga } });
    const courseHistoryResults = await courseHistory.find({ player: { $in: playerNames } });

    tournamentRowResults.forEach(result => {
      if (TO_FD[result.player]) {
        result.player = TO_FD[result.player];
      }
    });

    pgatourResults.forEach(result => {
      if (TO_FD[result.player]) {
        result.player = TO_FD[result.player];
      }
    });

    courseHistoryResults.forEach(result => {
      if (TO_FD[result.player]) {
        result.player = TO_FD[result.player];
      }
    });


    // Combine the results into a single JSON object
    const combinedResults = {
      salaries: salariesResults,
      tournamentRow: tournamentRowResults,
      pgatour: pgatourResults,
      courseHistory: courseHistoryResults,
    };

    // Send the combined results as JSON
    res.json(combinedResults);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/get/cheatSheet/', async (req, res) => {
    try {
      // Perform salariesResults query first
      const salariesResults = await salaries.find({});
  
      if (salariesResults.length === 0) {
        // No player found in salariesResults, return empty result
        res.json([]);
        return;
      }
  
      // Extract player names from salariesResults
      const playerNames = salariesResults.map(result => result.player);

      const convertedPlayerNamesPga = playerNames.map(name => FD_TO_PGA[name] || name);

      const convertedPlayerNamesTournament = playerNames.map(name => FD_TO_TOURNAMENT[name] || name);

  
      // Perform subsequent queries using the filtered player names
      const tournamentRowResults = await TournamentRow.find({ player: { $in: convertedPlayerNamesTournament }, 'Round': { $ne: 'Event' } });

      tournamentRowResults.forEach(result => {
        if (TO_FD[result.player]) {
          result.player = TO_FD[result.player];
        }
      });

      const pgatourResults = await pgatour.find({ player: { $in: convertedPlayerNamesPga } });

      pgatourResults.forEach(result => {
        if (TO_FD[result.player]) {
          result.player = TO_FD[result.player];
        }
      });

      const courseHistoryResults = await courseHistory.find({ player: { $in: playerNames } });

      courseHistoryResults.forEach(result => {
        if (TO_FD[result.player]) {
          result.player = TO_FD[result.player];
        }
      });
  
      // Combine the results into a single JSON object
      const combinedResults = {
        salaries: salariesResults,
        tournamentRow: tournamentRowResults,
        pgatour: pgatourResults,
        courseHistory: courseHistoryResults,
      };
  
      // Send the combined results as JSON
      res.json(combinedResults);
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(port, () =>
console.log(
    `Example app listening at http://127.0.0.1:${port}` // Change this ip address
));