function home() {
    window.location.href = './index.html';
}

function cheatSheet() {
    window.location.href = './cheatSheet.html';
}

function golferProfiles() {
    window.location.href = './profiles.html';
}

function uploadPage() {
    window.location.href = './upload.html';
}


function applyClassesBasedOnValue(element, numericValue, lowestCutoff, lowCutoff, mediumCutoff, highCutoff, higherCutoff, highestCutoff) {
    if (!isNaN(numericValue)) {
        if (numericValue < lowestCutoff) {
            element.addClass('lowest-value');
        } else if (numericValue >= lowestCutoff && numericValue <= lowCutoff) {
            element.addClass('lower-value');
        } else if (numericValue >= lowCutoff && numericValue <= mediumCutoff) {
            element.addClass('low-value');
        } else if (numericValue >= mediumCutoff && numericValue <= highCutoff) {
            element.addClass('medium-value');
        } else if (numericValue >= highCutoff && numericValue <= higherCutoff) {
            element.addClass('high-value');
        } else if (numericValue >= higherCutoff && numericValue <= highestCutoff) {
            element.addClass('higher-value');
        } else {
            element.addClass('highest-value');
        }
    }
}

let isCheatSheetInitialized = false;

let tournamentAbbreviations;
let recentTournaments;

function loadCheatSheet() {
    let lastNRounds = document.getElementById('lastNRounds');

    let url = '/get/cheatSheet/';

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) => {
        console.log(jsonData);

        // Check if there are no results or missing properties
        if (!jsonData.salaries || !jsonData.pgatour || !jsonData.courseHistory || !jsonData.tournamentRow) {
            console.log('Invalid data format. Expected "salaries", "pgatour", "courseHistory", and "tournamentRow" properties.');
            return;
        }

        // Extract data for DataTable
        let dataTableData = jsonData.salaries.map((salary) => {
            let player = salary.player;
            let fdSalary = salary.fdSalary;
            let dkSalary = salary.dkSalary;

            // Find matching player in pgatour
            let pgatourData = jsonData.pgatour.find((pgatour) => pgatour.player === player);

            // Find matching player in courseHistory
            let courseHistoryData = jsonData.courseHistory.find((courseHistory) => courseHistory.player === player);

            // Default all components of courseHistory to null if player is not found
            if (!courseHistoryData) {
                const courseHistoryKeys = ['minus1', 'minus2', 'minus3', 'minus4', 'minus5']; // Add other keys as needed
                courseHistoryData = Object.fromEntries(courseHistoryKeys.map(key => [key, null]));
            }

            // Find all rounds for the player in tournamentRow, order by 'dates' and 'Round' in descending order
            let playerRounds = jsonData.tournamentRow.filter((round) => round.player === player)
                .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
                .slice(0, lastNRounds.value); // Grab at most the specified number of rounds

            // Calculate the average of specific columns for the player's rounds
            let avgRoundData = {};
            if (playerRounds.length > 0) {
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    let averageValue = playerRounds.reduce((sum, round) => sum + round[col], 0) / playerRounds.length;
                    avgRoundData[col] = Number(averageValue.toFixed(2));
                });
            } else {
                // Set default values to null if no rounds
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    avgRoundData[col] = null;
                });
            }

            // Step 1: Sort tournamentRow Data in descending order by 'dates'
            let sortedTournamentRow = jsonData.tournamentRow.sort((a, b) => new Date(b.dates) - new Date(a.dates));

            // Step 2: Identify the 10 most recent tournaments
            recentTournaments = Array.from(new Set(sortedTournamentRow.map(entry => entry.tournament))).slice(0, 10);

            // Step 3: Create Abbreviations for Tournament Names
            tournamentAbbreviations = recentTournaments.reduce((abbreviations, tournament, index) => {
                // Split the tournament name into words
                const words = tournament.split(' ');
            
                // Take the first 3 letters of the first word
                let abbreviation = words[0].substring(0, 3);
            
                // Add the first letter of the remaining words, up to a total of 5 letters
                abbreviation += words.slice(1).map(word => word[0]).join('').substring(0, 2);
            
                abbreviations[`recent${index + 1}`] = abbreviation.toUpperCase(); // Adjust the abbreviation logic as needed
            
                return abbreviations;
            }, {});

            // Ensure tournamentAbbreviations is of length 10
            for (let index = 1; Object.keys(tournamentAbbreviations).length < 10; index++) {
                let defaultAbbreviation = `Default${index}`;
                let currentKey = `recent${index}`;

                // Add default names only if the key doesn't already exist
                if (!tournamentAbbreviations[currentKey]) {
                    tournamentAbbreviations[currentKey] = defaultAbbreviation;
                }
            }

            // Step 4: Compile Recent History Data for Each Player
            let recentHistory = recentTournaments.map(tournament => {
                let entry = sortedTournamentRow.find(entry => entry.player === player && entry.tournament === tournament);
                return entry ? entry.finish : null;
            });

            // Ensure recentHistory has 10 entries
            while (recentHistory.length < 10) {
                recentHistory.push(null);
            }

            // Step 5: Generate Finish Data for Recent Tournaments with Abbreviations
            let recentFinishData = recentTournaments.reduce((finishData, tournament, index) => {
                let entry = sortedTournamentRow.find(entry => entry.player === player && entry.tournament === tournament);
                let abbreviation = tournamentAbbreviations[`recent${index + 1}`]; // Get the abbreviation for the current tournament
                finishData[abbreviation] = entry ? entry.finish : null; // Use abbreviation as column name

                // Set null if the player has no data for the current tournament
                if (!entry) {
                    recentHistory[index] = null;
                }

                return finishData;
            }, {});

            // Check if player exists in pgatour
            if (pgatourData) {
                // Hard code the fields for pgatourData (excluding those with 'Rank' and 'player')
                let filteredPgatourData = {
                    sgPuttPGA: Number(pgatourData.sgPutt.toFixed(2)),
                    sgArgPGA: Number(pgatourData.sgArg.toFixed(2)),
                    sgAppPGA: Number(pgatourData.sgApp.toFixed(2)),
                    sgOttPGA: Number(pgatourData.sgOtt.toFixed(2)),
                    sgT2GPGA: Number(pgatourData.sgT2G.toFixed(2)),
                    sgTotPGA: Number(pgatourData.sgTot.toFixed(2)),
                    drDist: Number(pgatourData.drDist.toFixed(2)),
                    drAcc: Number(pgatourData.drAcc.toFixed(2)),
                    gir: Number(pgatourData.gir.toFixed(2)),
                    sandSave: Number(pgatourData.sandSave.toFixed(2)),
                    scrambling: Number(pgatourData.scrambling.toFixed(2)),
                    app50_75: Number(pgatourData.app50_75.toFixed(2)),
                    app75_100: Number(pgatourData.app75_100.toFixed(2)),
                    app100_125: Number(pgatourData.app100_125.toFixed(2)),
                    app125_150: Number(pgatourData.app125_150.toFixed(2)),
                    app150_175: Number(pgatourData.app150_175.toFixed(2)),
                    app175_200: Number(pgatourData.app175_200.toFixed(2)),
                    app200_up: Number(pgatourData.app200_up.toFixed(2)),
                    bob: Number(pgatourData.bob.toFixed(2)),
                    bogAvd: Number(pgatourData.bogAvd.toFixed(2)),
                    par3Scoring: Number(pgatourData.par3Scoring.toFixed(2)),
                    par4Scoring: Number(pgatourData.par4Scoring.toFixed(2)),
                    par5Scoring: Number(pgatourData.par5Scoring.toFixed(2)),
                    prox: Number(pgatourData.prox.toFixed(2)),
                    roughProx: Number(pgatourData.roughProx.toFixed(2)),
                    puttingBob: Number(pgatourData.puttingBob.toFixed(2)),
                    threePuttAvd: Number(pgatourData.threePuttAvd.toFixed(2)),
                    bonusPutt: Number(pgatourData.bonusPutt.toFixed(2)),
                    // Add other fields as needed
                };

                // Combine data
                return {
                    player,
                    fdSalary,
                    dkSalary,
                    ...filteredPgatourData,
                    ...courseHistoryData, // Include course history data
                    ...avgRoundData, // Include average round data
                    ...recentHistory.reduce((result, finish, index) => {
                        result[`recent${index + 1}`] = finish;
                        return result;
                    }, {}),
                    ...recentFinishData, // Include finish data for recent tournaments
                    tournamentAbbreviations, // Include tournament abbreviations
                };
            } else {
                let filteredPgatourData = {
                    sgPuttPGA: null,
                    sgArgPGA: null,
                    sgAppPGA: null,
                    sgOttPGA: null,
                    sgT2GPGA: null,
                    sgTotPGA: null,
                    drDist: null,
                    drAcc: null,
                    gir: null,
                    sandSave: null,
                    scrambling: null,
                    app50_75: null,
                    app75_100: null,
                    app100_125: null,
                    app125_150: null,
                    app150_175: null,
                    app175_200: null,
                    app200_up: null,
                    bob: null,
                    bogAvd: null,
                    par3Scoring: null,
                    par4Scoring: null,
                    par5Scoring: null,
                    prox: null,
                    roughProx: null,
                    puttingBob: null,
                    threePuttAvd: null,
                    bonusPutt: null,
                    // Add other fields as needed
                };

                // Combine data
                return {
                    player,
                    fdSalary,
                    dkSalary,
                    ...filteredPgatourData,
                    ...courseHistoryData, // Include course history data
                    ...avgRoundData, // Include average round data
                    ...recentHistory.reduce((result, finish, index) => {
                        result[`recent${index + 1}`] = finish;
                        return result;
                    }, {}),
                    ...recentFinishData, // Include finish data for recent tournaments
                    tournamentAbbreviations, // Include tournament abbreviations
                };
            }
        }).filter(Boolean); // Remove null entries

        console.log(dataTableData);

        $(document).ready(function() {
            // Define DataTable columns
            let columns = [
                {data: 'player', title:'Player'},
                { data: 'fdSalary', title: 'FD Salary' },
                { data: 'dkSalary', title: 'DK Salary' },
                // Columns from tournamentRow
                { data: 'sgOtt', title: 'SG: Ott' },
                { data: 'sgApp', title: 'SG: App' },
                { data: 'sgArg', title: 'SG: Arg' },
                { data: 'sgPutt', title: 'SG: Putt' },
                { data: 'sgT2G', title: 'SG: T2G' },
                { data: 'sgTot', title: 'SG: Tot' },
                { data: 'sgPuttPGA', title: 'SG: Putt PGA' },
                { data: 'sgArgPGA', title: 'SG: Arg PGA' },
                { data: 'sgAppPGA', title: 'SG: App PGA' },
                { data: 'sgOttPGA', title: 'SG: Ott PGA' },
                { data: 'sgT2GPGA', title: 'SG: T2G PGA' },
                { data: 'sgTotPGA', title: 'SG: Tot PGA' },
                { data: 'drDist', title: 'Dr. Dist.' },
                { data: 'drAcc', title: 'Dr. Acc.' },
                { data: 'gir', title: 'GIR %' },
                { data: 'sandSave', title: 'Sand Save %' },
                { data: 'scrambling', title: 'Scrambling %' },
                { data: 'app50_75', title: 'App. 50-75' },
                { data: 'app75_100', title: 'App. 75-100' },
                { data: 'app100_125', title: 'App. 100-125' },
                { data: 'app125_150', title: 'App. 125-150' },
                { data: 'app150_175', title: 'App. 150-175' },
                { data: 'app175_200', title: 'App. 175-200' },
                { data: 'app200_up', title: 'App. 200+' },
                { data: 'bob', title: 'BoB %' },
                { data: 'bogAvd', title: 'Bogey Avg.' },
                { data: 'par3Scoring', title: 'Par 3s Avg' },
                { data: 'par4Scoring', title: 'Par 4s Avg' },
                { data: 'par5Scoring', title: 'Par 5s Avg' },
                { data: 'prox', title: 'Prox.' },
                { data: 'roughProx', title: 'Rough Prox.' },
                { data: 'puttingBob', title: 'Putt. BoB %' },
                { data: 'threePuttAvd', title: '3-Putt Avd.' },
                { data: 'bonusPutt', title: 'Bonus Putt' },
                // Add columns for recent history based on tournamentAbbreviations
                ...Object.keys(tournamentAbbreviations).map(abbreviation => ({
                    data: abbreviation,
                    title: tournamentAbbreviations[abbreviation]
                })),
                // Columns from courseHistory
                { data: 'minus1', title: '-1' },
                { data: 'minus2', title: '-2' },
                { data: 'minus3', title: '-3' },
                { data: 'minus4', title: '-4' },
                { data: 'minus5', title: '-5' },
                // Add other columns as needed
            ];

            let columnGroups = [
                { title: 'SG', columns: [3, 4, 5, 6, 7, 8] }, // Group SG columns
                { title: 'SG PGA', columns: [9, 10, 11, 12, 13, 14] }, // Group SG PGA columns
                { title: 'Recent History', columns: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46] }, // Group Recent History columns
                { title: 'Course History', columns: [47, 48, 49, 50, 51] }, // Group Recent History columns
            ]

            // Merge column groups into a single array
            let allColumns = [...columns];
            columnGroups.forEach(group => {
                allColumns.splice(group.columns[0], 0, { title: group.title, colspan: group.columns.length });
            });

            if (!isCheatSheetInitialized){
                // Initialize DataTable with the combined data and columns
                $('#cheatSheet').DataTable({
                    data: dataTableData,
                    columns: columns,
                    order: [[1, 'desc']],
                    dom: 'Bfrtip', // Add 'B' to enable the ColVis button
                    buttons: [
                        'pageLength',
                        'colvis', // Include the ColVis button
                    ],
                    columnDefs: [
                        { targets: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
                        42, 43, 44, 45, 46],
                            visible: false }, // Columns 3 to 8 initially hidden
                    ],
                    pageLength: 140,
                });

                isCheatSheetInitialized = true;
            } else {
                var table = $('#cheatSheet').DataTable();
                table.clear().rows.add(dataTableData).draw();
            }
        
            
        });
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}



