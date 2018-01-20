import React from 'react';
import ReactDOM from 'react-dom';
import {Link, Route, BrowserRouter} from 'react-router-dom';
import TemplateEditor from './template-editor';

const CLIENT_ID = '1091131697082-sbl11q8ppq4bbegs9n3sm8dmv0obgvbr.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAie9sI3kQO5_ntbWSSOwALvOaDfIXMFzs';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4', 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive';


function onSigninStatusUpdate(isSignedIn) {
    signedIn = isSignedIn;

    if (isSignedIn) {
        console.log('signed in');

        gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: '1XYhF38bNaxp4FBUh3LSJ9dNAc6l7hTOunA7nuAjLKSU',
            range: '시트1!A1:E'
        }).then(resp => {
            let range = resp.result;
            alert('range:' + range.toString());
        }).catch(err => alert('err: ' + err.body));

        gapi.client.drive.files.list({
            q: "'1jRDYn-BQB4xrfzN-zkgdddAFp_8YeRA_' in parents",
        }).then(resp => {
            alert(resp.result.files.length);
        }).catch(err => alert('err: ' + err.body));
    } else {
        console.log('signed out');
    }
}

class Home extends React.Component {
    constructor() {
        super();

        this.state = {
            signedIn: false,
            cardTemplates: [],
        }; }

    onSignResult(ok) {
        console.log(ok);
        this.setState({signedIn: ok})

        if (ok) {
            // fetch files
            gapi.client.drive.files.list({
                q: "'1jRDYn-BQB4xrfzN-zkgdddAFp_8YeRA_' in parents",
            }).then(resp => {
                this.setState({cardTemplates: resp.result.files});
            }).catch(err => alert('err: ' + JSON.stringify(err)));
        }
    }

    onSignButton(e) {
        if (this.state.signedIn) {
            return;
        }

        let gapiScript = document.createElement('script');
        gapiScript.onload = e => {
            gapiScript.onload = e => {};

            gapi.load('client:auth2', () => gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
            }).then(() => {
                gapi.auth2.getAuthInstance().isSignedIn.listen(this.onSignResult);

                // handle the initial sign-in state
                this.onSignResult(gapi.auth2.getAuthInstance().isSignedIn.get());
                gapi.auth2.getAuthInstance().signIn();
            }).catch(err => {
                console.log(err);
            }));
        }

        gapiScript.onreadystatechange = e => {
            if (gapiScript.readyState == 'complete')
                gapiScript.onload(e);
        }

        gapiScript.src = 'https://apis.google.com/js/api.js';
        document.body.appendChild(gapiScript);
    }

    render() {
        return (
        <div>
            <div>
                <button onClick={e => this.onSignButton(e)} disabled={this.state.signedIn}>Login</button>
            </div>
            <div>
                <h4>Files</h4>
                <ul>
                {this.state.cardTemplates.map(tmpl => {
                    return <li key={tmpl.id}>{tmpl.name} <Link to="/edit"><button>edit</button></Link></li>
                })}
                </ul>
            </div>
        </div>
        );
    }
}

class App extends React.Component {
    render() {
        return (
        <BrowserRouter>
            <div>
                <Route exact path="/" component={Home} />
                <Route path="/edit" component={TemplateEditor} />
            </div>
        </BrowserRouter>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
