import { google } from "googleapis";

export const sheet_auth = () => {
  console.log("Authenticating with the following...")
  console.log(process.env.SERVICE_KEY, process.env.SERVICE_EMAIL)
  const auth = new google.auth.JWT({
    email: process.env.SERVICE_EMAIL,
    key: process.env.SERVICE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  })

  return auth;
}

/**
 * Includes the header row, aka the column aliases.
 */
export const serialize_rows = (sheet: Array<Array<string>>) => {
  const columns = sheet.splice(0, 1)[0];

  // @ts-ignore
  // I know this works. It's okay.
  // Practically maps an array with a top column to an object.
  return sheet.map(row => row.reduce((acc, cell, i) => { acc[columns[i]] = cell; return acc }, {}))
}