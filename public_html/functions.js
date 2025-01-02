
// Page Changing functions
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

function modelPage() {
    window.location.href = './customModel.html';
}

function optimizerSettings() {
    window.location.href = './optimizerSettings.html';
}

function floorCeiling() {
    window.location.href = './floorCeiling.html';
}

/*
    logSavedData() -- 
        - Gets custom model saved data, saved player pool & saved excluded players
        - Populate player pool & excluded player dropdowns
        - On change of player pool / excluded player list, call to update optimizer data
        - Set player pool & excluded player lists if saved versions exist

    Called by: optimizerSettings.html
*/
function logSavedData() {
    // Retrieve saved custom model data from localStorage
    const savedDataJSON = localStorage.getItem('modelData');
    let inModelData = [];
    if (savedDataJSON) {
        inModelData = JSON.parse(savedDataJSON);
    }

    // Retrieve chosen and excluded players data from localStorage
    let chosenPlayers1 = localStorage.getItem('chosenPlayers');
    let excludedPlayers1 = localStorage.getItem('excludedPlayers');

    // If there are no chosen/excluded players in localStorage,
    //      set optimizer data to full custom model data
    if (chosenPlayers1 == null || excludedPlayers1 == null) { // null case
        localStorage.setItem('selectedModelData', savedDataJSON);
        console.log('Set savedModelData to full set - chosen/excluded was null');
    } else if (JSON.parse(chosenPlayers1).length == 0 && JSON.parse(excludedPlayers1).length == 0) { // empty case
        localStorage.setItem('selectedModelData', savedDataJSON);
        console.log('Set savedModelData to full set');
    } else {
        console.log('Had some excluded or chosen players already...');
    }

    // Dynamically populate "Choose Players" (choose player pool) dropdown with player names
    var selectDropdown = document.getElementById('choosePlayerBox');
    var htmlString = "";
    for (var i = 0; i < inModelData.length; i++) {
        var playerName = inModelData[i].player; // Get player name from model data
        var option = document.createElement('option');
        option.text = playerName;  // Set option text to player name
        option.value = playerName; // Set option value to player name
        selectDropdown.add(option); // Add option to the dropdown
    }

    // Dynamically populate "Exclude Players" dropdown with player names
    var excludeDropdown = document.getElementById('excludePlayerBox');
    for (var i = 0; i < inModelData.length; i++) {
        var playerName = inModelData[i].player; // Get player name from model data
        var option = document.createElement('option');
        option.text = playerName;  // Set option text to player name
        option.value = playerName; // Set option value to player name
        excludeDropdown.add(option); // Add option to the dropdown
    }

    // Call updateSelectedData() given player pool & excluded players
    $(selectDropdown).trigger('chosen:updated');
    $(excludeDropdown).trigger('chosen:updated');

    // Check for selected "chosen players" data in localStorage
    const selectedModelDataJSON = localStorage.getItem('chosenPlayers');
    if (selectedModelDataJSON) {
        var selectedModelData = JSON.parse(selectedModelDataJSON);

        // Loop through options and mark chosen players in the "Choose Players" dropdown
        for (var i = 0; i < selectDropdown.options.length; i++) {
            var playerName = selectDropdown.options[i].value;
            if (selectedModelData.includes(playerName)) {
                selectDropdown.options[i].selected = true;
            }
        }

        // Update optimizer players: updateSelectedData()
        $(selectDropdown).trigger('chosen:updated');
    }

    // Check for selected "excluded players" data in localStorage
    const excludedPlayersJSON = localStorage.getItem('excludedPlayers');
    if (excludedPlayersJSON) {
        var excludedPlayers = JSON.parse(excludedPlayersJSON);

        // Loop through options and mark excluded players in the "Exclude Players" dropdown
        for (var i = 0; i < excludeDropdown.options.length; i++) {
            var playerName = excludeDropdown.options[i].value;
            if (excludedPlayers.includes(playerName)) {
                excludeDropdown.options[i].selected = true;
            }
        }

        // Update optimizer players: updateSelectedData()
        $(excludeDropdown).trigger('chosen:updated');
    }

    // Initialize the Chosen plugin for the "Choose Players" dropdown
    $(selectDropdown).chosen();

    // Initialize the Chosen plugin for the "Exclude Players" dropdown
    $(excludeDropdown).chosen();

    // On selectDropdown change, call updateSelectedData
    $(selectDropdown).on('change', function() {
        updateSelectedData(inModelData, savedDataJSON); // Update the selected data when the dropdown changes
    });

    // on excludeDropdown change, call updateSelectedData
    $(excludeDropdown).on('change', function() {
        updateSelectedData(inModelData, savedDataJSON); // Update the selected data when the dropdown changes
    });
}

/*
    updateSelectedData(inModelData, savedDataJSON) --
        - Grab players in player pool dropdown & excluded player dropdown
        - Exclude players that are in both dropdown
        - save lists of excluded and player pool players to local storage
        - Update list of players to send to optimizer accordingly
            - (If players are in player pool / some players are excluded)
*/
function updateSelectedData(inModelData, savedDataJSON) {

    // Grab player pool & excluded player dropdown elements
    var selectDropdown = document.getElementById('choosePlayerBox');
    var excludeDropdown = document.getElementById('excludePlayerBox');

    // Get selected players for player pool from "Choose Players" dropdown
    var selectedPlayers = Array.from(selectDropdown.selectedOptions).map(option => option.value);

    // Get excluded players from "Exclude Players" dropdown
    var excludedPlayers = Array.from(excludeDropdown.selectedOptions).map(option => option.value);

    // If player is both in player pool and excluded, exclude the player
    excludedPlayers.forEach(function(player) {
        var index = selectedPlayers.indexOf(player);
        if (index !== -1) {
            selectedPlayers.splice(index, 1);
        }
    });

    // Save the lists of excluded players and chosen player pool
    localStorage.setItem('excludedPlayers', JSON.stringify(excludedPlayers));
    localStorage.setItem('chosenPlayers', JSON.stringify(selectedPlayers));

    // If player pool or exluded players are specified
    if (selectedPlayers.length > 0 || excludedPlayers.length > 0) {
        var selectedData;

        // SETUP PLAYER POOL
        // If players are selected in "Choose Players," filter modelData based on selected players
        if (selectedPlayers.length > 0) {
            selectedData = inModelData.filter(data => selectedPlayers.includes(data.player));
        } else {
            // If no players are selected in "Choose Players," include all players other than those selected in "Exclude Players"
            selectedData = inModelData.filter(data => !excludedPlayers.includes(data.player));
        }

        // Save new player pool for optimizer to local storage
        localStorage.setItem('selectedModelData', JSON.stringify(selectedData));

    } else { // No modifications needed to custom model player pool
        console.log('No players selected. Using all saved model data.');
        localStorage.setItem('selectedModelData', savedDataJSON);
        console.log('All saved model data: ', inModelData);
    }
}

/*
    goOptimizerResults() --
        - Grab number of lineups to make
        - Set numLineups in local storage
        - Go to optimizerResults.html page (calls loadOptimizedLineups())
*/
function goOptimizerResults() {
    let numLineups = document.getElementById('numLineups').value;

    localStorage.setItem('numLineups', numLineups);

    window.location.href = './optimizerResults.html';
}

let isCheatSheetInitialized = false;

let tournamentAbbreviations;
let recentTournaments;
let gridApi;

// Calculates average SG category for last numRounds for each player
function calcSgAverages(jsonData, numRounds, player) {

    // SG: LAST N ROUNDS
    // Find all rounds for player in tournamentRow, order by 'dates' and 'Round' in descending order
    let playerRounds = jsonData.tournamentRow.filter((round) => round.player === player)
        .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
        .slice(0, numRounds); // Grab at most the specified number of rounds

    // Initialize storage, grab Round sample size of interest
    let avgRoundData = {};
    avgRoundData['numRounds'] = playerRounds.length;

    // Calculate the average of specific columns for the player's rounds
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

    return avgRoundData;
}

// Makes the headers for column definition of recent history
function makeRecHistHd(tournamentAbbreviations, customComparator) {
    const headers = [];
    const abbreviationKeys = Object.keys(tournamentAbbreviations);

    for (let i = 0; i < abbreviationKeys.length; i++) {
        const abbreviation = abbreviationKeys[i];
        headers.push({
            headerName: tournamentAbbreviations[abbreviation],
            field: abbreviation,
            comparator: customComparator
        });
    }

    return headers;
}

// Creates dict of tournament abbreviations for last 10 tournaments
function makeTournAbbrv(jsonData) {

    // Sort tournamentRow data in descending order by dates
    let sortedTournamentRow = jsonData.tournamentRow.sort((a, b) => new Date(b.dates) - new Date(a.dates));

    // Identify the 10 most recent tournaments
    let recentTournaments = [];
    let uniqueTournaments = new Set();
    for (let entry of sortedTournamentRow) {
        let tournamentDateKey = `${entry.tournament}-${entry.dates}`;
        if (!uniqueTournaments.has(tournamentDateKey)) {
            uniqueTournaments.add(tournamentDateKey);
            recentTournaments.push({ tournament: entry.tournament, dates: entry.dates });
        }
        if (recentTournaments.length >= 10) {
            break;
        }
    }

    // Build Abbreviations for each tournament
    let tournamentAbbreviations = {};
    for (let i = 0; i < recentTournaments.length; i++) {
        let tournament = recentTournaments[i].tournament;
        let words = tournament.split(' ');

        if (words[0] === 'The') {
            words = words.slice(1);
        }

        // Build the abbreviation
        let abbreviation = words[0].substring(0, 3);
        for (let j = 1; j < words.length; j++) {
            abbreviation += words[j][0];
            if (abbreviation.length >= 5) {
                break;
            }
        }

        tournamentAbbreviations[`recent${i + 1}`] = abbreviation.toUpperCase();
    }

    // Ensure tournamentAbbreviations is of length 10
    let index = 1;
    while (Object.keys(tournamentAbbreviations).length < 10) {
        let currentKey = `recent${index}`;
        if (!tournamentAbbreviations[currentKey]) {
            tournamentAbbreviations[currentKey] = `Default${index}`;
        }
        index++;
    }

    return tournamentAbbreviations;
}

