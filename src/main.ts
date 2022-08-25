import express from "express";
import cors from "cors";
import { initHeartbeat } from "./utils/heartbeat";

import dotenv from "dotenv";

dotenv.config();

import { create_check_in, create_event, read_all_events } from "./controllers/checkins";
import { read_all_clients, read_one_client, update_one_client } from "./controllers/client";

var app = express()
app.use(cors())
app.use(express.json())

const v1 = express.Router();

v1.route("/event")
  .get(read_all_events)
  .post(create_event);

v1.route("/checkin")
  .post(create_check_in)

v1.route("/client")
  .get(read_all_clients)

v1.route("/client/:id")
  .get(read_one_client)
  .put(update_one_client)

app.use("/v1", v1);

initHeartbeat(app)

const port = process.env.PORT ?? 3001;

app.listen(port, function () {
  console.log("Listening on " + port);
})

export {app}