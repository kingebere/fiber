/**
 * The entry point function. This will download the given dump file, extract/decompress it,
 * parse the CSVs within, and add the data to a SQLite database.
 * This is the core function you'll need to edit, though you're encouraged to make helper
 * functions!
 */
import { error } from "node:console"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import path from "path" // Import the 'path' module
import {
  CustomerCSVRow,
  OrganizationCSVRow,
  downloadFile,
  ensureFoldersExists,
  extractTarGz,
  initializeDatabase,
  readAndParseCSVFiles,
} from "./lib/helpers"
import { createProgressBar, notice } from "./lib/utils"
import { DUMP_DOWNLOAD_URL } from "./resources"
import { Knex } from "knex"

async function downloadFileWithProgress(
  url: string,
  targetFolder: string,
  tarName: string
) {
  const dbFilePath = path.join(targetFolder, tarName)
  try {
    await ensureFoldersExists(targetFolder)
    await downloadFile(url, dbFilePath)
    return dbFilePath
  } catch (err) {
    console.error(err)
    throw err
  }
}

async function decompressAndUnzip(
  targetFolder: string,
  extractedFolderName: string,
  tarName: string
) {
  try {
    const extractedFolder = path.join(targetFolder, extractedFolderName)
    const dbFilePath = path.join(targetFolder, tarName)
    await ensureFoldersExists(targetFolder, extractedFolder)
    await extractTarGz(dbFilePath, extractedFolder)
  } catch (err) {
    console.error(err)
    throw err
  }
}

async function batchInsertDataWithProgress(
  db: Knex,
  tableName: string,
  data: OrganizationCSVRow[] | CustomerCSVRow[],
  batchSize = 100
) {
  try {
    //Calculate total chunks and initialize progress bar
    const chunkSize = batchSize
    const totalChunks = Math.ceil(data.length / chunkSize)
    const bar = createProgressBar(
      totalChunks,
      `Inserting data to the ${tableName} table [:bar] :percent :etas`,
      "*"
    )

    // Transactions helps with memory efficiency,
    //allow you to work with data in smaller batches ,
    // committing each batch individually within the transaction.
    //This approach reduces the amount of memory needed because
    //you don't have to load and process the entire dataset at once.
    //Source - ChatGPT and Knex docs
    await db.transaction(async (trx: any) => {
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize)
        await trx(tableName).insert(chunk)
        // Update the progress bar
        bar.tick()
      }
    })
  } catch (error) {
    // If we get here, that means that the insert, didnt take place.
    console.error("Error inserting data:", error)
    throw error
  }
}

export const processDataDump = async (targetFolderName: string = "tmp") => {
  //Setting the path of folders was a real issue for me
  //I dont know if it was my PC, but it wasnt getting the correct
  //path, I fixed that with this

  //Gets the url of this ts file
  const __filename = fileURLToPath(import.meta.url)
  //This gives me the directory of this ts file
  const __dirname = dirname(__filename)
  //This locates the  directory of this ts file
  const targetFolder = path.join(__dirname, targetFolderName)

  try {
    // Step 1: Download the .tar.gz File
    console.log(
      notice("=================  DOWNLOADING FILE  =================\n")
    )
    await downloadFileWithProgress(
      DUMP_DOWNLOAD_URL,
      targetFolder,
      "dump.tar.gz"
    )
    console.log(
      notice("============= FILE DOWNLOADED SUCCESSFULLY =================\n")
    )

    // Step 2: Decompress and Unzip
    console.log(notice("========== EXTRACTING DATA ===============\n"))

    await decompressAndUnzip(targetFolder, "extracted", "dump.tar.gz")

    console.log(notice("========== DATA EXTRACTED ===============\n"))

    // Step 3: Insert Data into the Database

    console.log(
      notice("========== INSERTING DATA INTO THE DATBASE ===============\n")
    )

    const db = initializeDatabase() // Initialize your database here
    //---- Read and Parse CSV Files
    const { organizationsData, customersData } = await readAndParseCSVFiles(
      targetFolder,
      "extracted/dump"
    )
    //---- Batch Insert Data into the Database
    await batchInsertDataWithProgress(
      db,
      "organizations",
      organizationsData,
      100
    )
    await batchInsertDataWithProgress(db, "customers", customersData, 100)
    console.log(
      notice("========== DATA INSERTED SUCCESSFULLY ===============\n")
    )
  } catch (e: any) {
    console.error(error("AN ERROR OCCURED", e.message))
  }
}
