const puppeteer = require('puppeteer');
const fs = require('fs');
const sha256 = require('js-sha256');
const axios = require('axios');
const config = require('./config');
const cookies = require('./cookies.json');
const groupsIds = require('./groupIds.json');
const postsDb = require('./posts.json');
const keyWords = require('./keywords.json');

(async () => {
    /* Start up puppeteer ad create new page */
    let browser = await puppeteer.launch({ headless: false });
    let page = await browser.newPage();

    /* Check if we have previosly saved session */
    if (Object.keys(cookies).length) {
        /* Set the saved cookies in the puppeteer browser page */
        await page.setCookie(...cookies);
        /* Go to facebook */
        await page.goto('https://www.facebook.com', { waitUntill: 'networkidle2' });
        setInterval(startScraper, 60 * 1000 * 10, page);
        startScraper(page);
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
            setInterval(startScraper, 60 * 1000 * 12, page);
            startScraper(page)
        } catch (error) {
            console.log('Faild to login');
        }

        /* Get the current browser page session */
        let currentCookies = await page.cookies();

        /* Create a cookie file (if not already created) to hold the session */
        fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));
    }

})();

async function startScraper(page) {
    var posts;
    for (const groupId of groupsIds) {
        try{
            /* Go to group */
            await page.goto(`https://www.facebook.com/groups/${groupId}`, { waitUntill: 'networkidle2' });
            await page.waitForSelector('div[role=feed]');
            await autoScroll(page);

            // Wait for the required DOM to be rendered
            posts = await page.evaluate(() => {
                const list = []
                // Remove comments
                document.querySelectorAll('[data-visualcompletion=ignore-dynamic]').forEach(e => e.remove());
                // Select all posts
                const els = document.querySelectorAll('div[role=article].lzcic4wl');
                // For each post:
                els.forEach(el => {
                    const regex = /(<([^>]+)>)/ig;
                    // Remove time
                    el.querySelectorAll('.qzhwtbm6:nth-child(2)')?.forEach(elem => elem.remove());
                    // Remove tags
                    let result = el.innerHTML.replace(regex, ' ');
                    // Remove spaces
                    result = result.replace(/\s\s+/g, ' ').trim();
                    // Push post to result
                    list.push(result);
                })
    
                return list
            })
        }catch(e) {
            console.log(e, groupId);
            posts = null;
            continue;
        }

        for (let post of posts) {
            // Get post hash
            const hash = sha256(post);
            // Check if post not exists -> add post to posts db & send email
            if (!postsDb[hash]) {
                postsDb[hash] = post;
                // Find keywoerds
                let foundKeyWords = []
                keyWords.forEach(keyword => {
                    if (post.includes(keyword))
                        foundKeyWords.push(keyword);
                })
                foundKeyWords = foundKeyWords.join(', ');
                // Send email
                post = `https://www.facebook.com/groups/${groupId} ${foundKeyWords.length ? '<br>מילות מפתח שנמצאו: <b>' + foundKeyWords + '</b>' : ''} <br> ${post}`
                try {
                    await axios.get(encodeURI(`https://shaharmeshulam.co.il/email-new.php?content=${post}&to=${config.username}`));
                    await axios.get(encodeURI(`https://shaharmeshulam.co.il/email-new.php?content=${post}&to=livne@s-tov.org.il`));
                    console.log(encodeURI(`https://shaharmeshulam.co.il/email-new.php?content=${post}&to=${config.username}`), '!!!');
                } catch (e) {
                    console.log('Error sending email', e);
                }
            }
        }

        // Write posts JSON
        fs.writeFileSync('./posts.json', JSON.stringify(postsDb));
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

                if (totalHeight >= 3000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 2000);
        });
    });
}