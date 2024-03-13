//const { isNull } = require("lodash");

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

function trends() {
    window.location.href = './trends.html';
}

function flagPage() {
    window.location.href = './redflag.html';
}

function modelPage() {
    window.location.href = './customModel.html';
}

function optimizerSettings() {
    window.location.href = './optimizerSettings.html';
}

function logSavedData() {
    const savedDataJSON = localStorage.getItem('modelData');
    let inModelData = savedDataJSON ? JSON.parse(savedDataJSON) : [];
    console.log('in model data: ', inModelData);
    let chosenPlayers1 = localStorage.getItem('chosenPlayers');
    let excludedPlayers1 = localStorage.getItem('excludedPlayers');
    if(chosenPlayers1 == null || excludedPlayers1 == null){
        localStorage.setItem('selectedModelData', savedDataJSON);
        console.log('set savedModelData to full set - chosen/excluded was null');
    }else if (JSON.parse(chosenPlayers1).length == 0 && JSON.parse(excludedPlayers1).length == 0){
        localStorage.setItem('selectedModelData', savedDataJSON);
        console.log('set savedModelData to full set');
    } else {
        console.log('had some excluded or chosen players already...');
    }

    // Dynamically populate the "Choose Players" dropdown with player names
    var selectDropdown = document.getElementById('choosePlayerBox');
    var htmlString = "";

    inModelData.forEach(function(data) {
        var playerName = data.player;
        var option = document.createElement('option');
        option.text = playerName;
        option.value = playerName;
        selectDropdown.add(option);
    });

    // Dynamically populate the "Exclude Players" dropdown with player names
    var excludeDropdown = document.getElementById('excludePlayerBox');
    inModelData.forEach(function(data) {
        var playerName = data.player;
        var option = document.createElement('option');
        option.text = playerName;
        option.value = playerName;
        excludeDropdown.add(option);
    });

    // Trigger Chosen update after adding options to both dropdowns
    $(selectDropdown).trigger('chosen:updated');
    $(excludeDropdown).trigger('chosen:updated');

    // Check for selected data in local storage
    const selectedModelDataJSON = localStorage.getItem('chosenPlayers');
    if (selectedModelDataJSON) {
        var selectedModelData = JSON.parse(selectedModelDataJSON);

        // Iterate through the options and select excluded players in "Exclude Players" dropdown
        for (var i = 0; i < selectDropdown.options.length; i++) {
            var playerName = selectDropdown.options[i].value;
            if (selectedModelData.includes(playerName)) {
                selectDropdown.options[i].selected = true;
            }
        }

        // Trigger Chosen update after updating selected options for "Choose Players" dropdown
        $(selectDropdown).trigger('chosen:updated');
    }

    // Check for excluded players in local storage
    const excludedPlayersJSON = localStorage.getItem('excludedPlayers');
    if (excludedPlayersJSON) {
        var excludedPlayers = JSON.parse(excludedPlayersJSON);

        // Iterate through the options and select excluded players in "Exclude Players" dropdown
        for (var i = 0; i < excludeDropdown.options.length; i++) {
            var playerName = excludeDropdown.options[i].value;
            if (excludedPlayers.includes(playerName)) {
                excludeDropdown.options[i].selected = true;
            }
        }
        $(excludeDropdown).trigger('chosen:updated');
    }
    

    // Initialize the Chosen plugin for "Choose Players"
    $(selectDropdown).chosen();

    // Initialize the Chosen plugin for "Exclude Players"
    $(excludeDropdown).chosen();

    // Add event listener for Chosen's 'change' event on "Choose Players" dropdown
    $(selectDropdown).on('change', function() {
        updateSelectedData(inModelData, savedDataJSON);
    });

    // Add event listener for Chosen's 'change' event on "Exclude Players" dropdown
    $(excludeDropdown).on('change', function() {
        updateSelectedData(inModelData, savedDataJSON);
    });
}

function updateSelectedData(inModelData, savedDataJSON) {
    console.log('update selected data called');
    var selectDropdown = document.getElementById('choosePlayerBox');
    var excludeDropdown = document.getElementById('excludePlayerBox');

    // Get selected players from "Choose Players" dropdown
    var selectedPlayers = Array.from(selectDropdown.selectedOptions).map(option => option.value);

    // Get excluded players from "Exclude Players" dropdown
    var excludedPlayers = Array.from(excludeDropdown.selectedOptions).map(option => option.value);

    // Exclude players selected in both "Choose Players" and "Exclude Players"
    excludedPlayers.forEach(function(player) {
        var index = selectedPlayers.indexOf(player);
        if (index !== -1) {
            selectedPlayers.splice(index, 1);
        }
    });

    localStorage.setItem('excludedPlayers', JSON.stringify(excludedPlayers));
    localStorage.setItem('chosenPlayers', JSON.stringify(selectedPlayers));

    // Check if any players are selected in "Choose Players" or "Exclude Players"
    if (selectedPlayers.length > 0 || excludedPlayers.length > 0) {
        var selectedData;

        // If players are selected in "Choose Players," filter modelData based on selected players
        if (selectedPlayers.length > 0) {
            selectedData = inModelData.filter(data => selectedPlayers.includes(data.player));
        } else {
            // If no players are selected in "Choose Players," include all players other than those selected in "Exclude Players"
            selectedData = inModelData.filter(data => !excludedPlayers.includes(data.player));
        }

        // Save excluded players to local storage

        localStorage.setItem('selectedModelData', JSON.stringify(selectedData));
        console.log('Selected model data: ', selectedData);
    } else {
        console.log('No players selected. Using all saved model data.');
        localStorage.setItem('selectedModelData', savedDataJSON);
        console.log('All saved model data: ', inModelData);
    }
}