let isDataTableInitialized = false;

function loadProfile(){
    let profileTbl = document.getElementById('profileTable');
    let currGolfer = document.getElementById('playerNameProf');
    let roundView = document.getElementById('selectRoundDrop');

    let url = '/get/golferProf/' + currGolfer.value + '/' + roundView.value; // Eventually change this to pass which golfer to get.

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) => {
        if (!isDataTableInitialized) {
            // DataTable not initialized, initialize it
            const columnsAndHeaders = [
                // Specify custom column keys and headers
                { data: 'dates', title: 'Date' },
                { data: 'finish', title: 'Finish' },
                { data: 'tournament', title: 'Tournament' },
                { data: 'Round', title: 'Round' },
                { data: 'sgPutt', title: 'SG: Putt', className: 'numeric-cell putt-cell' },
                { data: 'sgArg', title: 'SG: Arg', className: 'numeric-cell arg-cell' },
                { data: 'sgApp', title: 'SG: App', className: 'numeric-cell app-cell' },
                { data: 'sgOtt', title: 'SG: Ott', className: 'numeric-cell ott-cell' },
                { data: 'sgT2G', title: 'SG: T2G', className: 'numeric-cell t2g-cell' },
                { data: 'sgTot', title: 'SG: TOT', className: 'numeric-cell tot-cell' }
                // Add more columns as needed
            ];

            // Dynamically generate table header
            $('#myDataTable').DataTable({
                data: jsonData,
                columns: columnsAndHeaders,
                order: [[0, 'desc'], [3, 'desc']],
                pageLength: 30,
                createdRow: function (row, data, dataIndex) {
                    // Loop through specific numeric cells in the row
                    $(row).find('.putt-cell, .arg-cell, .app-cell, .ott-cell, .t2g-cell, .tot-cell').each(function (index) {
                        // Get the numeric value
                        var numericValue = parseFloat($(this).text());

                        applyClassesBasedOnValue($(this), numericValue, -3, -1.5, -0.5, 0.5, 1.5, 3);
                    });

                    $(row).find('.t2g-cell, .tot-cell').each(function (index) {
                        // Get the numeric value
                        var numericValue = parseFloat($(this).text());

                        applyClassesBasedOnValue($(this), numericValue, -7, -3, -1, 1, 3, 7);
                    });
                }
            });

            isDataTableInitialized = true; // Set the flag to indicate DataTable is now initialized
        } else {
            // DataTable already initialized, update the rows
            var table = $('#myDataTable').DataTable();
            table.clear().rows.add(jsonData).draw();
        }
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}