// Creates array of 10 recent finishes of player
function getRecentHistory(tournamentRow, player) {
    // Step 1: Sort tournamentRow Data in descending order by 'dates'
    let sortedTournamentRow = tournamentRow.sort((a, b) => new Date(b.dates) - new Date(a.dates));

    // Step 2: Identify the 10 most recent tournaments
    let recentTournaments = [];
    let uniqueTournaments = new Set();
    for (let entry of sortedTournamentRow) {
        let tournamentDateKey = `${entry.tournament}-${entry.dates}`;
        if (!uniqueTournaments.has(tournamentDateKey)) {
            uniqueTournaments.add(tournamentDateKey);
            recentTournaments.push({ tournament: entry.tournament, dates: entry.dates });
        }
        if (recentTournaments.length >= 10) {
            break;
        }
    }

    // Step 3: Compile Recent History Data for Player
        // For each of recent tournaments, search for player in that tournament
    let recentHistory = [];
    for (let i = 0; i < recentTournaments.length; i++) {
        let tournamentEntry = recentTournaments[i];
        let entry = null;
    
        for (let j = 0; j < sortedTournamentRow.length; j++) {
            let entryPlayer = sortedTournamentRow[j].player;
            let entryTourney = sortedTournamentRow[j].tournament;
            let entryDates = sortedTournamentRow[j].dates;
    
            if (entryPlayer === player && entryTourney === tournamentEntry.tournament && entryDates === tournamentEntry.dates) {
                entry = sortedTournamentRow[j];
                break;
            }
        }
    
        if (entry == null) {
            recentHistory.push(null);
        } else {
            recentHistory.push(entry.finish);
        }
    }

    // If recentHistory does not have 10 entries, fill it with null.
    while (recentHistory.length < 10) {
        recentHistory.push(null);
    }

    return recentHistory;
}

function changeCellFormat() {
    let cellFormatStyle = document.getElementById('selectColorDrop');

    if(colDefHolder != null) {

    }
}

let colDefHolder = null;

