const config = require('./config');
const { URLSearchParams } = require('url');
const puppeteer = require("puppeteer");
const images = require("images");
const wallpaper = require('wallpaper');
const fs = require('fs');

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchEklaseScreenshot(browser){
    console.log('Opening a new page');
    const page = await browser.newPage();

    let device = {
        name: 'custom device',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
        viewport: {
            width: 760,
            height: 1400,
            deviceScaleFactor: config.scale,
            isMobile: false,
            hasTouch: false,
            isLandscape: false
        }
    }
    console.log('Setting viewport, scale factor');
    await page.emulate(device);

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
    const response = await page.goto(config.eklase.login_url+'?'+params.toString(), {waitUntil: 'load', timeout: 0});
    
    console.log('Waiting for elements to load');
    await Promise.race([
        page.waitForSelector(".diary-container .row"),
        page.waitForSelector(".diary-container h2"),
        page.waitForSelector(".dashboard-news")
    ]);

    console.log('Applying style.css');
    let cssCode = fs.readFileSync('style.css',{encoding:'utf8', flag:'r'});
    console.log(cssCode);
    await page.evaluate((cssCode) => {
        function addCss(cssCode) {
            var styleElement = document.createElement("style");
            styleElement.type = "text/css";
            if (styleElement.styleSheet) {
                styleElement.styleSheet.cssText = cssCode;
            } else {
                styleElement.appendChild(document.createTextNode(cssCode));
            }
            document.getElementsByTagName("head")[0].appendChild(styleElement);
        }
        addCss(cssCode);
    }, cssCode);

    console.log(`Setting timeout (${config.timeout}ms) to account for reloading`)
    await timeout(config.timeout);

    console.log('Taking e-klase screenshot');
    await page.screenshot({path: 'images/screenshot.png'})
}

async function fetchTimeScreenshot(browser){
    console.log('Rendering time.png')
    const timePage = await browser.newPage();
    await timePage.setViewport({
        width: 300,
        height: 50,
        deviceScaleFactor: 1,
    });
    let time = new Date().toLocaleString();
    let html = '<p style="font-weight: bold; font-size: 170%;">'+time+'</p>';
    await timePage.setContent(html);
    await timePage.screenshot({path: 'images/time.png'});
    
}

async function main() {
    console.log('Launching browser');
    const browser = await puppeteer.launch({
        args: ["--enable-features=NetworkService", "--no-sandbox"],
        headless: true,
        ignoreHTTPSErrors: true
    });

    await fetchEklaseScreenshot(browser);
    await fetchTimeScreenshot(browser);

    console.log('Closing the browser');
    //await browser.close();

    console.log('Merging screenshot with time');
    let eklaseScreenshot = images("images/screenshot.png");
    let timeScreenshot = images("images/time.png");

    let timeX = (eklaseScreenshot.width()-timeScreenshot.width())/2;
    eklaseScreenshot
        .draw(timeScreenshot, timeX, 20);

    console.log('Drawing wallpaper');
    let wallpaperImage = images("images/wallpaper.png");
    let padding = 10;
    let x = wallpaperImage.width()-eklaseScreenshot.width()-padding;
    let y = padding;
    wallpaperImage.draw(eklaseScreenshot, x, y).save("images/output.png");

    console.log('Setting wallpaper');
    await wallpaper.set('images/output.png');

    console.log('Done');
}

main();
setInterval(main, config.updateInterval*60*1000);