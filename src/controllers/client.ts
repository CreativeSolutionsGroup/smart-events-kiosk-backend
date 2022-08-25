import Express from "express";
import { google } from "googleapis";
import { Client } from "../models/client";
import { serialize_rows, sheet_auth } from "../utils/sheets";
import { CLIENT_SHEET_ID } from "./checkins";

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