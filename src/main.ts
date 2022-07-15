import express from "express";
import cors from "cors";

var app = express()
app.use(cors())

const port = process.env.PORT ?? 8081;

app.listen(port, function () {
  console.log("Listening on " + port);
})