import { CheckInInput, EventInput } from './../models/checkin';
import Express from "express";
import { google } from "googleapis";
import { sheet_auth } from "../utils/sheets";
import { v4 } from 'uuid';

const EVENT_SHEET_ID = "EVENTS";
const CHECKIN_SHEET_ID = "CHECKINS";

export const create_check_in: Express.RequestHandler = async (req, res) => {
  const check_in: CheckInInput = req.body;

  const sheet = google.sheets("v4");

  const insert_result = await sheet.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: CHECKIN_SHEET_ID,
    valueInputOption: "RAW",
    requestBody: {
      values: [[v4(), check_in.event, check_in.student_id, Date.now().toLocaleString()]]
    }
  });


  res.json(insert_result.data);
}

export const create_event: Express.RequestHandler = async (req, res) => {
  const event: EventInput = req.body;

  const sheet = google.sheets("v4");

  const insert_result = await sheet.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    auth: sheet_auth(),
    range: CHECKIN_SHEET_ID,
    valueInputOption: "RAW",
    requestBody: {
      values: [[v4(), event.alias, Date.now().toLocaleString()]]
    }
  });

  res.json(insert_result.data);
}

export const read_all_events: Express.RequestHandler = async (req, res) => {
  const sheet = google.sheets("v4");
}