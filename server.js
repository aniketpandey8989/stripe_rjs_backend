process.on("uncaughtException", (err) => {
  console.error(err);
  console.trace(err);
  process.exit(1);
});

import express from "express";
import { urlencoded, json } from "body-parser";
import cors from "cors";
import routes from "./server/routes/routes";
const app = express();
const http = require("http").createServer(app);
const port = 8000;
const corsOptions = {
  origin: "*",
};
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(urlencoded({ extended: true }));
app.use(json({ limit: "1000mb" }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", routes);

const ser = http.listen(port, (req, res) => {
  console.log(`server listening on port: ${port}`);
});