function loadCheatSheet() {
    let lastNRounds = document.getElementById('lastNRounds');
    let cellFormatStyle = document.getElementById('selectColorDrop');

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
        
        // Create tournament abbreviations for last 10 tournaments
        let tournamentAbbreviations = makeTournAbbrv(jsonData);

        // Create data table data
        let dataTableData = [];
        for(let i = 0; i < jsonData.salaries.length; i++) {
            const salary = jsonData.salaries[i];
            const player = salary.player;
            const fdSalary = salary.fdSalary;
            const dkSalary = salary.dkSalary;

            // SG: PGATOUR.COM
            // Find a matching player in pgatour
            let pgatourData = jsonData.pgatour.find((pgatour) => pgatour.player === player);

            // COURSE HISTORY
            // Find matching player in courseHistory : set all fields to null if unfound
            let courseHistoryData = jsonData.courseHistory.find(course => course.player === player) || 
                        { minus1: null, minus2: null, minus3: null, minus4: null, minus5: null };

            // SG AVERAGES
            // Set SG Last N Rounds data for player
            let avgRoundData = calcSgAverages(jsonData, lastNRounds.value, player);

            // RECENT HISTORY
            let recentHistory = getRecentHistory(jsonData.tournamentRow, player);

            function formatData(value) {
                // Returns null or the stat value
                return value !== null && value !== undefined ? Number(value.toFixed(2)) : null;
            }

            function generateFilteredData(source, keys) {
                // Generates a dictionary of PGATOUR statistics for player
                const data = {};

                const sgKeys = ["sgPutt", "sgArg", "sgApp", "sgOtt", "sgT2G", "sgTot"];
                for(let i = 0; i < keys.length; i++) {
                    let key;
                    if(sgKeys.includes(keys[i])) {
                        key = keys[i] + "PGA";
                    } else {
                        key = keys[i];
                    }
                    data[key] = source ? formatData(source[keys[i]]) : null;
                }
                return data;
            }

            const keys = [
                "sgPutt", "sgArg", "sgApp", "sgOtt", "sgT2G", "sgTot",
                "drDist", "drAcc", "gir", "sandSave", "scrambling",
                "app50_75", "app75_100", "app100_125", "app125_150",
                "app150_175", "app175_200", "app200_up", "bob", "bogAvd",
                "par3Scoring", "par4Scoring", "par5Scoring", "prox",
                "roughProx", "puttingBob", "threePuttAvd", "bonusPutt"
            ];

            let filteredPgatourData = generateFilteredData(pgatourData || null, keys);

            const rowData = {
                player,
                fdSalary,
                dkSalary,
                ...filteredPgatourData,
                ...courseHistoryData, // Include course history data
                ...(avgRoundData || {}), // Include average round data if it exists
                ...recentHistory.reduce((result, finish, index) => {
                    result[`recent${index + 1}`] = finish;
                    return result;
                }, {}),
                tournamentAbbreviations, // Include tournament abbreviations
            };

            if(rowData) {
                dataTableData.push(rowData);
            }
        }

        // BUILD AG-GRID TABLE
        // Custom Comparator function
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

        // Make headers for recent history columns
        const recHistHeaders = makeRecHistHd(tournamentAbbreviations, customComparator);

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
                    { headerName: 'SG: Putt', field: 'sgPutt'},
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
                    { headerName: 'SndSave%', field: 'sandSave', hide: true },
                    { headerName: 'Scrmbl%', field: 'scrambling', hide: true },
                    { headerName: 'Ap50-75', field: 'app50_75', hide: true, comparator: customComparator },
                    { headerName: 'Ap75-100', field: 'app75_100', hide: true, comparator: customComparator },
                    { headerName: 'Ap100-125', field: 'app100_125', hide: true, comparator: customComparator },
                    { headerName: 'Ap125-150', field: 'app125_150', hide: true, comparator: customComparator },
                    { headerName: 'Ap150-175', field: 'app150_175', hide: true, comparator: customComparator },
                    { headerName: 'Ap175-200', field: 'app175_200', hide: true, comparator: customComparator },
                    { headerName: 'Ap200+', field: 'app200_up', hide: true, comparator: customComparator },
                    { headerName: 'BoB %', field: 'bob', hide: true },
                    { headerName: 'Bog Avd.', field: 'bogAvd', hide: true, comparator: customComparator },
                    { headerName: 'Par3Avg', field: 'par3Scoring', hide: true, comparator: customComparator },
                    { headerName: 'Par4Avg', field: 'par4Scoring', hide: true, comparator: customComparator },
                    { headerName: 'Par5Avg', field: 'par5Scoring', hide: true, comparator: customComparator },
                    { headerName: 'Prox.', field: 'prox', hide: true, comparator: customComparator },
                    { headerName: 'RoughProx.', field: 'roughProx', hide: true, comparator: customComparator },
                    { headerName: 'PuttBoB%', field: 'puttingBob', hide: true },
                    { headerName: '3-PuttAvd.', field: 'threePuttAvd', hide: true, comparator: customComparator },
                    { headerName: 'Bonus Putt', field: 'bonusPutt', hide: true },
                ],
            },
            // Recent History grouping
            {
                headerName: 'Recent History',
                children: [
                    // Add columns for recent history based on tournamentAbbreviations
                    ...recHistHeaders
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

        colDefHolder = columnDefs;

        function calculateQuantiles(values) {
            const filteredValues = values.filter(value => value !== null).sort((a, b) => a - b);
            if (!filteredValues.length) return {};
        
            const quantiles = [0.25, 0.5, 0.75, 1];
            const result = {};
        
            for (const q of quantiles) {
                const index = Math.floor(q * (filteredValues.length - 1));
                result[q] = filteredValues[index];
            }
        
            return result;
        }

        // List of columns for which to apply the color scale
        const columnsWithColorScale = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot',
            'sgPuttPGA', 'sgArgPGA', 'sgAppPGA', 'sgOttPGA', 'sgT2GPGA', 'sgTotPGA',
            'drDist', 'drAcc', 'gir', 'sandSave', 'scrambling', 'app50_75', 'app75_100',
            'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bob',
            'bogAvd', 'par3Scoring', 'par4Scoring', 'par5Scoring', 'prox', 'roughProx',
            'puttingBob', 'threePuttAvd', 'bonusPutt'];

        // List of columns where you want to reverse the color scale
        const columnsWithReversedColorScale = ['app50_75','app75_100',
        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bogAvd', 'par3Scoring',
        'par4Scoring', 'par5Scoring', 'prox', 'roughProx', 'threePuttAvd'];

        // Define the color scale for each column based on the calculated values
        const colorScales = makeColorScales(dataTableData, columnsWithColorScale, columnsWithReversedColorScale);

        // Formats cells with quantile emojis
        function emojiCellRenderer(params, quantiles) {
            const { value, colDef } = params;
            if (value === null) return '';
        
            const columnName = colDef.field;
        
            let emoji;
            if (columnsWithReversedColorScale.includes(columnName)) {
                if (value < quantiles[0.25]) emoji = '🟢';
                else if (value < quantiles[0.5]) emoji = '🟡';
                else if (value < quantiles[0.75]) emoji = '🟠';
                else emoji = '🚩';
            } else {
                if (value < quantiles[0.25]) emoji = '🚩';
                else if (value < quantiles[0.5]) emoji = '🟠';
                else if (value < quantiles[0.75]) emoji = '🟡';
                else emoji = '🟢';
            }
        
            return `<span title="${value}">${emoji} ${value}</span>`;
        }

        // Clears emoji's from cells
        function clearEmojis(colDefs) {
            colDefs.forEach((group) => {
                if (group.children) {
                    group.children.forEach((column) => {
                        column.cellRenderer = (params) => {
                            if(params.value != null) {
                                return `<span>${params.value}</span>`; // Render just the value without emoji
                            } else {
                                return `<span></span>`;
                            }
                        };
                    });
                }
            });
        }

        // Registers emoji formatting if flag format is specified
        function registerEmojiFlags(colDefs = columnDefs) {
            clearEmojis(colDefs);
            if(cellFormatStyle.value == "flags") {
                colDefs.forEach((group) => {
                    if (group.children) {
                        group.children.forEach((column) => {
                            const columnName = column.field;
                            
                            if (columnsWithColorScale.includes(columnName) || columnsWithReversedColorScale.includes(columnName)) {
                                
                                // Calculate quantiles for the current column
                                const columnQuantiles = calculateQuantiles(dataTableData.map(row => row[columnName]));
                
                                // Apply emojiCellRenderer to the current column
                                column.cellRenderer = (params) => emojiCellRenderer(params, columnQuantiles, columnsWithReversedColorScale);
                            }
                        });
                    }
                });
            }
        }

        registerEmojiFlags();

        // Sets styling & coloring for cheat sheet cells
        function globalCellStyle(params) {
            const fieldName = params.colDef.field;
            const numericValue = params.value;

            // Set background color to white for null values
            if (numericValue === null) {
                return { backgroundColor: '#FFFFFF' };
            }
        
            // Check if the column is in the list and the value is numeric before applying the color scale
            if (columnsWithColorScale.includes(fieldName) && !isNaN(numericValue) && isFinite(numericValue) && cellFormatStyle.value == "colorScales") {
                const cellColor = colorScales[fieldName](numericValue);
                return { backgroundColor: cellColor};
            }
        
            // Return default style if the column is not in the list or the value is not numeric
            return {};
        }

        // Clear content of cheat sheet
        function clearCheatSheetContent() {
            const cheatSheet = document.getElementById('cheatSheet');
            if (cheatSheet) {
                cheatSheet.innerHTML = '';
            }
        }

        // Sets custom column widths
        function getColumnWidth(field) {
            salary = ['fdSalary', 'dkSalary'];

            recentHist = ['recent1', 'recent2', 'recent3', 'recent4', 'recent5',
                'recent6', 'recent7', 'recent8', 'recent9', 'recent10'];
            
            courseHist = ['minus1', 'minus2', 'minus3', 'minus4', 'minus5'];    
            
            if(field == 'player'){
                return 180;
            } else if(salary.includes(field)) {
                return 78;
            } else if(recentHist.includes(field)) {
                return 65;
            } else if(courseHist.includes(field)) {
                return 55;
            } else { // DEFAULT
                return 70;
            }
        }

        //let gridApi;
        let currColDefs = null;

        // Set Cell Format Style onChange
        if(cellFormatStyle) {
            cellFormatStyle.addEventListener('change', function() {
                cellFormatStyle = document.getElementById('selectColorDrop');
                currColDefs = gridApi.getColumnDefs();
                registerEmojiFlags(currColDefs);
                initializeCheatSheet(currColDefs);
            });
        }

        function initializeCheatSheet(colDef = columnDefs) {
            // Clear cheat sheet if initialized
            if (isCheatSheetInitialized) {
                clearCheatSheetContent();
            }
    
            // setup grid options
            const gridOptions = {
                columnDefs: colDef.map(column => ({
                    ...column,
                    cellStyle: globalCellStyle,
                    children: column.children ? column.children.map(child => ({
                        ...child,
                        cellStyle: globalCellStyle,
                        width: getColumnWidth(child.field)
                    })) : undefined,
                })),
                rowData: dataTableData,
                suppressColumnVirtualisation: true,  // allows auto resize of non-visible cols
                onFirstDataRendered: function (params) {
                    console.log('grid is ready');
                    setupColumnVisibilityDropdown(colDef);
                },
                getRowHeight: function(params) {
                    // return the desired row height in pixels
                    return 25; // adjust this value based on your preference
                },
                headerHeight: 30,
            };
    
            // Create the grid using createGrid
            gridApi = agGrid.createGrid(document.querySelector('#cheatSheet'), gridOptions);
            isCheatSheetInitialized = true;
        }

        // Sets up the HTML behind column visibility dropdown
        function setupColumnVisibilityDropdown(columnDefs) {
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

        // Sets checked columns to zero when 'apply' is pressed
        window.applyColumnVisibility = function () {
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

        // Toggles visibility of the box containing the checkboxes & cols
        window.toggleColumnVisibility = function () {
            const checkboxContainer = document.getElementById('checkboxContainer');
            const applyButton = document.getElementById('applyColVisCS');

            if (checkboxContainer && applyButton) {
                const isExpanded = checkboxContainer.style.height === 'auto' || checkboxContainer.style.height === '150px';
                checkboxContainer.style.height = isExpanded ? '0' : '150px';
                checkboxContainer.style.overflowY = isExpanded ? 'hidden' : 'auto';
                applyButton.style.display = isExpanded ? 'none' : 'inline-block';
            }
        };

        // For hovering the entire row - considering we have pinned rows...
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

// Cheat Sheet Search Box onChange Function
function onFilterTextBoxChanged() {
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

    console.log(currGolfer.value);

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) => {

        // Ensure jsonData.document is an array
        let documentData = jsonData.document;

        // Sort player's rounds to show most recent at top
        documentData.sort((a, b) => {
            // First, compare by date in descending order
            const dateComparison = new Date(b.dates) - new Date(a.dates);
            
            // If dates are equal, compare by round in descending order
            return dateComparison !== 0 ? dateComparison : b.Round - a.Round;
        });

        // Clear html if table was initialized
        if(isDataTableInitialized){
            profileTbl.innerHTML = '';
        }
        
        // Define table's columns
        const columnDefs = [
            { headerName: 'Date', field: 'dates', width: 60},
            { headerName: 'Finish', field: 'finish' },
            { headerName: 'Tournament', field: 'tournament', width: 240},
            { headerName: 'Round', field: 'Round' },
            { headerName: 'SG: Putt', field: 'sgPutt', valueFormatter: roundToTwoDecimals, width: 70},
            { headerName: 'SG: Arg', field: 'sgArg', valueFormatter: roundToTwoDecimals, width: 70},
            { headerName: 'SG: App', field: 'sgApp', valueFormatter: roundToTwoDecimals, width: 70},
            { headerName: 'SG: Ott', field: 'sgOtt', valueFormatter: roundToTwoDecimals, width: 70},
            { headerName: 'SG: T2G', field: 'sgT2G', valueFormatter: roundToTwoDecimals, width: 70},
            { headerName: 'SG: TOT', field: 'sgTot', valueFormatter: roundToTwoDecimals, width: 70},
            ];
        
        // Function to round some columns to 2 decimals
        function roundToTwoDecimals(params) {
            // Check if the value is a number before rounding
            if (typeof params.value === 'number') {
                return params.value.toFixed(2);
            }
            // If the value is not a number, return it as is
            return params.value;
        }
        
        // Define set values for color scales
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
        
        // Declare which color scale values each field has
        const colMinMax = {
            'sgPutt' : indMinMax,
            'sgArg' : indMinMax,
            'sgApp' : indMinMax,
            'sgOtt' : indMinMax,
            'sgT2G' : t2gMinMax,
            'sgTot' : totMinMax,
        }

        // Define actual cell color scales
        const colorScales = {};
        const fieldNames = Object.keys(colMinMax);
        for (let i = 0; i < fieldNames.length; i++) {
            const fieldName = fieldNames[i];
            const { minValue, midValue, maxValue } = colMinMax[fieldName];

            const colorScale = d3.scaleLinear()
                .domain([minValue, midValue, maxValue]);

            colorScale.range(['#F83E3E', '#FFFFFF', '#4579F1']);

            colorScales[fieldName] = colorScale;
        }

        // Specify columns with a color scale
        const columnsWithColorScale = ['sgPutt', 'sgArg', 'sgApp', 'sgOtt',
                                        'sgT2G', 'sgTot'];

        // Setup overall cell styles
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

        function getColumnWidth(field) {
            sg = ['sgPutt', 'sgArg', 'sgApp', 'sgT2G', 'sgOtt', 'sgTot'];

            if(field == 'dates') {
                return 70;
            } else if(field == 'finish') {
                return 55;
            } else if(field == 'tournament') {
                return 280;
            } else if(field == 'Round') {
                return 60;
            } else if(sg.includes(field)) {
                return 65;
            } else {
                return 65;                
            }
        }

        // Finalize grid options for ag-grid
        const gridOptions = {
            columnDefs: columnDefs.map(column => ({
                ...column,
                cellStyle: globalCellStyle,
                width: getColumnWidth(column.field)
            })),
            rowData: documentData,
            suppressColumnVirtualisation: true,
            onFirstDataRendered: function (params) {
                console.log('grid is ready');
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
        
        // Create Grid
        profGridApi = agGrid.createGrid(document.querySelector('#golferProfTable'), gridOptions);
        isDataTableInitialized = true; // Set the flag to indicate DataTable is now initialized
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

// Golfer Profile Search Box onChange
function onFilterTextBoxChangedGp() {
    // the function for the search box which filters the table 
    // based on 'filter-text-box-Gp' for gridApi grid
    profGridApi.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box-GP').value
    );

    loadProfOverview();
}

let ovrProfGridApi;

// For overall stats on golfer profile page
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

        // Develop average SG categories over lastN rounds
        let avgRoundData = {};
        if (playerRounds.length > 0) { // Check if player has SG Data rounds
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

        // Make data into number unless it is null
        function formatData(value, source, isRank) {
            if (source && source[value] !== null && source[value] !== undefined) {
                if (isRank == 0) {  // For non-rank stats
                    return Number(source[value].toFixed(2));
                } else {  // For rank stats
                    let val = value + "Rank";
                    return Number(source[val].toFixed(0));
                }
            }
            return null;  // Return null if value is null or undefined
        }
        
        // Function to generate data object with formatted values
        function generateData(source, stats) {
            const data = {};
        
            // Loop through the stats array and format both stat and rank values
            for (let i = 0; i < stats.length; i++) {
                let keyStat = stats[i];
                let keyRank = keyStat + "R";  // The rank version of the stat
        
                // Format and assign values to the data object
                data[keyStat] = source ? formatData(keyStat, source, 0) : null;  // Format regular stat
                data[keyRank] = source ? formatData(keyStat, source, 1) : null;  // Format rank stat
            }
        
            return data;  // Return the generated data object
        }
        
        // Example stats list
        const stats = [
            'sgPutt', 'sgArg', 'sgApp', 'sgOtt', 'sgT2G', 'sgTot', 'drDist', 'drAcc',
            'gir', 'sandSave', 'scrambling', 'app50_75', 'app75_100', 'app100_125', 'app125_150',
            'app175_200', 'app200_up', 'bob', 'bogAvd', 'par3Scoring', 'par4Scoring', 'par5Scoring',
            'prox', 'roughProx', 'puttingBob', 'threePuttAvd', 'bonusPutt'
        ];

        // Set pgatourData 'dict' to hold pgatour stats if exist
        let pgatour = jsonData.pgatour[0];
        let pgatourData = generateData(pgatour, stats);

        // Funct to get color based on value
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

        const columnDefs = [
            { headerName: "Stat", field: "statName", width: 90, cellStyle: {textAlign: 'left', fontSize: '12px', paddingLeft: "5px"}},
            { headerName: "Value", field: "value", cellStyle: params => ({ backgroundColor: params.valueColor }), width: 70, 
                cellStyle: params => {
                    const rankValue = params.data.rank;
                    const statValue = params.data.value;
                    const stat = params.data.statName;

                    let col;

                    if(rankValue == '-'){
                        col = getColorFromScale2(statValue, statName);
                    } else if (rankValue !== null && rankValue !== undefined){
                        col = getColorFromScale(rankValue);
                    } else {
                        col = 'transparent';
                    }

                    return {
                        fontSize: '12px',
                        padding: '1px',
                        textAlign: 'center',
                        backgroundColor: col
                    }
                }},
            { headerName: "Rank", field: "rank", width: 58, cellStyle: {textAlign: 'center', fontSize: '12px', padding: '1px'}}
        ]

        const rowData = [];

        // Map behind the scenes name to front end name
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
            app50_75: 'App50-75',
            app75_100: 'App75-100',
            app100_125: 'App100-125',
            app125_150: 'App125-150',
            app150_175: 'App150-175',
            app175_200: 'App175-200',
            app200_up: 'App200+',
            bob: 'BOB%',
            bogAvd: 'Bog. Avd.',
            par3Scoring: 'Par 3s',
            par4Scoring: 'Par 4s',
            par5Scoring: 'Par 5s',
            prox: 'Prox.',
            roughProx: 'Rough Prox.',
            puttingBob: 'PuttBOB%',
            threePuttAvd: '3-PuttAvd',
            bonusPutt: 'BonusPutt',
        };

        if (pgatourData == null){ // Player doesn't have PGA Tour data
            // Add SG averages to the table
            const noPgaStats = ['sgPutt', 'sgArg', 'sgApp', 'sgOtt', 'sgT2G', 'sgTot'];
            noPgaStats.forEach(stat => {
                rowData.push({
                    statName: statMappings[stat],
                    value: avgRoundData[stat],
                    rank: '-',
                    valueColor: getColorFromScale2(avgRoundData[stat], stat)
                });
            });
        } else {
            // Add SG averages and PGA Tour stats to the table
            for (let stat in pgatourData) {
                if (pgatourData.hasOwnProperty(stat) && !stat.endsWith('R')) {
                    rowData.push({
                        statName: statMappings[stat],
                        value: pgatourData[stat],
                        rank: pgatourData[stat + 'R'],
                        valueColor: getColorFromScale(pgatourData[stat + 'R'])
                    });
                }
            }
        }

        const gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            getRowHeight: function(params) {
                return 20;
            },
            headerHeight: 25,
            getRowStyle: function (params) {
                return { borderBottom: '1px solid #ccc' };
            },
        };

        if(ovrProfGridApi != null) {
            ovrProfGridApi = null;
            document.getElementById(('overallStatsProfile')).innerHTML = '';
        }
        ovrProfGridApi = agGrid.createGrid(document.querySelector('#overallStatsProfile'), gridOptions);
    })
}

// For dropdown list of players in Golfer Profile page
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
        
        // Add all players to an html
        for (let i=0; i<jsonData.length; i++){
            let object = jsonData[i];
            if(i == 0){
                htmlString += '<option value="' + object.player + '" default>' + object.player + '</option>';
            } else {
                htmlString += '<option value="' + object.player + '">' + object.player + '</option>';
            }
        }

        // add html of players to dropdown
        playerDropdown.innerHTML = htmlString;

        // reload profile and profile overview
        loadProfile();
        loadProfOverview();
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

// Helper function to get the median of an array
function getMedian(arr) {
    const sorted = arr.map(parseFloat).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Makes dict of color scales for specified colsWithColors
function makeColorScales(dataTableData, colsWithColors, colsWithRevColors) {
    const columnData = {};
    colsWithColors.forEach(col => columnData[col] = []);

    // Place Data for each column in columnData
    dataTableData.forEach(player => {
        colsWithColors.forEach(col => {
            if(player[col] != null) {
                columnData[col].push(player[col]);
            }
        });
    });

    // Store min, median, max for each column
    const colMinMax = {};
    colsWithColors.forEach(col => {
        const values = columnData[col];
        colMinMax[col] = {
            minValue: Math.min(...values),
            midValue: getMedian(values),
            maxValue: Math.max(...values),
        };
    });

    // Hold color scales for each column
    const colorScales = {};
    colsWithColors.forEach(col => {
        const { minValue, midValue, maxValue } = colMinMax[col];
        colorScales[col] = d3.scaleLinear()
            .domain([minValue, midValue, maxValue])
        
        if(colsWithRevColors.includes(col)){
            colorScales[col].range(['#4579F1', '#FFFFFF', '#F83E3E']);
        } else {
            colorScales[col].range(['#F83E3E', '#FFFFFF', '#4579F1']);
        }
            
    });

    return colorScales;
}

let isFloorCeilingInitialized = false;
let gridApiFloorCeiling;

function loadFloorCeilingSheet() {
    let baseRounds = document.getElementById('baseRdsInp');
    let sheet = document.getElementById('floorCeilSheet');

    let url = '/get/floorCeilSheet/';

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) => {
        console.log(jsonData);

        // Ensure server sent the correct data
        if (!jsonData.salaries || !jsonData.tournamentRow){
            console.log('Invalid data format, expected "salaries" and "tournamentRow".');
            return;
        }

        // Create array of data for data table (SG Threshold %'s)
        let dataTableData = [];
        for(let i = 0; i < jsonData.salaries.length; i++) {
            const salary = jsonData.salaries[i];
            const player = salary.player;
            const fdSalary = salary.fdSalary;
            const dkSalary = salary.dkSalary;

            // playerRounds: array of last N rounds for player
            let playerRounds = jsonData.tournamentRow.filter((round) => round.player === player)
                .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
                .slice(0, baseRounds.value);

            // Arrays to calculate total rounds by sg threshold
            let thresholds = [0, 1, 2, 3, 4, 5];
            let totals = [];
            let totRounds = playerRounds.length;

            // Set all totals to zero
            for(let i = 0; i < thresholds.length; i++) {
                totals.push(0);
            }

            if(totRounds > 0) {
                // For each sg thresh, add to total rds for each thresh for each rd
                for(let round of playerRounds) {
                    for(let i = 0; i < thresholds.length; i++) {
                        if(round.sgTot >= thresholds[i]) {
                            totals[i]++;
                        }
                    }
                }

                // Calculate percentages for each sg threshold
                let percentages = [];
                for(let total of totals) {
                    percentages.push(Number((total / totRounds).toFixed(2)));
                }

                // Give variable names for percentages
                sg0Plus = percentages[0];
                sg1Plus = percentages[1];
                sg2Plus = percentages[2];
                sg3Plus = percentages[3];
                sg4Plus = percentages[4];
                sg5Plus = percentages[5];
            } else {
                // Default to zero for no rounds
                sg0Plus = sg1Plus = sg2Plus = sg3Plus = sg4Plus = sg5Plus = 0.00;
            }

            let finalData = {
                player,
                fdSalary,
                dkSalary,
                sg0Plus,
                sg1Plus,
                sg2Plus,
                sg3Plus,
                sg4Plus,
                sg5Plus,
                totRounds
            };

            dataTableData.push(finalData);
        }

        // Specify columns with color scale
        const columnsWithColorScale = ['sg0Plus', 'sg1Plus', 'sg2Plus', 'sg3Plus',
                                        'sg4Plus', 'sg5Plus'];
        
        const columnsWithRevColorScale = [];

        const colorScales = makeColorScales(dataTableData, columnsWithColorScale, columnsWithRevColorScale);

        // Set global cell style (includes color scale specification)
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

        // Define col defs for table
        let columnDefs = [
            {headerName: 'Player', field: 'player', width: 200},
            {headerName: 'FD Salary', field: 'fdSalary', width: 75},
            {headerName: 'DK Salary', field: 'dkSalary', width: 75},
            {headerName: 'SG: 0+', field: 'sg0Plus', width: 70},
            {headerName: 'SG: 1+', field: 'sg1Plus', width: 70},
            {headerName: 'SG: 2+', field: 'sg2Plus', width: 70},
            {headerName: 'SG: 3+', field: 'sg3Plus', width: 70},
            {headerName: 'SG: 4+', field: 'sg4Plus', width: 70},
            {headerName: 'SG: 5+', field: 'sg5Plus', width: 70},
            {headerName: 'Tot Rds', field: 'totRounds', width: 60},
        ];

        // Function to clear the sheet before initializing
        function clearFloorCeilSheetContent() {
                const floorCeilSheet = document.getElementById('floorCeilSheet');
                if (floorCeilSheet) {
                    floorCeilSheet.innerHTML = '';
                }
        };

        // Function to initialize the sheet
        function initializeFloorCeilSheet() {

            // Clear sheet if initialized
            if (isFloorCeilingInitialized) {
                clearFloorCeilSheetContent();
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
                },
                getRowHeight: function(params) {
                    return 25;
                },
                headerHeight: 30,
            };
    
            // Create the grid using createGrid
            gridApiFloorCeiling = agGrid.createGrid(document.querySelector('#floorCeilSheet'), gridOptions);
            isFloorCeilingInitialized = true;
        };

        // make call to initialize the sheet
        initializeFloorCeilSheet();

        console.log("data table data", dataTableData);
    })
}

