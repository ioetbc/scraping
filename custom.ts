import {launch} from "puppeteer";

const collectLinks = (text: string) => {
  return "links";
};

const getWebPageText = async (url: string) => {
  const browser = await launch({
    headless: false,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  console.time("scraping");

  const page = await browser.newPage();
  await page.setRequestInterception(true);

  page.on("request", (request) => {
    if (
      ["image", "stylesheet", "font", "script"].includes(request.resourceType())
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
  } catch (error) {
    console.log("error visiting", url);
  }

  const text = await page.evaluate(() => document.body.textContent);

  return text;
};

const main = async () => {
  const text = await getWebPageText(
    "https://www.thehorsehospital.com/whats-on"
  );

  console.log("text", text);

  if (!text) {
    console.log("no text found");
    return;
  }

  const links = collectLinks(text);

  console.log("links", links);
};

await main();
