import { RedisClientType } from "@redis/client";
import { google } from "googleapis";
import { CheckIn } from "../models/checkin";
import { CHECKIN_SHEET_ID, serialize_rows, sheet_auth } from "./sheets";

var cache_hit_counter = 0;

const format_id = (student_id: string, event_id: string) => {
  return `${student_id}|||${event_id}`
}

const exists_in_cache = async (id: string, db: RedisClientType): Promise<boolean> => {
  return await db.exists(id) !== 0;
}

const insert_cache = async (check_in: CheckIn, db: RedisClientType) => {
  await db.set(format_id(check_in.student_id, check_in.event), JSON.stringify(check_in));
}

export const update_cache = async (ser: Array<CheckIn>, db: RedisClientType) => {
  await Promise.all(ser.map(i => insert_cache(i, db)));
  console.log("Updated cache");
}

export const clear_cache = async (db: RedisClientType) => {
  await db.flushAll();
}

export const check_dup_checkIn = async (student_id: string, event_id: string, db: RedisClientType) => {
  const sheet = google.sheets("v4");

  const exists = await exists_in_cache(format_id(student_id, event_id), db);

  if (cache_hit_counter >= 10) {
    cache_hit_counter = 0;
    await clear_cache(db);
  } else {
    cache_hit_counter++;
  }

  return exists;
}