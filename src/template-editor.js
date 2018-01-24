import React from 'react';
import {connect} from 'react-redux';

class TemplateEditor extends React.Component {
    constructor() {
        super();

        this.state = {
            meta: null
        };
    }

    componentDidMount() {
        this.props.match.params.id
    }

    render() {
        return <div>{this.props.match.params.id}</div>;
    }
}

export default TemplateEditor;
