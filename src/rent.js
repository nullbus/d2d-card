import React from 'react';

const RentRecordSheetID = '1WOGV8BUZQwp3y1DMP5v2Jkv41XHGKWQ0bkpXkIq7x8Q';
const RentRecordDirectory = '15LGQrR3NA4NymT7fBhkSt8rCVMpnHvmJ';

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

    ensureRentDirectoryExists(subdir) {
        let checkDirectory = (resolve, reject) => {
            gapi.client.drive.files.list({
                q: "'{dir}' in parents and mimeType='application/vnd.google-apps.folder' and name='{name}'".replace(/{dir}/, RentRecordDirectory).replace(/{name}/, subdir),
            }).then(resp => {
                if (resp.result.files.length) {
                    resolve(resp.result.files[0].id);
                    return;
                }

                createDirectory(resolve, reject);
            }, reject)
        };

        let createDirectory = (resolve, reject) => {
            gapi.client.drive.files.create({}, {
                name: subdir,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [RentRecordDirectory],
            }).then(resp => {
                console.log(resp.result);
                resolve(resp.result.id);
            }, reject);
        }

        return new Promise(checkDirectory);
    }

    onRentButton(number) {
        let insertRecord = directory => {
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

        let name = prompt('put a name');
        if (Boolean(name)) {
            let now = new Date();
            let todayStr = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString();

            // check directory
            let subdir = todayStr.slice(0, todayStr.indexOf('T'));
            this.ensureRentDirectoryExists(subdir)
                .then(insertRecord)
                .catch(err => console.error(err));
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
