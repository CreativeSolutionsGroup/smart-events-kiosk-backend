import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import { initHeartbeat } from "./utils/heartbeat";

import dotenv from "dotenv";

dotenv.config();

import { create_check_in, create_event, delete_event, get_student_events, read_all_checkins, read_all_events, update_one_event } from "./controllers/checkins";
import { read_all_clients, read_one_client, create_client, update_one_client, remove_one_client } from "./controllers/client";

const error_handler: ErrorRequestHandler = (err, req, res, next) => {
  console.log("CAUGHT FATAL: " + err);
  res.status(500).send();
}

var app = express()
app.use(cors())
app.use(express.json())
app.use(error_handler);

const v1 = express.Router();

v1.route("/event")
  .get(read_all_events)
  .post(create_event)

v1.route("/event/:id")
  .put(update_one_event)
  .delete(delete_event)

v1.route("/checkin")
  .get(read_all_checkins)
  .post(create_check_in)

v1.route("/checkin/:id")
  .get(get_student_events)

v1.route("/client")
  .get(read_all_clients)
  .post(create_client)

v1.route("/client/:id")
  .get(read_one_client)
  .put(update_one_client)
  .delete(remove_one_client)

app.use("/v1", v1);

initHeartbeat(app)

const port = process.env.PORT ?? 3001;

app.listen(port, function () {
  console.log("Listening on " + port);
})

export {app}