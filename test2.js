const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const programersEmails = [];
const designersEmails = [];
const socialEmails = [];

const programmersGroups = [];
const designersGroups = [];
const socialGroups = [];
const projectsGroups = [];

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), getDataFromSheets);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the emails people in a spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/13zCT1ubfOCAejVlr5UwQNSp1XK3v3aiSopWkxjVLJp0/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function getDataFromSheets(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    // Get programers emails
    await new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: '13zCT1ubfOCAejVlr5UwQNSp1XK3v3aiSopWkxjVLJp0',
            range: 'רשומים למציאת עבודה - מתכנתים!B2:B',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows && rows.length) {
                console.log('Programmers Emails:');
                rows.forEach(row => {
                    programersEmails.push(row[0]);
                })
                console.log(programersEmails);
                resolve();
            } else {
                reject('No programmers emails found.');
            }
        });
    }).catch((error) => {
        console.error(error);
    });

    // Get designers emails
    await new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: '13zCT1ubfOCAejVlr5UwQNSp1XK3v3aiSopWkxjVLJp0',
            range: 'רשומים למציאת עבודה - מעצבים!B2:B',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows && rows.length) {
                console.log('Designers Emails:');
                rows.forEach(row => {
                    designersEmails.push(row[0]);
                })
                console.log(designersEmails);
                resolve();
            } else {
                reject('No designers emails found.');
            }
        });
    }).catch((error) => {
        console.error(error);
    });
    // Get social emails
    await new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: '13zCT1ubfOCAejVlr5UwQNSp1XK3v3aiSopWkxjVLJp0',
            range: 'רשומים למציאת עבודה - סושיאל ושיווק!B2:B',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows && rows.length) {
                console.log('Social Emails:');
                rows.forEach(row => {
                    socialEmails.push(row[0]);
                })
                console.log(socialEmails);
                resolve();
            } else {
                reject('No social emails found.')
            }
        });
    }).catch((error) => {
        console.error(error);
    });
    // Get Groups
    if (programersEmails.length) {
        // Get programers groups
        await new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get({
                spreadsheetId: '13zCT1ubfOCAejVlr5UwQNSp1XK3v3aiSopWkxjVLJp0',
                range: 'קבוצות מציאת עבודה - הייטק!A4:A',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                if (rows && rows.length) {
                    console.log('Programers groups:');
                    rows.forEach(row => {
                        programmersGroups.push(row[0]);
                    })
                    console.log(programmersGroups);
                    resolve();
                } else {
                    reject('No programers groups found.');
                }
            });
        }).catch((error) => {
            console.error(error);
        });
    }
    if (designersEmails.length) {
        // Get designers groups
        await new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get({
                spreadsheetId: '13zCT1ubfOCAejVlr5UwQNSp1XK3v3aiSopWkxjVLJp0',
                range: 'קבוצות מציאת עובדה - מעצבים!A4:A',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                if (rows && rows.length) {
                    console.log('Designers groups:');
                    rows.forEach(row => {
                        designersGroups.push(row[0]);
                    })
                    console.log(designersGroups);
                    resolve();
                } else {
                    reject('No designers groups found.');
                }
            });
        }).catch((error) => {
            console.error(error);
        });
    }
    if (designersEmails.length) {
        // Get social groups
        await new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get({
                spreadsheetId: '13zCT1ubfOCAejVlr5UwQNSp1XK3v3aiSopWkxjVLJp0',
                range: 'קבוצות מציאת עבודה - סושיאל!A4:A',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                if (rows && rows.length) {
                    console.log('Social groups:');
                    rows.forEach(row => {
                        socialGroups.push(row[0]);
                    })
                    console.log(socialGroups);
                    resolve();
                } else {
                    reject('No social groups found.');
                }
            });
        }).catch((error) => {
            console.error(error);
        });
    }
    // Get projects groups
    await new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: '13zCT1ubfOCAejVlr5UwQNSp1XK3v3aiSopWkxjVLJp0',
            range: 'קבוצות מציאת פרוייקטים!A4:A',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows && rows.length) {
                console.log('Projects groups:');
                rows.forEach(row => {
                    projectsGroups.push(row[0]);
                })
                console.log(projectsGroups);
                resolve();
            } else {
                reject('No projects groups found.');
            }
        });
    }).catch((error) => {
        console.error(error);
    });;
}