import Express from "express";
import { google } from "googleapis";
import { Client } from "../models/client";
import { check_dup_client } from "../utils/clientDup";
import { CLIENT_SHEET_ID } from "../utils/sheetID";
import { serialize_rows, sheet_auth } from "../utils/sheets";

export const read_one_client: Express.RequestHandler = async (req, res) => {
    const sheet = google.sheets("v4");
    const read_result = await sheet.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        auth: sheet_auth(),
        range: `${CLIENT_SHEET_ID}!A1:E`
    });

    const rows = read_result.data.values as string[][];
    const clients = serialize_rows(rows) as Array<Client>;

    const client = clients.find(c => c.mac_address === req.params.id);

    res.json(client);
}

export const read_all_clients: Express.RequestHandler = async (req, res) => {
    const sheet = google.sheets("v4");
    const read_result = await sheet.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        auth: sheet_auth(),
        range: `${CLIENT_SHEET_ID}!A1:E`
    });

    const rows = read_result.data.values as string[][];
    const clients = serialize_rows(rows) as Array<Client>;

    res.json(clients);
}

export const create_client: Express.RequestHandler = async (req, res) => {
    // Create new client from POST data
    const new_client: Client = req.body;
    
    const sheet = google.sheets("v4");    

    if (await check_dup_client(new_client.mac_address, new_client.alias)) {
        res.status(400).end()
    } else {
        const append_res = sheet.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: "Client",
            valueInputOption: "RAW",
            auth: sheet_auth(),
            requestBody: {
                values: [[new_client.mac_address, new_client.alias, new_client.event_id, 0, 0]]
            }
        });
    
        res.json(append_res)
    }
}

export const update_one_client: Express.RequestHandler = async (req, res) => {
    const client: Client = req.body;
    const id = req.params.id;


    const sheet = google.sheets("v4");
    const read_result = await sheet.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        auth: sheet_auth(),
        range: `${CLIENT_SHEET_ID}!A1:E`
    });

    const rows = read_result.data.values as string[][];
    const ser = serialize_rows(rows) as Array<Client>;

    const clientIndex = ser.findIndex((r) => id === r.mac_address);
    let mut_client = ser[clientIndex];
    const sheetIndex = clientIndex + 2;

    // We don't want people to change the mac address of the client.
    delete client.mac_address;

    mut_client = { ...mut_client, ...client };

    const row = [...Object.values(mut_client)];

    const request = {
        spreadsheetId: process.env.SHEET_ID,
        range: "Client!A" + sheetIndex + ":E" + sheetIndex,
        valueInputOption: "RAW",
        auth: sheet_auth(),
        resource: {
            values: [row]
        }
    }

    const result = sheet.spreadsheets.values.update(request);

    res.json(result)
}