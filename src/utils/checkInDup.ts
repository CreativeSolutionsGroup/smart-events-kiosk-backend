import { google } from "googleapis";
import { CHECKIN_SHEET_ID } from "../controllers/checkins";
import { CheckIn } from "../models/checkin";
import { serialize_rows, sheet_auth } from "../utils/sheets";

export const check_dup_student = async (eventId, studentId) => {
    const sheet = google.sheets("v4");
  
    const read_result = await sheet.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      auth: sheet_auth(),
      range: `${CHECKIN_SHEET_ID}!A1:D`
    });
  
    const rows = read_result.data.values as string[][];
    const ser = serialize_rows(rows) as Array<CheckIn>;

    for (let i = 0; i < ser.length; i++) {
        const event = ser.at(i)?.event
        const student = ser.at(i)?.student_id
        if (event == eventId && student == studentId) {
            return true;
        }
    }
    return false;
}