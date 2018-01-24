import React from 'react';
import ReactDOM from 'react-dom';
import {Link, Route, BrowserRouter} from 'react-router-dom';
import TemplateEditor from './template-editor';
import {createStore, combineReducers} from 'redux';
import {connect, Provider} from 'react-redux';

const CLIENT_ID = '1091131697082-sbl11q8ppq4bbegs9n3sm8dmv0obgvbr.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAie9sI3kQO5_ntbWSSOwALvOaDfIXMFzs';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4', 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive';

let actions = {
    login: { update: 'login.update' },
    home: { updateTemplate: 'home.template_list' },
};

let loginRouter = (state = {status: false}, action) => {
    if (action.type == actions.login.update)
        return {status: action.value};

    return state;
}

let homeRouter = (state = {cardTemplates: []}, action) => {
    if (action.type == actions.home.updateTemplate)
        return {cardTemplates: action.files};

    return state;
}

let store = createStore(combineReducers({
    login: loginRouter,
    home: homeRouter,
}));

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
    onSignResult(ok) {
        console.log(ok);
        this.props.onLogin(ok);

        if (ok) {
            // fetch files
            gapi.client.drive.files.list({
                q: "'1jRDYn-BQB4xrfzN-zkgdddAFp_8YeRA_' in parents",
            }).then(resp => {
                this.props.onUpdateTemplates(resp.result.files);
            }).catch(err => alert('err: ' + JSON.stringify(err)));
        }
    }

    onSignButton(e) {
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
                <button onClick={e => this.onSignButton(e)} disabled={this.props.login.status}>Login</button>
            </div>
            <div>
                <h4>Files</h4>
                <ul>
                {this.props.templates.map(tmpl => {
                    return <li key={tmpl.id}>{tmpl.name} <Link to={'/edit/' + tmpl.id}><button>edit</button></Link></li>
                })}
                </ul>
            </div>
        </div>
        );
    }
}

Home = connect(
    state => ({
        login: state.login,
        templates: state.home.cardTemplates,
    }),
    dispatch => ({
        onLogin: ok => dispatch({type: actions.login.update, value: ok}),
        onUpdateTemplates: files => dispatch({type: actions.home.updateTemplate, files: files}),
    }),
)(Home);

class App extends React.Component {
    render() {
        return (
        <Provider store={store}>
        <BrowserRouter>
            <div>
                <Route exact path="/" component={Home} />
                <Route path="/edit/:id" component={TemplateEditor} />
            </div>
        </BrowserRouter>
        </Provider>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
