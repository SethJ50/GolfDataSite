
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

let isDataTableInitialized = false;

function loadProfile(){
    let profileTbl = document.getElementById('profileTable');
    let currGolfer = document.getElementById('playerNameProf');


    let url = '/get/golferProf/' + currGolfer.value; // Eventually change this to pass which golfer to get.

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
                createdRow: function (row, data, dataIndex) {
                    // Loop through specific numeric cells in the row
                    $(row).find('.putt-cell, .arg-cell, .app-cell, .ott-cell, .t2g-cell, .tot-cell').each(function (index) {
                        // Get the numeric value
                        var numericValue = parseFloat($(this).text());

                        // Apply different classes based on numeric value
                        if (numericValue < -2) {
                            $(this).addClass('lowest-value');
                        } else if (numericValue >= -2 && numericValue <= -1) {
                            $(this).addClass('low-value');
                        } else if (numericValue >= -1 && numericValue <= 1) {
                            $(this).addClass('medium-value');
                        } else if (numericValue >= 1 && numericValue <= 2) {
                            $(this).addClass('high-value');
                        } else {
                            $(this).addClass('highest-value');
                        }
                    });

                    $(row).find('.t2g-cell, .tot-cell').each(function (index) {
                        // Get the numeric value
                        var numericValue = parseFloat($(this).text());

                        // Apply different classes based on numeric value
                        if (numericValue < -4) {
                            $(this).addClass('lowest-value');
                        } else if (numericValue >= -4 && numericValue <= -2) {
                            $(this).addClass('low-value');
                        } else if (numericValue >= -2 && numericValue <= 2) {
                            $(this).addClass('medium-value');
                        } else if (numericValue >= 2 && numericValue <= 4) {
                            $(this).addClass('high-value');
                        } else {
                            $(this).addClass('highest-value');
                        }
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