function goOptimizerResults() {
    let numLineups = document.getElementById('numLineups').value;

    localStorage.setItem('numLineups', numLineups);

    window.location.href = './optimizerResults.html';
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
let gridApi;

function loadCheatSheet() {
    let lastNRounds = document.getElementById('lastNRounds');

    let url = '/get/cheatSheet/';

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) => {
        console.log(jsonData);

        // Ensure that all parts of the jsonData are there.
        if (!jsonData.salaries || !jsonData.pgatour || !jsonData.courseHistory || !jsonData.tournamentRow) {
            console.log('Invalid data format. Expected "salaries", "pgatour", "courseHistory", and "tournamentRow" properties.');
            return;
        }

        /*
            EXTRACT DATA FOR DATATABLE:

            - jsonData.salaries.map iterates over each element in salaries array.

            - for each element, provided function inside map is executed

            - (salary) is the individual row from salaries
        */
        let dataTableData = jsonData.salaries.map((salary) => {
            let player = salary.player;
            let fdSalary = salary.fdSalary;
            let dkSalary = salary.dkSalary;

            // SG: PGATOUR.COM
            // Find a matching player in pgatour
            let pgatourData = jsonData.pgatour.find((pgatour) => pgatour.player === player);

            // COURSE HISTORY
            // Find matching player in courseHistory
            let courseHistoryData = jsonData.courseHistory.find((courseHistory) => courseHistory.player === player);

            // If no player is found in course history, default all course history.
            if (!courseHistoryData) {
                const courseHistoryKeys = ['minus1', 'minus2', 'minus3', 'minus4', 'minus5'];
                courseHistoryData = Object.fromEntries(courseHistoryKeys.map(key => [key, null]));
            }

            // SG: LAST N ROUNDS
            // Find all rounds for player in tournamentRow, order by 'dates' and 'Round' in descending order
            let playerRounds = jsonData.tournamentRow.filter((round) => round.player === player)
                .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
                .slice(0, lastNRounds.value); // Grab at most the specified number of rounds

            // Calculate the average of specific columns for the player's rounds
            let avgRoundData = {};
            avgRoundData['numRounds'] = playerRounds.length;

            if (playerRounds.length > 0 ) { // can change to ensure minimum # rounds for calc
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    let averageValue = playerRounds.reduce((sum, round) => sum + round[col], 0) / playerRounds.length;
                    if( averageValue == null){
                        avgRoundData[col] = null;
                    } else{
                        avgRoundData[col] = Number(averageValue.toFixed(2));
                    }
                });
            } else { // Set values to null if no rounds are found
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    avgRoundData[col] = null;
                });
            }

            // RECENT HISTORY
            // Step 1: Sort tournamentRow Data in descending order by 'dates'
            let sortedTournamentRow = jsonData.tournamentRow.sort((a, b) => new Date(b.dates) - new Date(a.dates));

            // Step 2: Identify the 10 most recent tournaments
            recentTournaments = Array.from(new Set(sortedTournamentRow.map(entry => entry.tournament))).slice(0, 10);

            // Step 3: Create Abbreviations for Tournament Names
            tournamentAbbreviations = recentTournaments.reduce((abbreviations, tournament, index) => {
                // Split the tournament name into words
                let words = tournament.split(' ');

                if(words[0] == 'The'){
                    words = words.slice(1);
                }
            
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

            // Step 4: Compile Recent History Data for Player
            /*
                For each recent tournament, search thru sortedTournamentRow, find all entries where the entry has the
                current player and the tournament is the current tournament.

                If entry was found, return the finish from the entry, otherwise return null.
            */
            let recentHistory = recentTournaments.map(tournament => {
                let entry = sortedTournamentRow.find(entry => entry.player === player && entry.tournament === tournament);
                return entry ? entry.finish : null;
            });

            // If recentHistory does not have 10 entries, fill it with null.
            while (recentHistory.length < 10) {
                recentHistory.push(null);
            }

            /*
                Step 5: Generate Finish Data for Recent Tournaments with Abbreviations

                reduce iterates over each 'tournament' in recent tournaments

                'finishData' is what 'accumulates' or gains data over iteration

                'tournament' is the current element in the array

                'index' is the current index in the array

                Finds a tournament in sorted tournament matching current tournament and player
                Gets the abbreviation for this tournament
                adds to 'finishData' the finish if an entry is found, otherwise null
                returns this 'finishData'
            */
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
                // If player in pgatour data, add pga tour data
                let filteredPgatourData = {
                    sgPuttPGA: pgatourData.sgPutt !== null && pgatourData.sgPutt !== undefined ? Number(pgatourData.sgPutt.toFixed(2)) : null,
                    sgArgPGA: pgatourData.sgArg !== null && pgatourData.sgArg !== undefined ? Number(pgatourData.sgArg.toFixed(2)) : null,
                    sgAppPGA: pgatourData.sgApp !== null && pgatourData.sgApp !== undefined ? Number(pgatourData.sgApp.toFixed(2)) : null,
                    sgOttPGA: pgatourData.sgOtt !== null && pgatourData.sgOtt !== undefined ? Number(pgatourData.sgOtt.toFixed(2)) : null,
                    sgT2GPGA: pgatourData.sgT2G !== null && pgatourData.sgT2G !== undefined ? Number(pgatourData.sgT2G.toFixed(2)) : null,
                    sgTotPGA: pgatourData.sgTot !== null && pgatourData.sgTot !== undefined ? Number(pgatourData.sgTot.toFixed(2)) : null,
                    drDist: pgatourData.drDist !== null && pgatourData.drDist !== undefined ? Number(pgatourData.drDist.toFixed(2)) : null,
                    drAcc: pgatourData.drAcc !== null && pgatourData.drAcc !== undefined ? Number(pgatourData.drAcc.toFixed(2)) : null,
                    gir: pgatourData.gir !== null && pgatourData.gir !== undefined ? Number(pgatourData.gir.toFixed(2)) : null,
                    sandSave: pgatourData.sandSave !== null && pgatourData.sandSave !== undefined ? Number(pgatourData.sandSave.toFixed(2)) : null,
                    scrambling: pgatourData.scrambling !== null && pgatourData.scrambling !== undefined ? Number(pgatourData.scrambling.toFixed(2)) : null,
                    app50_75: pgatourData.app50_75 !== null && pgatourData.app50_75 !== undefined ? Number(pgatourData.app50_75.toFixed(2)) : null,
                    app75_100: pgatourData.app75_100 !== null && pgatourData.app75_100 !== undefined ? Number(pgatourData.app75_100.toFixed(2)) : null,
                    app100_125: pgatourData.app100_125 !== null && pgatourData.app100_125 !== undefined ? Number(pgatourData.app100_125.toFixed(2)) : null,
                    app125_150: pgatourData.app125_150 !== null && pgatourData.app125_150 !== undefined ? Number(pgatourData.app125_150.toFixed(2)) : null,
                    app150_175: pgatourData.app150_175 !== null && pgatourData.app150_175 !== undefined ? Number(pgatourData.app150_175.toFixed(2)) : null,
                    app175_200: pgatourData.app175_200 !== null && pgatourData.app175_200 !== undefined ? Number(pgatourData.app175_200.toFixed(2)) : null,
                    app200_up: pgatourData.app200_up !== null && pgatourData.app200_up !== undefined ? Number(pgatourData.app200_up.toFixed(2)) : null,
                    bob: pgatourData.bob !== null && pgatourData.bob !== undefined ? Number(pgatourData.bob.toFixed(2)) : null,
                    bogAvd: pgatourData.bogAvd !== null && pgatourData.bogAvd !== undefined ? Number(pgatourData.bogAvd.toFixed(2)) : null,
                    par3Scoring: pgatourData.par3Scoring !== null && pgatourData.par3Scoring !== undefined ? Number(pgatourData.par3Scoring.toFixed(2)) : null,
                    par4Scoring: pgatourData.par4Scoring !== null && pgatourData.par4Scoring !== undefined ? Number(pgatourData.par4Scoring.toFixed(2)) : null,
                    par5Scoring: pgatourData.par5Scoring !== null && pgatourData.par5Scoring !== undefined ? Number(pgatourData.par5Scoring.toFixed(2)) : null,
                    prox: pgatourData.prox !== null && pgatourData.prox !== undefined ? Number(pgatourData.prox.toFixed(2)) : null,
                    roughProx: pgatourData.roughProx !== null && pgatourData.roughProx !== undefined ? Number(pgatourData.roughProx.toFixed(2)) : null,
                    puttingBob: pgatourData.puttingBob !== null && pgatourData.puttingBob !== undefined ? Number(pgatourData.puttingBob.toFixed(2)) : null,
                    threePuttAvd: pgatourData.threePuttAvd !== null && pgatourData.threePuttAvd !== undefined ? Number(pgatourData.threePuttAvd.toFixed(2)) : null,
                    bonusPutt: pgatourData.bonusPutt !== null && pgatourData.bonusPutt !== undefined ? Number(pgatourData.bonusPutt.toFixed(2)) : null,
                    // Add other fields as needed
                };

                // Returns all of this data in cumulation as a list of dicts in dataTableData
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
                // Set pgatour data for the player as null because player doesn't have data.
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

                // Returns all of this data in cumulation as a list of dicts in dataTableData
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

        // -- Begin building up the ag-grid table

        function customComparator(valueA, valueB) {
            if (valueA === null && valueB === null) {
              return 0; // If both values are null, consider them equal
            }
          
            if (valueA === null) {
              return 1; // If valueA is null, consider it greater
            }
          
            if (valueB === null) {
              return -1; // If valueB is null, consider it greater
            }
          
            // Compare non-null values as usual
            if (valueA > valueB) {
              return 1;
            } else if (valueA < valueB) {
              return -1;
            }
          
            return 0; // If values are equal
          }

        // Create column definitions
        let columnDefs = [
            // Player Info grouping
            {
                headerName: 'Player Info',
                children: [
                    { headerName: 'Player', field: 'player', pinned: 'left'},
                    { headerName: 'FD Salary', field: 'fdSalary', pinned: 'left' },
                    { headerName: 'DK Salary', field: 'dkSalary', pinned: 'left' },
                ],
            },
            // SG LastNRounds grouping
            {
                headerName: 'SG LastNRounds',
                children: [
                    { headerName: 'SG: Putt', field: 'sgPutt' },
                    { headerName: 'SG: Arg', field: 'sgArg' },
                    { headerName: 'SG: App', field: 'sgApp' },
                    { headerName: 'SG: Ott', field: 'sgOtt'},
                    { headerName: 'SG: T2G', field: 'sgT2G' },
                    { headerName: 'SG: Tot', field: 'sgTot' },
                    { headerName: '# Rds', field: 'numRounds'}
                ],
            },
            // SG PGATOUR.COM grouping
            {
                headerName: 'SG PGATOUR.COM',
                children: [
                    { headerName: 'SG: Putt', field: 'sgPuttPGA', hide: true },
                    { headerName: 'SG: Arg', field: 'sgArgPGA', hide: true },
                    { headerName: 'SG: App', field: 'sgAppPGA', hide: true },
                    { headerName: 'SG: Ott', field: 'sgOttPGA', hide: true},
                    { headerName: 'SG: T2G', field: 'sgT2GPGA', hide: true },
                    { headerName: 'SG: Tot', field: 'sgTotPGA', hide: true },
                ],
            },
            // Other Stats grouping
            {
                headerName: 'Other Stats',
                children: [
                    { headerName: 'Dr. Dist.', field: 'drDist', hide: true },
                    { headerName: 'Dr. Acc.', field: 'drAcc', hide: true },
                    { headerName: 'GIR %', field: 'gir', hide: true },
                    { headerName: 'Sand Save %', field: 'sandSave', hide: true },
                    { headerName: 'Scrambling %', field: 'scrambling', hide: true },
                    { headerName: 'App. 50-75', field: 'app50_75', hide: true, comparator: customComparator },
                    { headerName: 'App. 75-100', field: 'app75_100', hide: true, comparator: customComparator },
                    { headerName: 'App. 100-125', field: 'app100_125', hide: true, comparator: customComparator },
                    { headerName: 'App. 125-150', field: 'app125_150', hide: true, comparator: customComparator },
                    { headerName: 'App. 150-175', field: 'app150_175', hide: true, comparator: customComparator },
                    { headerName: 'App. 175-200', field: 'app175_200', hide: true, comparator: customComparator },
                    { headerName: 'App. 200+', field: 'app200_up', hide: true, comparator: customComparator },
                    { headerName: 'BoB %', field: 'bob', hide: true },
                    { headerName: 'Bogey Avd.', field: 'bogAvd', hide: true, comparator: customComparator },
                    { headerName: 'Par 3s Avg', field: 'par3Scoring', hide: true, comparator: customComparator },
                    { headerName: 'Par 4s Avg', field: 'par4Scoring', hide: true, comparator: customComparator },
                    { headerName: 'Par 5s Avg', field: 'par5Scoring', hide: true, comparator: customComparator },
                    { headerName: 'Prox.', field: 'prox', hide: true, comparator: customComparator },
                    { headerName: 'Rough Prox.', field: 'roughProx', hide: true, comparator: customComparator },
                    { headerName: 'Putt. BoB %', field: 'puttingBob', hide: true },
                    { headerName: '3-Putt Avd.', field: 'threePuttAvd', hide: true, comparator: customComparator },
                    { headerName: 'Bonus Putt', field: 'bonusPutt', hide: true },
                ],
            },
            // Recent History grouping
            {
                headerName: 'Recent History',
                children: [
                    // Add columns for recent history based on tournamentAbbreviations
                    ...Object.keys(tournamentAbbreviations).map(abbreviation => ({
                        headerName: tournamentAbbreviations[abbreviation],
                        field: abbreviation,
                        comparator: customComparator
                    })),
                ],
            },
            // Course History grouping
            {
                headerName: 'Course History',
                children: [
                    { headerName: '-1', field: 'minus1', comparator: customComparator },
                    { headerName: '-2', field: 'minus2', comparator: customComparator },
                    { headerName: '-3', field: 'minus3', comparator: customComparator },
                    { headerName: '-4', field: 'minus4', comparator: customComparator },
                    { headerName: '-5', field: 'minus5', comparator: customComparator },
                    // Add other columns as needed
                ],
            },
        ];

        // Calculate min, mid, and max values for each column
        const columnMinMaxValues = columnDefs.reduce((acc, column) => {
            if (column.children) {
                // If it's a column group, iterate over its children
                column.children.forEach(childColumn => {
                    const fieldName = childColumn.field;
                    const values = dataTableData.map(row => row[fieldName]);
                    const sortedValues = [...values].sort((a, b) => a - b);
                    const filteredValues = values.filter(value => value !== null && value !== 0);

                    const minValue = filteredValues.length > 0 ? Math.min(...filteredValues) : 0;
                    const maxValue = Math.max(...values);

                    const midIndex = Math.floor(sortedValues.length / 2);
                    const midValue = sortedValues.length % 2 === 0
                        ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
                        : sortedValues[midIndex];

                    acc[fieldName] = { minValue, midValue, maxValue };
                });
            } else {
                // If it's an individual column
                const fieldName = column.field;
                const values = dataTableData.map(row => row[fieldName]);
                const sortedValues = [...values].sort((a, b) => a - b);
                const filteredValues = values.filter(value => value !== null && value !== 0);

                const minValue = filteredValues.length > 0 ? Math.min(...filteredValues) : 0;
                const maxValue = Math.max(...values);


                const midIndex = Math.floor(sortedValues.length / 2);
                const midValue = sortedValues.length % 2 === 0
                    ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
                    : sortedValues[midIndex];

                acc[fieldName] = { minValue, midValue, maxValue };
            }

            return acc;
        }, {});

        // List of columns where you want to reverse the color scale
        const columnsWithReversedColorScale = ['app50_75','app75_100',
        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bogAvd', 'par3Scoring',
        'par4Scoring', 'par5Scoring', 'prox', 'roughProx', 'threePuttAvd'];

        // Define the color scale for each column based on the calculated values
        const colorScales = columnDefs.reduce((acc, column) => {
            if (column.children) {
                // If it's a column group, iterate over its children
                column.children.forEach(childColumn => {
                    const fieldName = childColumn.field;
                    const { minValue, midValue, maxValue } = columnMinMaxValues[fieldName];
        
                    const colorScale = d3.scaleLinear()
                        .domain([minValue, midValue, maxValue]);
        
                    if (columnsWithReversedColorScale.includes(fieldName)) {
                        console.log('Reversed ', fieldName);
                        colorScale.range(['#4579F1', '#FFFFFF', '#F83E3E']);
                    } else {
                        colorScale.range(['#F83E3E', '#FFFFFF', '#4579F1']);
                    }
        
                    acc[fieldName] = colorScale;
                });
            } else {
                // If it's an individual column
                const fieldName = column.field;
                const { minValue, midValue, maxValue } = columnMinMaxValues[fieldName];
        
                const colorScale = d3.scaleLinear()
                    .domain([minValue, midValue, maxValue]);
        
                if (columnsWithReversedColorScale.includes(fieldName)) {
                    console.log('Reversed ', fieldName);
                    colorScale.range(['#4579F1', '#FFFFFF', '#F83E3E']);
                } else {
                    colorScale.range(['#F83E3E', '#FFFFFF', '#4579F1']);
                }
        
                acc[fieldName] = colorScale;
            }
        
            return acc;
        }, {});
        

        // List of columns for which to apply the color scale
        const columnsWithColorScale = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot',
                                        'sgPuttPGA', 'sgArgPGA', 'sgAppPGA', 'sgOttPGA', 'sgT2GPGA', 'sgTotPGA',
                                        'drDist', 'drAcc', 'gir', 'sandSave', 'scrambling', 'app50_75', 'app75_100',
                                        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bob',
                                        'bogAvd', 'par3Scoring', 'par4Scoring', 'par5Scoring', 'prox', 'roughProx',
                                        'puttingBob', 'threePuttAvd', 'bonusPutt'];
        
        function globalCellStyle(params) {
            const fieldName = params.colDef.field;
            const numericValue = params.value;

            // Set background color to white for null values
            if (numericValue === null) {
                return { backgroundColor: '#FFFFFF' };
            }
        
            // Check if the column is in the list and the value is numeric before applying the color scale
            if (columnsWithColorScale.includes(fieldName) && !isNaN(numericValue) && isFinite(numericValue)) {
                const cellColor = colorScales[fieldName](numericValue);
                return { backgroundColor: cellColor };
            }
        
            // Return default style if the column is not in the list or the value is not numeric
            return {};
        }

        function clearCheatSheetContent() {
            /*
                Clears the content of the cheatSheet.
            */
            const cheatSheet = document.getElementById('cheatSheet');
            if (cheatSheet) {
                cheatSheet.innerHTML = ''; // Clear content
            }
        }

        function initializeCheatSheet() {
            /*
                clears cheat sheet if already initialized

                builds up grid options - specifies column defs, row data,...
                
                creates the grid and puts it in #cheatSheet
            */
            console.log('init');
            if (isCheatSheetInitialized) {
                clearCheatSheetContent();
            }
    
            // setup grid options
            const gridOptions = {
                columnDefs: columnDefs.map(column => ({
                    ...column,
                    cellStyle: globalCellStyle,
                    children: column.children ? column.children.map(child => ({
                        ...child,
                        cellStyle: globalCellStyle,
                    })) : undefined,
                })),
                rowData: dataTableData,
                suppressColumnVirtualisation: true,  // allows auto resize of non-visible cols
                onFirstDataRendered: function (params) {
                    console.log('grid is ready');
                    params.api.autoSizeAllColumns();
                    params.api.setColumnWidth('player', 150);
                    params.api.setColumnWidth('fdSalary', 73);
                    params.api.setColumnWidth('dkSalary', 73);
                    params.api.setColumnWidth('numRounds', 45);
                    params.api.setColumnWidth('recent1', 58);
                    params.api.setColumnWidth('recent2', 58);
                    params.api.setColumnWidth('recent3', 58);
                    params.api.setColumnWidth('recent4', 58);
                    params.api.setColumnWidth('recent5', 58);
                    params.api.setColumnWidth('recent6', 58);
                    params.api.setColumnWidth('recent7', 58);
                    params.api.setColumnWidth('recent8', 58);
                    params.api.setColumnWidth('recent9', 58);
                    params.api.setColumnWidth('recent10', 58);
                    params.api.setColumnWidth('minus1', 40);
                    params.api.setColumnWidth('minus2', 40);
                    params.api.setColumnWidth('minus3', 40);
                    params.api.setColumnWidth('minus4', 40);
                    params.api.setColumnWidth('minus5', 40);
                    setupColumnVisibilityDropdown(columnDefs);
                },
                getRowHeight: function(params) {
                    // return the desired row height in pixels
                    return 25; // adjust this value based on your preference
                },
                headerHeight: 30,
            };

            console.log('Column Definitions:', gridOptions.columnDefs);
    
            // Create the grid using createGrid
            gridApi = agGrid.createGrid(document.querySelector('#cheatSheet'), gridOptions);
            isCheatSheetInitialized = true;
        }

        function setupColumnVisibilityDropdown(columnDefs) {
            // Handles the setup of the column visibility dropdown
            const checkboxContainer = document.getElementById('checkboxContainer'); // container of the checkboxes
        
            if (!checkboxContainer) {
                console.error('Checkbox container not found');
                return;
            }
        
            // Clear the checkbox container if it is not initially empty
            if (checkboxContainer.hasChildNodes()) {
                checkboxContainer.innerHTML = '';
            }
        
            // Check if columnDefs is an array and not empty
            if (Array.isArray(columnDefs) && columnDefs.length > 0) {
                columnDefs.forEach(group => { // for each group in column defs
                    if (group.children) {
        
                        // Create group checkbox, label, add it to container
                        const groupCheckbox = document.createElement('input');
                        groupCheckbox.type = 'checkbox';
                        groupCheckbox.id = group.headerName + '_group';
                        groupCheckbox.checked = !group.children.every(col => col.hide); // If any child col visible, check this
                        groupCheckbox.classList.add('group-checkbox'); // Add class for easier targeting
        
                        const groupLabel = document.createElement('label');
                        groupLabel.htmlFor = group.headerName + '_group';
                        groupLabel.appendChild(document.createTextNode(group.headerName));
                        groupLabel.classList.add('group-label'); // Add class to make the font bold
        
                        checkboxContainer.appendChild(groupCheckbox);
                        checkboxContainer.appendChild(groupLabel);
                        checkboxContainer.appendChild(document.createElement('br'));
        
                        // For each child within the group
                        group.children.forEach(column => {
                            // Create checkbox, label, add it to checkbox container.
                            const checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            checkbox.id = column.field;
                            checkbox.checked = !column.hide; // Checked if column is not hidden
        
                            const label = document.createElement('label');
                            label.htmlFor = column.field;
                            label.appendChild(document.createTextNode(column.headerName));
        
                            checkboxContainer.appendChild(checkbox);
                            checkboxContainer.appendChild(label);
                            checkboxContainer.appendChild(document.createElement('br'));
        
                            // Add event listener to column checkbox to update group checkbox and column visibility
                            checkbox.addEventListener('change', function () {
                                const allColumnsHidden = group.children.every(col => col.hide);
                                groupCheckbox.checked = !allColumnsHidden;
        
                                const column = gridApi.getColumn(checkbox.id);
                                if (column) {
                                    column.hide = !checkbox.checked;
                                    //gridApi.setColumnDefs(gridApi.getColumnDefs());
                                    gridApi.updateGridOptions({ columnDefs: gridApi.getColumnDefs() });
                                }
                            });
                        });
        
                        // Add event listener to group checkbox to toggle visibility of group columns
                        groupCheckbox.addEventListener('change', function () {
                            group.children.forEach(col => {
                                col.hide = !groupCheckbox.checked;
                                const colCheckbox = document.getElementById(col.field);
                                colCheckbox.checked = groupCheckbox.checked;
                            });
                            gridApi.updateGridOptions({ columnDefs: gridApi.getColumnDefs() });
                        });
                    }
                });
            } else {
                console.error('Invalid or empty columnDefs array');
            }
        }
        

        window.applyColumnVisibility = function () {
            // called on click of apply col vis, sets checked cols to visible!
        
            const checkboxes = document.querySelectorAll('#checkboxContainer input');
            const applyButton = document.getElementById('applyColVisCS');
        
            const columnsToUpdate = [];
        
            checkboxes.forEach(checkbox => {
                const column = gridApi.getColumn(checkbox.id);
                if (column) {
                    // If checkbox is checked, show the column; if unchecked, hide the column
                    columnsToUpdate.push({ column, visible: checkbox.checked });
                } else {
                    console.warn(`Column with field '${checkbox.id}' not found`);
                }
            });
        
            // Set visibility and hide properties for each column
            columnsToUpdate.forEach(({ column, visible }) => {
                column.setVisible(visible);
                column.getColDef().hide = !visible;
            });
        
            // Set the new columnDefs using setGridOption
            gridApi.setGridOption('columnDefs', gridApi.getColumnDefs());
        
            // Auto-size all columns
            gridApi.autoSizeAllColumns();
        
            // Hide the "Apply" button after applying column visibility changes
            if (applyButton) {
                applyButton.style.display = 'none';
            }
        
            // Collapse the checkboxContainer after applying column visibility changes
            const checkboxContainer = document.getElementById('checkboxContainer');
            if (checkboxContainer) {
                checkboxContainer.style.height = '0';
                checkboxContainer.style.overflowY = 'hidden';
            }
        };
        
        
        

        window.toggleColumnVisibility = function () {
            // toggles visibility of the checkbox container
            const checkboxContainer = document.getElementById('checkboxContainer');
            const applyButton = document.getElementById('applyColVisCS');

            if (checkboxContainer && applyButton) {
                console.log('in if');
                const isExpanded = checkboxContainer.style.height === 'auto' || checkboxContainer.style.height === '150px';
                console.log('is expanded', isExpanded);
                checkboxContainer.style.height = isExpanded ? '0' : '150px';
                checkboxContainer.style.overflowY = isExpanded ? 'hidden' : 'auto';
                applyButton.style.display = isExpanded ? 'none' : 'inline-block';
            }
        };

        /*
            For hovering the entire row - considering we have pinned rows...
        */
        document.addEventListener('DOMContentLoaded', function () {
            const cheatSheet = document.getElementById('cheatSheet');
          
            cheatSheet.addEventListener('mouseover', function (event) {
              const targetRow = event.target.closest('.ag-row');
              if (targetRow) {
                targetRow.classList.add('ag-row-hover');
              }
            });
          
            cheatSheet.addEventListener('mouseout', function (event) {
              const targetRow = event.target.closest('.ag-row');
              if (targetRow) {
                targetRow.classList.remove('ag-row-hover');
              }
            });
          });

        initializeCheatSheet();

    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

function onFilterTextBoxChanged() {
    // the function for the search box which filters the table 
    // based on 'filter-text-box' for gridApi grid
    gridApi.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box').value
    );
}



let isDataTableInitialized = false;
let profGridApi;