// Floor ceiling sheet search box onChange
function onFilterTextBoxChangedFloorCeil() {
    gridApiFloorCeiling.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box-floor-ceil').value
    );
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

        // Ensure sever sent correct data
        if (!jsonData.salaries || !jsonData.tournamentRow){
            console.log('Invalid data format, expected "salaries" and "tournamentRow".');
            return;
        }

        // Returns dict of average for sg cats for last numRounds
        function averageSgCats(numRounds, jsonData, player) {
            // playerRounds: array of last N rounds for player
            let playerRounds = jsonData.tournamentRow.filter((round) => round.player === player)
            .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
            .slice(0, numRounds);

            // Get average of each sg category over last N rounds
            let avgRoundData = {};
            avgRoundData['baseRds'] = playerRounds.length;
            let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt'];
            if(playerRounds.length > 0) {
                for(let i = 0; i < columnsToAverage.length; i++) {
                    let col = columnsToAverage[i];
                    let sum = 0;
                    for(let j = 0; j < playerRounds.length; j++) {
                        sum += playerRounds[j][col];
                    }
                    let averageValue = sum / playerRounds.length;
                    avgRoundData[col] = Number(averageValue.toFixed(2));
                }
            } else {
                // Default values to null
                for(let i = 0; i < columnsToAverage.length; i++) {
                    avgRoundData[columnsToAverage[i]] = null;
                }
            }

            return avgRoundData;
        }

        // Produce trends data table data
        let dataTableData = [];
        for(let i = 0; i < jsonData.salaries.length; i++) {
            const salary = jsonData.salaries[i];
            const player = salary.player;
            const fdSalary = salary.fdSalary;
            const dkSalary = salary.dkSalary;

            // Get averages by sg category over last N
            let avgRoundData = averageSgCats(recentRounds.value, jsonData, player);

            // Get averages by sg category over last BASE_N
            let avgRoundBaseData = averageSgCats(baseRounds.value, jsonData, player);

            let trendsData = {
                player,
                fdSalary,
                dkSalary,
                'sgPutt': null,
                'sgArg': null,
                'sgApp': null,
                'sgOtt': null,
                'sgHeat': null,
                'baseRds': 0
            };

            if(avgRoundData.baseRds !== 0) {
                const sgPuttDiff = avgRoundData.sgPutt - avgRoundBaseData.sgPutt;
                const sgArgDiff = avgRoundData.sgArg - avgRoundBaseData.sgArg;
                const sgAppDiff = avgRoundData.sgApp - avgRoundBaseData.sgApp;
                const sgOttDiff = avgRoundData.sgOtt - avgRoundBaseData.sgOtt;

                trendsData = {
                    ...trendsData,
                    'sgPutt': Number(sgPuttDiff.toFixed(2)),
                    'sgArg': Number(sgArgDiff.toFixed(2)),
                    'sgApp': Number(sgAppDiff.toFixed(2)),
                    'sgOtt': Number(sgOttDiff.toFixed(2)),
                    'sgHeat': Number((sgPuttDiff + sgArgDiff + sgAppDiff + sgOttDiff).toFixed(2)),
                    'baseRds': avgRoundBaseData.baseRds
                };
            }

            dataTableData.push(trendsData);
        }

        // Define col defs for table
        let columnDefs = [
            {headerName: 'Player', field: 'player', width: 200},
            {headerName: 'FD Salary', field: 'fdSalary', width: 75},
            {headerName: 'DK Salary', field: 'dkSalary', width: 75},
            {headerName: 'SG: Putt', field: 'sgPutt', width: 70},
            {headerName: 'SG: Arg', field: 'sgArg', width: 70},
            {headerName: 'SG: App', field: 'sgApp', width: 70},
            {headerName: 'SG: Ott', field: 'sgOtt', width: 70},
            {headerName: 'SG HEAT', field: 'sgHeat', sortable: true, sort: 'desc', width: 80},
            {headerName: 'Base Rds', field: 'baseRds', width: 70},
        ];

        // Specify columns with a color scale
        const columnsWithColorScale = ['sgPutt', 'sgArg', 'sgApp', 'sgOtt',
                                        'sgHeat'];

        const columnsWithRevColorScale = [];

        const colorScales = makeColorScales(dataTableData, columnsWithColorScale, columnsWithRevColorScale);

        // Set global cell style for table (includes color scales)
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

        // Clears content of trends sheet
        function clearCheatSheetContent() {
                const trendSheet = document.getElementById('trendSheet');
                if (trendSheet) {
                    trendSheet.innerHTML = ''; // Clear content
                }
        };

        // Places trends 'Quad Plot'
        function placePlot() {
        
            // Adds distance from center plot to data table data
            let playersWithDistances = [];
            for (let i = 0; i < dataTableData.length; i++) {
                const d = dataTableData[i];
                playersWithDistances.push({
                    ...d,
                    distance: Math.sqrt(d.sgPutt ** 2 + d.sgApp ** 2)
                });
            }
            playersWithDistances.sort((a, b) => b.distance - a.distance);
        
            // Select the top N players by distance to mark with text
            let topPlayers = [];
            for (let i = 0; i < Math.min(15, playersWithDistances.length); i++) {
                topPlayers.push(playersWithDistances[i].player);
            }
        
            // Prepare data for the plot
            let xValues = [];
            let yValues = [];
            let textValues = [];
            let textPositions = [];
            let hoverTexts = [];
            let customData = [];
            const positions = ['top center', 'bottom center', 'middle left', 'middle right'];

            for (let i = 0; i < dataTableData.length; i++) {
                const d = dataTableData[i];
                xValues.push(d.sgPutt);
                yValues.push(d.sgApp);
                textValues.push(topPlayers.includes(d.player) ? d.player : '');
                textPositions.push(positions[i % positions.length]); // txt positions vary
                hoverTexts.push(d.player);
                customData.push(d.player);
            }

            const trace = {
                x: xValues,
                y: yValues,
                mode: 'markers+text',
                type: 'scatter',
                text: textValues,
                textposition: textPositions,
                hovertext: hoverTexts,
                hoverinfo: 'text',
                hovertemplate: 
                    '%{customdata}<br>' +
                    'SG Putt: %{x}<br>' +
                    'SG App: %{y}<br><extra></extra>',
                customdata: customData,
                marker: { size: 5, color: 'blue' }
            };
        
            // Layout settings
            const layout = {
                title: { 
                    text: '<b>SG: Putt vs. SG: App</b>',
                    font: {
                        family: 'Arial, sans-serif',
                        size: 20
                    }
                 },
                xaxis: { 
                    title: {
                        text: '<b>SG Putting</b>',
                        font: {
                            family: 'Arial, sans-serif',
                            size: 14
                        },
                    },
                    range: [Math.min(...trace.x) - 0.5, Math.max(...trace.x) + 0.5]
                },
                yaxis: { 
                    title: {
                        text: '<b>SG Approach</b>',
                        font: {
                            family: 'Arial, sans-serif',
                            size: 14
                        },
                    },
                    range: [Math.min(...trace.y) - 0.5, Math.max(...trace.y) + 0.5]
                },
                margin: { l: 50, r: 50, b: 50, t: 50, pad: 10 },
                hovermode: 'closest',
                font: {
                    family: 'Arial, sans-serif', 
                    size: 10,  // Default text size
                    color: '#000000'
                },
            };
        
            // Create the plot
            Plotly.newPlot('quadPlot', [trace], layout);
        }        

        // Initializes cheat sheet and quad plot
        function initializeCheatSheet() {

            // clear cheat sheet if needed
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
                suppressColumnVirtualisation: true,
                onFirstDataRendered: function (params) {
                    console.log('grid is ready');
                },
                getRowHeight: function(params) {
                    return 25;
                },
                headerHeight: 30,
            };
    
            // Create the grid using createGrid
            gridApiTrends = agGrid.createGrid(document.querySelector('#trendSheet'), gridOptions);
            placePlot();
            isTrendSheetInitialized = true;
        };

        initializeCheatSheet();
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

