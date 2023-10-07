import clc from "cli-color"
import ProgressBar from "progress"

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
