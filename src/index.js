import React from 'react';
import ReactDOM from 'react-dom';
import {Link, Route, BrowserRouter} from 'react-router-dom';
import {createStore, combineReducers} from 'redux';
import {connect, Provider} from 'react-redux';
import RentPage from './rent';
import TemplateEditor from './template-editor';
import {MinistryPaper} from './paper';
import {GApiWrapper, GApiWrapperActions, RequestSignin} from './gapi-wrapper';

let actions = {
    home: { updateTemplate: 'home.template_list' },
};

let homeRouter = (state = {cardTemplates: []}, action) => {
    if (action.type == actions.home.updateTemplate)
        return {cardTemplates: action.files};

    return state;
}

let store = createStore(combineReducers({
    home: homeRouter,
    api: GApiWrapperActions,
}));

class Home extends React.Component {
    fetchTemplates() {
        // fetch files
        gapi.client.drive.files.list({
            q: "'1jRDYn-BQB4xrfzN-zkgdddAFp_8YeRA_' in parents",
        }).then(resp => {
            this.props.onUpdateTemplates(resp.result.files);
        }).catch(err => alert('err: ' + JSON.stringify(err)));
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.api.signedIn != nextProps.api.signedIn && nextProps.api.signedIn) {
            this.fetchTemplates();
        }
    }

    render() {
        return (
        <div>
            <div>
                <button onClick={e => this.props.onSignRequest()} disabled={!this.props.api.apiAvailable || this.props.api.signedIn}>Login</button>
            </div>
            <div>
                { this.props.api.signedIn ? <Link to="/rent"><button>Rental</button></Link> : null }
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
        api: state.api,
        templates: state.home.cardTemplates,
    }),
    dispatch => ({
        onSignRequest: () => dispatch(RequestSignin()),
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
                    <Route path="/rent" component={RentPage} />
                    <Route path="/paper/:id" component={MinistryPaper} />
                    <GApiWrapper />
                </div>
            </BrowserRouter>
        </Provider>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