// Trend sheet search box onChange
function onFilterTextBoxChangedTrend() {
    gridApiTrends.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box-trend').value
    );
}

let isModelSheetInitialized = false;
let gridApiModel;
let gridOptionsModel;
let savedData;

function loadModelResults() {

    // Grab all custom model inputs:
    const ids = ['sgPuttPGAinput', 'sgAppPGAinput', 'sgT2GPGAinput', 'sgArgPGAinput', 'sgOttPGAinput',
        'sgTotPGAinput', 'sgPutt12input', 'sgApp12input', 'sgT2G12input', 'sgArg12input', 'sgOtt12input', 'sgTot12input',
        'sgPutt24input', 'sgApp24input', 'sgT2G24input', 'sgArg24input', 'sgOtt24input', 'sgTot24input',
        'sgPutt36input', 'sgApp36input', 'sgT2G36input', 'sgArg36input', 'sgOtt36input', 'sgTot36input',
        'sgPutt50input', 'sgApp50input', 'sgT2G50input', 'sgArg50input', 'sgOtt50input', 'sgTot50input',
        'drDist', 'bob', 'sandSave', 'par3scoring', 'par5scoring', 'prox', 'app50_75', 'app100_125', 
        'app150_175', 'app200_up', 'bonusPutt', 'drAcc', 'bogAvd', 'scrambling', 'par4scoring', 
        'gir', 'roughProx', 'app75_100', 'app125_150', 'app175_200', 'puttingBob', 'threePuttAvd', 
        'easyField', 'mediumField', 'hardField', 'courseHistory'
    ];

    // Create dictionary of inputs
    const weights = {};
    for(let i = 0; i < ids.length; i++) {
        let key = ids[i];
        let value = document.getElementById(key).value;
        if(key.endsWith('input')) {
            key = key.slice(0, -5);
        } else if(key == 'easyField') {
            key = 'sgEasy';
        } else if(key == 'mediumField') {
            key = 'sgMed';
        } else if(key == 'hardField') {
            key = 'sgHard';
        } else if(key == 'courseHistory') {
            key = 'chAvg';
        }
        weights[key] = value;
    }

    let url = '/get/modelSheet/';

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) =>{
        // Ensure that all parts of the jsonData are there.
        if (!jsonData.salaries || !jsonData.pgatour || !jsonData.courseHistory || !jsonData.tournamentRow || !jsonData.fieldStrength) {
            console.log('Invalid data format. Expected "salaries", "pgatour", "courseHistory","tournamentRow", and "fieldStrength" properties.');
            return;
        }

        // For each salary row (essentially for each player)
        let dataTableData = [];
        for(let i = 0; i < jsonData.salaries.length; i++) {
            const salary = jsonData.salaries[i];
            const player = salary.player;
            const fdSalary = salary.fdSalary;
            const dkSalary = salary.dkSalary;

            // SG: PGATOUR.COM
            // Grab player's pgatour data
            let pgatourData = jsonData.pgatour.find((pgatour) => pgatour.player === player);

            // COURSE HISTORY
            // Grab player's course history
            let courseHistoryData = jsonData.courseHistory.find((courseHistory) => courseHistory.player === player);

            // If no player is found in course history, default all course history to null
            if (!courseHistoryData) {
                const courseHistoryKeys = ['minus1', 'minus2', 'minus3', 'minus4', 'minus5'];
                courseHistoryData = Object.fromEntries(courseHistoryKeys.map(key => [key, null]));
            }

            // SG LAST N ROUNDS
            // Calculate averages for all sg categories for num round buckets!
            function averageSgCats(numRounds, jsonData, player) {
                // playerRounds: array of last N rounds for player
                let playerRounds = jsonData.tournamentRow.filter((round) => round.player === player)
                .sort((a, b) => new Date(b.dates) - new Date(a.dates) || b.Round - a.Round)
                .slice(0, numRounds);
    
                // Get average of each sg category over last N rounds
                let avgRoundData = {};
                avgRoundData['baseRds'] = playerRounds.length;
                let columnsToAverage = ['sgOtt', 'sgApp', 'sgArg', 'sgPutt', 'sgT2G', 'sgTot'];
                if(playerRounds.length > 0) {
                    for(let i = 0; i < columnsToAverage.length; i++) {
                        let col = columnsToAverage[i];
                        let sum = 0;
                        for(let j = 0; j < playerRounds.length; j++) {
                            sum += playerRounds[j][col];
                        }
                        let averageValue = sum / playerRounds.length;
                        avgRoundData[col] = Number(averageValue.toFixed(2));
                    }
                } else {
                    // Default values to null
                    for(let i = 0; i < columnsToAverage.length; i++) {
                        avgRoundData[columnsToAverage[i]] = null;
                    }
                }
    
                return avgRoundData;
            }

            // SG: LAST 12 ROUNDS
            let avgRoundData12 = averageSgCats(12, jsonData, player);
            let updatedAvgRoundData12 = {};
            for (let key in avgRoundData12) {
                if (avgRoundData12.hasOwnProperty(key)) {
                    updatedAvgRoundData12[key + '12'] = avgRoundData12[key];
                }
            }
            avgRoundData12 = updatedAvgRoundData12;

            // SG: LAST 24 ROUNDS
            let avgRoundData24 = averageSgCats(24, jsonData, player);
            let updatedAvgRoundData24 = {};
            for (let key in avgRoundData24) {
                if (avgRoundData24.hasOwnProperty(key)) {
                    updatedAvgRoundData24[key + '24'] = avgRoundData24[key];
                }
            }
            avgRoundData24 = updatedAvgRoundData24;

            // SG: LAST 36 ROUNDS
            let avgRoundData36 = averageSgCats(36, jsonData, player);
            let updatedAvgRoundData36 = {};
            for (let key in avgRoundData36) {
                if (avgRoundData36.hasOwnProperty(key)) {
                    updatedAvgRoundData36[key + '36'] = avgRoundData36[key];
                }
            }
            avgRoundData36 = updatedAvgRoundData36;

            // SG: LAST 50 ROUNDS
            let avgRoundData50 = averageSgCats(50, jsonData, player);
            let updatedAvgRoundData50 = {};
            for (let key in avgRoundData50) {
                if (avgRoundData50.hasOwnProperty(key)) {
                    updatedAvgRoundData50[key + '50'] = avgRoundData50[key];
                }
            }
            avgRoundData50 = updatedAvgRoundData50;

            // RECENT HISTORY - get most recent 10 rounds for Player
            let tournamentAbbreviations = makeTournAbbrv(jsonData);
            let recentHistory = getRecentHistory(jsonData.tournamentRow, player);

           // FIELD STRENGTH PERFORMANCE
           let fieldStrengthData = {};
           let playerTournamentData = jsonData.tournamentRow.filter((round) => round.player === player);

           let fieldStrength = {
                easy: {total: 0, count: 0},
                medium: {total: 0, count: 0},
                hard: {total: 0, count: 0}
           }

           function calculateAverage(total, count) {
                return count === 0 ? null : Number((total / count).toFixed(2));
            }

            // Sum up sg and num rds for different field strengths for player
            for (let i = 0; i < playerTournamentData.length; i++) {
                let row = playerTournamentData[i];
                let sofTournament = jsonData.fieldStrength.find(tourneyData => tourneyData.tournament === row.tournament);
                
                if (!sofTournament) {
                    console.error("Couldn't find tournament:", row.tournament);
                    continue; // Skip this row if no strength data is found
                }
            
                let sof = sofTournament.strength;
                if (sof <= -0.15) {
                    fieldStrength.easy.total += row.sgTot;
                    fieldStrength.easy.count++;
                } else if (sof >= 0.7) {
                    fieldStrength.hard.total += row.sgTot;
                    fieldStrength.hard.count++;
                } else {
                    fieldStrength.medium.total += row.sgTot;
                    fieldStrength.medium.count++;
                }
            }
            
            // Calculate averages for each field strength
            //     Note: We use difference of sg_avg_for_difficulty_level - sg_average_overall
            //           to adjust for player strength
            fieldStrengthData = {
                sgEasy: Number((calculateAverage(fieldStrength.easy.total, fieldStrength.easy.count) - avgRoundData50.sgTot50).toFixed(2)),
                sgMed: Number((calculateAverage(fieldStrength.medium.total, fieldStrength.medium.count) - avgRoundData50.sgTot50).toFixed(2)),
                sgHard: Number((calculateAverage(fieldStrength.hard.total, fieldStrength.hard.count) - avgRoundData50.sgTot50).toFixed(2))
            };

            function formatData(value) {
                // Returns null or the stat value
                return value !== null && value !== undefined ? Number(value.toFixed(2)) : null;
            }

            // FILTER PLAYER DATA FOR ALL CATEGORIES
            function generateFilteredData(source, keys) {
                // Generates a dictionary of PGATOUR statistics for player
                const data = {};

                const sgKeys = ["sgPutt", "sgArg", "sgApp", "sgOtt", "sgT2G", "sgTot"];
                for(let i = 0; i < keys.length; i++) {
                    let key;
                    if(sgKeys.includes(keys[i])) {
                        key = keys[i] + "PGA";
                    } else {
                        key = keys[i];
                    }
                    data[key] = source ? formatData(source[keys[i]]) : null;
                }
                return data;
            }

            const keys = [
                "sgPutt", "sgArg", "sgApp", "sgOtt", "sgT2G", "sgTot",
                "drDist", "drAcc", "gir", "sandSave", "scrambling",
                "app50_75", "app75_100", "app100_125", "app125_150",
                "app150_175", "app175_200", "app200_up", "bob", "bogAvd",
                "par3Scoring", "par4Scoring", "par5Scoring", "prox",
                "roughProx", "puttingBob", "threePuttAvd", "bonusPutt"
            ];

            let filteredPgatourData = generateFilteredData(pgatourData || null, keys);

            const rowData = {
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
                tournamentAbbreviations,
                ...fieldStrengthData,
            };

            if(rowData) {
                dataTableData.push(rowData);
            }
        }

        // Calculate average course history to quantify course history in model
        for (let i = 0; i < dataTableData.length; i++) {
            let playerData = dataTableData[i];

            // Extract the relevant stats for chAvg calculation
            let statsToAverage = ['minus1', 'minus2', 'minus3', 'minus4', 'minus5'];
            let validStats = [];

            // Collect valid stats (non-null and parsed as numbers)
            for (let j = 0; j < statsToAverage.length; j++) {
                let statKey = statsToAverage[j];
                let statValue = playerData[statKey];
                if (statValue !== null) {
                    let parsedValue = parseFloat(statValue);
                    if (!Number.isNaN(parsedValue)) {
                        validStats.push(parsedValue);
                    }
                }
            }

            // Calculate the average of valid stats
            let chAvg = null;
            if (validStats.length > 0) {
                let sum = 0;
                for (let k = 0; k < validStats.length; k++) {
                    sum += validStats[k];
                }
                chAvg = Number((sum / validStats.length).toFixed(2));
            }

            // Add chAvg to playerData
            playerData['chAvg'] = chAvg;
        }
        
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
            'prox', 'roughProx', 'puttingBob', 'threePuttAvd', 'bonusPutt', 'chAvg', 'fdSalary', 'dkSalary',
            'sgEasy', 'sgMed', 'sgHard'
        ];

        // Initialize accumulators for statistics
        const stats = {};
        zScoreFields.forEach(field => {
            stats[field] = { sum: 0, sumSquared: 0, count: 0 };
        });

        // Step 1: Collect sums and counts for mean and standard deviation calculation
        for (let playerData of dataTableData) {
            for (let stat of zScoreFields) {
                let value = playerData[stat];
                if (typeof value === 'number' && value !== null && !Number.isNaN(value)) {
                    stats[stat].sum += value;
                    stats[stat].sumSquared += value * value;
                    stats[stat].count++;
                }
            }
        }

        // Step 2: Calculate means and standard deviations of each stat
        const statMeans = {};
        const statStdDevs = {};

        for (let stat of zScoreFields) {
            const { sum, sumSquared, count } = stats[stat];
            if (count > 0) {
                const mean = sum / count;
                const variance = (sumSquared / count) - (mean * mean);
                const stdDev = Math.sqrt(variance);

                statMeans[stat] = mean;
                statStdDevs[stat] = stdDev;
            } else {
                statMeans[stat] = null;
                statStdDevs[stat] = null;
            }
        }

        // Step 3: Compute z-scores for each stat of each player
        for (let playerData of dataTableData) {
            for (let stat of zScoreFields) {
                let value = playerData[stat];
                if (typeof value === 'number' && value !== null && !Number.isNaN(value)) {
                    const mean = statMeans[stat];
                    const stdDev = statStdDevs[stat];
                    playerData[`${stat}_zScore`] = stdDev ? (value - mean) / stdDev : null;
                } else {
                    playerData[`${stat}_zScore`] = null;
                }
            }
        }

        // Normal CDF function
        function normalCDF(mean, sigma, to) {
            const z = (to - mean) / Math.sqrt(2 * sigma * sigma);
            const t = 1 / (1 + 0.3275911 * Math.abs(z));
            const coefficients = [1.061405429, -1.453152027, 1.421413741, -0.284496736, 0.254829592];
            const erf = 1 - coefficients.reduce((sum, coef, i) => sum * t + coef, 0) * t * Math.exp(-z * z);
            return 0.5 * (1 + Math.sign(z) * erf);
        }

        let weightDict = weights;

        // Stats to reverse sign of for analysis
        const reverseStats = ['app50_75','app75_100',
        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bogAvd', 'par3Scoring',
        'par4Scoring', 'par5Scoring', 'prox', 'roughProx', 'threePuttAvd', 'chAvg'];
        
        // Computation for weighted average of zScores, value, and fd/dk value
        for (let i = 0; i < dataTableData.length; i++) {
            let playerData = dataTableData[i];
            let ratingSum = 0;
            let weightSum = 0;
        
            // For each stat, calculate weighted sum and keep track of weights
            let statLog = {};
            for (let key in weightDict) {
                let zScore = playerData[`${key}_zScore`];
                let weight = parseFloat(weightDict[key]); // Convert weight to a number
        
                // Check validity of zScore and weight before using them
                if (zScore !== null && zScore !== undefined && weight && !isNaN(weight)) {
                    // Reverse the sign of z-score for reverse stats
                    if (reverseStats.includes(key)) {
                        zScore = -zScore;
                    }
        
                    ratingSum += zScore * weight;
                    weightSum += weight;
        
                    statLog[key] = weight;
                }
            }
        
            // Handle missing data by using the player's salary as a fallback
            let fullModel = true;
            if (weightSum !== 100) {
                fullModel = false;
                let remSum = 100 - weightSum;
                let platform = document.getElementById('platform').value;
                let salZScore = platform === 'fanduel' ? playerData['fdSalary_zScore'] : playerData['dkSalary_zScore'];
        
                ratingSum += salZScore * remSum;
                weightSum += remSum;
            }
        
            // Calculate weighted average rating
            let rating = weightSum !== 0 ? ratingSum / weightSum : null;
        
            // Calculate percentile of the outcome weighted average using normal CDF
            let percentile = null;
            if (rating !== null) {
                percentile = fullModel 
                    ? Number((normalCDF(0, 1, rating) * 100).toFixed(2)) 
                    : Number((normalCDF(0, 1, rating) * 100 - 10).toFixed(2)); // Adjusted value for incomplete models
            }
        
            // Calculate fdValue and dkValue
            let fdSalary = playerData['fdSalary']; // Replace with the actual FanDuel salary key
            let dkSalary = playerData['dkSalary']; // Replace with the actual DraftKings salary key
        
            let fdValue = rating !== null && fdSalary !== null ? Number((percentile / (fdSalary / 1000)).toFixed(2)) : null;
            let dkValue = rating !== null && dkSalary !== null ? Number((percentile / (dkSalary / 1000)).toFixed(2)) : null;
        
            // Add calculated values to playerData
            playerData['fdValue'] = fdValue;
            playerData['dkValue'] = dkValue;
            playerData['rating'] = percentile;
        }

        // Save current model data to local storage for use in optimizer
        let savePlatform = document.getElementById('platform').value;
        let savedData = [];
        for (let i = 0; i < dataTableData.length; i++) {
            let playerData = dataTableData[i];
            savedData.push({
                player: playerData.player,
                fdSalary: playerData.fdSalary,
                dkSalary: playerData.dkSalary,
                rating: playerData.rating,
                platform: savePlatform
            });
        }
        localStorage.setItem('modelData', JSON.stringify(savedData));
        console.log('Data saved:', savedData);

        // Custom column value comparator
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
            { headerName: 'Player', field: 'player', pinned: 'left', width: 180},
            { headerName: 'FD Salary', field: 'fdSalary', pinned: 'left', width: 78},
            { headerName: 'DK Salary', field: 'dkSalary', pinned: 'left', width: 78},
            { headerName: 'FD Value', field: 'fdValue', width: 70},
            { headerName: 'DK Value', field: 'dkValue', width: 70},
            { headerName: 'Model Rtg.', field: 'rating', sortable: true, sort: 'desc', width: 70},

            { headerName: 'SG:PuttL12', field: 'sgPutt12', hide: true },
            { headerName: 'SG:Arg L12', field: 'sgArg12', hide: true },
            { headerName: 'SG:AppL12', field: 'sgApp12', hide: true },
            { headerName: 'SG:OttL12', field: 'sgOtt12', hide: true },
            { headerName: 'SG:T2GL12', field: 'sgT2G12', hide: true },
            { headerName: 'SG:TotL12', field: 'sgTot12', hide: true },

            { headerName: 'SG:PuttL24', field: 'sgPutt24', hide: true },
            { headerName: 'SG:ArgL24', field: 'sgArg24', hide: true },
            { headerName: 'SG:AppL24', field: 'sgApp24', hide: true },
            { headerName: 'SG:OttL24', field: 'sgOtt24', hide: true },
            { headerName: 'SG:T2GL24', field: 'sgT2G24', hide: true },
            { headerName: 'SG:TotL24', field: 'sgTot24', hide: true },

            { headerName: 'SG:PuttL36', field: 'sgPutt36', hide: true },
            { headerName: 'SG:ArgL36', field: 'sgArg36', hide: true },
            { headerName: 'SG:AppL36', field: 'sgApp36', hide: true },
            { headerName: 'SG:OttL36', field: 'sgOtt36', hide: true },
            { headerName: 'SG:T2GL36', field: 'sgT2G36', hide: true },
            { headerName: 'SG:TotL36', field: 'sgTot36', hide: true },

            { headerName: 'SG:PuttL50', field: 'sgPutt50', hide: true },
            { headerName: 'SG:ArgL50', field: 'sgArg50', hide: true },
            { headerName: 'SG:AppL50', field: 'sgApp50', hide: true },
            { headerName: 'SG:OttL50', field: 'sgOtt50', hide: true },
            { headerName: 'SG:T2GL50', field: 'sgT2G50', hide: true },
            { headerName: 'SG:TotL50', field: 'sgTot50', hide: true },

            { headerName: 'SG:PuttPGA', field: 'sgPuttPGA', hide: true },
            { headerName: 'SG:ArgPGA', field: 'sgArgPGA', hide: true },
            { headerName: 'SG:AppPGA', field: 'sgAppPGA', hide: true },
            { headerName: 'SG:OttPGA', field: 'sgOttPGA', hide: true},
            { headerName: 'SG:T2GPGA', field: 'sgT2GPGA', hide: true },
            { headerName: 'SG:TotPGA', field: 'sgTotPGA', hide: true },

            { headerName: 'Dr. Dist.', field: 'drDist', hide: true },
            { headerName: 'Dr. Acc.', field: 'drAcc', hide: true },
            { headerName: 'GIR %', field: 'gir', hide: true },
            { headerName: 'SndSave%', field: 'sandSave', hide: true },
            { headerName: 'Scrbl%', field: 'scrambling', hide: true },
            { headerName: 'Ap50-75', field: 'app50_75', hide: true, comparator: customComparator },
            { headerName: 'Ap75-100', field: 'app75_100', hide: true, comparator: customComparator },
            { headerName: 'Ap100-125', field: 'app100_125', hide: true, comparator: customComparator },
            { headerName: 'Ap125-150', field: 'app125_150', hide: true, comparator: customComparator },
            { headerName: 'Ap150-175', field: 'app150_175', hide: true, comparator: customComparator },
            { headerName: 'Ap175-200', field: 'app175_200', hide: true, comparator: customComparator },
            { headerName: 'Ap200+', field: 'app200_up', hide: true, comparator: customComparator },
            { headerName: 'BoB %', field: 'bob', hide: true },
            { headerName: 'Bogey Avd.', field: 'bogAvd', hide: true, comparator: customComparator },
            { headerName: 'Par3Avg', field: 'par3Scoring', hide: true, comparator: customComparator },
            { headerName: 'Par4Avg', field: 'par4Scoring', hide: true, comparator: customComparator },
            { headerName: 'Par5Avg', field: 'par5Scoring', hide: true, comparator: customComparator },
            { headerName: 'Prox.', field: 'prox', hide: true, comparator: customComparator },
            { headerName: 'RoughProx.', field: 'roughProx', hide: true, comparator: customComparator },
            { headerName: 'PuttBoB %', field: 'puttingBob', hide: true },
            { headerName: '3-PuttAvd.', field: 'threePuttAvd', hide: true, comparator: customComparator },
            { headerName: 'Bonus Putt', field: 'bonusPutt', hide: true },
            { headerName: 'SG:EasyField', field: 'sgEasy', hide: true},
            { headerName: 'SG:MedField', field: 'sgMed', hide: true},
            { headerName: 'SG:HardField', field: 'sgHard', hide: true},
            { headerName: 'Course Hist.', field: 'chAvg', hide: true, comparator: customComparator },
        ];

        // Function to determine if a column should not be hidden (if has value in custom model, don't hide)
        function shouldNotHideColumn(key, weightDict) {
            const value = weightDict[key];

            // Check if the value is a number
            if (value !== '' && value !== undefined) {
                console.log('key: ', key, ' value: ', value);
                return true; // Do not hide if it's a number
            }

            return false; // Hide for other cases
        }

        // Set columns not in current custom model to be hidden
        columnDefs.forEach((column) => {
            if (column.field && shouldNotHideColumn(column.field, weightDict)) {
                column.hide = false;
            }
        });

        const columnsWithReversedColorScale = ['app50_75','app75_100',
        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bogAvd', 'par3Scoring',
        'par4Scoring', 'par5Scoring', 'prox', 'roughProx', 'threePuttAvd', 'chAvg'];

        const columnsWithColorScale = ['sgOtt12', 'sgApp12', 'sgArg12', 'sgPutt12', 'sgT2G12', 'sgTot12',
        'sgOtt24', 'sgApp24', 'sgArg24', 'sgPutt24', 'sgT2G24', 'sgTot24',
        'sgOtt36', 'sgApp36', 'sgArg36', 'sgPutt36', 'sgT2G36', 'sgTot36',
        'sgOtt50', 'sgApp50', 'sgArg50', 'sgPutt50', 'sgT2G50', 'sgTot50',
                                        'sgPuttPGA', 'sgArgPGA', 'sgAppPGA', 'sgOttPGA', 'sgT2GPGA', 'sgTotPGA',
                                        'drDist', 'drAcc', 'gir', 'sandSave', 'scrambling', 'app50_75', 'app75_100',
                                        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bob',
                                        'bogAvd', 'par3Scoring', 'par4Scoring', 'par5Scoring', 'prox', 'roughProx',
                                        'puttingBob', 'threePuttAvd', 'bonusPutt', 'rating', 'chAvg', 'sgEasy', 'sgMed', 'sgHard'];

        const colorScales = makeColorScales(dataTableData, columnsWithColorScale, columnsWithReversedColorScale);
        
        // Define global cell style (with color scale)
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

        // Clear model results content
        function clearModelResContent() {
            const cheatSheet = document.getElementById('modelSheet');
            if (cheatSheet) {
                cheatSheet.innerHTML = ''; // Clear content
            }
        }

        // Initialize model results sheet
        function initializeCheatSheet() {
            if (isModelSheetInitialized) {
                clearModelResContent();
            }

            function getColumnWidth(field) {
                let salary = ['fdSalary', 'dkSalary'];
                let value = ['fdValue', 'dkValue'];
    
                if(field == 'player') {
                    return 180;
                } else if(salary.includes(field)) {
                    return 78;
                } else if(value.includes(field)) {
                    return 70;
                } else {
                    return 80;
                }
            }
        
            // Setup grid options
            gridOptionsModel = {
                columnDefs: columnDefs.map(column => ({
                    ...column,
                    cellStyle: globalCellStyle,
                    width: getColumnWidth(column.field),
                    children: column.children ? column.children.map(child => ({
                        ...child,
                        cellStyle: globalCellStyle,
                    })) : undefined,
                })),
                rowData: dataTableData,
                suppressColumnVirtualisation: true,
                onFirstDataRendered: function (params) {
                    console.log('grid is ready');
                },
                getRowHeight: function(params) {
                    return 25;
                },
                headerHeight: 30,
            };
        
            // Update column visibility based on platform
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

                    column.width = getColumnWidth(colId);
                });
            
                if (gridOptionsModel.api) {
                    gridOptionsModel.api.setColumnDefs(gridOptionsModel.columnDefs); // Reapply updated column definitions
                } else {
                    console.error('Grid API is not initialized yet.');
                }
            }                      
        
            clearModelResContent();
            gridApiModel = new agGrid.createGrid(document.querySelector('#modelSheet'), gridOptionsModel);
            updateColumnVisibility();
        
            isModelSheetInitialized = true;
        }

        // Row hovering shadow function
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