function loadProfile(){
    let profileTbl = document.getElementById('golferProfTable');
    let currGolfer = document.getElementById('playerNameProf');
    let roundView = document.getElementById('selectRoundDrop');

    let url = '/get/golferProf/' + currGolfer.value + '/' + roundView.value;

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) => {

        jsonData.sort((a, b) => {
            // First, compare by date in descending order
            const dateComparison = new Date(b.dates) - new Date(a.dates);
            
            // If dates are equal, compare by round in descending order
            return dateComparison !== 0 ? dateComparison : b.Round - a.Round;
        });

        if(isDataTableInitialized){
            profileTbl.innerHTML = '';
        }

        const columnDefs = [
            { headerName: 'Date', field: 'dates' },
            { headerName: 'Finish', field: 'finish' },
            { headerName: 'Tournament', field: 'tournament' },
            { headerName: 'Round', field: 'Round' },
            { headerName: 'SG: Putt', field: 'sgPutt', valueFormatter: roundToTwoDecimals},
            { headerName: 'SG: Arg', field: 'sgArg', valueFormatter: roundToTwoDecimals},
            { headerName: 'SG: App', field: 'sgApp', valueFormatter: roundToTwoDecimals},
            { headerName: 'SG: Ott', field: 'sgOtt', valueFormatter: roundToTwoDecimals},
            { headerName: 'SG: T2G', field: 'sgT2G', valueFormatter: roundToTwoDecimals},
            { headerName: 'SG: TOT', field: 'sgTot', valueFormatter: roundToTwoDecimals},
            ];
        
        function roundToTwoDecimals(params) {
            // Check if the value is a number before rounding
            if (typeof params.value === 'number') {
                return params.value.toFixed(2);
            }
            // If the value is not a number, return it as is
            return params.value;
        }
        
        let indMinMax;
        let t2gMinMax;
        let totMinMax;
        if(roundView.value == 'roundByRound'){
            indMinMax = {minValue: -4.5, midValue: 0, maxValue: 4.5};
            t2gMinMax = {minValue: -7, midValue: 0, maxValue: 7};
            totMinMax = {minValue: -9, midValue: 0, maxValue: 9};
        }else{
            indMinMax = {minValue: -6, midValue: 0, maxValue: 6};
            t2gMinMax = {minValue: -11, midValue: 0, maxValue: 11};
            totMinMax = {minValue: -12, midValue: 0, maxValue: 15};
        }
        
        const colMinMax = {
            'sgPutt' : indMinMax,
            'sgArg' : indMinMax,
            'sgApp' : indMinMax,
            'sgOtt' : indMinMax,
            'sgT2G' : t2gMinMax,
            'sgTot' : totMinMax,
        }

        const colorScales = {};

        Object.keys(colMinMax).forEach(fieldName => {
            const { minValue, midValue, maxValue } = colMinMax[fieldName];
        
            const colorScale = d3.scaleLinear()
                .domain([minValue, midValue, maxValue]);
        
            colorScale.range(['#F83E3E', '#FFFFFF', '#4579F1']);
        
            colorScales[fieldName] = colorScale;
        });

        const columnsWithColorScale = ['sgPutt', 'sgArg', 'sgApp', 'sgOtt',
                                        'sgT2G', 'sgTot'];

        function globalCellStyle(params){
            const fieldName = params.colDef.field;
            const numericValue = params.value;

            // Set background color to white for null values
            if (numericValue === null) {
                return { backgroundColor: '#FFFFFF' };
            }
        
            // Check if the column is in the list and the value is numeric before applying the color scale
            if (columnsWithColorScale.includes(fieldName) && !isNaN(numericValue) && isFinite(numericValue)) {
                const cellColor = colorScales[fieldName](numericValue);
                return { backgroundColor: cellColor };
            }
        
            // Return default style if the column is not in the list or the value is not numeric
            return {};
        }

        const gridOptions = {
            columnDefs: columnDefs.map(column => ({
                ...column,
                cellStyle: globalCellStyle,
            })),
            rowData: jsonData,
            suppressColumnVirtualisation: true,
            onFirstDataRendered: function (params) {
                console.log('grid is ready');
                params.api.autoSizeAllColumns();
                //setupColumnVisibilityDropdown(columnDefs);
            },
            getRowHeight: function(params) {
                // return the desired row height in pixels
                return 25; // adjust this value based on your preference
            },
            headerHeight: 30,
            getRowStyle: function (params) {
                return { borderBottom: '1px solid #ccc' };
            },
        }

        profGridApi = agGrid.createGrid(document.querySelector('#golferProfTable'), gridOptions);
        isDataTableInitialized = true; // Set the flag to indicate DataTable is now initialized
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

function onFilterTextBoxChangedGp() {
    // the function for the search box which filters the table 
    // based on 'filter-text-box-Gp' for gridApi grid
    profGridApi.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box-GP').value
    );
}


function loadProfOverview(){
    let profOvrTbl = document.getElementById("overallStatsProfile");
    let currGolfer = document.getElementById('playerNameProf');

    let url = "/get/profOverview/" + currGolfer.value;

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) => {

        let lastN = 50; // IMPORTANT - can change this!!!

        let playerRounds = jsonData.tournaments.sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round).slice(0, lastN);

        let avgRoundData = {};

        if (playerRounds.length > 0) { // Check if there are rounds for calculation
            let columnsToAverage = ['sgPutt', 'sgArg', 'sgApp', 'sgOtt', 'sgT2G', 'sgTot'];

            columnsToAverage.forEach((col) => {
                // Calculate the average value for each column
                let sum = playerRounds.reduce((sum, round) => sum + round[col], 0);
                let averageValue = sum / playerRounds.length;

                avgRoundData[col] = Number(averageValue.toFixed(2));
            });
        } else { // Set values to null if no rounds are found
            let columnsToAverage = ['sgPutt', 'sgArg', 'sgApp', 'sgOtt', 'sgT2G', 'sgTot'];

            columnsToAverage.forEach((col) => {
                avgRoundData[col] = null;
            });
        }


        let pgatour = jsonData.pgatour[0];

        let pgatourData = null;

        if (pgatour){
            pgatourData = {
                sgPutt: pgatour.sgPutt !== null && pgatour.sgPutt !== undefined ? Number(pgatour.sgPutt.toFixed(2)) : null,
                sgPuttR: pgatour.sgPuttRank !== null && pgatour.sgPuttRank !== undefined ? Number(pgatour.sgPuttRank.toFixed(0)) : null,
                sgArg: pgatour.sgArg !== null && pgatour.sgArg !== undefined ? Number(pgatour.sgArg.toFixed(2)) : null,
                sgArgR: pgatour.sgArgRank !== null && pgatour.sgArgRank !== undefined ? Number(pgatour.sgArgRank.toFixed(0)) : null,
                sgApp: pgatour.sgApp !== null && pgatour.sgApp !== undefined ? Number(pgatour.sgApp.toFixed(2)) : null,
                sgAppR: pgatour.sgAppRank !== null && pgatour.sgAppRank !== undefined ? Number(pgatour.sgAppRank.toFixed(0)) : null,
                sgOtt: pgatour.sgOtt !== null && pgatour.sgOtt !== undefined ? Number(pgatour.sgOtt.toFixed(2)) : null,
                sgOttR: pgatour.sgOttRank !== null && pgatour.sgOttRank !== undefined ? Number(pgatour.sgOttRank.toFixed(0)) : null,
                sgT2G: pgatour.sgT2G !== null && pgatour.sgT2G !== undefined ? Number(pgatour.sgT2G.toFixed(2)) : null,
                sgT2GR: pgatour.sgT2GRank !== null && pgatour.sgT2GRank !== undefined ? Number(pgatour.sgT2GRank.toFixed(0)) : null,
                sgTot: pgatour.sgTot !== null && pgatour.sgTot !== undefined ? Number(pgatour.sgTot.toFixed(2)) : null,
                sgTotR: pgatour.sgTotRank !== null && pgatour.sgTotRank !== undefined ? Number(pgatour.sgTotRank.toFixed(0)) : null,
                drDist: pgatour.drDist !== null && pgatour.drDist !== undefined ? Number(pgatour.drDist.toFixed(1)) : null,
                drDistR: pgatour.drDistRank !== null && pgatour.drDistRank !== undefined ? Number(pgatour.drDistRank.toFixed(0)) : null,
                drAcc: pgatour.drAcc !== null && pgatour.drAcc !== undefined ? Number(pgatour.drAcc.toFixed(2)) : null,
                drAccR: pgatour.drAccRank !== null && pgatour.drAccRank !== undefined ? Number(pgatour.drAccRank.toFixed(0)) : null,
                gir: pgatour.gir !== null && pgatour.gir !== undefined ? Number(pgatour.gir.toFixed(2)) : null,
                girR: pgatour.girRank !== null && pgatour.girRank !== undefined ? Number(pgatour.girRank.toFixed(0)) : null,
                sandSave: pgatour.sandSave !== null && pgatour.sandSave !== undefined ? Number(pgatour.sandSave.toFixed(2)) : null,
                sandSaveR: pgatour.sandSaveRank !== null && pgatour.sandSaveRank !== undefined ? Number(pgatour.sandSaveRank.toFixed(0)) : null,
                scrambling: pgatour.scrambling !== null && pgatour.scrambling !== undefined ? Number(pgatour.scrambling.toFixed(2)) : null,
                scramblingR: pgatour.scramblingRank !== null && pgatour.scramblingRank !== undefined ? Number(pgatour.scramblingRank.toFixed(0)) : null,
                app50_75: pgatour.app50_75 !== null && pgatour.app50_75 !== undefined ? Number(pgatour.app50_75.toFixed(0)) : null,
                app50_75R: pgatour.app50_75Rank !== null && pgatour.app50_75Rank !== undefined ? Number(pgatour.app50_75Rank.toFixed(0)) : null,
                app75_100: pgatour.app75_100 !== null && pgatour.app75_100 !== undefined ? Number(pgatour.app75_100.toFixed(0)) : null,
                app75_100R: pgatour.app75_100Rank !== null && pgatour.app75_100Rank !== undefined ? Number(pgatour.app75_100Rank.toFixed(0)) : null,
                app100_125: pgatour.app100_125 !== null && pgatour.app100_125 !== undefined ? Number(pgatour.app100_125.toFixed(0)) : null,
                app100_125R: pgatour.app100_125Rank !== null && pgatour.app100_125Rank !== undefined ? Number(pgatour.app100_125Rank.toFixed(0)) : null,
                app125_150: pgatour.app125_150 !== null && pgatour.app125_150 !== undefined ? Number(pgatour.app125_150.toFixed(0)) : null,
                app125_150R: pgatour.app125_150Rank !== null && pgatour.app125_150Rank !== undefined ? Number(pgatour.app125_150Rank.toFixed(0)) : null,
                app150_175: pgatour.app150_175 !== null && pgatour.app150_175 !== undefined ? Number(pgatour.app150_175.toFixed(0)) : null,
                app150_175R: pgatour.app150_175Rank !== null && pgatour.app150_175Rank !== undefined ? Number(pgatour.app150_175Rank.toFixed(0)) : null,
                app175_200: pgatour.app175_200 !== null && pgatour.app175_200 !== undefined ? Number(pgatour.app175_200.toFixed(0)) : null,
                app175_200R: pgatour.app175_200Rank !== null && pgatour.app175_200Rank !== undefined ? Number(pgatour.app175_200Rank.toFixed(0)) : null,
                app200_up: pgatour.app200_up !== null && pgatour.app200_up !== undefined ? Number(pgatour.app200_up.toFixed(0)) : null,
                app200_upR: pgatour.app200_upRank !== null && pgatour.app200_upRank !== undefined ? Number(pgatour.app200_upRank.toFixed(0)) : null,
                bob: pgatour.bob !== null && pgatour.bob !== undefined ? Number(pgatour.bob.toFixed(2)) : null,
                bobR: pgatour.bobRank !== null && pgatour.bobRank !== undefined ? Number(pgatour.bobRank.toFixed(0)) : null,
                bogAvd: pgatour.bogAvd !== null && pgatour.bogAvd !== undefined ? Number(pgatour.bogAvd.toFixed(2)) : null,
                bogAvdR: pgatour.bogAvdRank !== null && pgatour.bogAvdRank !== undefined ? Number(pgatour.bogAvdRank.toFixed(0)) : null,
                par3Scoring: pgatour.par3Scoring !== null && pgatour.par3Scoring !== undefined ? Number(pgatour.par3Scoring.toFixed(2)) : null,
                par3ScoringR: pgatour.par3ScoringRank !== null && pgatour.par3ScoringRank !== undefined ? Number(pgatour.par3ScoringRank.toFixed(0)) : null,
                par4Scoring: pgatour.par4Scoring !== null && pgatour.par4Scoring !== undefined ? Number(pgatour.par4Scoring.toFixed(2)) : null,
                par4ScoringR: pgatour.par4ScoringRank !== null && pgatour.par4ScoringRank !== undefined ? Number(pgatour.par4ScoringRank.toFixed(0)) : null,
                par5Scoring: pgatour.par5Scoring !== null && pgatour.par5Scoring !== undefined ? Number(pgatour.par5Scoring.toFixed(2)) : null,
                par5ScoringR: pgatour.par5ScoringRank !== null && pgatour.par5ScoringRank !== undefined ? Number(pgatour.par5ScoringRank.toFixed(0)) : null,
                prox: pgatour.prox !== null && pgatour.prox !== undefined ? Number(pgatour.prox.toFixed(0)) : null,
                proxR: pgatour.proxRank !== null && pgatour.proxRank !== undefined ? Number(pgatour.proxRank.toFixed(0)) : null,
                roughProx: pgatour.roughProx !== null && pgatour.roughProx !== undefined ? Number(pgatour.roughProx.toFixed(0)) : null,
                roughProxR: pgatour.roughProxRank !== null && pgatour.roughProxRank !== undefined ? Number(pgatour.roughProxRank.toFixed(0)) : null,
                puttingBob: pgatour.puttingBob !== null && pgatour.puttingBob !== undefined ? Number(pgatour.puttingBob.toFixed(1)) : null,
                puttingBobR: pgatour.puttingBobRank !== null && pgatour.puttingBobRank !== undefined ? Number(pgatour.puttingBobRank.toFixed(0)) : null,
                threePuttAvd: pgatour.threePuttAvd !== null && pgatour.threePuttAvd !== undefined ? Number(pgatour.threePuttAvd.toFixed(1)) : null,
                threePuttAvdR: pgatour.threePuttAvdRank !== null && pgatour.threePuttAvdRank !== undefined ? Number(pgatour.threePuttAvdRank.toFixed(0)) : null,
                bonusPutt: pgatour.bonusPutt !== null && pgatour.bonusPutt !== undefined ? Number(pgatour.bonusPutt.toFixed(2)) : null,
                bonusPuttR: pgatour.bonusPuttRank !== null && pgatour.bonusPuttRank !== undefined ? Number(pgatour.bonusPuttRank.toFixed(0)) : null,
            };
        }

        profOvrTbl.innerHTML = '';

        // Start building the HTML string for the table
        let tableHTML = '';

        const statMappings = {
            sgPutt: 'SG: Putt',
            sgArg: 'SG: Arg',
            sgApp: 'SG: App',
            sgOtt: 'SG: Ott',
            sgT2G: 'SG: T2G',
            sgTot: 'SG: Tot.',
            drDist: 'Dr. Dist.',
            drAcc: 'Dr. Acc.',
            gir: 'GIR%',
            sandSave: 'Sand Save%',
            scrambling: 'Scrambling',
            app50_75: 'App. 50-75',
            app75_100: 'App. 75-100',
            app100_125: 'App. 100-125',
            app125_150: 'App. 125-150',
            app150_175: 'App. 150-175',
            app175_200: 'App. 175-200',
            app200_up: 'App. 200+',
            bob: 'BOB%',
            bogAvd: 'Bog. Avd.',
            par3Scoring: 'Par 3s',
            par4Scoring: 'Par 4s',
            par5Scoring: 'Par 5s',
            prox: 'Prox.',
            roughProx: 'Rough Prox.',
            puttingBob: 'PuttBOB%',
            threePuttAvd: '3-Putt Avd.',
            bonusPutt: 'BonusPutt',
            // Add more mappings as needed
        };
        

        // Table header row
        tableHTML += '<thead><tr id="profOvrRow"><th id="profOvrHead">Stat</th><th id="profOvrHead">Value</th><th id="profOvrHead">Rank</th></tr></thead><tbody>';

        let noPgaStats = ['sgPutt', 'sgArg', 'sgApp', 'sgOtt', 'sgT2G', 'sgTot'];

        function getColorFromScale(value) {
            const scale = d3.scaleLinear()
                .domain([0, 75, 150])
                .range(['#4579F1', '#FFFFFF','#F83E3E']);
        
            return scale(value);
        }

        function getColorFromScale2(value, stat){
            let dom;
            if(stat == 'sgPutt' | stat == 'sgArg' | stat == 'sgApp' | stat == 'sgOtt'){
                console.log('main');
                dom = [-1.5,0,1.5];
            } else if (stat == 'sgT2G'){
                dom = [-2, 0, 2];
            } else {
                dom = [-2.5,0,2.5];
            }

            const scale = d3.scaleLinear()
                .domain(dom)
                .range(['#F83E3E', '#FFFFFF','#4579F1'])

            return scale(value);
        }

        if (pgatourData == null){
            for( let statInd in noPgaStats){
                let stat = noPgaStats[statInd];
                // Add a new row for each stat
                tableHTML += '<tr id="profOvrRow">';
                // Add the stat name to the first column
                tableHTML += `<td id="profOvrElem" class="profOvrStat">${statMappings[stat]}</td>`;
                // Add the stat value to the second column
                tableHTML += `<td id="profOvrElem" style="background-color: ${getColorFromScale2(avgRoundData[stat], stat)};">${avgRoundData[stat]}</td>`;
                tableHTML += `<td id="profOvrElem">-</td>`;

                tableHTML += '</tr>';
            }
        } else {
            for (let stat in pgatourData) {
                // Check if the property is a valid stat (not a method, etc.) and does not end with 'R'
                if (pgatourData.hasOwnProperty(stat) && !stat.endsWith('R')) {
                    // Add a new row for each stat
                    tableHTML += '<tr id="profOvrRow">';
                    // Add the stat name to the first column
                    tableHTML += `<td id="profOvrElem" class="profOvrStat">${statMappings[stat]}</td>`;
        
                    // Add the stat value to the second column
                    let valueColumn = `<td id="profOvrElem" style="background-color: ${getColorFromScale(pgatourData[stat + 'R'])};">${pgatourData[stat]}</td>`;
        
                    // Add the corresponding rank to the third column
                    let rankColumn = `<td id="profOvrElem">${pgatourData[stat + 'R']}</td>`;
        
                    tableHTML += valueColumn;
                    tableHTML += rankColumn;
        
                    tableHTML += '</tr>';
                }
            }
        }
        

        profOvrTbl.innerHTML = tableHTML + '</tbody>';

    })
}