function loadProfOverview(){
    let profOvrTbl = document.getElementById("overallStatsProfile");
    let currGolfer = document.getElementById('playerNameProf');
    let lastNumRounds = 4;

    let url = "/get/profOverview/";

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) => {

        jsonData.sort((a, b) => {
            const dateA = new Date(a.dates);
            const dateB = new Date(b.dates);

            if (dateA - dateB === 0) {
                return b.Round - a.Round;
            }

            return dateB - dateA;
        });

        // Step 1: Group by player and calculate averages for each stat
        const playerStats = {};
        jsonData.forEach((data) => {
            const player = data.player;

            if (!playerStats[player]) {
                playerStats[player] = {
                count: 1,
                sgPutt: data.sgPutt,
                sgArg: data.sgArg,
                sgApp: data.sgApp,
                sgOtt: data.sgOtt,
                sgT2G: data.sgT2G,
                drDist: data.drDist,
                drAcc: data.drAcc,
                gir: data.gir,
                sandSaves: data.sandSaves,
                scrambling: data.scrambling,
                // add more stats here
                };
            } else {
                playerStats[player].count += 1;
                playerStats[player].sgPutt += data.sgPutt;
                playerStats[player].sgArg += data.sgArg;
                playerStats[player].sgApp += data.sgApp;
                playerStats[player].sgOtt += data.sgOtt;
                playerStats[player].sgT2G += data.sgT2G;
                playerStats[player].drDist += data.drDist;
                playerStats[player].drAcc += data.drAcc;
                playerStats[player].gir += data.gir;
                playerStats[player].sandSaves += data.sandSaves;
                playerStats[player].scrambling += data.scrambling;
                // update more stats here
            }
        });

        for (const player in playerStats) {
            if (playerStats[player].count < lastNumRounds){
                delete playerStats[player];
            } else {
                const count = playerStats[player].count;
                playerStats[player].sgPutt /= count;
                playerStats[player].sgArg /= count;
                playerStats[player].sgApp /= count;
                playerStats[player].sgOtt /= count;
                playerStats[player].sgT2G /= count;
                playerStats[player].drDist /= count;
                playerStats[player].drAcc /= count;
                playerStats[player].gir /= count;
                playerStats[player].sandSaves /= count;
                playerStats[player].scrambling /= count;
                // update more stats here
            }
        }

        // Step 2: Calculate ranks for each stat
        const stats = ['sgPutt', 'sgArg', 'sgApp', 'sgOtt', 'sgT2G', 'drDist', 'drAcc', 'gir', 'sandSaves', 'scrambling']; // add more stats here
        const averagesObject = {};

        // Helper function to calculate ranks for a specific stat
        function calculateStatRank(stat, averagesObject) {
            const statAverages = [];

            // Collect averages for the specified stat from all players
            for (const currentPlayer in averagesObject) {
                if (averagesObject.hasOwnProperty(currentPlayer)) {
                statAverages.push({ player: currentPlayer, value: averagesObject[currentPlayer][stat] });
                }
            }

            // Sort averages in descending order
            statAverages.sort((a, b) => b.value - a.value);

            // Assign ranks based on the sorted order
            const ranks = {};
            statAverages.forEach((entry, index) => {
                ranks[entry.player] = index + 1;
            });

            return ranks;
        }

        // Calculate ranks for each stat
        for (const stat of stats) {
            const ranks = calculateStatRank(stat, playerStats);
            for (const player in ranks) {
                playerStats[player][`${stat}Rank`] = ranks[player];
            }
        }

        console.log(playerStats);

        // Get Current Golfer Data
        let currData = playerStats[currGolfer.value];
        console.log(currData);
        let sgPutt = parseFloat(currData['sgPutt']).toFixed(2);
        let sgPuttRank = parseInt(currData['sgPuttRank']);

        let sgArg = parseFloat(currData['sgArg']).toFixed(2);
        let sgArgRank = parseInt(currData['sgArgRank']);

        let sgApp = parseFloat(currData['sgApp']).toFixed(2);
        let sgAppRank = parseInt(currData['sgAppRank']);

        let sgOtt = parseFloat(currData['sgOtt']).toFixed(2);
        let sgOttRank = parseInt(currData['sgOttRank']);

        let sgT2G = parseFloat(currData['sgT2G']).toFixed(2);
        let sgT2GRank = parseInt(currData['sgT2GRank']);

        let drDist = parseFloat(currData['drDist']).toFixed(2);
        let drDistRank = parseInt(currData['drDistRank']);

        let drAcc = parseFloat(currData['drAcc']).toFixed(2);
        let drAccRank = parseInt(currData['drAccRank']);

        let gir = parseFloat(currData['gir']).toFixed(2);
        let girRank = parseInt(currData['girRank']);

        let sandSaves = parseFloat(currData['sandSaves']).toFixed(2);
        let sandSavesRank = parseInt(currData['sandSavesRank']);

        let scrambling = parseFloat(currData['scrambling']).toFixed(2);
        let scramblingRank = parseInt(currData['scramblingRank']);

        //let tableString = '<table>';
        let tableString = '<tr><th>Stat</th><th>Value</th><th>Rank</th></tr>';

        // Add rows for each stat
        let statsDict = [
            { name: 'SG: Putt', value: sgPutt, rank: sgPuttRank },
            { name: 'SG: Arg', value: sgArg, rank: sgArgRank },
            { name: 'SG: App', value: sgApp, rank: sgAppRank },
            { name: 'SG: Ott', value: sgOtt, rank: sgOttRank },
            { name: 'SG: T2G', value: sgT2G, rank: sgT2GRank },
            { name: 'Dr. Dist', value: drDist, rank: drDistRank },
            { name: 'Dr. Acc', value: drAcc, rank: drAccRank },
            { name: 'GIR%', value: gir, rank: girRank },
            { name: 'Sand Save %', value: sandSaves, rank: sandSavesRank },
            { name: 'Scrambling %', value: scrambling, rank: scramblingRank }
        ];

        for (let stat of statsDict) {
            tableString += `<tr><td>${stat.name}</td><td>${stat.value}</td><td>${stat.rank}</td></tr>`;
        }

        //tableString += '</table>';

        profOvrTbl.innerHTML = tableString;
    })
}
