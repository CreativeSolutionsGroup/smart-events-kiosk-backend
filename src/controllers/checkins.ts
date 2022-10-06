import { CheckIn, CheckInInput, Event, EventInput } from './../models/checkin';
import { Client } from '../models/client';
import Express from "express";
import { google } from "googleapis";
import { CHECKIN_SHEET_ID, CLIENT_SHEET_ID, EVENT_SHEET_ID, serialize_rows, sheet_auth } from "../utils/sheets";
import { v4 } from 'uuid';
import { parse_mag_stripe } from '../utils/card';
import { check_dup_checkIn, update_cache } from '../utils/checkin-dup';

export const create_check_in: Express.RequestHandler = async (req, res) => {
  let check_in: CheckInInput = req.body;
  if (check_in.student_id.charAt(0) === ";") check_in.student_id = parse_mag_stripe(check_in.student_id);

  const sheet = google.sheets("v4");

  const read_result = await sheet.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: `${CLIENT_SHEET_ID}!A1:C`
  });

  const rows = read_result.data.values as string[][];
  const ser = serialize_rows(rows) as Array<Client>;

  const client = ser.find((a) => a.mac_address === check_in.mac_address)

  const event_id = client?.event_id;

  const cache = req.app.get("cache");

  const does_already_exist = await check_dup_checkIn(check_in.student_id, event_id!, cache);

  const checkin_to_insert = {
    event: event_id,
    id: v4(),
    student_id: check_in.student_id,
    created: new Date(Date.now())
  } as CheckIn;

  const checkin_read_result = await sheet.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: `${CHECKIN_SHEET_ID}!A1:D`
  });

  const checkin_rows = checkin_read_result.data.values as string[][];
  const checkin_ser = serialize_rows(checkin_rows) as Array<CheckIn>;

  if (does_already_exist) {
    res.status(400).end()
  } else {
    const insert_result = await sheet.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      auth: sheet_auth(),
      range: CHECKIN_SHEET_ID,
      valueInputOption: "RAW",
      requestBody: {
        values: [[...Object.values(checkin_to_insert)]]
      }
    });

    await update_cache(ser, cache);

    res.json(insert_result.data);
  }
}

export const create_event: Express.RequestHandler = async (req, res) => {
  const event: EventInput = req.body;

  const sheet = google.sheets("v4");

  const id = v4();

  const insert_result = await sheet.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: EVENT_SHEET_ID,
    valueInputOption: "RAW",
    requestBody: {
      values: [[id, event.alias, Date.now()]]
    }
  });

  res.json(id);
}

export const update_one_event: Express.RequestHandler = async (req, res) => {
  const event_update: EventInput = req.body;
  const id = req.params.id;

  const sheet = google.sheets("v4");
  const read_result = await sheet.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: `${EVENT_SHEET_ID}!A1:D`
  });

  const rows = read_result.data.values as string[][];
  const ser = serialize_rows(rows) as Array<Event>;

  const eventIndex = ser.findIndex((r) => id === r.id);
  if (eventIndex === -1) {
    res.status(404).end();
    return;
  }
  let mut_event = ser[eventIndex];
  const sheetIndex = eventIndex + 2;

  mut_event.alias = event_update.alias;

  const row = [...Object.values(mut_event)];

  const request = {
    spreadsheetId: process.env.SHEET_ID,
    range: "Events!A" + sheetIndex + ":C" + sheetIndex,
    valueInputOption: "RAW",
    auth: sheet_auth(),
    resource: {
      values: [row]
    }
  }

  const result = sheet.spreadsheets.values.update(request);

  res.json(result);
}

export const delete_event: Express.RequestHandler = async (req, res) => {
  const id = req.params.id;

  const sheet = google.sheets("v4");
  const read_result = await sheet.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: `${EVENT_SHEET_ID}!A1:C`
  });

  const rows = read_result.data.values as string[][]
  const ser = serialize_rows(rows) as Array<Event>

  const eventIndex = ser.findIndex((r) => id === r.id)
  if (eventIndex === -1) {
    res.status(404).end()
  } else {
    const sheetIndex = eventIndex + 2;

    const request = {
      spreadsheetId: process.env.SHEET_ID,
      auth: sheet_auth(),
      range: "Events!A" + sheetIndex + ":C" + sheetIndex,
      valueInputOption: "RAW",
      requestBody: {
        values: [["", "", ""]]
      }
    }

    const result = sheet.spreadsheets.values.update(request)
    res.json(result)
  }
}

export const read_all_events: Express.RequestHandler = async (req, res) => {
  const sheet = google.sheets("v4");

  const read_result = await sheet.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: `${EVENT_SHEET_ID}!A1:C`
  });

  const rows = read_result.data.values as string[][];
  const ser = serialize_rows(rows);

  res.json(ser);
}

export const get_student_events: Express.RequestHandler = async (req, res) => {
  const studentId = req.params.id
  const sheet = google.sheets("v4");

  const read_result = await sheet.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: `${CHECKIN_SHEET_ID}!A1:D`
  });

  const rows = read_result.data.values as string[][];
  const ser = serialize_rows(rows) as Array<CheckIn>;
  const studentEvents = ser.filter((r) => studentId === r.student_id)

  res.json(studentEvents)
}

export const read_all_checkins: Express.RequestHandler = async (req, res) => {
  const sheet = google.sheets("v4");

  const read_result = await sheet.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: `${CHECKIN_SHEET_ID}!A1:D`
  });

  const rows = read_result.data.values as string[][];
  const ser = serialize_rows(rows) as Array<CheckIn>;

  res.json(ser);
}
