import { Dataset, PlaywrightCrawler } from "crawlee"
import csv from "fast-csv"
import fs from "fs-extra"
import { createReadStream, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import path from "path" // Import the 'path' module
import { createProgressBar, notice } from "./utilities"

interface scrapedDataInterface {
  founded: string | null
  teamSize: string | null
  location: string | null
  url: string
  websiteUrl: string | null
  name: string | null
  description: string | null
  job: { role: string | null; location: string | null }[]
  founderList: { name: string | null; linkedIn: string | null }[]
  companyNews: { headline: string | null; date: string | null }[]
  launchPosts: { title: string | null; body: string | null }[]
  launchPages: {
    launchTitle: string | null
    launchSubTitle: string | null
    pageLink: string | null
  }[]
}


/**
 * This function validates gets the file size
 *
 * @param {string} filePath - The first number.
 * @returns {number}
 */
function getFileSize(filePath: string) {
  const stats = fs.statSync(filePath)
  return stats.size
}

/**
 * This function validates gets the file size
 *
 * @param {any} page - The first number.
 * @returns {Array}
 */
export async function extractLaunchData(page: any) {
  const launchPosts: { title: string | null; body: string | null }[] = []

  const launchTitleElement = page.locator(".company-launch h3").first()

  //Playwright threw error for sites without company launches, so I decided to look out for the element before running the code
  //https://playwright.dev/docs/api/class-locator#locator-is-visible

  if (await launchTitleElement.isVisible()) {
    const launchTitle = await launchTitleElement.textContent()
    const launchBodyElement = page.locator(".company-launch div").first()
    const launchBody = await launchBodyElement.textContent()
    launchPosts.push({ title: launchTitle, body: launchBody })
  } else {
    launchPosts.push({ title: "", body: "" })
  }

  return launchPosts
}

// Extract the "Founded" and "Team Size" values
//So, this was tricky , because there are two spans here
//So, the + sign just grabs the span after the Text

/**
 * This function validates gets the text content such as Founded ,Team size
 *
 * @param {string} filePath - The first number.
 * @returns {any}
 */
export async function extractTextContent(page: any, text: string) {
  const element = page.locator(`.ycdc-card span:has-text("${text}") + span`)
  return await element.textContent()
}

//This is a nice trick I got from chatGPT to help me target the founders details
//The consistency I noticed was the image url
//Very funny hack when I thought about it, but think about this
//the images sources are always going to be the same
//the URL href is always going to be the same for every image
//and this is how I grabbed the parent that houses these images
//because, come to think of it, there is literally no other place , after studying the site structure
//other images like logos are stored here . https://bookface-images.s3.amazonaws.com/small_logos, in a small_logos directory
//avatars directory are only for images of the founders
//bookface-images is the bucket name , and unless they really really want to switch buckets, which is very rare
//Then I believe this piece of code would always work.
//It seems like the one that would stand the test of time out of all the elements i have targeted this far on this challenge

/**
 * This function extracts Founders' details
 *
 * @param {any} page - The first number.
 * @returns {Array}
 */
export async function extractFoundersData(page: any) {
  const founderList: { name: string | null; linkedIn: string | null }[] = []
  const socialDetails = await page.locator(
    `//img[contains(@src, 'https://bookface-images.s3.amazonaws.com/avatars')]/..`
  )

  //This was tough , because after I had obtained the array of results. I need to find the method
  // that would allow me get the count and iterate through it , so after digging online.
  //I saw this github post which helped me, https://github.com/microsoft/playwright/issues/10648#issuecomment-1042741050
  // count() and nth(i) were perfect for my solution, until I realized that i cant use for loop
  // So, I found the .all() method, but it was still failing
  // they stated in their docs, that if the list of elements changes dynamically ,it would produce flaky results
  //https://playwright.dev/docs/api/class-locator#locator-all
  // But is that the case here . Thinking......
  // (await socialDetails.all()).forEach(async (element:any) => {
  //   const founder = await element.locator(".font-bold").textContent();

  //   if (await element.locator('a[href*="linkedin"]').first().isVisible()) {
  //     const linkedIn = await element.locator('a[href*="linkedin"]').first().getAttribute("href");
  //     founderList.push({ name: founder, linkedIn: linkedIn });
  //   } else {
  //     founderList.push({ name: founder, linkedIn: "" });
  //   }
  // so I came up with a little hack , since I can get the count , I passed the count into an Array.from method
  //to the asynchronous operations within the map callback to run in parallel. So, if we find 2 founders details
  //we run the operations , get their details, push to the array and move to the next operation
  // });

  const socialCount = await socialDetails.count()

  await Promise.all(
    Array.from({ length: socialCount }).map(async (_, i) => {
      const founder = await socialDetails
        .nth(i)
        .locator(".font-bold")
        .textContent()

      if (
        await socialDetails
          .nth(i)
          .locator('a[href*="linkedin"]')
          .first()
          .isVisible()
      ) {
        const linkedIn = await socialDetails
          .nth(i)
          .locator('a[href*="linkedin"]')
          .first()
          .getAttribute("href")
        //if there's a linkedin profile, then there is absolutely a founder name there
        //think of it like this
        //A founder might not have a linkedin profile
        //But a linkedin profile would surely have a Founder associated with it
        founderList.push({ name: founder, linkedIn: linkedIn })
      } else {
        founderList.push({ name: founder, linkedIn: "" })
      }
    })
  )

  return founderList
}

//This gets the website url of the company
//Fun fact- I had implemented the same thing at https://instantapply.co to grab the urls
//of ycombinator companies and scrape online for their emails . ;)

/**
 * This function extracts the url
 *
 * @param {any} page - The first number.
 * @returns {any}
 */

export async function extractWebsiteUrlData(page: any) {
  const websiteUrl = await page
    .locator(".text-linkColor a")
    .getAttribute("href")
  return websiteUrl
}
export async function extractCompanyName(page: any) {
  const websiteUrl = await page.locator("h1").first().textContent()
  return websiteUrl
}

//This grabs the company's description
/**
 * This function extracts the company's description
 *
 * @param {any} page - The first number.
 * @returns {any}
 */
export async function extractDescriptionData(page: any) {
  const description = await page.locator(".prose p").first().textContent()
  return description
}

/**
 * This function extract company news details
 *
 * @param {any} page - The first number.
 * @returns {Array}
 */

export async function extractCompanyNewsData(page: any) {
  //based on the structure of the site, I used this to target the container
  //that houses all the news info.
  const news = await page.locator("#news div:nth-child(2) + div")
  const companyNews: { headline: string | null; date: string | null }[] = []

  const newsCount = await news.count()

  await Promise.all(
    Array.from({ length: newsCount }).map(async (_, i) => {
      const newsHeadline = await news.nth(i).locator("a").textContent()
      const newsDate = await news
        .nth(i)
        .locator("div + div")
        .first()
        .textContent()
      companyNews.push({ headline: newsHeadline, date: newsDate })
    })
  )
  return companyNews
}

/**
 * This function runs the launch pages
 *
 * @param {any} enqueueLinks - The first number.
 * @returns {void}
 */
export async function clickLaunchButton(enqueueLinks: any) {
  await enqueueLinks({
    selector: ".ycdc-btn-green",
    //I created a label for it to differentiate it
    label: "LIST",
  })
}

/**
 * This function extracts the jobs data
 *
 * @param {any} page - The first number.
 * @returns {Array}
 */
export async function extractJobsData(page: any) {
  const job: { role: string | null; location: string | null }[] = []

  //I decided to use "Apply Now" and find the parent container
  // because it was the most distinct thing I could find
  const applyButtonParentContainer = page.locator(
    'div .py-4:has-text("Apply Now")'
  )

  //Because there were multiple items on the page, I decided to iterate through them

  const count = await applyButtonParentContainer.count()

  await Promise.all(
    Array.from({ length: count }).map(async (_, i) => {
      const jobTitle = await applyButtonParentContainer
        .nth(i)
        .locator("a")
        .first()
        .textContent()
      //I decided to target list-item here
      const location = await applyButtonParentContainer
        .nth(i)
        .locator(".list-item")
        .first()
        .textContent()
      job.push({ role: jobTitle, location: location })
    })
  )

  return job
}

export async function parseCSVAndRetrieveUrls(
  inputCSVPath: string
): Promise<string[]> {
  //I use this to get the path of the CSV file
  const __filename = fileURLToPath(import.meta.url)
  const parentDir = resolve(__filename, "..")
  const __dirname = dirname(parentDir)

  try {
    console.log(
      notice(
        "=============== PARSING INPUT FILE FOR COMPANIES URLS ==============================\n"
      ),
      "\n"
    )
    const companiesData: string[] = [] // Store parsed organization data here
    const CSV_INPUT_PATH = path.join(__dirname, inputCSVPath)
    //This gets the File Size
    const totalBytes = getFileSize(CSV_INPUT_PATH)
    const bar = createProgressBar(totalBytes, "Parsing Files... :etas\n", "+")
    const stream = createReadStream(CSV_INPUT_PATH)
    // parse the csv data
    const parser = csv.parse({ headers: true })

    await new Promise((resolve) => {
      stream
        .pipe(parser)
        .on("data", (row) => {
          //since I needed only the urls with the domain name
          const url: string = row["YC URL"]
          companiesData.push(url)
          bar.tick()
        })
        .on("end", resolve)
    })
    console.log(
      "\n",
      notice(
        "=============== FILE PARSED SUCCESSFULLY  ==============================\n"
      )
    )
    return companiesData
  } catch (error) {
    throw error
  }
}

export const crawlSites = async (companiesUrls: string[]) => {
  console.log(
    "\n",
    notice("===============SCRAPING SITE ==============================\n")
  )
  const scrapedData: scrapedDataInterface[] = []

  // PlaywrightCrawler crawls the web using a headless
  // browser controlled by the Playwright library.
  //Why is this Important to us?
  //Ycombinator isnt a static site that Cheerio can just parse the html
  //so using Cheerio wouldnt work
  //But did I try to use Cheerio? Yes ,  I did
  //Did it fail? Yes It absolutely did
  //Check it out to see the JS files being served on Ycombinator
  // view-source:https://www.ycombinator.com/companies/fiber-ai
  //Very similar to an issue I ran into while trying to scrape job descriptions from job boards
  // https://workable.com gave me PTSD,lol. Cheerio wasnt working and it forced me to use
  //Puppeteer , which worked perfectly until it was time to deploy it on Vercel,ouch!!
  //how was I going to host Chromium for Puppetter to use in Production. Finally had to use https://www.browserless.io/
  //and how it works well. Maybe I would configure AWS lambda to handle that later , saw an article on how to get it working there.
  // You can see it in action on this Lindein post I did
  //https://www.linkedin.com/posts/goodluck-dike_finally-update-to-the-chrome-extension-activity-7113129125158019073-tI2c
  // This is the project it was used for , https://chrome.google.com/webstore/detail/instant-apply/ihgmeifeofnbegocgfecndeaohbigpon
  // It grabs the job description it gets from the previous page and sends it to Open ai to generate keywords to include in your resume
  // and gives you a resume score , similar to https://jobscan.co , but its a chrome extension, web app coming soon :)
  // Even Crawlee knows Cheerio wouldnt work on Ycombinator, https://crawlee.dev/docs/quick-start#cheeriocrawler
  //I had to use a headless browser and Crawlee Playwright was my go-to because of two reasons .
  //1. https://crawlee.dev/docs/quick-start#playwrightcrawler, It was mentioned to be a successor to Puppeteer
  //2. Something new to try out
  const crawler = new PlaywrightCrawler({

    // this is the default configuration for using
    //browser fingerprints, which is a collection of browser attributes 
    // that can show if our browser is a bot or a real user. 
    //https://crawlee.dev/docs/guides/avoid-blocking
    //Since we already have it out-of-the-box by Crawlee, I decided to comment it out
    //For now, it shows the error "Cannot access ambient const enums when 'isolatedModules' is enabled."
    //Because our isolatedModules in the tsconfig.ts is set to true
    //If, I set it to false , it fixes it . But why would I want to do that?
    //Didnt see any fix for that . Crawlee has to look into it . I will raise a Github issue on that
    //And it does even help that a search for Crawlee returns search results for Crawler .
    // Thats why Branding is very important, a very key feature when I chose https://uiland.design
    // as the domain name for my project . I worked the SEO and now I easily rank for Ui land , uiland even above ui.land
    // created by designer at Vercel. I also got it to rank number one for big keywords like "uber app screens" etc

  //   browserPoolOptions: {
  //     useFingerprints: true, 
  //     fingerprintOptions: {
  //         fingerprintGeneratorOptions: {
  //             browsers: [{
  //                 name: BrowserName.edge,
  //                 minVersion: 96,
  //             }],
  //             devices: [
  //                 DeviceCategory.desktop,
  //             ],
  //             operatingSystems: [
  //                 OperatingSystemsName.windows,
  //             ],
  //         },
  //     },
  // },
    async requestHandler({ page, request, enqueueLinks }) {
      await clickLaunchButton(enqueueLinks)

      //For weird reasons, it doesnt work in a function
      //I have to call it bare here
      if (request.label === "LIST") {
        // So, this is where the usefulness of the label comes to play .
        // Because of it, I am able to write a different set of methods for
        // just the launch page
        const launchPageDetails: {
          launchTitle: string | null
          launchSubTitle: string | null
          pageLink: string | null
        }[] = []
        //I would call this lazy work ,lol. Because I used just h1 . But it works
        const title = await page.locator("h1").first().textContent()
        //same thing here. just the p tag
        const subTitle = await page.locator("p").first().textContent()
        //Ok, this got tricky . I needed to find a way to add these titles and subtitles to the
        //object that it is related with.
        //One issue arose, I initially thought that enqueueLinks() method would be call on every page
        //so I expected the request.url to come in as ycombinatior/doordash and /launch/we-deliver-to-the-nation
        //but it called all the sites first before enqueueLinks() was called
        //so I decided to grab the relative url i saw in the href of the launch page and use it for comparison
        //with the url key i stored in the company object in the scrapedData array
        //If we find we just add our launchpages array into the company Data.

        const pageLink = await page
          .locator(".post-company-link")
          .getAttribute("href")
        launchPageDetails.push({
          launchTitle: title,
          launchSubTitle: subTitle,
          pageLink: pageLink,
        })

        scrapedData.map((item) => {
          if (item.url.includes(pageLink as string)) {
            item["launchPages"] = launchPageDetails
          }
        })
        //For some weird reason, the code tried to run beyond this
        //I added this to let it know that this is the final destination.
        return
      }
      const name = await extractCompanyName(page)
      const founded = await extractTextContent(page, "Founded:")
      const teamSize = await extractTextContent(page, "Team Size:")
      const location = await extractTextContent(page, "Location:")
      const launchPosts = await extractLaunchData(page)
      const founderList = await extractFoundersData(page)
      const websiteUrl = await extractWebsiteUrlData(page)
      const description = await extractDescriptionData(page)
      const companyNews = await extractCompanyNewsData(page)

      const job = await extractJobsData(page)

      //passed the items into this scrapedItem object
      const scrapedItem = {
        founded,
        teamSize,
        location,
        launchPosts,
        job,
        websiteUrl,
        name,
        description,
        founderList,
        companyNews,
        url: request.url,
        launchPages: [],
      }
      scrapedData.push(scrapedItem)
    },
    async failedRequestHandler({ request }) {
      await Dataset.pushData({
        url: request.url,
        succeeded: false,
        errors: request.errorMessages,
      })
    },
  })

  // Add first URL to the queue and start the crawl.
  await crawler.run(companiesUrls)
  console.log(
    "\n",
    notice(
      "=============== SITE SUCCESSFULLY SCRAP ==============================\n"
    )
  )

  return scrapedData
}

/**
 * This function creates and adds data into JSON
 *
 * @param {Array , Array, string} folderName  - The first number.
 * @returns {void}
 */
export const writeJSONToFile = async (
  scrapedData: scrapedDataInterface[],
  folderName: string,
  FileName: string
) => {
  const __filename = fileURLToPath(import.meta.url)
  const parentDir = resolve(__filename, "..")
  const __dirname = dirname(parentDir)
  const folder = path.join(__dirname, folderName)
  await fs.ensureDir(folderName)
  const dbFilePath = `${folder}/${FileName}.json`

  //We are writing into the json file
  // converting the array to JSON-formatted string
  //and finally formats it to 2 lines of spaces
  writeFileSync(dbFilePath, JSON.stringify(scrapedData, null, 2))
}
