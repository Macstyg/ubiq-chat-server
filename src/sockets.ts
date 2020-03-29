import { v4 } from "uuid";
import getOr from "lodash/fp/getOr";
import socket from "socket.io";

import logger from "./logger";
import { checkAndAddUser, removeUserFromActive } from "./users";

const IDLE_TIME = 10_000;

const disconnectDueToIdle = (
  socket: socket.Socket,
  io: socket.Server,
  userName: string
) => {
  return setTimeout(() => {
    const text = `${userName} was disconnected due to inactivity`;
    io.emit("CHAT_MESSAGE", createMessage(text, userName));
    socket.emit("IDLE_DISCONNECT");
    socket.removeAllListeners();
    socket.disconnect(true);
    logger.info(text);
  }, IDLE_TIME);
};

const createSubscriptions = (io: socket.Server) => {
  io.on("connection", socket => {
    const userName = getOr("", "handshake.query.userName", socket);
    const result = checkAndAddUser(userName);
    if (!result) {
      socket.emit("NOT_UNIQUE_LOGIN");
      socket.disconnect(true);
      logger.info(`not unique username >> ${userName} <<`);
      logger.info("disconecting");
      return;
    }
    logger.info(`a user >> ${userName} << connected`);

    socket.emit("WELCOME");

    const timer = disconnectDueToIdle(socket, io, userName);

    socket.on("disconnecting", (reason: string) => {
      io.emit(
        "CHAT_MESSAGE",
        createMessage(`${userName} left the chat, connection lost`, userName)
      );
      logger.info(
        `user ${userName} is goint to be disconnected : reason : ${reason}`
      );
      removeUserFromActive(userName);
    });

    socket.on("disconnect", () => {
      clearTimeout(timer);
      logger.info("user disconnected");
    });

    socket.on("CHAT_MESSAGE", msg => {
      timer.refresh();
      logger.info("message: " + JSON.stringify(msg));
      io.emit("CHAT_MESSAGE", createMessage(msg, userName));
    });
  });
};

const createMessage = (msg: string, userName: string) => {
  return {
    text: msg,
    createdBy: userName,
    date: new Date(),
    id: v4()
  };
};

export default createSubscriptions;
