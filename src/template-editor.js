import React from 'react';

export default class TemplateEditor extends React.Component {
    constructor() {
        super();

        this.state = {
            meta: null
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id == this.props.id)
            return;
    }

    render() {
        return <div></div>;
    }
}