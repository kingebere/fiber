import * as csv from "fast-csv"
import fs from "fs-extra"
import https from "https"

import knex from "knex"
import { createReadStream, readdirSync } from "node:fs"
import path from "path" // Import the 'path' module
import tar from "tar"
import zlib from "zlib"
import { development } from "../knexfile"
import { createProgressBar } from "./utils"

//  Define an interface for CSV rows
export interface CustomerCSVRow {
  Index: number
  "Customer Id": string
  "First Name": string
  "Last Name": string
  Company: string
  City: string
  Country: string
  "Phone 1": string
  "Phone 2": string
  Email: string
  "Subscription Date": Date
  Website: string
}

export interface OrganizationCSVRow {
  Index: number
  "Organization Id": string
  Name: string
  Website: string
  Country: string
  Description: string
  Founded: string
  Industry: string
  "Number of employees": string
}

/**
 * This  function  checks if a folder exists
 *
 * @param {Array} folders - The first number.
 * @returns {void}
 */
export async function ensureFoldersExists(...folders: string[]) {
  for (const folder of folders) {
    //I was using fs existsSync and mkdirSync previously
    //I tried out fx-extra and it was so easy to setup
    // ensureDir made it so easier in one line of code
    //I will keep using it in my projects now
    await fs.ensureDir(folder)
  }
}

/**
 * This function validates gets the file size
 *
 * @param {string} filePath - The first number.
 * @returns {number}
 */
function getFileSize(filePath: string) {
  // Decided to add a loading indicator
  //because I didnt enjoy just staring at the
  //console without knowing what was going on
  //This is one of the steps to ensure that I give
  //you a god user experience while downloading the files
  const stats = fs.statSync(filePath)
  return stats.size
}

/**
 * This function validates to download the file
 *
 * @param {string} url - The first number.
 * @param {string} dbFilePath
 * @returns {void}
 */
export async function downloadFile(
  url: string,
  dbFilePath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let downloadedBytes = 0
        //so , for a good downloading experience, As required by Progress npm package,
        // https://www.npmjs.com/package/progress#download
        //I decided to get the content length from the HTTP response header,
        // change it to an Integer and store it .
        //Added the ! for non-null assertion
        //The aim is to show you the progress of the tar.gz file been downloaded
        //Fun fact: I have never handled a file as large as that before
        const totalBytes =
          parseInt(response.headers["content-length"]!, 10) || 0
        const fileStream = fs.createWriteStream(dbFilePath)
        //The sweet progress bar :)
        // learnt this trick from their npm page
        // https://www.npmjs.com/package/progress#download
        const bar = createProgressBar(
          totalBytes,
          "Downloading File [:bar] :percent :etas",
          "="
        )

        //runs everytime a chunk is downloaded
        response.on("data", (chunk) => {
          downloadedBytes += chunk.length
          // Update the progress bar with the bytes received.
          bar.tick(chunk.length)
          // Write the data to the file stream.
          fileStream.write(chunk)
        })

        //runs when all is downloaded
        response.on("end", () => {
          fileStream.end()
          bar.terminate()
          resolve()
        })

        response.on("error", (err) => {
          reject(err)
        })
      })
      .on("error", (err) => {
        reject(err)
      })
  })
}

//helper function
/**
 * This function validates for extracting files
 *
 * @param {string} srcFilePath - The first number.
 * @param {string} destFolder
 * @returns {void}
 */
export async function extractTarGz(srcFilePath: string, destFolder: string) {
  return new Promise((resolve, reject) => {
    // this does the decompression
    const gunzip = zlib.createGunzip()
    //tar extracted the file and piped it into
    // the extracted folder
    const extract = tar.extract({ cwd: destFolder })

    createReadStream(srcFilePath)
      .pipe(gunzip)
      .pipe(extract)
      .on("finish", () => {
        resolve("success")
      })
      .on("error", (error) => {
        reject(error)
      })
  })
}

// Helper function
/**
 * This function  read and parses CSV files
 *
 * @param {string} targetFolder - The first number.
 * @param {string} extractedPath
 * @returns {Array} organizationData
 * @returns {Array} customersData
 */
export async function readAndParseCSVFiles(
  targetFolder: string,
  extractedPath: string
): Promise<{
  organizationsData: OrganizationCSVRow[]
  customersData: CustomerCSVRow[]
}> {
  const organizationsData: OrganizationCSVRow[] = []
  const customersData: CustomerCSVRow[] = []

  const readExtractedFolder = path.join(targetFolder, extractedPath)

  //This reads through the files in the folder
  const csvFiles = readdirSync(readExtractedFolder)

  // Since I wasnt expecting a result, I decided to use the Array.from
  // which works perfectly for this usecase
  await Promise.all(
    Array.from({ length: csvFiles.length }).map(async (_, i) => {
      const filePath = `${readExtractedFolder}/${csvFiles[i]}`
      const totalBytes = getFileSize(filePath)
      //Progress .....:)
      const bar = createProgressBar(totalBytes, "Parsing Files... :etas", "+")
      const stream = createReadStream(filePath)
      //since we want the first row to be treated as the headers
      //I used option ,headers
      //https://c2fo.github.io/fast-csv/docs/parsing/options#headers
      const parsedCSV = csv.parse({ headers: true })

      await new Promise((resolve) => {
        stream
          .pipe(parsedCSV)
          .on("data", (row: OrganizationCSVRow | CustomerCSVRow) => {
            //So, we want to place the 2 csv to represent two different
            //Tables , so I separated them and stored into organizations
            //and customers variables respectively
            //Is this a good idea
            if (csvFiles[i].trim() === "organizations.csv") {
              organizationsData.push(row as OrganizationCSVRow)
              //Progress Indicator ... :)
              bar.tick()
            } else if (csvFiles[i].trim() === "customers.csv") {
              customersData.push(row as CustomerCSVRow)
              //Progress Indicator ... :)
              bar.tick()
            }
          })
          .on("end", resolve)
      })
    })
  )

  return { organizationsData, customersData }
}

// Helper function
/**
 * This function  initialize the database
 *
 * @param
 * @returns {any} db
 */
export function initializeDatabase() {
  const db = knex(development)
  //This step is very important
  //Without this step, we would be unable to create the Organizations and Customers Tables for the
  //Database. https://knexjs.org/guide/migrations.html#latest
  //It runs all migrations that havent been ran ,
  db.migrate.latest()

  return db
}
