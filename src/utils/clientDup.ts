import { google } from "googleapis";
import { CLIENT_SHEET_ID } from "../controllers/checkins";
import { Client } from "../models/client";
import { serialize_rows, sheet_auth } from "../utils/sheets";

export const check_dup_client = async (mac_address, alias) => {
    const sheet = google.sheets("v4");
  
    const read_result = await sheet.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      auth: sheet_auth(),
      range: `${CLIENT_SHEET_ID}!A1:E`
    });
  
    const rows = read_result.data.values as string[][];
    const ser = serialize_rows(rows) as Array<Client>;

    return ser.findIndex(client => client.mac_address === mac_address || client.alias === alias) !== -1
}