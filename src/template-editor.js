import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

class TemplateEditor extends React.Component {
    constructor() {
        super();

        this.state = {
            meta: {
                card: 0,
                groups: [],
                numHouses: 0,
                name: '',
            },
            houses: [],
            fetching: true,
        };
    }

    componentDidMount() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: this.props.match.params.id,
            range: '시트1!A1',
        }).then(resp => this.onMetadata(resp.result), err => alert('err: ' + err.body));
    }

    onMetadata(range) {
        console.log(range);

        let meta = JSON.parse(range.values[0][0] || '{}');
        this.setState({meta});

        if (meta.numHouses > 0) {
            gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.props.match.params.id,
                range: "'시트1'!A3:D" + (meta.numHouses + 2),
            }).then(resp => {
                let houses = resp.result.values.map((row, i) => {
                    return {
                        id: i,
                        group: parseInt(row[0]) || 0,
                        address: row[1],
                        door: row[2],
                        note: row[3],
                    };
                });

                this.setState({houses: houses, fetching: false});
            }).catch(err => alert('err: ' + err.body));
        }
    }

    render() {
        let byGroup = [];
        this.state.houses.forEach(house => {
            let group = house.group || 0;
            byGroup[group] = byGroup[group] || [];
            byGroup[group].push(house);
        });

        let rows = [];
        byGroup.forEach((group, i) => {
            rows.push( <tr key={"g"+i}> <td colSpan="3"> Group {this.state.meta.groups[0] || ''} </td> </tr> );

            rows.push(...group.map(house => (
                <tr key={house.id}>
                    <td>{house.group}</td>
                    <td>{house.address}</td>
                    <td>{house.door}</td>
                    <td>{house.note}</td>
                </tr>)
            ));
        })

        return (
        <div>
            <Link to="/"><button>Home</button></Link>
            {this.state.fetching ? <div>fetching data...</div> : null}
            {this.props.match.params.id}
            <table>
                <thead>
                    <tr>
                        <td>그룹</td>
                        <td>주소</td>
                        <td>집이름</td>
                        <td>비고</td>
                    </tr>
                </thead>
                <tbody> {rows} </tbody>
            </table>
        </div>
        );
    }
}

export default TemplateEditor;
