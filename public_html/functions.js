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
                    avgRoundData[col] = Number(averageValue.toFixed(2));
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
                    { headerName: 'SG: Putt PGA', field: 'sgPuttPGA', hide: true },
                    { headerName: 'SG: Arg PGA', field: 'sgArgPGA', hide: true },
                    { headerName: 'SG: App PGA', field: 'sgAppPGA', hide: true },
                    { headerName: 'SG: Ott PGA', field: 'sgOttPGA', hide: true},
                    { headerName: 'SG: T2G PGA', field: 'sgT2GPGA', hide: true },
                    { headerName: 'SG: Tot PGA', field: 'sgTotPGA', hide: true },
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
                        field: abbreviation
                    })),
                ],
            },
            // Course History grouping
            {
                headerName: 'Course History',
                children: [
                    { headerName: '-1', field: 'minus1' },
                    { headerName: '-2', field: 'minus2' },
                    { headerName: '-3', field: 'minus3' },
                    { headerName: '-4', field: 'minus4' },
                    { headerName: '-5', field: 'minus5' },
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
            { headerName: 'SG: Putt', field: 'sgPutt'},
            { headerName: 'SG: Arg', field: 'sgArg'},
            { headerName: 'SG: App', field: 'sgApp'},
            { headerName: 'SG: Ott', field: 'sgOtt'},
            { headerName: 'SG: T2G', field: 'sgT2G'},
            { headerName: 'SG: TOT', field: 'sgTot'},
            ];
        
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
                sgPutt: Number(pgatour.sgPutt.toFixed(2)),
                sgPuttR: Number(pgatour.sgPuttRank.toFixed(0)),
                sgArg: Number(pgatour.sgArg.toFixed(2)),
                sgArgR: Number(pgatour.sgArgRank.toFixed(0)),
                sgApp: Number(pgatour.sgApp.toFixed(2)),
                sgAppR: Number(pgatour.sgAppRank.toFixed(0)),
                sgOtt: Number(pgatour.sgOtt.toFixed(2)),
                sgOttR: Number(pgatour.sgOttRank.toFixed(0)),
                sgT2G: Number(pgatour.sgT2G.toFixed(2)),
                sgT2GR: Number(pgatour.sgT2GRank.toFixed(0)),
                sgTot: Number(pgatour.sgTot.toFixed(2)),
                sgTotR: Number(pgatour.sgTotRank.toFixed(0)),
                drDist: Number(pgatour.drDist.toFixed(1)),
                drDistR: Number(pgatour.drDistRank.toFixed(0)),
                drAcc: Number(pgatour.drAcc.toFixed(2)),
                drAccR: Number(pgatour.drAccRank.toFixed(0)),
                gir: Number(pgatour.gir.toFixed(2)),
                girR: Number(pgatour.girRank.toFixed(0)),
                sandSave: Number(pgatour.sandSave.toFixed(2)),
                sandSaveR: Number(pgatour.sandSaveRank.toFixed(0)),
                scrambling: Number(pgatour.scrambling.toFixed(2)),
                scramblingR: Number(pgatour.scramblingRank.toFixed(0)),
                app50_75: Number(pgatour.app50_75.toFixed(0)),
                app50_75R: Number(pgatour.app50_75Rank.toFixed(0)),
                app75_100: Number(pgatour.app75_100.toFixed(0)),
                app75_100R: Number(pgatour.app75_100Rank.toFixed(0)),
                app100_125: Number(pgatour.app100_125.toFixed(0)),
                app100_125R: Number(pgatour.app100_125Rank.toFixed(0)),
                app125_150: Number(pgatour.app125_150.toFixed(0)),
                app125_150R: Number(pgatour.app125_150Rank.toFixed(0)),
                app150_175: Number(pgatour.app150_175.toFixed(0)),
                app150_175R: Number(pgatour.app150_175Rank.toFixed(0)),
                app175_200: Number(pgatour.app175_200.toFixed(0)),
                app175_200R: Number(pgatour.app175_200Rank.toFixed(0)),
                app200_up: Number(pgatour.app200_up.toFixed(0)),
                app200_upR: Number(pgatour.app200_upRank.toFixed(0)),
                bob: Number(pgatour.bob.toFixed(2)),
                bobR: Number(pgatour.bobRank.toFixed(0)),
                bogAvd: Number(pgatour.bogAvd.toFixed(2)),
                bogAvdR: Number(pgatour.bogAvdRank.toFixed(0)),
                par3Scoring: Number(pgatour.par3Scoring.toFixed(2)),
                par3ScoringR: Number(pgatour.par3ScoringRank.toFixed(0)),
                par4Scoring: Number(pgatour.par4Scoring.toFixed(2)),
                par4ScoringR: Number(pgatour.par4ScoringRank.toFixed(0)),
                par5Scoring: Number(pgatour.par5Scoring.toFixed(2)),
                par5ScoringR: Number(pgatour.par5ScoringRank.toFixed(0)),
                prox: Number(pgatour.prox.toFixed(0)),
                proxR: Number(pgatour.proxRank.toFixed(0)),
                roughProx: Number(pgatour.roughProx.toFixed(0)),
                roughProxR: Number(pgatour.roughProxRank.toFixed(0)),
                puttingBob: Number(pgatour.puttingBob.toFixed(1)),
                puttingBobR: Number(pgatour.puttingBobRank.toFixed(0)),
                threePuttAvd: Number(pgatour.threePuttAvd.toFixed(1)),
                threePuttAvdR: Number(pgatour.threePuttAvdRank.toFixed(0)),
                bonusPutt: Number(pgatour.bonusPutt.toFixed(2)),
                bonusPuttR: Number(pgatour.bonusPuttRank.toFixed(0)),
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


    let url = '/get/modelSheet/';

    let p = fetch(url);
    p.then((response) => {
        return response.json();
    })
    .then((jsonData) =>{
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
                .slice(0, 12); // Grab at most the specified number of rounds

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
                .slice(0, 12); // Grab at most the specified number of rounds

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
                .slice(0, 12); // Grab at most the specified number of rounds

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
            'prox', 'roughProx', 'puttingBob', 'threePuttAvd', 'bonusPutt'
        ];

        // Calculate mean and standard deviation for each stat
        let statSums = {};
        let statSumsSquared = {};
        let statCounts = {};

        // Iterate through data to calculate sums and counts
        dataTableData.forEach((playerData) => {
            Object.keys(playerData).forEach((stat) => {
                // Check if the field is in the zScoreFields array
                if (zScoreFields.includes(stat) && typeof playerData[stat] === 'number' && playerData[stat] !== null) {
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
        });

        // Compute z-score for each data point
        dataTableData.forEach((playerData) => {
            Object.keys(playerData).forEach((stat) => {
                // Check if the field is in the zScoreFields array and is a number
                if (zScoreFields.includes(stat) && typeof playerData[stat] === 'number') {
                    // Calculate z-score for the current stat
                    let zScore = playerData[stat] !== null
                        ? (playerData[stat] - statMeans[stat]) / statStdDevs[stat]
                        : null;

                    // Add z-score to playerData
                    playerData[`${stat}_zScore`] = zScore;
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
        };

        console.log('weightDict: ', weightDict);

        const reverseStats = ['app50_75','app75_100',
        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bogAvd', 'par3Scoring',
        'par4Scoring', 'par5Scoring', 'prox', 'roughProx', 'threePuttAvd'];

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

                    if(playerData['player'] == 'Dylan Frittelli'){
                        console.log('stat: ',key ,'zscore: ', zScore, 'weight: ', weight, 'mult: ', zScore * weight);
                    }

                    statLog[key] = weight;
                }
            }

            

            // Calculate weighted average rating
            let rating = weightSum !== 0 ? ratingSum / weightSum : null;

            // Calculate the percentile using the CDF of the standard normal distribution
            let percentile = rating !== null ? Number((normalCDF(0, 1, rating) * 100).toFixed(2)) : null;

            if(playerData['player'] == 'Dylan Frittelli'){
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
        const columnsWithColorScale = ['sgOtt12', 'sgApp12', 'sgArg12', 'sgPutt12', 'sgT2G12', 'sgTot12',
        'sgOtt24', 'sgApp24', 'sgArg24', 'sgPutt24', 'sgT2G24', 'sgTot24',
        'sgOtt36', 'sgApp36', 'sgArg36', 'sgPutt36', 'sgT2G36', 'sgTot36',
        'sgOtt50', 'sgApp50', 'sgArg50', 'sgPutt50', 'sgT2G50', 'sgTot50',
                                        'sgPuttPGA', 'sgArgPGA', 'sgAppPGA', 'sgOttPGA', 'sgT2GPGA', 'sgTotPGA',
                                        'drDist', 'drAcc', 'gir', 'sandSave', 'scrambling', 'app50_75', 'app75_100',
                                        'app100_125', 'app125_150', 'app150_175', 'app175_200', 'app200_up', 'bob',
                                        'bogAvd', 'par3Scoring', 'par4Scoring', 'par5Scoring', 'prox', 'roughProx',
                                        'puttingBob', 'threePuttAvd', 'bonusPutt', 'rating'];
        
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
            
                gridOptions.columnDefs.forEach(column => {
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
            
                gridOptions.api.setColumnDefs(gridOptions.columnDefs);
            }                      
        
            const gridDiv = document.querySelector('#modelSheet');
            gridApiModel = new agGrid.Grid(gridDiv, gridOptions); // Use new agGrid.Grid constructor
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
    });
}

function onFilterTextBoxChangedModel() {
    // the function for the search box which filters the table 
    // based on 'filter-text-box' for gridApi grid
    gridApiModel.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box-model').value
    );
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

    const inputElements = [
        sgPuttPGAinput, sgAppPGAinput, sgT2GPGAinput, sgArgPGAinput, sgOttPGAinput, sgTotPGAinput,
        sgPutt12input, sgApp12input, sgT2G12input, sgArg12input, sgOtt12input, sgTot12input,
        sgPutt24input, sgApp24input, sgT2G24input, sgArg24input, sgOtt24input, sgTot24input,
        sgPutt36input, sgApp36input, sgT2G36input, sgArg36input, sgOtt36input, sgTot36input,
        sgPutt50input, sgApp50input, sgT2G50input, sgArg50input, sgOtt50input, sgTot50input,
        drDist, bob, sandSave, par3scoring, par5scoring, prox, app50_75, app100_125, app150_175,
        app200_up, bonusPutt, drAcc, bogAvd, scrambling, par4scoring, gir, roughProx, app75_100,
        app125_150, app175_200, puttingBob, threePuttAvd
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
        input.addEventListener('change', onModelInputChange);
    });
});
