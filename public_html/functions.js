
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

            - (salary) is the individual salary object
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

            if (playerRounds.length > 0 ) { // can change to ensure # rounds for calc
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

            // Step 4: Compile Recent History Data for Each Player
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

        // Begin building up the ag-grid table

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
                    { headerName: 'Player', field: 'player' },
                    { headerName: 'FD Salary', field: 'fdSalary' },
                    { headerName: 'DK Salary', field: 'dkSalary' },
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
                    { headerName: 'Bogey Avg.', field: 'bogAvd', hide: true, comparator: customComparator },
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

            function customComparator(valueA, valueB, nodeA, nodeB, isInverted) {
                if (valueA === null) {
                  return 1; // Nulls always go to the bottom
                } else if (valueB === null) {
                  return -1; // Nulls always go to the bottom
                } else if (valueA > valueB) {
                  return isInverted ? -1 : 1;
                } else if (valueA < valueB) {
                  return isInverted ? 1 : -1;
                } else {
                  return 0;
                }
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
            //
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

            // Update all columns at once
            gridApi.updateGridOptions({ columnDefs: gridApi.getColumnDefs() });

            // Auto-size all columns
            gridApi.autoSizeAllColumns();

            // Hide the "Apply" button after applying column visibility changes
            if (applyButton) {
                applyButton.style.display = 'none';
            }

            // Collapse the checkboxContainer after applying column visibility changes
            const checkboxContainer = document.getElementById('checkboxContainer');
            if (checkboxContainer) {
                checkboxContainer.style.display = 'none';
            }
        };
        

        window.toggleColumnVisibility = function () {
            // toggles visibility of the checkbox container
            const checkboxContainer = document.getElementById('checkboxContainer');
            const applyButton = document.getElementById('applyColVisCS');

            if (checkboxContainer && applyButton) {
                checkboxContainer.style.display = checkboxContainer.style.display === 'none' ? 'inline-block' : 'none';
                applyButton.style.display = checkboxContainer.style.display;
            }
        };

        initializeCheatSheet();

    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

function onFilterTextBoxChanged() {
    // the function for the search box which filters the table 
    //based on 'filter-text-box' for gridApi grid
    gridApi.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box').value
    );
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
