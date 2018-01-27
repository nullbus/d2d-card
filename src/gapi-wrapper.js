import React from 'react';
import {connect} from 'react-redux';

const initialState = {
    apiAvailable: false,
    signedIn: false,
    requestSignIn: false,
}

const ActionApiAvailable = 'gapi.available';
const ActionSignedIn = 'gapi.signedin';
const ActionRequestSignin = 'gapi.signin';

const CLIENT_ID = '1091131697082-sbl11q8ppq4bbegs9n3sm8dmv0obgvbr.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAie9sI3kQO5_ntbWSSOwALvOaDfIXMFzs';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4', 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive';

function RequestSignin() {
    return {type: ActionRequestSignin};
}

function GApiWrapperActions(state = initialState, action) {
    switch(action.type) {
    case ActionApiAvailable:
        console.log(action.value);
        return {apiAvailable: action.value};

    case ActionSignedIn:
        return {signedIn: action.value};

    case ActionRequestSignin:
        return {requestSignIn: true};
    }

    return state;
}

class GApiWrapper extends React.Component {
    componentDidMount() {
        let gapiScript = document.createElement('script');
        gapiScript.onload = e => {
            gapiScript.onload = e => {};
            this.props.onApiAvailable(true);
        }

        gapiScript.onreadystatechange = e => {
            if (gapiScript.readyState == 'complete')
                gapiScript.onload(e);
        }

        gapiScript.src = 'https://apis.google.com/js/api.js';
        document.body.appendChild(gapiScript);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.api.requestSignIn != this.props.api.requestSignIn && nextProps.api.requestSignIn) {
            this.login();
        }
    }

    login() {
        if (this.props.api.signedIn) {
            console.log('already signed in');
            return;
        }

        gapi.load('client:auth2', () => gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
        }).then(() => {
            // gapi.auth2.getAuthInstance().isSignedIn.listen(ok => this.props.onLogin(ok));
            console.log(gapi.auth2.getAuthInstance().isSignedIn);
            gapi.auth2.getAuthInstance().signIn().then(() => this.props.onLogin(true)).catch(() => this.props.onLogin(false));
        }).catch(err => {
            console.log(err);
        }));
    }

    render() {
        return null;
    }
}

GApiWrapper = connect(
    state => ({
        api: state.api
    }),
    dispatch => ({
        onApiAvailable: ok => dispatch({type: ActionApiAvailable, value: ok}),
        onLogin: ok => dispatch({type: ActionSignedIn, value: ok}),
    })
)(GApiWrapper);

export {GApiWrapper, GApiWrapperActions, RequestSignin};