function loadPlayerListGp(){
    let playerDropdown = document.getElementById('playerNameProf');

    let url = '/get/playerListGp/';

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) => {
        playerDropdown.innerHTML = '';

        let htmlString = '';

        //console.log('playerList: ', jsonData);

        for (let i=0; i<jsonData.length; i++){
            let object = jsonData[i];
            if(i == 0){
                htmlString += '<option value="' + object.player + '" default>' + object.player + '</option>';
            } else {
                htmlString += '<option value="' + object.player + '">' + object.player + '</option>';
            }
        }

        playerDropdown.innerHTML = htmlString;

        loadProfile();
        loadProfOverview();
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

let isTrendSheetInitialized = false;
let gridApiTrends;

function loadTrendsSheet() {
    let recentRounds = document.getElementById('recRdsInp');
    let baseRounds = document.getElementById('baseRdsInp');
    let trendSheet = document.getElementById('trendSheet');

    let url = '/get/trendsSheet/';
    
    let p = fetch(url);
    p.then((response) =>{
        return response.json()
    })
    .then((jsonData) =>{
        console.log(jsonData);

        if (!jsonData.salaries || !jsonData.tournamentRow){
            console.log('Invalid data format, expected "salaries" and "tournamentRow".');
            return;
        }

        let dataTableData = jsonData.salaries.map((salary) => {
            let player = salary.player;
            let fdSalary = salary.fdSalary;
            let dkSalary = salary.dkSalary;

            // SG: Recent Rounds Avg
            let playerRounds = jsonData.tournamentRow.filter((round) => round.player === player)
                .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
                .slice(0, recentRounds.value); // Grab at most the specified number of rounds

            // Calculate the average of specific columns for the player's rounds
            let avgRoundData = {};

            if (playerRounds.length > 0 ) { // can change to ensure minimum # rounds for calc
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt'];
                columnsToAverage.forEach((col) => {
                    let averageValue = playerRounds.reduce((sum, round) => sum + round[col], 0) / playerRounds.length;
                    avgRoundData[col] = Number(averageValue.toFixed(2));
                });
            } else { // Set values to null if no rounds are found
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt'];
                columnsToAverage.forEach((col) => {
                    avgRoundData[col] = null;
                });
            }

            // SG: Base Rounds Avg
            let playerBaseRounds = jsonData.tournamentRow.filter((round) => round.player === player)
                .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
                .slice(0, baseRounds.value); // Grab at most the specified number of rounds

            // Calculate the average of specific columns for the player's rounds
            let avgRoundBaseData = {};
            avgRoundBaseData['baseRds'] = playerBaseRounds.length;

            if (playerBaseRounds.length > 0 ) { // can change to ensure minimum # rounds for calc
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt'];
                columnsToAverage.forEach((col) => {
                    let averageValue = playerBaseRounds.reduce((sum, round) => sum + round[col], 0) / playerBaseRounds.length;
                    avgRoundBaseData[col] = Number(averageValue.toFixed(2));
                });
            } else { // Set values to null if no rounds are found
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt'];
                columnsToAverage.forEach((col) => {
                    avgRoundBaseData[col] = null;
                });
            }

            let trendsData;

            if(playerRounds.length != 0){
                console.log('here');
                trendsData = {
                    player,
                    fdSalary,
                    dkSalary,
                    'sgPutt': Number((avgRoundData.sgPutt - avgRoundBaseData.sgPutt).toFixed(2)),
                    'sgArg': Number((avgRoundData.sgArg - avgRoundBaseData.sgArg).toFixed(2)),
                    'sgApp': Number((avgRoundData.sgApp - avgRoundBaseData.sgApp).toFixed(2)),
                    'sgOtt': Number((avgRoundData.sgOtt - avgRoundBaseData.sgOtt).toFixed(2)),
                    'sgHeat': Number((
                        (avgRoundData.sgPutt - avgRoundBaseData.sgPutt) +
                        (avgRoundData.sgArg - avgRoundBaseData.sgArg) +
                        (avgRoundData.sgApp - avgRoundBaseData.sgApp) +
                        (avgRoundData.sgOtt - avgRoundBaseData.sgOtt)
                    ).toFixed(2)),
                    'baseRds':avgRoundBaseData.baseRds
                    };
            }else {
                trendsData = {
                    player,
                    fdSalary,
                    dkSalary,  
                    'sgPutt': null,
                    'sgArg':null,
                    'sgApp': null,
                    'sgOtt': null,
                    'sgHeat': null,
                    'baseRds': 0
                    };
            }

            return trendsData;
        }).filter(Boolean);

        console.log(dataTableData);

        let columnDefs = [
            {headerName: 'Player', field: 'player'},
            {headerName: 'FD Salary', field: 'fdSalary'},
            {headerName: 'DK Salary', field: 'dkSalary'},
            {headerName: 'SG: Putt', field: 'sgPutt'},
            {headerName: 'SG: Arg', field: 'sgArg'},
            {headerName: 'SG: App', field: 'sgApp'},
            {headerName: 'SG: Ott', field: 'sgOtt'},
            {headerName: 'SG HEAT', field: 'sgHeat', sortable: true, sort: 'desc'},
            {headerName: 'Base Rds', field: 'baseRds'},
        ];

        let minMax = {minValue: -2, midValue: 0, maxValue: 2};
        let minMaxHeat = {minValue: -3.5, midValue: 0, maxValue: 3.5};

        const colMinMax = {
            'sgPutt': minMax,
            'sgArg': minMax,
            'sgApp': minMax,
            'sgOtt': minMax,
            'sgHeat': minMaxHeat,
        };

        const colorScales = {};

        Object.keys(colMinMax).forEach(fieldName => {
            const { minValue, midValue, maxValue } = colMinMax[fieldName];
        
            const colorScale = d3.scaleLinear()
                .domain([minValue, midValue, maxValue]);
        
            colorScale.range(['#F83E3E', '#FFFFFF', '#4579F1']);
        
            colorScales[fieldName] = colorScale;
        });

        const columnsWithColorScale = ['sgPutt', 'sgArg', 'sgApp', 'sgOtt',
                                        'sgHeat'];

        function globalCellStyle(params){
            const fieldName = params.colDef.field;
            const numericValue = params.value;

            // Set background color to white for null values
            if (numericValue === null) {
                return { backgroundColor: '#FFFFFF' };
            }
        
            // Check if the column is in the list and the value is numeric before applying the color scale
            if (columnsWithColorScale.includes(fieldName) && !isNaN(numericValue) && isFinite(numericValue)) {
                const cellColor = colorScales[fieldName](numericValue);
                return { backgroundColor: cellColor };
            }
        
            // Return default style if the column is not in the list or the value is not numeric
            return {};
        }

        function clearCheatSheetContent() {
            /*
                Clears the content of the cheatSheet.
            */
                const trendSheet = document.getElementById('trendSheet');
                if (trendSheet) {
                    trendSheet.innerHTML = ''; // Clear content
                }
        };

        function initializeCheatSheet() {
            /*
                clears trend sheet if already initialized

                builds up grid options - specifies column defs, row data,...
                
                creates the grid and puts it in #cheatSheet
            */
            if (isTrendSheetInitialized) {
                clearCheatSheetContent();
            }
    
            // setup grid options
            const gridOptions = {
                columnDefs: columnDefs.map(column => ({
                    ...column,
                    cellStyle: globalCellStyle,
                })),
                rowData: dataTableData,
                suppressColumnVirtualisation: true,  // allows auto resize of non-visible cols
                onFirstDataRendered: function (params) {
                    console.log('grid is ready');
                    params.api.autoSizeAllColumns();
                    params.api.setColumnWidth('sgHeat', 80);
                },
                getRowHeight: function(params) {
                    // return the desired row height in pixels
                    return 25; // adjust this value based on your preference
                },
                headerHeight: 30,
            };
    
            // Create the grid using createGrid
            gridApiTrends = agGrid.createGrid(document.querySelector('#trendSheet'), gridOptions);
            isTrendSheetInitialized = true;
        };

        initializeCheatSheet();
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

function onFilterTextBoxChangedTrend() {
    // the function for the search box which filters the table 
    // based on 'filter-text-box' for gridApi grid
    gridApiTrends.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box-trend').value
    );
}

let isFlagSheetInitialized = false;
let gridApiFlag;

function loadFlagSheet(){

    let url = '/get/flagSheet/';
    let p = fetch(url);
    p.then((response) =>{
        return response.json();
    })
    .then((jsonData) =>{
        console.log(jsonData);

        if(!jsonData.salaries || !jsonData.pgatour){
            console.log('Invalid data format. Expected "salaries", "pgatour"');
            return;
        }

        let dataTableData = jsonData.salaries.map((salary) => {
            let player = salary.player;
            let fdSalary = salary.fdSalary;
            let dkSalary = salary.dkSalary;

            // SG: PGATOUR.COM
            // Find a matching player in pgatour
            let pgatourData = jsonData.pgatour.find((pgatour) => pgatour.player === player);

            if (pgatourData) {
                // If player in pgatour data, add pga tour data
                let filteredPgatourData = {
                    sgPuttPGA: pgatourData.sgPutt !== null && pgatourData.sgPutt !== undefined ? Number(pgatourData.sgPutt.toFixed(2)) : null,
                    sgArgPGA: pgatourData.sgArg !== null && pgatourData.sgArg !== undefined ? Number(pgatourData.sgArg.toFixed(2)) : null,
                    sgAppPGA: pgatourData.sgApp !== null && pgatourData.sgApp !== undefined ? Number(pgatourData.sgApp.toFixed(2)) : null,
                    sgOttPGA: pgatourData.sgOtt !== null && pgatourData.sgOtt !== undefined ? Number(pgatourData.sgOtt.toFixed(2)) : null,
                    sgT2GPGA: pgatourData.sgT2G !== null && pgatourData.sgT2G !== undefined ? Number(pgatourData.sgT2G.toFixed(2)) : null,
                    sgTotPGA: pgatourData.sgTot !== null && pgatourData.sgTot !== undefined ? Number(pgatourData.sgTot.toFixed(2)) : null,
                    drDist: pgatourData.drDist !== null && pgatourData.drDist !== undefined ? Number(pgatourData.drDist.toFixed(2)) : null,
                    drAcc: pgatourData.drAcc !== null && pgatourData.drAcc !== undefined ? Number(pgatourData.drAcc.toFixed(2)) : null,
                    gir: pgatourData.gir !== null && pgatourData.gir !== undefined ? Number(pgatourData.gir.toFixed(2)) : null,
                    sandSave: pgatourData.sandSave !== null && pgatourData.sandSave !== undefined ? Number(pgatourData.sandSave.toFixed(2)) : null,
                    scrambling: pgatourData.scrambling !== null && pgatourData.scrambling !== undefined ? Number(pgatourData.scrambling.toFixed(2)) : null,
                    app50_75: pgatourData.app50_75 !== null && pgatourData.app50_75 !== undefined ? Number(pgatourData.app50_75.toFixed(2)) : null,
                    app75_100: pgatourData.app75_100 !== null && pgatourData.app75_100 !== undefined ? Number(pgatourData.app75_100.toFixed(2)) : null,
                    app100_125: pgatourData.app100_125 !== null && pgatourData.app100_125 !== undefined ? Number(pgatourData.app100_125.toFixed(2)) : null,
                    app125_150: pgatourData.app125_150 !== null && pgatourData.app125_150 !== undefined ? Number(pgatourData.app125_150.toFixed(2)) : null,
                    app150_175: pgatourData.app150_175 !== null && pgatourData.app150_175 !== undefined ? Number(pgatourData.app150_175.toFixed(2)) : null,
                    app175_200: pgatourData.app175_200 !== null && pgatourData.app175_200 !== undefined ? Number(pgatourData.app175_200.toFixed(2)) : null,
                    app200_up: pgatourData.app200_up !== null && pgatourData.app200_up !== undefined ? Number(pgatourData.app200_up.toFixed(2)) : null,
                    bob: pgatourData.bob !== null && pgatourData.bob !== undefined ? Number(pgatourData.bob.toFixed(2)) : null,
                    bogAvd: pgatourData.bogAvd !== null && pgatourData.bogAvd !== undefined ? Number(pgatourData.bogAvd.toFixed(2)) : null,
                    par3Scoring: pgatourData.par3Scoring !== null && pgatourData.par3Scoring !== undefined ? Number(pgatourData.par3Scoring.toFixed(2)) : null,
                    par4Scoring: pgatourData.par4Scoring !== null && pgatourData.par4Scoring !== undefined ? Number(pgatourData.par4Scoring.toFixed(2)) : null,
                    par5Scoring: pgatourData.par5Scoring !== null && pgatourData.par5Scoring !== undefined ? Number(pgatourData.par5Scoring.toFixed(2)) : null,
                    prox: pgatourData.prox !== null && pgatourData.prox !== undefined ? Number(pgatourData.prox.toFixed(2)) : null,
                    roughProx: pgatourData.roughProx !== null && pgatourData.roughProx !== undefined ? Number(pgatourData.roughProx.toFixed(2)) : null,
                    puttingBob: pgatourData.puttingBob !== null && pgatourData.puttingBob !== undefined ? Number(pgatourData.puttingBob.toFixed(2)) : null,
                    threePuttAvd: pgatourData.threePuttAvd !== null && pgatourData.threePuttAvd !== undefined ? Number(pgatourData.threePuttAvd.toFixed(2)) : null,
                    bonusPutt: pgatourData.bonusPutt !== null && pgatourData.bonusPutt !== undefined ? Number(pgatourData.bonusPutt.toFixed(2)) : null,
                    // Add other fields as needed
                };

                // Returns all of this data in cumulation as a list of dicts in dataTableData
                return {
                    player,
                    fdSalary,
                    dkSalary,
                    ...filteredPgatourData
                };
            } else {
                // Set pgatour data for the player as null because player doesn't have data.
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

                // Returns all of this data in cumulation as a list of dicts in dataTableData
                return {
                    player,
                    fdSalary,
                    dkSalary,
                    ...filteredPgatourData
                };
            }
        }).filter(Boolean);

        function customComparator(valueA, valueB) {
            if (valueA === null && valueB === null) {
              return 0; // If both values are null, consider them equal
            }
          
            if (valueA === null) {
              return 1; // If valueA is null, consider it greater
            }
          
            if (valueB === null) {
              return -1; // If valueB is null, consider it greater
            }
          
            // Compare non-null values as usual
            if (valueA > valueB) {
              return 1;
            } else if (valueA < valueB) {
              return -1;
            }
          
            return 0; // If values are equal
          }

        let columnDefs = [
            // Player Info grouping
            {
                headerName: 'Player Info',
                children: [
                    { headerName: 'Player', field: 'player', pinned: 'left'},
                    { headerName: 'FD Salary', field: 'fdSalary', pinned: 'left' },
                    { headerName: 'DK Salary', field: 'dkSalary', pinned: 'left' },
                ],
            },
            // SG PGATOUR.COM grouping
            {
                headerName: 'SG PGATOUR.COM',
                children: [
                    { headerName: 'SG: Putt', field: 'sgPuttPGA', hide: false },
                    { headerName: 'SG: Arg', field: 'sgArgPGA', hide: false },
                    { headerName: 'SG: App', field: 'sgAppPGA', hide: false },
                    { headerName: 'SG: Ott', field: 'sgOttPGA', hide: false},
                    { headerName: 'SG: T2G', field: 'sgT2GPGA', hide: false },
                    { headerName: 'SG: Tot', field: 'sgTotPGA', hide: false },
                ],
            },
            // Other Stats grouping
            {
                headerName: 'Other Stats',
                children: [
                    { headerName: 'Dr. Dist.', field: 'drDist', hide: false },
                    { headerName: 'Dr. Acc.', field: 'drAcc', hide: false },
                    { headerName: 'GIR %', field: 'gir', hide: true },
                    { headerName: 'Sand Save %', field: 'sandSave', hide: true },
                    { headerName: 'Scrambling %', field: 'scrambling', hide: true },
                    { headerName: 'App. 50-75', field: 'app50_75', hide: true, comparator: customComparator },
                    { headerName: 'App. 75-100', field: 'app75_100', hide: true, comparator: customComparator },
                    { headerName: 'App. 100-125', field: 'app100_125', hide: true, comparator: customComparator },
                    { headerName: 'App. 125-150', field: 'app125_150', hide: true, comparator: customComparator },
                    { headerName: 'App. 150-175', field: 'app150_175', hide: true, comparator: customComparator },
                    { headerName: 'App. 175-200', field: 'app175_200', hide: true, comparator: customComparator },
                    { headerName: 'App. 200+', field: 'app200_up', hide: true, comparator: customComparator },
                    { headerName: 'BoB %', field: 'bob', hide: false },
                    { headerName: 'Bogey Avd.', field: 'bogAvd', hide: true, comparator: customComparator },
                    { headerName: 'Par 3s Avg', field: 'par3Scoring', hide: true, comparator: customComparator },
                    { headerName: 'Par 4s Avg', field: 'par4Scoring', hide: true, comparator: customComparator },
                    { headerName: 'Par 5s Avg', field: 'par5Scoring', hide: true, comparator: customComparator },
                    { headerName: 'Prox.', field: 'prox', hide: true, comparator: customComparator },
                    { headerName: 'Rough Prox.', field: 'roughProx', hide: true, comparator: customComparator },
                    { headerName: 'Putt. BoB %', field: 'puttingBob', hide: true },
                    { headerName: '3-Putt Avd.', field: 'threePuttAvd', hide: true, comparator: customComparator },
                    { headerName: 'Bonus Putt', field: 'bonusPutt', hide: true },
                ],
            }
        ];

        // Function to calculate quantiles for a given array of values, ignoring nulls
        function calculateQuantiles(values) {
            // Filter out null values
            const filteredValues = values.filter(value => value !== null);
        
            // If there are no non-null values, return an empty result
            if (filteredValues.length === 0) {
            return {};
            }
        
            // Sort the non-null values
            filteredValues.sort((a, b) => a - b);
        
            // Define quantiles
            const quantiles = [0.25, 0.5, 0.75, 1];
        
            // Calculate quantile values
            const result = {};
            quantiles.forEach((q) => {
            const index = Math.floor(q * (filteredValues.length - 1));
            result[q] = filteredValues[index];
            });
        
            return result;
        }

        // List of columns where you want to reverse the color scale
        const columnsWithReversedOrder  = ['app50_75','app75_100',
        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bogAvd', 'par3Scoring',
        'par4Scoring', 'par5Scoring', 'prox', 'roughProx', 'threePuttAvd'];

        // Function to render emoji in cells
        function emojiCellRenderer(params, quantiles, columnsWithReversedOrder) {
            const value = params.value;

            // Check if the value is null
            if (value === null) {
                return ''; // Return an empty string for null values
            }

            // Assign emoji based on quantile
            let emoji;
            
            // Check if the column is in the list and whether to reverse the order
            const reverseOrder = columnsWithReversedOrder.includes(params.colDef.field);
            if (reverseOrder) {
                if (value < quantiles[0.25]) {
                    emoji = '🟢'; // Green flag emoji
                } else if (value < quantiles[0.5]) {
                    emoji = '🟡';
                } else if (value < quantiles[0.75]) {
                    emoji = '🟠';
                } else {
                    emoji = '🚩'; // Red flag emoji
                }
            } else {
                if (value < quantiles[0.25]) {
                    emoji = '🚩'; // Red flag emoji
                } else if (value < quantiles[0.5]) {
                    emoji = '🟠';
                } else if (value < quantiles[0.75]) {
                    emoji = '🟡';
                } else {
                    emoji = '🟢'; // Green flag emoji
                }
            }

            // Return the emoji along with the original value
            return `<span title="${value}">${emoji} ${value}</span>`;
        }


        columnDefs.forEach((group) => {
            if (group.children) {
                group.children.forEach((column) => {
                    const columnName = column.field;
                    
                    // Check if the column is not one of the specified exceptions
                    if (columnName !== 'player' && columnName !== 'fdSalary' && columnName !== 'dkSalary') {
                        // Calculate quantiles for the current column
                        const columnQuantiles = calculateQuantiles(dataTableData.map(row => row[columnName]));
        
                        // Apply emojiCellRenderer to the current column
                        column.cellRenderer = (params) => emojiCellRenderer(params, columnQuantiles, columnsWithReversedOrder);
                    }
                });
            }
        });
        
          

        function clearCheatSheetContent() {
            /*
                Clears the content of the cheatSheet.
            */
            const cheatSheet = document.getElementById('flagSheet');
            if (cheatSheet) {
                cheatSheet.innerHTML = ''; // Clear content
            }
        };

        function initializeCheatSheet() {
            /*
                clears cheat sheet if already initialized

                builds up grid options - specifies column defs, row data,...
                
                creates the grid and puts it in #cheatSheet
            */
            if (isFlagSheetInitialized) {
                clearCheatSheetContent();
            }
    
            // setup grid options
            const gridOptions = {
                columnDefs: columnDefs,
                rowData: dataTableData,
                suppressColumnVirtualisation: true,  // allows auto resize of non-visible cols
                onFirstDataRendered: function (params) {
                    console.log('grid is ready');
                    params.api.autoSizeAllColumns();
                    setupColumnVisibilityDropdown(columnDefs); // TODO
                },
                getRowHeight: function(params) {
                    // return the desired row height in pixels
                    return 25; // adjust this value based on your preference
                },
                headerHeight: 30,
            };

            console.log('Column Definitions:', gridOptions.columnDefs);
    
            // Create the grid using createGrid
            gridApiFlag = agGrid.createGrid(document.querySelector('#flagSheet'), gridOptions);
            isFlagSheetInitialized = true;
        }

        function setupColumnVisibilityDropdown(columnDefs) {
            // Handles the setup of the column visibility dropdown
            const checkboxContainer = document.getElementById('checkboxContainerFL'); // container of the checkboxes
        
            if (!checkboxContainer) {
                console.error('Checkbox container not found');
                return;
            }
        
            // Clear the checkbox container if it is not initially empty
            if (checkboxContainer.hasChildNodes()) {
                checkboxContainer.innerHTML = '';
            }
        
            // Check if columnDefs is an array and not empty
            if (Array.isArray(columnDefs) && columnDefs.length > 0) {
                columnDefs.forEach(group => { // for each group in column defs
                    if (group.children) {
        
                        // Create group checkbox, label, add it to container
                        const groupCheckbox = document.createElement('input');
                        groupCheckbox.type = 'checkbox';
                        groupCheckbox.id = group.headerName + '_group';
                        groupCheckbox.checked = !group.children.every(col => col.hide); // If any child col visible, check this
                        groupCheckbox.classList.add('group-checkbox'); // Add class for easier targeting
        
                        const groupLabel = document.createElement('label');
                        groupLabel.htmlFor = group.headerName + '_group';
                        groupLabel.appendChild(document.createTextNode(group.headerName));
                        groupLabel.classList.add('group-label'); // Add class to make the font bold
        
                        checkboxContainer.appendChild(groupCheckbox);
                        checkboxContainer.appendChild(groupLabel);
                        checkboxContainer.appendChild(document.createElement('br'));
        
                        // For each child within the group
                        group.children.forEach(column => {
                            // Create checkbox, label, add it to checkbox container.
                            const checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            checkbox.id = column.field;
                            checkbox.checked = !column.hide; // Checked if column is not hidden
        
                            const label = document.createElement('label');
                            label.htmlFor = column.field;
                            label.appendChild(document.createTextNode(column.headerName));
        
                            checkboxContainer.appendChild(checkbox);
                            checkboxContainer.appendChild(label);
                            checkboxContainer.appendChild(document.createElement('br'));
        
                            // Add event listener to column checkbox to update group checkbox and column visibility
                            checkbox.addEventListener('change', function () {
                                const allColumnsHidden = group.children.every(col => col.hide);
                                groupCheckbox.checked = !allColumnsHidden;
        
                                const column = gridApiFlag.getColumn(checkbox.id);
                                if (column) {
                                    column.hide = !checkbox.checked;
                                    //gridApi.setColumnDefs(gridApi.getColumnDefs());
                                    gridApiFlag.updateGridOptions({ columnDefs: gridApiFlag.getColumnDefs() });
                                }
                            });
                        });
        
                        // Add event listener to group checkbox to toggle visibility of group columns
                        groupCheckbox.addEventListener('change', function () {
                            group.children.forEach(col => {
                                col.hide = !groupCheckbox.checked;
                                const colCheckbox = document.getElementById(col.field);
                                colCheckbox.checked = groupCheckbox.checked;
                            });
                            gridApiFlag.updateGridOptions({ columnDefs: gridApiFlag.getColumnDefs() });
                        });
                    }
                });
            } else {
                console.error('Invalid or empty columnDefs array');
            }
        }

        window.applyColumnVisibility = function () {
            // called on click of apply col vis, sets checked cols to visible!
            console.log('applying col vis');
        
            const checkboxes = document.querySelectorAll('#checkboxContainerFL input');
            const applyButton = document.getElementById('applyColVisFL');
        
            const columnsToUpdate = [];
        
            checkboxes.forEach(checkbox => {
                const column = gridApiFlag.getColumn(checkbox.id);
                if (column) {
                    // If checkbox is checked, show the column; if unchecked, hide the column
                    columnsToUpdate.push({ column, visible: checkbox.checked });
                } else {
                    console.warn(`Column with field '${checkbox.id}' not found`);
                }
            });
        
            // Set visibility and hide properties for each column
            columnsToUpdate.forEach(({ column, visible }) => {
                column.setVisible(visible);
                column.getColDef().hide = !visible;
            });
        
            // Set the new columnDefs using setGridOption
            gridApiFlag.setGridOption('columnDefs', gridApiFlag.getColumnDefs());
        
            // Auto-size all columns
            gridApiFlag.autoSizeAllColumns();
        
            // Hide the "Apply" button after applying column visibility changes
            if (applyButton) {
                applyButton.style.display = 'none';
            }
        
            // Collapse the checkboxContainer after applying column visibility changes
            const checkboxContainer = document.getElementById('checkboxContainerFL');
            if (checkboxContainer) {
                checkboxContainer.style.height = '0';
                checkboxContainer.style.overflowY = 'hidden';
            }
        };

        window.toggleColumnVisibility = function () {
            // toggles visibility of the checkbox container
            const checkboxContainer = document.getElementById('checkboxContainerFL');
            const applyButton = document.getElementById('applyColVisFL');

            if (checkboxContainer && applyButton) {
                console.log('in if');
                const isExpanded = checkboxContainer.style.height === 'auto' || checkboxContainer.style.height === '150px';
                console.log('is expanded', isExpanded);
                checkboxContainer.style.height = isExpanded ? '0' : '150px';
                checkboxContainer.style.overflowY = isExpanded ? 'hidden' : 'auto';
                applyButton.style.display = isExpanded ? 'none' : 'inline-block';
            }
        };

        /*
            For hovering the entire row - considering we have pinned rows...
        */
        document.addEventListener('DOMContentLoaded', function () {
            const cheatSheet = document.getElementById('cheatSheet');
            
            cheatSheet.addEventListener('mouseover', function (event) {
                const targetRow = event.target.closest('.ag-row');
                if (targetRow) {
                targetRow.classList.add('ag-row-hover');
                }
            });
            
            cheatSheet.addEventListener('mouseout', function (event) {
                const targetRow = event.target.closest('.ag-row');
                if (targetRow) {
                targetRow.classList.remove('ag-row-hover');
                }
            });
            });

        initializeCheatSheet();
    })
    .catch((error) => {
        console.log('Error: ', error.message);
    })
}

function onFilterTextBoxChangedFlag() {
    // the function for the search box which filters the table 
    // based on 'filter-text-box' for gridApi grid
    gridApiFlag.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box-flag').value
    );
}

let isModelSheetInitialized = false;
let gridApiModel;
let gridOptionsModel;
let savedData;

function loadModelResults() {
    // PGA Tour SG Stats
    let sgPuttPGAinput = document.getElementById('sgPuttPGAinput').value;
    let sgAppPGAinput = document.getElementById('sgAppPGAinput').value;
    let sgT2GPGAinput = document.getElementById('sgT2GPGAinput').value;
    let sgArgPGAinput = document.getElementById('sgArgPGAinput').value;
    let sgOttPGAinput = document.getElementById('sgOttPGAinput').value;
    let sgTotPGAinput = document.getElementById('sgTotPGAinput').value;

    // SG Last 12 Rds
    let sgPutt12input = document.getElementById('sgPutt12input').value;
    let sgApp12input = document.getElementById('sgApp12input').value;
    let sgT2G12input = document.getElementById('sgT2G12input').value;
    let sgArg12input = document.getElementById('sgArg12input').value;
    let sgOtt12input = document.getElementById('sgOtt12input').value;
    let sgTot12input = document.getElementById('sgTot12input').value;

    // SG Last 24 Rds
    let sgPutt24input = document.getElementById('sgPutt24input').value;
    let sgApp24input = document.getElementById('sgApp24input').value;
    let sgT2G24input = document.getElementById('sgT2G24input').value;
    let sgArg24input = document.getElementById('sgArg24input').value;
    let sgOtt24input = document.getElementById('sgOtt24input').value;
    let sgTot24input = document.getElementById('sgTot24input').value;

    // SG Last 36 Rds
    let sgPutt36input = document.getElementById('sgPutt36input').value;
    let sgApp36input = document.getElementById('sgApp36input').value;
    let sgT2G36input = document.getElementById('sgT2G36input').value;
    let sgArg36input = document.getElementById('sgArg36input').value;
    let sgOtt36input = document.getElementById('sgOtt36input').value;
    let sgTot36input = document.getElementById('sgTot36input').value;

    // SG Last 50 Rds
    let sgPutt50input = document.getElementById('sgPutt50input').value;
    let sgApp50input = document.getElementById('sgApp50input').value;
    let sgT2G50input = document.getElementById('sgT2G50input').value;
    let sgArg50input = document.getElementById('sgArg50input').value;
    let sgOtt50input = document.getElementById('sgOtt50input').value;
    let sgTot50input = document.getElementById('sgTot50input').value;

    // Other Stats
    let drDist = document.getElementById('drDist').value;
    let bob = document.getElementById('bob').value;
    let sandSave = document.getElementById('sandSave').value;
    let par3scoring = document.getElementById('par3scoring').value;
    let par5scoring = document.getElementById('par5scoring').value;
    let prox = document.getElementById('prox').value;
    let app50_75 = document.getElementById('app50_75').value;
    let app100_125 = document.getElementById('app100_125').value;
    let app150_175 = document.getElementById('app150_175').value;
    let app200_up = document.getElementById('app200_up').value;
    let bonusPutt = document.getElementById('bonusPutt').value;
    let drAcc = document.getElementById('drAcc').value;
    let bogAvd = document.getElementById('bogAvd').value;
    let scrambling = document.getElementById('scrambling').value;
    let par4scoring = document.getElementById('par4scoring').value;
    let gir = document.getElementById('gir').value;
    let roughProx = document.getElementById('roughProx').value;
    let app75_100 = document.getElementById('app75_100').value;
    let app125_150 = document.getElementById('app125_150').value;
    let app175_200 = document.getElementById('app175_200').value;
    let puttingBob = document.getElementById('puttingBob').value;
    let threePuttAvd = document.getElementById('threePuttAvd').value;
    let courseHistoryInput = document.getElementById('courseHistory').value;


    let url = '/get/modelSheet/';

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) =>{
        // X - START
        console.log('jsonData: ', jsonData);

        // Ensure that all parts of the jsonData are there.
        if (!jsonData.salaries || !jsonData.pgatour || !jsonData.courseHistory || !jsonData.tournamentRow) {
            console.log('Invalid data format. Expected "salaries", "pgatour", "courseHistory", and "tournamentRow" properties.');
            return;
        }

        /*
            EXTRACT DATA FOR DATATABLE:

            - jsonData.salaries.map iterates over each element in salaries array.

            - for each element, provided function inside map is executed

            - (salary) is the individual row from salaries
        */
        let dataTableData = jsonData.salaries.map((salary) => {
            let player = salary.player;
            let fdSalary = salary.fdSalary;
            let dkSalary = salary.dkSalary;

            // SG: PGATOUR.COM
            // Find a matching player in pgatour
            let pgatourData = jsonData.pgatour.find((pgatour) => pgatour.player === player);

            // COURSE HISTORY
            // Find matching player in courseHistory
            let courseHistoryData = jsonData.courseHistory.find((courseHistory) => courseHistory.player === player);

            // If no player is found in course history, default all course history.
            if (!courseHistoryData) {
                const courseHistoryKeys = ['minus1', 'minus2', 'minus3', 'minus4', 'minus5'];
                courseHistoryData = Object.fromEntries(courseHistoryKeys.map(key => [key, null]));
            }



            //12, 24, 36, 50

            // SG: LAST 12 ROUNDS
            // Find all rounds for player in tournamentRow, order by 'dates' and 'Round' in descending order
            let playerRounds12 = jsonData.tournamentRow.filter((round) => round.player === player)
                .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
                .slice(0, 12); // Grab at most the specified number of rounds

            // Calculate the average of specific columns for the player's rounds
            let avgRoundData12 = {};

            if (playerRounds12.length > 0 ) { // can change to ensure minimum # rounds for calc
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    let averageValue = playerRounds12.reduce((sum, round) => sum + round[col], 0) / playerRounds12.length;
                    avgRoundData12[`${col}12`] = Number(averageValue.toFixed(2));
                });
            } else { // Set values to null if no rounds are found
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    avgRoundData12[`${col}12`] = null;
                });
            }

            // SG: LAST 24 ROUNDS
            // Find all rounds for player in tournamentRow, order by 'dates' and 'Round' in descending order
            let playerRounds24 = jsonData.tournamentRow.filter((round) => round.player === player)
                .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
                .slice(0, 24); // Grab at most the specified number of rounds

            // Calculate the average of specific columns for the player's rounds
            let avgRoundData24 = {};

            if (playerRounds24.length > 0 ) { // can change to ensure minimum # rounds for calc
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    let averageValue = playerRounds24.reduce((sum, round) => sum + round[col], 0) / playerRounds24.length;
                    avgRoundData24[`${col}24`] = Number(averageValue.toFixed(2));
                });
            } else { // Set values to null if no rounds are found
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    avgRoundData24[`${col}24`] = null;
                });
            }

            // SG: LAST 36 ROUNDS
            // Find all rounds for player in tournamentRow, order by 'dates' and 'Round' in descending order
            let playerRounds36 = jsonData.tournamentRow.filter((round) => round.player === player)
                .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
                .slice(0, 36); // Grab at most the specified number of rounds

            // Calculate the average of specific columns for the player's rounds
            let avgRoundData36 = {};

            if (playerRounds36.length > 0 ) { // can change to ensure minimum # rounds for calc
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    let averageValue = playerRounds36.reduce((sum, round) => sum + round[col], 0) / playerRounds36.length;
                    avgRoundData36[`${col}36`] = Number(averageValue.toFixed(2));
                });
            } else { // Set values to null if no rounds are found
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    avgRoundData36[`${col}36`] = null;
                });
            }

            // SG: LAST 50 ROUNDS
            // Find all rounds for player in tournamentRow, order by 'dates' and 'Round' in descending order
            let playerRounds50 = jsonData.tournamentRow.filter((round) => round.player === player)
                .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
                .slice(0, 50); // Grab at most the specified number of rounds

            // Calculate the average of specific columns for the player's rounds
            let avgRoundData50 = {};

            if (playerRounds50.length > 0 ) { // can change to ensure minimum # rounds for calc
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    let averageValue = playerRounds50.reduce((sum, round) => sum + round[col], 0) / playerRounds50.length;
                    avgRoundData50[`${col}50`] = Number(averageValue.toFixed(2));
                });
            } else { // Set values to null if no rounds are found
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                columnsToAverage.forEach((col) => {
                    avgRoundData50[`${col}50`] = null;
                });
            }

            // RECENT HISTORY
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

            // Step 4: Compile Recent History Data for Player
            /*
                For each recent tournament, search thru sortedTournamentRow, find all entries where the entry has the
                current player and the tournament is the current tournament.

                If entry was found, return the finish from the entry, otherwise return null.
            */
            let recentHistory = recentTournaments.map(tournament => {
                let entry = sortedTournamentRow.find(entry => entry.player === player && entry.tournament === tournament);
                return entry ? entry.finish : null;
            });

            // If recentHistory does not have 10 entries, fill it with null.
            while (recentHistory.length < 10) {
                recentHistory.push(null);
            }

            /*
                Step 5: Generate Finish Data for Recent Tournaments with Abbreviations

                reduce iterates over each 'tournament' in recent tournaments

                'finishData' is what 'accumulates' or gains data over iteration

                'tournament' is the current element in the array

                'index' is the current index in the array

                Finds a tournament in sorted tournament matching current tournament and player
                Gets the abbreviation for this tournament
                adds to 'finishData' the finish if an entry is found, otherwise null
                returns this 'finishData'
            */
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
                // If player in pgatour data, add pga tour data
                // FIXED BUG - checked for missing indv stats here...
                let filteredPgatourData = {
                    sgPuttPGA: pgatourData.sgPutt !== null && pgatourData.sgPutt !== undefined ? Number(pgatourData.sgPutt.toFixed(2)) : null,
                    sgArgPGA: pgatourData.sgArg !== null && pgatourData.sgArg !== undefined ? Number(pgatourData.sgArg.toFixed(2)) : null,
                    sgAppPGA: pgatourData.sgApp !== null && pgatourData.sgApp !== undefined ? Number(pgatourData.sgApp.toFixed(2)) : null,
                    sgOttPGA: pgatourData.sgOtt !== null && pgatourData.sgOtt !== undefined ? Number(pgatourData.sgOtt.toFixed(2)) : null,
                    sgT2GPGA: pgatourData.sgT2G !== null && pgatourData.sgT2G !== undefined ? Number(pgatourData.sgT2G.toFixed(2)) : null,
                    sgTotPGA: pgatourData.sgTot !== null && pgatourData.sgTot !== undefined ? Number(pgatourData.sgTot.toFixed(2)) : null,
                    drDist: pgatourData.drDist !== null && pgatourData.drDist !== undefined ? Number(pgatourData.drDist.toFixed(2)) : null,
                    drAcc: pgatourData.drAcc !== null && pgatourData.drAcc !== undefined ? Number(pgatourData.drAcc.toFixed(2)) : null,
                    gir: pgatourData.gir !== null && pgatourData.gir !== undefined ? Number(pgatourData.gir.toFixed(2)) : null,
                    sandSave: pgatourData.sandSave !== null && pgatourData.sandSave !== undefined ? Number(pgatourData.sandSave.toFixed(2)) : null,
                    scrambling: pgatourData.scrambling !== null && pgatourData.scrambling !== undefined ? Number(pgatourData.scrambling.toFixed(2)) : null,
                    app50_75: pgatourData.app50_75 !== null && pgatourData.app50_75 !== undefined ? Number(pgatourData.app50_75.toFixed(2)) : null,
                    app75_100: pgatourData.app75_100 !== null && pgatourData.app75_100 !== undefined ? Number(pgatourData.app75_100.toFixed(2)) : null,
                    app100_125: pgatourData.app100_125 !== null && pgatourData.app100_125 !== undefined ? Number(pgatourData.app100_125.toFixed(2)) : null,
                    app125_150: pgatourData.app125_150 !== null && pgatourData.app125_150 !== undefined ? Number(pgatourData.app125_150.toFixed(2)) : null,
                    app150_175: pgatourData.app150_175 !== null && pgatourData.app150_175 !== undefined ? Number(pgatourData.app150_175.toFixed(2)) : null,
                    app175_200: pgatourData.app175_200 !== null && pgatourData.app175_200 !== undefined ? Number(pgatourData.app175_200.toFixed(2)) : null,
                    app200_up: pgatourData.app200_up !== null && pgatourData.app200_up !== undefined ? Number(pgatourData.app200_up.toFixed(2)) : null,
                    bob: pgatourData.bob !== null && pgatourData.bob !== undefined ? Number(pgatourData.bob.toFixed(2)) : null,
                    bogAvd: pgatourData.bogAvd !== null && pgatourData.bogAvd !== undefined ? Number(pgatourData.bogAvd.toFixed(2)) : null,
                    par3Scoring: pgatourData.par3Scoring !== null && pgatourData.par3Scoring !== undefined ? Number(pgatourData.par3Scoring.toFixed(2)) : null,
                    par4Scoring: pgatourData.par4Scoring !== null && pgatourData.par4Scoring !== undefined ? Number(pgatourData.par4Scoring.toFixed(2)) : null,
                    par5Scoring: pgatourData.par5Scoring !== null && pgatourData.par5Scoring !== undefined ? Number(pgatourData.par5Scoring.toFixed(2)) : null,
                    prox: pgatourData.prox !== null && pgatourData.prox !== undefined ? Number(pgatourData.prox.toFixed(2)) : null,
                    roughProx: pgatourData.roughProx !== null && pgatourData.roughProx !== undefined ? Number(pgatourData.roughProx.toFixed(2)) : null,
                    puttingBob: pgatourData.puttingBob !== null && pgatourData.puttingBob !== undefined ? Number(pgatourData.puttingBob.toFixed(2)) : null,
                    threePuttAvd: pgatourData.threePuttAvd !== null && pgatourData.threePuttAvd !== undefined ? Number(pgatourData.threePuttAvd.toFixed(2)) : null,
                    bonusPutt: pgatourData.bonusPutt !== null && pgatourData.bonusPutt !== undefined ? Number(pgatourData.bonusPutt.toFixed(2)) : null,
                    // Add other fields as needed
                };                

                // Returns all of this data in cumulation as a list of dicts in dataTableData
                return {
                    player,
                    fdSalary,
                    dkSalary,
                    ...filteredPgatourData,
                    ...courseHistoryData, // Include course history data
                    ...avgRoundData12, // Include average round data
                    ...avgRoundData24,
                    ...avgRoundData36,
                    ...avgRoundData50,
                    ...recentHistory.reduce((result, finish, index) => {
                        result[`recent${index + 1}`] = finish;
                        return result;
                    }, {}),
                    ...recentFinishData, // Include finish data for recent tournaments
                    tournamentAbbreviations, // Include tournament abbreviations
                };
            } else {
                // Set pgatour data for the player as null because player doesn't have data.
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

                // Returns all of this data in cumulation as a list of dicts in dataTableData
                return {
                    player,
                    fdSalary,
                    dkSalary,
                    ...filteredPgatourData,
                    ...courseHistoryData, // Include course history data
                    ...avgRoundData12, // Include average round data
                    ...avgRoundData24,
                    ...avgRoundData36,
                    ...avgRoundData50,
                    ...recentHistory.reduce((result, finish, index) => {
                        result[`recent${index + 1}`] = finish;
                        return result;
                    }, {}),
                    ...recentFinishData, // Include finish data for recent tournaments
                    tournamentAbbreviations, // Include tournament abbreviations
                };
            }
        }).filter(Boolean); // Remove null entries

        dataTableData.forEach(playerData => {
            // Extract the relevant stats for chAvg calculation
            let statsToAverage = ['minus1', 'minus2', 'minus3', 'minus4', 'minus5'];
        
            // Filter out null values and convert to numbers
            let validStats = statsToAverage.map(stat => {
                let statValue = playerData[stat];
                return statValue !== null ? parseFloat(statValue) : null;
            });
        
            // Filter out null values and calculate the average
            let filteredStats = validStats.filter(stat => stat !== null);
            let filterNaNs = filteredStats.filter(value => !Number.isNaN(value));
            let chAvg = filterNaNs.length > 0 ? Number((filterNaNs.reduce((sum, stat) => sum + stat, 0) / filterNaNs.length).toFixed(2)) : null;
            if(Number.isNaN(chAvg)){
                chAvg = null;
            }
        
            // Add chAvg to playerData
            playerData['chAvg'] = chAvg;
        });
        
        // Define the fields for which you want to calculate z-scores
        const zScoreFields = [
            'sgPutt12', 'sgArg12', 'sgApp12', 'sgOtt12', 'sgT2G12', 'sgTot12',
            'sgPutt24', 'sgArg24', 'sgApp24', 'sgOtt24', 'sgT2G24', 'sgTot24',
            'sgPutt36', 'sgArg36', 'sgApp36', 'sgOtt36', 'sgT2G36', 'sgTot36',
            'sgPutt50', 'sgArg50', 'sgApp50', 'sgOtt50', 'sgT2G50', 'sgTot50',
            'sgPuttPGA', 'sgArgPGA', 'sgAppPGA', 'sgOttPGA', 'sgT2GPGA', 'sgTotPGA',
            'drDist', 'drAcc', 'gir', 'sandSave', 'scrambling', 'app50_75',
            'app75_100', 'app100_125', 'app125_150', 'app150_175', 'app175_200',
            'app200_up', 'bob', 'bogAvd', 'par3Scoring', 'par4Scoring', 'par5Scoring',
            'prox', 'roughProx', 'puttingBob', 'threePuttAvd', 'bonusPutt', 'chAvg', 'fdSalary', 'dkSalary'
        ];

        // Calculate mean and standard deviation for each stat
        let statSums = {}; // This is the issue !!
        let statSumsSquared = {};
        let statCounts = {};

        // Iterate through data to calculate sums and counts
        dataTableData.forEach((playerData) => {
            Object.keys(playerData).forEach((stat) => {
                // Check if the field is in the zScoreFields array
                if (zScoreFields.includes(stat) && typeof playerData[stat] === 'number' && playerData[stat] !== null && !Number.isNaN(playerData[stat])) {
                    if (!statSums[stat]) statSums[stat] = 0;
                    if (!statSumsSquared[stat]) statSumsSquared[stat] = 0;
                    if (!statCounts[stat]) statCounts[stat] = 0;

                    statSums[stat] += playerData[stat];
                    statSumsSquared[stat] += Math.pow(playerData[stat], 2);
                    statCounts[stat]++;
                }
            });
        });

        // Calculate mean and standard deviation
        let statMeans = {};
        let statStdDevs = {};

        Object.keys(statSums).forEach((stat) => {
            statMeans[stat] = statSums[stat] / statCounts[stat];
            statStdDevs[stat] = Math.sqrt((statSumsSquared[stat] / statCounts[stat]) - Math.pow(statMeans[stat], 2));
            if(stat == 'chAvg'){
                console.log('sum: ', statSums[stat]);
                console.log('count: ', statCounts[stat]);
                console.log('stat: ', stat, 'mean : ', statMeans[stat], 'std dev: ', statStdDevs[stat]);
            }
        });

        // Compute z-score for each data point
        dataTableData.forEach((playerData) => {
            Object.keys(playerData).forEach((stat) => {
                // Check if the field is in the zScoreFields array and is a number
                if (zScoreFields.includes(stat)){
                    if (typeof playerData[stat] === 'number' && !Number.isNaN(playerData[stat])) {
                        // Calculate z-score for the current stat
                        let zScore = playerData[stat] !== null
                            ? (playerData[stat] - statMeans[stat]) / statStdDevs[stat]
                            : null;
    
                        // Add z-score to playerData
                        playerData[`${stat}_zScore`] = zScore;
                    } else {
                        playerData[`${stat}_zScore`] = null;
                    }
                }
            });
        });

        function normalCDF(mean, sigma, to) {
            var z = (to-mean)/Math.sqrt(2*sigma*sigma);
            var t = 1/(1+0.3275911*Math.abs(z));
            var a1 =  0.254829592;
            var a2 = -0.284496736;
            var a3 =  1.421413741;
            var a4 = -1.453152027;
            var a5 =  1.061405429;
            var erf = 1-(((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-z*z);
            var sign = 1;
            if(z < 0)
            {
                sign = -1;
            }
            return (1/2)*(1+sign*erf);
        }

        let weightDict = {
            // PGA Tour SG Stats
            'sgPuttPGA': sgPuttPGAinput,
            'sgAppPGA': sgAppPGAinput,
            'sgT2GPGA': sgT2GPGAinput,
            'sgArgPGA': sgArgPGAinput,
            'sgOttPGA': sgOttPGAinput,
            'sgTotPGA': sgTotPGAinput,
        
            // SG Last 12 Rds
            'sgPutt12': sgPutt12input,
            'sgApp12': sgApp12input,
            'sgT2G12': sgT2G12input,
            'sgArg12': sgArg12input,
            'sgOtt12': sgOtt12input,
            'sgTot12': sgTot12input,
        
            // SG Last 24 Rds
            'sgPutt24': sgPutt24input,
            'sgApp24': sgApp24input,
            'sgT2G24': sgT2G24input,
            'sgArg24': sgArg24input,
            'sgOtt24': sgOtt24input,
            'sgTot24': sgTot24input,
        
            // SG Last 36 Rds
            'sgPutt36': sgPutt36input,
            'sgApp36': sgApp36input,
            'sgT2G36': sgT2G36input,
            'sgArg36': sgArg36input,
            'sgOtt36': sgOtt36input,
            'sgTot36': sgTot36input,
        
            // SG Last 50 Rds
            'sgPutt50': sgPutt50input,
            'sgApp50': sgApp50input,
            'sgT2G50': sgT2G50input,
            'sgArg50': sgArg50input,
            'sgOtt50': sgOtt50input,
            'sgTot50': sgTot50input,
        
            // Other Stats
            'drDist': drDist,
            'bob': bob,
            'sandSave': sandSave,
            'par3Scoring': par3scoring,
            'par5Scoring': par5scoring,
            'prox': prox,
            'app50_75': app50_75,
            'app100_125': app100_125,
            'app150_175': app150_175,
            'app200_up': app200_up,
            'bonusPutt': bonusPutt,
            'drAcc': drAcc,
            'bogAvd': bogAvd,
            'scrambling': scrambling,
            'par4Scoring': par4scoring,
            'gir': gir,
            'roughProx': roughProx,
            'app75_100': app75_100,
            'app125_150': app125_150,
            'app175_200': app175_200,
            'puttingBob': puttingBob,
            'threePuttAvd': threePuttAvd,
            'chAvg': courseHistoryInput
        };

        console.log('weightDict: ', weightDict);

        const reverseStats = ['app50_75','app75_100',
        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bogAvd', 'par3Scoring',
        'par4Scoring', 'par5Scoring', 'prox', 'roughProx', 'threePuttAvd', 'chAvg'];

        let testPlayer = 'Padraig Harrington';
        console.log('Player: ', testPlayer);
        
        dataTableData.forEach((playerData) =>{
            let ratingSum = 0;
            let weightSum = 0;

            let statLog = {};
            for (let key in weightDict){
                let zScore = playerData[`${key}_zScore`];
                let weight = parseFloat(weightDict[key]); // Convert weight to a number

                // Check if zScore is not null, not undefined, and weight is not null before incrementing
                if (zScore !== null && zScore !== undefined && weight !== null && weight !== 0 && weight !== '' && !isNaN(weight)) {
                    // Reverse the sign of z-score for stats in reverseStats
                    if (reverseStats.includes(key)) {
                        zScore = -zScore;
                    }
                    
                    ratingSum += zScore * weight;
                    weightSum += weight;

                    if(playerData['player'] == testPlayer){
                        console.log('stat: ',key ,'zscore: ', zScore, 'weight: ', weight, 'mult: ', zScore * weight);
                    }

                    statLog[key] = weight;
                }
            }

            let fullModel = true;
            if(weightSum !== 100){
                fullModel = false;
                let remSum = 100 - weightSum;
                let platformCheck = document.getElementById('platform').value;
                let salZScore;

                if(platformCheck == 'fanduel'){
                    salZScore = playerData['fdSalary_zScore'];
                } else{
                    salZScore = playerData['dkSalary_zScore'];
                }

                ratingSum += salZScore * remSum;
                weightSum += remSum;
            }

            

            // Calculate weighted average rating
            let rating = weightSum !== 0 ? ratingSum / weightSum : null;

            // Calculate the percentile using the CDF of the standard normal distribution
            let percentile;
            if (fullModel == false){
                percentile = rating !== null ? Number((Number((normalCDF(0, 1, rating) * 100).toFixed(2)) - 10).toFixed(2)) : null; // IMPORTANT, can change value of 5 here
            } else {
                percentile = rating !== null ? Number((normalCDF(0, 1, rating) * 100).toFixed(2)) : null;
            }

            if(playerData['player'] == testPlayer){
                console.log('weightsum: ', weightSum, ' rating sum: ', ratingSum);
                console.log('stat log', statLog);
                console.log('rating: ', rating, ' percentile: ', percentile);
            }

            // Calculate fdValue and dkValue
            let fdSalary = playerData['fdSalary']; // Replace with the actual key for FanDuel salary
            let dkSalary = playerData['dkSalary']; // Replace with the actual key for DraftKings salary

            let fdValue = rating !== null && fdSalary !== null ? Number((percentile / (fdSalary / 1000)).toFixed(2)) : null;
            let dkValue = rating !== null && dkSalary !== null ? Number((percentile / (dkSalary / 1000)).toFixed(2)) : null;

            // Add fdValue and dkValue to playerData
            playerData['fdValue'] = fdValue;
            playerData['dkValue'] = dkValue;

            playerData['rating'] = percentile;
        });

        console.log('data table data: ', dataTableData);

        let savePlatform = document.getElementById('platform').value;
        // Save current model data for optimizer
        savedData = dataTableData.map(playerData => ({
            player: playerData.player,
            fdSalary: playerData.fdSalary,
            dkSalary: playerData.dkSalary,
            rating: playerData.rating,
            platform: savePlatform
        }));

        localStorage.setItem('modelData', JSON.stringify(savedData));
    
        console.log('Data saved:', savedData);

        function customComparator(valueA, valueB) {
            if (valueA === null && valueB === null) {
              return 0; // If both values are null, consider them equal
            }
          
            if (valueA === null) {
              return 1; // If valueA is null, consider it greater
            }
          
            if (valueB === null) {
              return -1; // If valueB is null, consider it greater
            }
          
            // Compare non-null values as usual
            if (valueA > valueB) {
              return 1;
            } else if (valueA < valueB) {
              return -1;
            }
          
            return 0; // If values are equal
          }

        // Create column definitions
        let columnDefs = [
            { headerName: 'Player', field: 'player', pinned: 'left'},
            { headerName: 'FD Salary', field: 'fdSalary', pinned: 'left' },
            { headerName: 'DK Salary', field: 'dkSalary', pinned: 'left' },
            { headerName: 'FD Value', field: 'fdValue'},
            { headerName: 'DK Value', field: 'dkValue'},
            {headerName: 'Model Rtg.', field: 'rating', sortable: true, sort: 'desc'},

            { headerName: 'SG: Putt L12', field: 'sgPutt12', hide: true },
            { headerName: 'SG: Arg L12', field: 'sgArg12', hide: true },
            { headerName: 'SG: App L12', field: 'sgApp12', hide: true },
            { headerName: 'SG: Ott L12', field: 'sgOtt12', hide: true },
            { headerName: 'SG: T2G L12', field: 'sgT2G12', hide: true },
            { headerName: 'SG: Tot L12', field: 'sgTot12', hide: true },

            { headerName: 'SG: Putt L24', field: 'sgPutt24', hide: true },
            { headerName: 'SG: Arg L24', field: 'sgArg24', hide: true },
            { headerName: 'SG: App L24', field: 'sgApp24', hide: true },
            { headerName: 'SG: Ott L24', field: 'sgOtt24', hide: true },
            { headerName: 'SG: T2G L24', field: 'sgT2G24', hide: true },
            { headerName: 'SG: Tot L24', field: 'sgTot24', hide: true },

            { headerName: 'SG: Putt L36', field: 'sgPutt36', hide: true },
            { headerName: 'SG: Arg L36', field: 'sgArg36', hide: true },
            { headerName: 'SG: App L36', field: 'sgApp36', hide: true },
            { headerName: 'SG: Ott L36', field: 'sgOtt36', hide: true },
            { headerName: 'SG: T2G L36', field: 'sgT2G36', hide: true },
            { headerName: 'SG: Tot L36', field: 'sgTot36', hide: true },

            { headerName: 'SG: Putt L50', field: 'sgPutt50', hide: true },
            { headerName: 'SG: Arg L50', field: 'sgArg50', hide: true },
            { headerName: 'SG: App L50', field: 'sgApp50', hide: true },
            { headerName: 'SG: Ott L50', field: 'sgOtt50', hide: true },
            { headerName: 'SG: T2G L50', field: 'sgT2G50', hide: true },
            { headerName: 'SG: Tot L50', field: 'sgTot50', hide: true },

            { headerName: 'SG: Putt PGA', field: 'sgPuttPGA', hide: true },
            { headerName: 'SG: Arg PGA', field: 'sgArgPGA', hide: true },
            { headerName: 'SG: App PGA', field: 'sgAppPGA', hide: true },
            { headerName: 'SG: Ott PGA', field: 'sgOttPGA', hide: true},
            { headerName: 'SG: T2G PGA', field: 'sgT2GPGA', hide: true },
            { headerName: 'SG: Tot PGA', field: 'sgTotPGA', hide: true },

            { headerName: 'Dr. Dist.', field: 'drDist', hide: true },
            { headerName: 'Dr. Acc.', field: 'drAcc', hide: true },
            { headerName: 'GIR %', field: 'gir', hide: true },
            { headerName: 'Sand Save %', field: 'sandSave', hide: true },
            { headerName: 'Scrambling %', field: 'scrambling', hide: true },
            { headerName: 'App. 50-75', field: 'app50_75', hide: true, comparator: customComparator },
            { headerName: 'App. 75-100', field: 'app75_100', hide: true, comparator: customComparator },
            { headerName: 'App. 100-125', field: 'app100_125', hide: true, comparator: customComparator },
            { headerName: 'App. 125-150', field: 'app125_150', hide: true, comparator: customComparator },
            { headerName: 'App. 150-175', field: 'app150_175', hide: true, comparator: customComparator },
            { headerName: 'App. 175-200', field: 'app175_200', hide: true, comparator: customComparator },
            { headerName: 'App. 200+', field: 'app200_up', hide: true, comparator: customComparator },
            { headerName: 'BoB %', field: 'bob', hide: true },
            { headerName: 'Bogey Avd.', field: 'bogAvd', hide: true, comparator: customComparator },
            { headerName: 'Par 3s Avg', field: 'par3Scoring', hide: true, comparator: customComparator },
            { headerName: 'Par 4s Avg', field: 'par4Scoring', hide: true, comparator: customComparator },
            { headerName: 'Par 5s Avg', field: 'par5Scoring', hide: true, comparator: customComparator },
            { headerName: 'Prox.', field: 'prox', hide: true, comparator: customComparator },
            { headerName: 'Rough Prox.', field: 'roughProx', hide: true, comparator: customComparator },
            { headerName: 'Putt. BoB %', field: 'puttingBob', hide: true },
            { headerName: '3-Putt Avd.', field: 'threePuttAvd', hide: true, comparator: customComparator },
            { headerName: 'Bonus Putt', field: 'bonusPutt', hide: true },
            { headerName: 'Course History', field: 'chAvg', hide: true, comparator: customComparator },
        ];

        // Function to determine if a column should not be hidden
        function shouldNotHideColumn(key, weightDict) {
            const value = weightDict[key];

            // Check if the value is a number
            if (value !== '' && value !== undefined) {
                console.log('key: ', key, ' value: ', value);
                return true; // Do not hide if it's a number
            }

            return false; // Hide for other cases
        }

        // Apply the function to the columnDefs array
        columnDefs.forEach((column) => {
            if (column.field && shouldNotHideColumn(column.field, weightDict)) {
                column.hide = false;
            }
        });

        // Calculate min, mid, and max values for each column
        const columnMinMaxValues = columnDefs.reduce((acc, column) => {
            if (column.children) {
                // If it's a column group, iterate over its children
                column.children.forEach(childColumn => {
                    const fieldName = childColumn.field;
                    const values = dataTableData.map(row => row[fieldName]);
                    const sortedValues = [...values].sort((a, b) => a - b);
                    const filteredValues = values.filter(value => value !== null && value !== 0);

                    const minValue = filteredValues.length > 0 ? Math.min(...filteredValues) : 0;
                    const maxValue = Math.max(...values);

                    const midIndex = Math.floor(sortedValues.length / 2);
                    const midValue = sortedValues.length % 2 === 0
                        ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
                        : sortedValues[midIndex];

                    acc[fieldName] = { minValue, midValue, maxValue };
                });
            } else {
                // If it's an individual column
                const fieldName = column.field;
                const values = dataTableData.map(row => row[fieldName]);
                const sortedValues = [...values].sort((a, b) => a - b);
                const filteredValues = values.filter(value => value !== null && value !== 0);

                const minValue = filteredValues.length > 0 ? Math.min(...filteredValues) : 0;
                const maxValue = Math.max(...values);


                const midIndex = Math.floor(sortedValues.length / 2);
                const midValue = sortedValues.length % 2 === 0
                    ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
                    : sortedValues[midIndex];

                acc[fieldName] = { minValue, midValue, maxValue };
            }

            return acc;
        }, {});

        // List of columns where you want to reverse the color scale
        const columnsWithReversedColorScale = ['app50_75','app75_100',
        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bogAvd', 'par3Scoring',
        'par4Scoring', 'par5Scoring', 'prox', 'roughProx', 'threePuttAvd', 'chAvg'];

        // Define the color scale for each column based on the calculated values
        const colorScales = columnDefs.reduce((acc, column) => {
            if (column.children) {
                // If it's a column group, iterate over its children
                column.children.forEach(childColumn => {
                    const fieldName = childColumn.field;
                    const { minValue, midValue, maxValue } = columnMinMaxValues[fieldName];
        
                    const colorScale = d3.scaleLinear()
                        .domain([minValue, midValue, maxValue]);
        
                    if (columnsWithReversedColorScale.includes(fieldName)) {
                        colorScale.range(['#4579F1', '#FFFFFF', '#F83E3E']);
                    } else {
                        colorScale.range(['#F83E3E', '#FFFFFF', '#4579F1']);
                    }
        
                    acc[fieldName] = colorScale;
                });
            } else {
                // If it's an individual column
                const fieldName = column.field;
                const { minValue, midValue, maxValue } = columnMinMaxValues[fieldName];
        
                const colorScale = d3.scaleLinear()
                    .domain([minValue, midValue, maxValue]);
        
                if (columnsWithReversedColorScale.includes(fieldName)) {
                    colorScale.range(['#4579F1', '#FFFFFF', '#F83E3E']);
                } else {
                    colorScale.range(['#F83E3E', '#FFFFFF', '#4579F1']);
                }
        
                acc[fieldName] = colorScale;
            }
        
            return acc;
        }, {});
        

        // List of columns for which to apply the color scale
        const columnsWithColorScale = ['sgOtt12', 'sgApp12', 'sgArg12', 'sgPutt12', 'sgT2G12', 'sgTot12',
        'sgOtt24', 'sgApp24', 'sgArg24', 'sgPutt24', 'sgT2G24', 'sgTot24',
        'sgOtt36', 'sgApp36', 'sgArg36', 'sgPutt36', 'sgT2G36', 'sgTot36',
        'sgOtt50', 'sgApp50', 'sgArg50', 'sgPutt50', 'sgT2G50', 'sgTot50',
                                        'sgPuttPGA', 'sgArgPGA', 'sgAppPGA', 'sgOttPGA', 'sgT2GPGA', 'sgTotPGA',
                                        'drDist', 'drAcc', 'gir', 'sandSave', 'scrambling', 'app50_75', 'app75_100',
                                        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bob',
                                        'bogAvd', 'par3Scoring', 'par4Scoring', 'par5Scoring', 'prox', 'roughProx',
                                        'puttingBob', 'threePuttAvd', 'bonusPutt', 'rating', 'chAvg'];
        
        function globalCellStyle(params) {
            const fieldName = params.colDef.field;
            const numericValue = params.value;

            // Set background color to white for null values
            if (numericValue === null) {
                return { backgroundColor: '#FFFFFF' };
            }
        
            // Check if the column is in the list and the value is numeric before applying the color scale
            if (columnsWithColorScale.includes(fieldName) && !isNaN(numericValue) && isFinite(numericValue)) {
                const cellColor = colorScales[fieldName](numericValue);
                return { backgroundColor: cellColor };
            }
        
            // Return default style if the column is not in the list or the value is not numeric
            return {};
        }

        function clearCheatSheetContent() {
            /*
                Clears the content of the cheatSheet.
            */
            const cheatSheet = document.getElementById('modelSheet');
            if (cheatSheet) {
                cheatSheet.innerHTML = ''; // Clear content
            }
        }

        function initializeCheatSheet() {
            if (isModelSheetInitialized) {
                clearCheatSheetContent();
            }
        
            // Setup grid options
            gridOptionsModel = {
                columnDefs: columnDefs.map(column => ({
                    ...column,
                    cellStyle: globalCellStyle,
                    children: column.children ? column.children.map(child => ({
                        ...child,
                        cellStyle: globalCellStyle,
                    })) : undefined,
                })),
                rowData: dataTableData,
                suppressColumnVirtualisation: true,
                onFirstDataRendered: function (params) {
                    console.log('grid is ready');
                    params.api.autoSizeAllColumns();
                    params.api.setColumnWidth('rating', 90);
                },
                getRowHeight: function(params) {
                    return 25;
                },
                headerHeight: 30,
            };
        
            function updateColumnVisibility() {
                let selectedPlatform = document.getElementById('platform').value;
            
                gridOptionsModel.columnDefs.forEach(column => {
                    const colId = column.field;
            
                    if (selectedPlatform === 'fanduel') {
                        if (colId === 'fdSalary' || colId === 'fdValue') {
                            column.hide = false;
                        } else if (colId === 'dkSalary' || colId === 'dkValue') {
                            column.hide = true;
                        }
                    } else if (selectedPlatform === 'draftkings') {
                        if (colId === 'fdSalary' || colId === 'fdValue') {
                            column.hide = true;
                        } else if (colId === 'dkSalary' || colId === 'dkValue') {
                            column.hide = false;
                        }
                    }
                });
            
                gridOptionsModel.api.setColumnDefs(gridOptionsModel.columnDefs);
            }                      
        
            const gridDiv = document.querySelector('#modelSheet');
            gridApiModel = new agGrid.Grid(gridDiv, gridOptionsModel); // Use new agGrid.Grid constructor
            updateColumnVisibility();
        
            isModelSheetInitialized = true;
        }

        /*
            For hovering the entire row - considering we have pinned rows...
        */
        document.addEventListener('DOMContentLoaded', function () {
            const cheatSheet = document.getElementById('modelSheet');
            
            cheatSheet.addEventListener('mouseover', function (event) {
                const targetRow = event.target.closest('.ag-row');
                if (targetRow) {
                targetRow.classList.add('ag-row-hover');
                }
            });
            
            cheatSheet.addEventListener('mouseout', function (event) {
                const targetRow = event.target.closest('.ag-row');
                if (targetRow) {
                targetRow.classList.remove('ag-row-hover');
                }
            });
        });

        initializeCheatSheet();
    })
    .catch((error) => {
        console.error('Error:', error.message);
        console.trace();
    });
}

