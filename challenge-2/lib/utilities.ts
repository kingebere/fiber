import clc from "cli-color"
import figlet from "figlet"
import ProgressBar from "progress"
// import { ProxyConfiguration} from "crawlee";
import util from "util"

// Promisify the figlet function to work with async/await
const figletPromise = util.promisify(figlet)

/**
 * This function prints a welcome message on the console
 *
 * @param {string} message - The first number.
 * @returns {void}
 */
export const printWelcomeMessage = async (message: string) => {
  try {
    const data = await figletPromise(message)
    console.log(data)
  } catch (err) {
    console.log("Something went wrong...")
    console.dir(err)
  }
}

// export const setupProxy(){

// // const proxyConfiguration = new ProxyConfiguration({
// //   proxyUrls: [
// //       'http://groups-BUYPROXIES94952:apify_proxy_ljBya4qHO0Zc7R3MQghbDif6ecVhEv0GA7de@proxy.apify.com:8000'
// //   ],
// // });
// return proxyConfiguration
// }

export const error = clc.red.bold
export const warn = clc.yellow
export const notice = clc.blue

//helper function for creating folder bar
export const createProgressBar = (
  bytes: number,
  text: string,
  progressindicator: string
) => {
  text
  return new ProgressBar(text, {
    total: bytes,
    width: 50,
    complete: progressindicator,
    incomplete: " ",
  })
}