// Model search box onChange
function onFilterTextBoxChangedModel() {
    gridApiModel.setGridOption(
        'quickFilterText',
        document.getElementById('filter-text-box-model').value
      );
}

// Change sum of model inputs when they are changed
function onModelInputChange() {
    const currentSum = document.getElementById('currSumModel');

    // List of all input field IDs
    const inputIds = [
        'sgPuttPGAinput', 'sgAppPGAinput', 'sgT2GPGAinput', 'sgArgPGAinput', 'sgOttPGAinput', 'sgTotPGAinput',
        'sgPutt12input', 'sgApp12input', 'sgT2G12input', 'sgArg12input', 'sgOtt12input', 'sgTot12input',
        'sgPutt24input', 'sgApp24input', 'sgT2G24input', 'sgArg24input', 'sgOtt24input', 'sgTot24input',
        'sgPutt36input', 'sgApp36input', 'sgT2G36input', 'sgArg36input', 'sgOtt36input', 'sgTot36input',
        'sgPutt50input', 'sgApp50input', 'sgT2G50input', 'sgArg50input', 'sgOtt50input', 'sgTot50input',
        'drDist', 'bob', 'sandSave', 'par3scoring', 'par5scoring', 'prox', 'app50_75', 'app100_125', 'app150_175',
        'app200_up', 'bonusPutt', 'drAcc', 'bogAvd', 'scrambling', 'par4scoring', 'gir', 'roughProx', 'app75_100',
        'app125_150', 'app175_200', 'puttingBob', 'threePuttAvd', 'easyField', 'mediumField', 'hardField', 'courseHistory'
    ];

    // Sum of all input values
    const totalSum = inputIds.reduce((sum, id) => {
        const value = parseFloat(document.getElementById(id).value) || 0;
        return sum + value;
    }, 0);

    // Update the current sum
    currentSum.innerText = `Current Sum: ${totalSum.toFixed(1)}`;
}

