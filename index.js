const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const cron = require("node-cron");
const url = "https://learnwebcode.github.io/practice-requests/";

//everything works in the browser - not in node by itself
async function scrap() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  // make a screenshot of the site
  await page.screenshot({ path: "screenShot.png", fullPage: true });

  // get selector items and save them in txt file
  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".info strong")).map(
      (elem) => elem.textContent
    );
  });
  await fs.writeFile("names.txt", names.join("\r\n"));

  // click the button and get text inside div (landingPage)
  await page.click("#clickme");
  const clickedData = await page.$eval("#data", (elem) => elem.textContent);
  console.log(clickedData);

  // get photos from site
  const photos = await page.$$eval("img", (imgs) => {
    return imgs.map((x) => x.src);
  });

  // write text to the from and proceed
  await page.type("#ourfield", "blue");
  await Promise.all([page.click("#ourform button"), page.waitForNavigation()]);
  const proceedInfo = await page.$eval("#message", (elem) => elem.textContent);
  console.log(proceedInfo);

  for (const photo of photos) {
    const imagePage = await page.goto(photo);
    await fs.writeFile(photo.split("/").pop(), await imagePage.buffer());
  }
  await browser.close();
}
//setInterval(scrap, 1000);
//automate: https://crontab.guru
cron.schedule("*/5 * * * * *", scrap);
