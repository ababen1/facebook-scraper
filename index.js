const fs = require('fs');
const puppeteer = require('puppeteer');
const sha256 = require('js-sha256');
const axios = require('axios');
const readline = require('readline');
const { google } = require('googleapis');
const config = require('./config');
const cookies = require('./cookies.json');
const postsDBProgrammers = require('./postsDBProgrammers.json');
const postsDBDesigners = require('./postsDBDesigners.json');
const postsDBSocial = require('./postsDBSocial.json');
const postsDBProjects = require('./postsDBProjects.json');
const keyWords = require('./keywords.json');


let postsArr = [];
const CHUNK_SIZE = 15; // Number of posts per email

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
 * Get data in a spreadsheet:
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
    // Get programmers groups
    await new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: '13zCT1ubfOCAejVlr5UwQNSp1XK3v3aiSopWkxjVLJp0',
            range: 'קבוצות מציאת עבודה - הייטק!A4:A',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows && rows.length) {
                console.log('Programmers groups:');
                rows.forEach(row => {
                    programmersGroups.push(row[0]);
                })
                console.log(programmersGroups);
                resolve();
            } else {
                reject('No programmers groups found.');
            }
        });
    }).catch((error) => {
        console.error(error);
    });
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
    });

    start();
}

async function start() {
    /* Start up puppeteer ad create new page */
    let browser = await puppeteer.launch({ headless: false });
    let page = await browser.newPage();

    /* Check if we have previosly saved session */
    if (Object.keys(cookies).length) {
        /* Set the saved cookies in the puppeteer browser page */
        await page.setCookie(...cookies);
        /* Go to facebook */
        await page.goto('https://www.facebook.com', { waitUntill: 'networkidle2' });
        // If we want to scrape in infinite loop uncomment this line
        // setInterval(startScraper, 60 * 1000 * 10, page);
        if (programmersGroups.length)
            await startScraper(page, programmersGroups, postsDBProgrammers, 'programmers', 'בוט משרות פייסבוק: $ משרות חדשות', programersEmails);
        if (designersGroups.length)
            await startScraper(page, designersGroups, postsDBDesigners, 'designers', 'בוט משרות פייסבוק: $ משרות חדשות', designersEmails);
        if (socialGroups.length)
            await startScraper(page, socialGroups, postsDBSocial, 'social', 'בוט משרות פייסבוק: $ משרות חדשות', socialEmails);
        if (projectsGroups.length)
            await startScraper(page, projectsGroups, postsDBProjects, 'projects', 'בוט פרוייקטים פייסבוק: $ פרוייקטים חדשות', ['shahar.mesh@gmail.com', 'livne@s-tov.org.il']);
    } else {
        /* Go to facebook */
        await page.goto('https://www.facebook.com/login/', { waitUntill: 'networkidle0' });
        /* Write in the username and password */
        await page.type('#email', config.username, { delay: 30 });
        await page.type('#pass', config.password, { delay: 30 });
        /* Click the login button */
        await page.click('#loginbutton');
        /* wait for navigation to finish */
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitFor(15000)

        /* Check if logged in */
        try {
            await page.waitFor('[data-click="profile_icon"]');
            // setInterval(startScraper, 60 * 1000 * 12, page);
            if (programmersGroups.length)
                await startScraper(page, programmersGroups, postsDBProgrammers, 'programmers', 'בוט משרות פייסבוק: $ משרות חדשות', programersEmails);
            if (designersGroups.length)
                await startScraper(page, designersGroups, postsDBDesigners, 'designers', 'בוט משרות פייסבוק: $ משרות חדשות', designersEmails);
            if (socialGroups.length)
                await startScraper(page, socialGroups, postsDBSocial, 'social', 'בוט משרות פייסבוק: $ משרות חדשות', socialEmails);
            if (projectsGroups.length)
                await startScraper(page, projectsGroups, postsDBProjects, 'projects', 'בוט פרוייקטים פייסבוק: $ פרוייקטים חדשות', ['shahar.mesh@gmail.com', 'livne@s-tov.org.il']);
        } catch (error) {
            console.log('Faild to login');
        }

        /* Get the current browser page session */
        let currentCookies = await page.cookies();

        /* Create a cookie file (if not already created) to hold the session */
        fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));
    }

};

