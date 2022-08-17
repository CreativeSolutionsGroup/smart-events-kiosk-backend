import { CheckInInput, Event, EventInput, RPI } from './../models/checkin';
import Express from "express";
import { google } from "googleapis";
import { serialize_rows, sheet_auth } from "../utils/sheets";
import { v4 } from 'uuid';
import { parse_mag_stripe } from '../utils/card';

const EVENT_SHEET_ID = "EVENTS";
const CHECKIN_SHEET_ID = "CHECKINS";
const RPI_SHEET_ID = "RPI";

export const create_check_in: Express.RequestHandler = async (req, res) => {
  let check_in: CheckInInput = req.body;
  if (check_in.student_id.charAt(0) === ";") check_in.student_id = parse_mag_stripe(check_in.student_id);

  const sheet = google.sheets("v4");

  const read_result = await sheet.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: `${RPI_SHEET_ID}!A1:C`
  });

  const rows = read_result.data.values as string[][];
  const ser: Array<RPI> = serialize_rows(rows) as Array<RPI>;

  const rpi = ser.find((a) => a.mac_address === check_in.mac_address)

  const event_id = rpi?.event_id;

  const insert_result = await sheet.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: CHECKIN_SHEET_ID,
    valueInputOption: "RAW",
    requestBody: {
      values: [[v4(), event_id, check_in.student_id, Date.now()]]
    }
  });

  res.json(insert_result.data);
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

export const read_all_events: Express.RequestHandler = async (req, res) => {
  const sheet = google.sheets("v4");

  const read_result = await sheet.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: `${EVENT_SHEET_ID}!A1:D`
  });

  const rows = read_result.data.values as string[][];
  const ser = serialize_rows(rows);

  res.json(ser);
}