import { google } from "googleapis";
import { CLIENT_SHEET_ID } from "../controllers/checkins";
import { CheckIn } from "../models/checkin";
import { serialize_rows, sheet_auth } from "../utils/sheets";

export const check_dup_client = async (mac_address, alias) => {
    const sheet = google.sheets("v4");
  
    const read_result = await sheet.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      auth: sheet_auth(),
      range: `${CLIENT_SHEET_ID}!A1:B`
    });
  
    const rows = read_result.data.values as string[][];
    const ser = serialize_rows(rows) as Array<CheckIn>;

    for (let i = 0; i < ser.length; i++) {
        const macI = ser.at(i)?.event
        const aliasI = ser.at(i)?.student_id
        if (macI == mac_address || aliasI == alias) {
            return true;
        }
    }
    return false;
}