import React from 'react';

const RentRecordSheetID = '1WOGV8BUZQwp3y1DMP5v2Jkv41XHGKWQ0bkpXkIq7x8Q';
const RentRecordDirectory = '15LGQrR3NA4NymT7fBhkSt8rCVMpnHvmJ';
const TemplateDirectory = '1jRDYn-BQB4xrfzN-zkgdddAFp_8YeRA_';

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

    doRent(number) {
        return new Promise((resolve, reject) => {
            let now = new Date();
            let todayStr = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString();
            let strNumber = number.toFixed(0);
            if (number < 10)
                strNumber = '0' + strNumber;
            if (number < 100)
                strNumber = '0' + strNumber;
            if (number < 1000)
                strNumber = '0' + strNumber;

            // check directory
            let subdir = todayStr.slice(0, todayStr.indexOf('T'));
            let checkDirectory = cb => {
                gapi.client.drive.files.list({
                    q: "'{dir}' in parents and mimeType='application/vnd.google-apps.folder' and name='{name}'".replace(/{dir}/, RentRecordDirectory).replace(/{name}/, subdir),
                }).then(resp => {
                    if (resp.result.files.length) {
                        cb(resp.result.files[0].id);
                        return;
                    }

                    createDirectory(cb);
                }, reject)
            };

            let createDirectory = cb => {
                gapi.client.drive.files.create({}, {
                    name: subdir,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [RentRecordDirectory],
                }).then(resp => {
                    console.log(resp.result);
                    cb(resp.result.id);
                }, reject);
            };

            let searchTemplate = cb => {
                let name = 'card-' + strNumber;
                gapi.client.drive.files.list({
                    q: "'{dir}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and name='{name}'".replace(/{dir}/, TemplateDirectory).replace(/{name}/, name)
                })
                .then(resp => cb(resp.result.files[0].id))
                .catch(reject);
            }

            let copyTemplate = cb => directory => {
                searchTemplate(id => {
                    gapi.client.drive.files.copy({fileId: id}, {
                        name: 'rent-' + strNumber,
                        parents: [directory],
                    })
                    .then(resp => cb(resp.result))
                    .catch(reject);
                });
            }

            let insertRecord = cardFile => {
                let row = [number, new Date().toISOString(), cardFile.webViewLink, name];
                gapi.client.sheets.spreadsheets.values.append({
                    spreadsheetId: RentRecordSheetID,
                    range: '시트1!A:D',
                    valueInputOption: 'USER_ENTERED',
                },
                { values: [row] })
                .then(resp => resolve())
                .catch(reject);
            }

            checkDirectory(copyTemplate(insertRecord));
        });
    }

    onRentButton(number) {
        if (prompt('put a name')) {
            this.doRent(number)
                .then(() => this.updateSingle(number))
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
