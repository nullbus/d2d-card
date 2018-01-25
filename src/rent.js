import React from 'react';

const RentRecordSheetID = '1WOGV8BUZQwp3y1DMP5v2Jkv41XHGKWQ0bkpXkIq7x8Q';

class RentPage extends React.Component {
    constructor() {
        super();

        this.state = {
            records: [],
        };
    }

    componentDidMount() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: RentRecordSheetID,
            range: '시트2!A:E',
        }).then(resp => {
            let records = resp.result.values.slice(1).map(row => ({
                id: parseInt(row[0]),
                date: row[2],
                url: row[3],
                rentee: row[4],
            }));

            this.setState({records});
        }).catch(err => alert('err: ' + err.body));
    }

    onRentButton(number) {
        let name = prompt('put a name');
        if (Boolean(name)) {
            let row = [number, new Date().toISOString(), 'temp_qr_link', name];
            gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: RentRecordSheetID,
                range: '시트1!A:D',
                valueInputOption: 'USER_ENTERED',
            },
            {
                values: [row],
            }).then(resp => {
                console.log(resp.result);
                this.updateSingle(number);
            }).catch(err => console.error(err.body));
        }
    }

    updateSingle(number) {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: RentRecordSheetID,
            range: '시트2!A%d:E%d'.replace(/%d/g, number+1),
        }).then(resp => {
            let row = resp.result.values[0];
            let record = {
                id: parseInt(row[0]),
                date: row[2],
                url: row[3],
                rentee: row[4],
            };

            this.setState(prev => {
                let records = Object.assign([], this.state.records, {[number-1]: record});
                console.log(records);
                return {records};
            });

        }).catch(err => alert('err: ' + err.body));
    }

    render() {
        return (
        <div>
            <table>
                <thead>
                    <tr>
                        <td>NO</td>
                        <td>Last Rental</td>
                        <td>QR code</td>
                        <td>Rentee</td>
                        <td>&nbsp;</td>
                    </tr>
                </thead>
                <tbody>
                {this.state.records.map((record, i) => (
                    <tr key={record.id}>
                        <td>{String(record.id)}</td>
                        <td>{record.date}</td>
                        <td><a href={record.url}>Link</a></td>
                        <td>{record.rentee}</td>
                        <td><button onClick={e => this.onRentButton(i+1)}>Lend {i+1}</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        );
    }
}

export default RentPage;
