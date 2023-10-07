/**
 * This function validates the domain name you inputted
 *
 * @param {string} value - The first number.
 * @returns {string}
 */
export function isDomainValid(value: string): string {
  //I used let here . I just had to because i cannot
  //re-assign a value to the error variable using const
  let error = ""

  if (value.length < 6) {
    error = "Password must contain at least 6 characters"
  } else if (
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("www.")
  ) {
    error = "Wrong Format"
  } else if (
    !value.endsWith(".com") &&
    !value.endsWith(".app") &&
    !value.endsWith(".xyz")
  ) {
    error = "Invalid input"
    //a valid domain shouldnt contain a /
  } else if (value.includes("/")) {
    error = "Not the right domain"
  }
  return error
}