async function startScraper(page, groupsLinks, DB, DBName, subject, emails) {
    await new Promise(async (resolve, reject) => {
        for (const groupLink of groupsLinks) {
            try {
                await scrape(page, groupLink, DB);
            } catch (e) {
                console.log(e, groupLink);
                //await scrape(page, groupLink, DB);
                continue;
            }
        }
        // Send Email;
        try {
            let params = new URLSearchParams();
            params.append('to', '');
            params.append('subject', '')
            params.append('content', '');
            // Send 15 posts per email
            console.log(postsArr.length);
            for (let i = 0; i < postsArr.length; i += CHUNK_SIZE) {
                for (let j = 0; j < emails.length; j++) {
                    params.set('to', emails[j]);
                    // Take 15 posts
                    const chuck = postsArr.slice(i, i + CHUNK_SIZE);
                    params.set('subject', subject.replace('$', chuck.length));
                    const messsage = chuck.join('<br><br>')
                    params.set('content', messsage);
                    let res = await axios.post('https://shaharmeshulam.co.il/email-post.php', params);
                    console.log(res.data);
                }
            }
            console.log('Emails sent');
            postsArr = [];
            // Write to posts JSON
            switch (DBName) {
                case 'programmers':
                    fs.writeFileSync('./postsDBProgrammers.json', JSON.stringify(DB));
                    break;
                case 'designers':
                    fs.writeFileSync('./postsDBDesigners.json', JSON.stringify(DB));
                    break;
                case 'social':
                    fs.writeFileSync('./postsDBSocial.json', JSON.stringify(DB));
                    break;
                default:
                    fs.writeFileSync('./postsDBProjects.json', JSON.stringify(DB));
            }
            resolve();
        } catch (e) {
            console.log('Error sending email', e);
            reject('Error sending email');
        }
    })
}

async function scrape(page, groupLink, DB) {
    var posts;
    try {
        /* Go to group */
        await page.goto(groupLink, { waitUntill: 'networkidle2' });
        // Wait for posts to load
        try {
            await page.waitForSelector('div[role=feed]');
        } catch (e) {
            console.log(e);
            throw e;
        }
        // Scroll page because we want more posts to load
        await autoScroll(page);
        const postsItemsLinks = await page.$$('div[role=article].lzcic4wl .qzhwtbm6:nth-child(2) a');
        for (let postItemLink of postsItemsLinks) {
            //hover on each element handle
            await postItemLink.hover();
        }
        // Wait for the required DOM to be rendered
        posts = await page.evaluate(() => {
            const list = [];
            // Removed "shred with"
            document.querySelectorAll('svg').forEach(e => e.remove());
            // Remove comments
            document.querySelectorAll('[data-visualcompletion=ignore-dynamic]').forEach(e => e.remove());
            // Select all posts
            const els = document.querySelectorAll('div[role=article].lzcic4wl');
            // For each post:
            els.forEach(el => {
                // Get post link
                const link = el.querySelector('.qzhwtbm6:nth-child(2)')?.querySelector('a').href;
                // console.log('link:', link);
                // Get post time
                const time = el.querySelector('.qzhwtbm6:nth-child(2)')?.innerText.replace("'\n \n · ", '');
                // Remove time
                el.querySelectorAll('.qzhwtbm6:nth-child(2)')?.forEach(elem => elem.remove());
                // Remove tags
                const regex = /(<([^>]+)>)/ig;
                let result = el.innerHTML.replace(regex, ' ');
                // Remove spaces
                result = result.replace(/\s\s+/g, ' ').trim();
                // Create object with post result and post time and link
                result = { result, time, link };
                // Push post to result
                list.push(result);
            })

            return list
        })
    } catch (e) {
        posts = null;
        throw e;
    }

    for (let post of posts) {
        // Get post hash
        const hash = sha256(post.result);
        // Check if post not exists in db 
        if (!DB[hash]) {
            DB[hash] = post.result;
            // Find keywoerds
            let foundKeyWords = []
            keyWords.forEach(keyword => {
                if (post.result.toLowerCase().includes(keyword))
                    foundKeyWords.push(keyword);
            })
            foundKeyWords = foundKeyWords.join(', ');
            // Generate email post
            // Add post link
            // console.log('link:', post.link);
            let content = post.link + '<br>';
            // If there is time in post add it first
            content += post.time ? `${post.time}<br>` : '';
            // Add the content of the post
            content += `${foundKeyWords.length ? 'מילות מפתח שנמצאו: <b>' + foundKeyWords + '</b>' : ''} <br> ${post.result}`;
            // Add post to array;
            postsArr.unshift(content);
        }
    }
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= 1500) {
                    clearInterval(timer);
                    resolve();
                }
            }, 2000);
        });
    });
}