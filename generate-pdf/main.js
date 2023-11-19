const response = require('@teamPleno/response')
const request = require('@teamPleno/request')
const s3 = require('@teamPleno/s3')
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const hbs = require("handlebars");
const moment = require("moment");
const middleware = require('./middleware')

exports.handler = async (event) => {
    const body = JSON.parse(event.body)
    const bucket = `improve-reports-${process.env.STAGE}`
    const folder = '/improve-reports-temp'
    const templateRootPath = `improve-reports-templates`
    try {
        const report = body?.filter?.report
        if(!report) throw Error('El atributo reporte es requerido')
        const data = await middleware.loadData(body?.filter)
        console.dir(data, {depth: 5});
        const template = await s3.getObject(bucket, `${templateRootPath}/${report}/template.hbs`)
        hbs.registerHelper("dataFormat", function (value, format) {
            return moment(value).format(format);
        });
        const html = template.Body.toString('utf-8')
        const content = hbs.compile(html)(data);
        // const signedUrl = await s3.getSignedUrl(bucketName, key)
        // Optional: If you'd like to disable webgl, true is the default.
        chromium.setGraphicsMode = false;

        // Optional: Load any fonts you need. Open Sans is included by default in AWS Lambda instances
        chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
        // const url = 'https://github.com/Sparticuz/chromium/releases/download/v117.0.0/chromium-v117.0.0-pack.tar';

        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        await page.setContent(content, { waitUntil: 'load' });
        const pdf = await page.pdf({
            printBackground: true,
            format: 'a4',
            margin: {
                top: '10px',
                right: '10px',
                bottom: '10px',
                left: '10px',
            },
        });
        await page.close();
        await browser.close();
        const key = `report-${Date.now()}.pdf`;
        let target = `${bucket}${folder}`
        const createdFile = await s3.uploadFile(target, key, pdf);
        return response(200, createdFile)
    } catch (error) {
        return response(500, error)
    }
}
