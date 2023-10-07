import {
  crawlSites,
  parseCSVAndRetrieveUrls,
  writeJSONToFile,
} from "./lib/helpers"
import { error, printWelcomeMessage } from "./lib/utilities"

export async function processCompanyList() {
  try {
    //To kick start the project, after you install the packages
    //Chromium gets installed too
    //This is to enable you to test properly with Chromium running the headless browser
    await printWelcomeMessage("YC Web Scrapper...")

    // 	//To prevent IP Address blocking , I tried doing the Plywright Crawlee
    // //proxy configuration . https://crawlee.dev/docs/guides/proxy-management#crawler-integration
    // //I would have proceeded but it also involves logging into an Apify account to use
    // //https://docs.apify.com/sdk/js/docs/guides/apify-platform#log-in-with-cli
    // //I have logged it, but I realized that testing locally would be very difficult because I dont know
    // //either you have an account or not ,but I have dropped the code on how it should be like
    // //I dont know if that would be helpful or not. I have attached the group proxy url I got from my apify dashboard

    // setupProxy()

    // 1.  Get the companies url to be scraped from the input given
    const companiesurl: string[] = await parseCSVAndRetrieveUrls(
      "inputs/companies.csv"
    )

    //2. Crawl the sites url to be scraped from the input given
    const scrapedData = await crawlSites(companiesurl)

    // 3. Write Scraped Data to a JSON file
    writeJSONToFile(scrapedData, "out", "scraped")
  } catch (err) {
    console.error(error("An error occurred", err.message))
  }
}
