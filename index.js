const config = require('./config');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const fs = require('fs');
const puppeteer = require("puppeteer");
const { request } = require('http');

async function main() {
    console.log('Launching browser');
    const browser = await puppeteer.launch({
        args: ["--enable-features=NetworkService", "--no-sandbox"],
        headless: true,
        ignoreHTTPSErrors: true
    });

    console.log('Opening a new page');
    const page = await browser.newPage();

    console.log('Setting viewport');
    await page.setViewport({ width: 760, height: 1400 })

    console.log('Setting request interception');
    await page.setRequestInterception(true);
    page.once('request', interceptedRequest => {
        interceptedRequest.continue({'method': 'POST'});
        page.setRequestInterception(false);
    });

    console.log('Logging in');
    const params = new URLSearchParams();
    params.append('v', '15');
    params.append('UserName', config.eklase.user_name);
    params.append('Password', config.eklase.password);
    console.log(config.eklase.login_url+'?'+params.toString());
    const response = await page.goto(config.eklase.login_url+'?'+params.toString());
    
    console.log('Removing useless stuff');
    await page.evaluate(() => {
        var newsSection = document.querySelector(".dashboard-news");
        if(newsSection !== null) newsSection.remove();
        else console.log("News section doesn't exist");

        var footer = document.querySelector("footer");
        if(footer !== null) footer.remove();
        else console.log("Footer doesn't exist");

        var tableHeader = document.querySelector(".diary-container .row");
        if(tableHeader !== null) tableHeader.remove();
        else console.log("Table header doesn't exist");

        var tableFooter = document.querySelector(".diary-container h2");
        if(tableFooter !== null) tableFooter.remove();
        else console.log("Table footer doesn't exist");
    });

    console.log('Taking a screenshot');
    await page.screenshot({path: 'screenshot.png'})
    
    console.log('Closing the browser');
    await browser.close();
}

main();