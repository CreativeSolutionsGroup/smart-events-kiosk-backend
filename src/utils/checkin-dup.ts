import { google } from "googleapis";
import { CheckIn } from "../models/checkin";
import { CHECKIN_SHEET_ID, serialize_rows, sheet_auth } from "./sheets";

export const check_dup_checkIn = async (eventId, studentId) => {
    const sheet = google.sheets("v4");
  
    const read_result = await sheet.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      auth: sheet_auth(),
      range: `${CHECKIN_SHEET_ID}!A1:D`
    });
  
    const rows = read_result.data.values as string[][];
    const ser = serialize_rows(rows) as Array<CheckIn>;

    return ser.findIndex(check_in => check_in.event === eventId && check_in.student_id === studentId) !== -1
}