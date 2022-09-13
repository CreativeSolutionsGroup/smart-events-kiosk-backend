import expressWS from 'express-ws';
import { google } from 'googleapis';
import { Heartbeat, Client } from '../models/client';
import { CLIENT_SHEET_ID, serialize_rows, sheet_auth } from './sheets';

export const initHeartbeat = (app) => {
    const ws = expressWS(app);

    ws.app.ws('/heartbeat', (ws, res) => {
        ws.on('message', async (message: string) => {
            let hb: Heartbeat
            try {
                hb = JSON.parse(message);
            } catch (error) {
                return
            }

            const sheet = google.sheets("v4");
            const read_result = await sheet.spreadsheets.values.get({
                spreadsheetId: process.env.SHEET_ID,
                auth: sheet_auth(),
                range: `${CLIENT_SHEET_ID}!A1:E`
            });

            const rows = read_result.data.values as string[][];
            const ser = serialize_rows(rows) as Array<Client>;

            const clientIndex = ser.findIndex((r) => hb.mac_address === r.mac_address);

            if (clientIndex == -1) {
                return;
            }

            let client = ser[clientIndex];
            const sheetIndex = clientIndex + 2;

            client.last_heartbeat = Date.now();
            const row = [...Object.values(client)];

            const request = {
                spreadsheetId: process.env.SHEET_ID,
                range: "Client!A" + sheetIndex + ":E" + sheetIndex,
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