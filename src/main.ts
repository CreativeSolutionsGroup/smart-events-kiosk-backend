import express from "express";
import cors from "cors";

import dotenv from "dotenv";

dotenv.config();

import { create_check_in, create_event, read_all_events } from "./controllers/checkins";

var app = express()
app.use(cors())
app.use(express.json())

const v1 = express.Router();

v1.route("/event")
  .get(read_all_events)
  .post(create_event);

v1.route("/checkin")
  .post(create_check_in)

app.use("/v1", v1);

const port = process.env.PORT ?? 3001;

app.listen(port, function () {
  console.log("Listening on " + port);
})