function onFilterTextBoxChangedModel() {
    // the function for the search box which filters the table 
    // based on 'filter-text-box' for gridOptionsModel
    const filterText = document.getElementById('filter-text-box-model').value;
    gridOptionsModel.api.setQuickFilter(filterText);
}

function onModelInputChange() {
    let currentSum = document.getElementById('currSumModel');

    let sgPuttPGAinput = document.getElementById('sgPuttPGAinput').value;
    let sgAppPGAinput = document.getElementById('sgAppPGAinput').value;
    let sgT2GPGAinput = document.getElementById('sgT2GPGAinput').value;
    let sgArgPGAinput = document.getElementById('sgArgPGAinput').value;
    let sgOttPGAinput = document.getElementById('sgOttPGAinput').value;
    let sgTotPGAinput = document.getElementById('sgTotPGAinput').value;

    // SG Last 12 Rds
    let sgPutt12input = document.getElementById('sgPutt12input').value;
    let sgApp12input = document.getElementById('sgApp12input').value;
    let sgT2G12input = document.getElementById('sgT2G12input').value;
    let sgArg12input = document.getElementById('sgArg12input').value;
    let sgOtt12input = document.getElementById('sgOtt12input').value;
    let sgTot12input = document.getElementById('sgTot12input').value;

    // SG Last 24 Rds
    let sgPutt24input = document.getElementById('sgPutt24input').value;
    let sgApp24input = document.getElementById('sgApp24input').value;
    let sgT2G24input = document.getElementById('sgT2G24input').value;
    let sgArg24input = document.getElementById('sgArg24input').value;
    let sgOtt24input = document.getElementById('sgOtt24input').value;
    let sgTot24input = document.getElementById('sgTot24input').value;

    // SG Last 36 Rds
    let sgPutt36input = document.getElementById('sgPutt36input').value;
    let sgApp36input = document.getElementById('sgApp36input').value;
    let sgT2G36input = document.getElementById('sgT2G36input').value;
    let sgArg36input = document.getElementById('sgArg36input').value;
    let sgOtt36input = document.getElementById('sgOtt36input').value;
    let sgTot36input = document.getElementById('sgTot36input').value;

    // SG Last 50 Rds
    let sgPutt50input = document.getElementById('sgPutt50input').value;
    let sgApp50input = document.getElementById('sgApp50input').value;
    let sgT2G50input = document.getElementById('sgT2G50input').value;
    let sgArg50input = document.getElementById('sgArg50input').value;
    let sgOtt50input = document.getElementById('sgOtt50input').value;
    let sgTot50input = document.getElementById('sgTot50input').value;

    // Other Stats
    let drDist = document.getElementById('drDist').value;
    let bob = document.getElementById('bob').value;
    let sandSave = document.getElementById('sandSave').value;
    let par3scoring = document.getElementById('par3scoring').value;
    let par5scoring = document.getElementById('par5scoring').value;
    let prox = document.getElementById('prox').value;
    let app50_75 = document.getElementById('app50_75').value;
    let app100_125 = document.getElementById('app100_125').value;
    let app150_175 = document.getElementById('app150_175').value;
    let app200_up = document.getElementById('app200_up').value;
    let bonusPutt = document.getElementById('bonusPutt').value;
    let drAcc = document.getElementById('drAcc').value;
    let bogAvd = document.getElementById('bogAvd').value;
    let scrambling = document.getElementById('scrambling').value;
    let par4scoring = document.getElementById('par4scoring').value;
    let gir = document.getElementById('gir').value;
    let roughProx = document.getElementById('roughProx').value;
    let app75_100 = document.getElementById('app75_100').value;
    let app125_150 = document.getElementById('app125_150').value;
    let app175_200 = document.getElementById('app175_200').value;
    let puttingBob = document.getElementById('puttingBob').value;
    let threePuttAvd = document.getElementById('threePuttAvd').value;
    let courseHistoryInput = document.getElementById('courseHistory').value;

    const inputElements = [
        sgPuttPGAinput, sgAppPGAinput, sgT2GPGAinput, sgArgPGAinput, sgOttPGAinput, sgTotPGAinput,
        sgPutt12input, sgApp12input, sgT2G12input, sgArg12input, sgOtt12input, sgTot12input,
        sgPutt24input, sgApp24input, sgT2G24input, sgArg24input, sgOtt24input, sgTot24input,
        sgPutt36input, sgApp36input, sgT2G36input, sgArg36input, sgOtt36input, sgTot36input,
        sgPutt50input, sgApp50input, sgT2G50input, sgArg50input, sgOtt50input, sgTot50input,
        drDist, bob, sandSave, par3scoring, par5scoring, prox, app50_75, app100_125, app150_175,
        app200_up, bonusPutt, drAcc, bogAvd, scrambling, par4scoring, gir, roughProx, app75_100,
        app125_150, app175_200, puttingBob, threePuttAvd, courseHistoryInput
    ];

    // Sum of all stats
    const totalSum = inputElements.reduce((sum, input) => {
        const value = parseFloat(input) || 0; // Convert input value to number, default to 0 if NaN
        return sum + value;
    }, 0);


    currentSum.innerText = "";

    // Update currentSum element
    currentSum.innerText = "Current Sum: " + totalSum.toFixed(1); // Display sum with 2 decimal places
}

