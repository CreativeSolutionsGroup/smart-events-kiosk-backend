import expressWS from 'express-ws';
import { google } from 'googleapis';
import { RPI_SHEET_ID } from '../controllers/checkins';
import { Heartbeat, RPI } from '../models/checkin';
import { serialize_rows, sheet_auth } from './sheets';

export const initHeartbeat = (app) => {
    const ws = expressWS(app);

    ws.app.ws('/heartbeat', (ws, res) => {
        ws.on('message', async (message: string) => {
            const hb: Heartbeat = JSON.parse(message);

            const sheet = google.sheets("v4");
            const read_result = await sheet.spreadsheets.values.get({
                spreadsheetId: process.env.SHEET_ID,
                auth: sheet_auth(),
                range: `${RPI_SHEET_ID}!A1:E`
            });

            const rows = read_result.data.values as string[][];
            const ser: Array<RPI> = serialize_rows(rows) as Array<RPI>;

            const rpiIndex = ser.findIndex((r) => hb.mac_address === r.mac_address);
            let rpi = ser[rpiIndex];
            const sheetIndex = rpiIndex + 2;

            rpi.last_heartbeat = Date.now();
            const row = [...Object.values(rpi)];

            const request = {
                spreadsheetId: process.env.SHEET_ID,
                range: "RPI!A" + sheetIndex + ":E" + sheetIndex,
                valueInputOption: "RAW",
                auth: sheet_auth(),
                resource: {
                    values: [row]
                }
            }

            sheet.spreadsheets.values.update(request);
        });
    })
}