import { google } from "googleapis";

export const sheet_auth = () => {
  const auth = new google.Auth.JWT({
    email: process.env.SERVICE_EMAIL,
    key: process.env.SERVICE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  })

  return auth;
}