// Call onModelInputChange() whenever a custom model field is changed
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
    // Gets saved model data from custom model
    function getSavedModelData() {
        const savedDataJSON = localStorage.getItem('selectedModelData');
        if (!savedDataJSON) {
            console.log('No saved model data found');
            return null;
        }
        console.log('Model data:', JSON.parse(savedDataJSON));
        return JSON.parse(savedDataJSON);
    }
    
    // Gets number of lineups to generate
    function getNumLineups() {
        const savedDataNum = localStorage.getItem('numLineups');
        const numLineups = savedDataNum ? parseInt(savedDataNum) : 0;
        if (!numLineups) {
            console.log('No saved number of lineups found');
        }
        return numLineups;
    }

    const modelData = getSavedModelData();
    if (!modelData) return;

    const numLineups = getNumLineups();
    if (!numLineups) return;

    // Sort model data by rating in descending order
    modelData.sort((a, b) => b.rating - a.rating);

    // Generate optimal lineups
    const allLineups = generateOptimalLineups(modelData, numLineups);

    // Show player exposure percentages
    const playerExposures = calculatePlayerPercentages(allLineups);
    populateDataTable(playerExposures);
    
    // Alert if not enough lineups can be generated
    if (allLineups.length < numLineups) {
        alert(`Based on your optimizer settings, can only make ${allLineups.length} total lineups.`);
    }

    console.log('All Lineups:', allLineups);

    function generateOptimalLineups(modelData, numLineups) {
        const platform = modelData[0].platform;
        const sortedModelData = modelData.slice(0, 40); // Only use top 40 players
        const allLineups = [];
        const maxLineups = choose(sortedModelData.length, 6);
    
        // Ensure we can generate the requested number of lineups
        const lineupsToGenerate = Math.min(numLineups, maxLineups);
        if (lineupsToGenerate < numLineups) {
            console.log(`Can only generate ${lineupsToGenerate} unique lineups. Add more players to fully generate!`);
        }
    
        const dataTable = initializeDataTable(numLineups);
    
        // Generate the specified number of lineups
        for (let i = 0; i < lineupsToGenerate; i++) {
            const bestLineup = { players: [], totalRating: 0, totalSalary: 0 };
            let targetRating;
            if (i === 0) {
                targetRating = 601;
            } else {
                targetRating = allLineups[allLineups.length - 1].totalRating - 0.01;
            }
    
            generateOptimalLineup(sortedModelData, 0, [], 0, bestLineup, targetRating, 0, platform);
    
            allLineups.push({ ...bestLineup });
            updateDataTable(dataTable, bestLineup);
        }
    
        dataTable.draw();
        return allLineups;
    }
    

    function generateOptimalLineup(modelData, currentIndex, currentLineup, currentTotalSalary, bestLineup, targetRating, currentTotalRating, platform) {
        // TODO: Can improve this logic in the future
        // BASE CASE: If the lineup contains 6 players, check if it's the best lineup found so far
        if (currentLineup.length === 6) {
            let totalRating = 0;
            let totalSalary = 0;
    
            // Loop to calculate the total rating
            for (let i = 0; i < currentLineup.length; i++) {
                totalRating += currentLineup[i].rating;
            }
    
            // Loop to calculate the total salary based on platform
            for (let i = 0; i < currentLineup.length; i++) {
                totalSalary += platform === 'fanduel' ? currentLineup[i].fdSalary : currentLineup[i].dkSalary;
            }
    
            // If the totalRating of this lineup is higher than the current best, update the best lineup
            if (!bestLineup.totalRating || totalRating > bestLineup.totalRating) {
                bestLineup.players = [...currentLineup];  // Copy the current lineup to bestLineup
                bestLineup.totalRating = totalRating;     // Update the total rating of the best lineup
                bestLineup.totalSalary = totalSalary;     // Update the total salary of the best lineup
            }
            return;  // Exit the function as we've reached a valid lineup of 6 players
        }
    
        // RECURSIVE CASE: Try adding each player starting from the current index
        for (let i = currentIndex; i < modelData.length; i++) {
            const currentPlayer = modelData[i];
            const playerSalary = platform === 'fanduel' ? currentPlayer.fdSalary : currentPlayer.dkSalary;
            const maxSalary = platform === 'fanduel' ? 60000 : 50000;
    
            // Check if adding this player would exceed the salary cap and if it doesn't exceed the target rating
            if (currentTotalSalary + playerSalary <= maxSalary && (!targetRating || currentTotalRating + currentPlayer.rating < targetRating)) {
                // Add current player to the lineup
                currentLineup.push(currentPlayer);
                // Recursively generate lineups with the new player added
                generateOptimalLineup(modelData, i + 1, currentLineup, currentTotalSalary + playerSalary, bestLineup, targetRating, currentTotalRating + currentPlayer.rating, platform);
                // Backtrack: Remove the player from the lineup to try the next one
                currentLineup.pop();
            }
        }
    }    
    
    // Function for x choose y
    function choose(x, y) {
        if (y < 0 || y > x) return 0;
        let result = 1;
        for (let i = 1; i <= y; i++) {
            result *= (x - i + 1) / i;
        }
        return Math.round(result);
    }
    
    // Initializes optimal lineup data table
    function initializeDataTable(numLineups) {
        return $('#allLineupsTable').DataTable({
            order: [[6, 'desc']], 
            pageLength: numLineups,
            dom: 'Bfrtip',
            buttons: ['excelHtml5']
        });
    }
    
    // Add lineup as row to dataTable data
    function updateDataTable(dataTable, bestLineup) {
        const rowData = [];
    
        // Loop through players to get their names
        for (let i = 0; i < bestLineup.players.length; i++) {
            rowData.push(bestLineup.players[i].player);
        }
    
        // Add totalRating and totalSalary at the end of the row data
        rowData.push(bestLineup.totalRating.toFixed(2));
        rowData.push(bestLineup.totalSalary);
    
        // Add the row to the DataTable
        dataTable.row.add(rowData);
    }
    
    // Calculates player exposure percentages
    function calculatePlayerPercentages(allLineups) {
        const playerCount = {};
    
        allLineups.forEach(lineup => {
            lineup.players.forEach(playerObj => {
                const playerName = playerObj.player;
                playerCount[playerName] = (playerCount[playerName] || 0) + 1;
            });
        });
    
        const totalLineups = allLineups.length;
        return Object.entries(playerCount).map(([player, count]) => ({
            player,
            percentage: ((count / totalLineups) * 100).toFixed(2)
        }));
    }
    
    // Populates player exposures to exposure table
    function populateDataTable(playerPercentages) {
        const table = $('#playerTable').DataTable({
            order: [[1, 'desc']],
            lengthChange: false,
            pageLength: -1
        });
    
        table.clear();
        playerPercentages.forEach(player => {
            table.row.add([player.player, `${player.percentage}%`]).draw();
        });
    }
}