document.addEventListener('DOMContentLoaded', function () {
    // Get all elements with the class 'modelInput'
    const modelInputs = document.querySelectorAll('.modelInput');

    // Attach onModelInputChange function to the change event of each modelInput element
    modelInputs.forEach(function (input) {
        console.log('on change');
        input.addEventListener('input', onModelInputChange);
    });
});

function loadOptimizedLineups() {
    let numLineups;
    let modelData;

    const savedDataJSONModel = localStorage.getItem('selectedModelData');
    const savedDataJSONNum = localStorage.getItem('numLineups');

    if (savedDataJSONModel) {
        modelData = JSON.parse(savedDataJSONModel);
        console.log('model data: ', modelData);
    } else {
        console.log('No saved model data found');
        return;
    }

    if (savedDataJSONNum) {
        numLineups = parseInt(savedDataJSONNum);
        console.log('numLineups: ', numLineups);
    } else {
        console.log('No saved number of lineups found');
        return;
    }

    modelData.sort((a, b) => b.rating - a.rating);

    function generateOptimalLineup(modelData, currentIndex, currentLineup, currentTotalSalary, bestLineup, targetRating, currentTotalRating, platform) {
        // Base case: if the lineup has 6 players, update the best lineup if needed
        if (currentLineup.length === 6) {
            // Calculate total rating and total salary for the current lineup
            const totalRating = currentLineup.reduce((sum, player) => sum + player.rating, 0);
            const totalSalary = currentLineup.reduce((sum, player) => sum + player.fdSalary, 0);
    
            // Check if the current lineup is better than the current best lineup
            if (!bestLineup.totalRating || totalRating > bestLineup.totalRating) {
                // Update the best lineup information
                bestLineup.players = [...currentLineup];
                bestLineup.totalRating = totalRating;
                bestLineup.totalSalary = totalSalary;
            }
            return; // Exit the function as the lineup is complete
        }
    
        // Iterate through the remaining players in modelData
        for (let i = currentIndex; i < modelData.length; i++) {
            const currentPlayer = modelData[i];
            let maxSalary;
            let playerSalary;
            if(platform == 'fanduel'){
                maxSalary = 60000;
                playerSalary = currentPlayer.fdSalary;
            } else {
                maxSalary = 50000;
                playerSalary = currentPlayer.dkSalary;
            }
    
            // Check if adding the current player exceeds the salary limit
            if (currentTotalSalary + playerSalary <= maxSalary &&
                (!targetRating || currentTotalRating + currentPlayer.rating < targetRating)) {
                // Choose the current player for the lineup
                currentLineup.push(currentPlayer);
                currentTotalSalary += playerSalary;
                currentTotalRating += currentPlayer.rating;
    
                // Recursively generate lineups with the current player chosen
                generateOptimalLineup(modelData, i + 1, currentLineup, currentTotalSalary, bestLineup, targetRating, currentTotalRating, platform);
    
                // Backtrack: remove the last player to explore other combinations
                currentLineup.pop();
                currentTotalSalary -= playerSalary;
                currentTotalRating -= currentPlayer.rating;
    
            }
        }
    }    

    function choose(x, y) {
        if (y < 0 || y > x) {
            return 0;
        }
    
        let result = 1;
        for (let i = 1; i <= y; i++) {
            result *= (x - i + 1) / i;
        }
    
        return Math.round(result);
    }
    
    function generateOptimalLineups(modelData, numLineups) {
        const sortedModelData = modelData.sort((a, b) => b.rating - a.rating);
        let sortedModelDataSlice = sortedModelData.slice(0, 40);
        let platform = sortedModelDataSlice[0].platform;
        console.log('sorted model data sliced: ', sortedModelDataSlice, ' length: ', sortedModelDataSlice.length);
        const allLineups = [];
        let numChoose = choose(sortedModelDataSlice.length, 6);
        let numGen = numLineups;
        if (numChoose < numLineups) {
            console.log('Could only generate ', numChoose, ' unique lineups. Add more players to fully generate!');
            numGen = numChoose;
        }
    
        // Initialize DataTable
        var dataTable = $('#allLineupsTable').DataTable({
            order: [[6, 'desc']],  // Sort by totalRating column in descending order
            pageLength: numLineups,
            dom: 'Bfrtip',  // Specify that you want to use the Buttons extension
            buttons: [
                'excelHtml5',
            ]
        });
    
        // Generate the specified number of lineups
        for (let i = 0; i < numGen; i++) {
            const bestLineup = { players: [], totalRating: 0, totalSalary: 0 };
            const targetRating = i === 0 ? 601 : (allLineups[allLineups.length - 1].totalRating - 0.01);
    
            generateOptimalLineup(sortedModelDataSlice, 0, [], 0, bestLineup, targetRating, 0, platform);
    
            // Add the best lineup to the list
            allLineups.push({ ...bestLineup });
    
            // Populate DataTable with data for each lineup
            var rowData = bestLineup.players.map(player => player.player).concat([bestLineup.totalRating.toFixed(2), bestLineup.totalSalary]);
            dataTable.row.add(rowData);
        }
    
        // Draw the DataTable
        dataTable.draw();
    
        return allLineups;
    }
    

    // Example usage:
    const modelData2 = [
        { player: 'player1', fdSalary: 10000, rating: 97 },
        { player: 'player2', fdSalary: 9500, rating: 85 },
        { player: 'player3', fdSalary: 11000, rating: 92 },
        { player: 'player4', fdSalary: 8800, rating: 78 },
        { player: 'player5', fdSalary: 10500, rating: 89 },
        { player: 'player6', fdSalary: 9300, rating: 88 },
        { player: 'player7', fdSalary: 9700, rating: 90 },
        { player: 'player8', fdSalary: 9200, rating: 91 },
        { player: 'player9', fdSalary: 8900, rating: 86 },
        { player: 'player10', fdSalary: 10200, rating: 94 },
        { player: 'player11', fdSalary: 9800, rating: 87 },
        { player: 'player12', fdSalary: 9400, rating: 93 },
        { player: 'player13', fdSalary: 9900, rating: 96 },
        { player: 'player14', fdSalary: 9100, rating: 84 },
        { player: 'player15', fdSalary: 10800, rating: 88 },
        { player: 'player16', fdSalary: 9600, rating: 90 },
        { player: 'player17', fdSalary: 9300, rating: 85 },
        { player: 'player18', fdSalary: 9800, rating: 89 },
        { player: 'player19', fdSalary: 9500, rating: 91 },
        { player: 'player20', fdSalary: 10300, rating: 92 },
        { player: 'player21', fdSalary: 9700, rating: 94 },
        { player: 'player22', fdSalary: 9200, rating: 86 },
        { player: 'player23', fdSalary: 9000, rating: 88 },
        { player: 'player24', fdSalary: 9400, rating: 91 },
        { player: 'player25', fdSalary: 9900, rating: 93 },
        { player: 'player26', fdSalary: 9600, rating: 95 },
        { player: 'player27', fdSalary: 9200, rating: 87 },
        { player: 'player28', fdSalary: 9100, rating: 89 },
        { player: 'player29', fdSalary: 8800, rating: 84 },
        { player: 'player30', fdSalary: 10500, rating: 91 },
        { player: 'player31', fdSalary: 10200, rating: 92 },
        { player: 'player32', fdSalary: 9800, rating: 90 },
        { player: 'player33', fdSalary: 9300, rating: 86 },
        { player: 'player34', fdSalary: 9200, rating: 88 },
        { player: 'player35', fdSalary: 9400, rating: 89 },
        { player: 'player36', fdSalary: 9500, rating: 87 },
        { player: 'player37', fdSalary: 9900, rating: 91 },
        { player: 'player38', fdSalary: 9600, rating: 88 },
        { player: 'player39', fdSalary: 9700, rating: 89 },
        { player: 'player40', fdSalary: 9000, rating: 92 },
        { player: 'player41', fdSalary: 9200, rating: 94 },
        { player: 'player42', fdSalary: 9300, rating: 86 },
        { player: 'player43', fdSalary: 9500, rating: 88 },
        { player: 'player44', fdSalary: 9800, rating: 89 },
        { player: 'player45', fdSalary: 9600, rating: 90 },
        { player: 'player46', fdSalary: 9400, rating: 91 },
        { player: 'player47', fdSalary: 9700, rating: 92 },
        { player: 'player48', fdSalary: 9200, rating: 93 },
        { player: 'player49', fdSalary: 9000, rating: 94 },
        { player: 'player50', fdSalary: 9100, rating: 95 },
        // ... (other players)
    ];    
    
    const n = numLineups; // Specify the number of lineups to generate
    const allLineups = generateOptimalLineups(modelData, n);

    if( allLineups.length < numLineups){
        let alertString = 'Based on your optimizer settings, can only make ' + allLineups.length + ' total lineups';
        alert(alertString);
    }
    
    console.log('All Lineups: ', allLineups);

    // Function to calculate player occurrences and percentages
    function calculatePlayerPercentages(allLineups) {
        const playerCount = {};

        // Count occurrences of each player
        allLineups.forEach(lineup => {
            lineup.players.forEach(playerObj => {
                let playerName = playerObj.player;
                console.log('player: ', playerName);
                playerCount[playerName] = (playerCount[playerName] || 0) + 1;
            });
        });

        // Calculate percentages
        const totalLineups = allLineups.length;
        const playerPercentages = Object.entries(playerCount).map(([player, count]) => ({
            player,
            percentage: (count / totalLineups * 100).toFixed(2),
        }));

        return playerPercentages;
    }

    // Function to populate DataTable
    function populateDataTable(playerPercentages) {

        const table = $('#playerTable').DataTable({
            order: [[1, 'desc']],
            lengthChange: false,
            pageLength: -1, 
        });

        // Clear existing rows
        table.clear();

        // Add rows with player name and percentage
        playerPercentages.forEach(player => {
            table.row.add([player.player, player.percentage + '%']).draw();
        });
    }

    let playerExposures = calculatePlayerPercentages(allLineups);
    console.log('exposures: ', playerExposures);
    populateDataTable(playerExposures);
}










