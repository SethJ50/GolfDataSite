
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

function loadProfile(){
    let profileTbl = document.getElementById('profileTable');
    let header = '<tr class="profHeadRow">' +
    '<th class="profHeadElem">Player</th>' +
    '<th class="profHeadElem">Tournament</th>' +
    '<th class="profHeadElem">Finish</th>' +
    '<th class="profHeadElem">Date</th>' +
    '<th class="profHeadElem">Round</th>' +
    '<th class="profHeadElem">SG: Putt</th>' +
    '<th class="profHeadElem">SG: Arg</th>' +
    '<th class="profHeadElem">SG: App</th>' +
    '<th class="profHeadElem">SG: Ott</th>' +
    '<th class="profHeadElem">SG: T2G</th>' +
    '<th class="profHeadElem">SG: Tot</th>' +
    '</tr>';

    let url = '/get/golferProf/' + 'Viktor Hovland'; // Eventually change this to pass which golfer to get.

    let p = fetch(url);
    p.then((response) => {
        return response.text();
    })
    .then((text) => {
        let listOfObjs = JSON.parse(text);
        let htmlString = header;

        for (let i=0; i<listOfObjs.length; i++){
            object = listOfObjs[i];

            let player = object.player;
            let tournament = object.tournament;
            let finish = object.finish;
            let date = object.dates;
            let round = object.Round;
            let sgPutt = object.sgPutt;
            let sgArg = object.sgArg;
            let sgApp = object.sgApp;
            let sgOtt = object.sgOtt;
            let sgT2G = object.sgT2G;
            let sgTot = object.sgTot;

            htmlString += '<tr class="profBodyRow">' +
                '<td class="profBodyElem" >' + player + '</td>' +
                '<td class="profBodyElem" >' + tournament + '</td>' +
                '<td class="profBodyElem" >' + finish + '</td>' +
                '<td class="profBodyElem" >' + date + '</td>' +
                '<td class="profBodyElem" >' + round + '</td>' +
                '<td class="profBodyElem" >' + sgPutt + '</td>' +
                '<td class="profBodyElem" >' + sgArg + '</td>' +
                '<td class="profBodyElem" >' + sgApp + '</td>' +
                '<td class="profBodyElem" >' + sgOtt + '</td>' +
                '<td class="profBodyElem" >' + sgT2G + '</td>' +
                '<td class="profBodyElem" >' + sgTot + '</td>' +
            '</tr>';
        }

        profileTbl.innerHTML = htmlString;
    })
    .catch((error) => {
        console.log('there was an error setting the profile table');
    });
}
