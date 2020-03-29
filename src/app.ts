import express from "express";
import http from "http";
import path from "path";
import socket from "socket.io";
import logger from "./logger";

import * as homeController from "./controllers/home";
import createSubscriptions from "./sockets";

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.set("views", path.join(__dirname, "../views"));

app.get("/", homeController.index);

createSubscriptions(io);

const port = 8888;

server.listen(port, () => {
  logger.info(`listening on *:${port}`);
});
