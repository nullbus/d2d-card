let CLIENT_ID = '1091131697082-sbl11q8ppq4bbegs9n3sm8dmv0obgvbr.apps.googleusercontent.com';
let API_KEY = 'AIzaSyAie9sI3kQO5_ntbWSSOwALvOaDfIXMFzs';
let DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
let SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

function handleClientLoad() {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
        }).then(() => {
            gapi.auth2.getAuthInstance().isSignedIn.listen(onSigninStatusUpdate);

            // handle the initial sign-in state
            onSigninStatusUpdate(gapi.auth2.getAuthInstance().isSignedIn.get());
            gapi.auth2.getAuthInstance().signIn();
        })
    });
}

function onSigninStatusUpdate(isSignedIn) {
    if (isSignedIn) {
        console.log('signed in');

        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1XYhF38bNaxp4FBUh3LSJ9dNAc6l7hTOunA7nuAjLKSU',
            range: '시트1!A1:E'
        }).then(resp => {
            let range = resp.result;
            alert(range);
        })
    } else {
        console.log('signed out');
    }
}

document.getElementById('btn').onclick = e => {
    let apiContainer = document.getElementById('gapi');
    apiContainer.onload = e => {
        apiContainer.onload = e => {};
        handleClientLoad();
    };

    apiContainer.onreadystatechange = e => {
        if (this.readyState == 'complete')
            this.onload();
    }

    apiContainer.src = 'https://apis.google.com/js/api.js';
};
