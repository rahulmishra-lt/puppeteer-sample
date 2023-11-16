const puppeteer = require('puppeteer');

(async () => {
    const maxRetries = 2;
    const retryDelay = 1000;
    let success = false;

    const capabilities = {
        'browserName': 'Chrome',
        'browserVersion': 'latest',
        'LT:Options': {
            'platform': 'Windows 10',
            'build': 'puppeteer-build-1',
            'name': 'My first Puppeteer test',
            'resolution':'1366x768',
            'user': process.env.LT_USERNAME || "Your Username",
            'accessKey': process.env.LT_ACCESS_KEY || "Your Access Key",
            'network': true
        }
    };

    for (let retryCount = 0; retryCount < maxRetries && !success; retryCount++) {
        try {
            const browser = await puppeteer.connect({
                browserWSEndpoint:
                    `wss://cdp.lambdatest.com/puppeteer?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`,
            });

            const page = await browser.newPage();
            await page.setViewport({
                width: 1024,
                height: 768,
                deviceScaleFactor: 1,
            });
            console.log("Navigating to LambdaTest");
            await page.goto('https://www.lambdatest.com/');
            console.log("Navigating to Pricing");
            await page.goto('https://www.lambdatest.com/pricing');
            console.log("Navigating to Automation");
            await page.goto('https://www.lambdatest.com/automation-testing');

            await page.evaluate(_ => { }, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'passed', remark: "Test Passed" } })}`)

            console.log("Closing browser");
            await browser.close();

            success = true;
        } catch (error) {
            console.error(`Test failed on attempt ${retryCount + 1}: ${error}`);
            if (retryCount < maxRetries - 1) {
                console.log(`Retrying test in ${retryDelay} milliseconds...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
        }
    }

    if (!success) {
        throw new Error('Test failed after all retries');
    }
})();