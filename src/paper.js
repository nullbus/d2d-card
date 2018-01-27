import React from 'react';
import {CardMetadata, WorkerMetadata} from './metadata';

class MinistryGroup extends React.Component {
}

class MinistryPaper extends React.Component {
    constructor() {
        super();

        this.state = {
            cardMeta: new CardMetadata(),
            workerMeta: new WorkerMetadata(),
        }
    }

    componentDidMount() {
        gapi.client.spreadsheets.values.get({
            spreadsheetId: this.props.match.params.id,
            range: '시트1!A1:B1',
        })
        .then(resp => this.fetchHouses(resp.result.values[0]))
        .catch(err => alert(JSON.stringify(err, null, '  ')));
    }

    fetchHouses(metadatas) {
        let cardMeta = new CardMetadata(JSON.parse(metadatas[0]));
        let workerMeta = new WorkerMetadata(JSON.parse(metadatas[1]));

        this.setState({cardMeta, workerMeta});
    }

    render() {
        const {cardMeta, workerMeta} = this.state;

        return (
        <div>
            <h1>구역번호 {cardMeta.card}: {cardMeta.name}</h1>
        </div>
        )
    }
}

export {MinistryPaper};
