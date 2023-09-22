import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { __dirname, dateHelper } from "./utils/utils.js";
import {
  PORT,
  SECRET_PASS,
  MONGO_URI,
  MONGO_DB_NAME,
} from "./config/config.js";
import run from "./run.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import { devLogger } from "./utils/logger.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));
app.engine(
  "handlebars",
  handlebars.engine({
    helpers: dateHelper,
  })
);
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

app.use(cookieParser(SECRET_PASS));
initializePassport();
app.use(passport.initialize());

try {
  await mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME}`);
  const serverHttp = app.listen(
    PORT,
    () => console.log(__dirname),
    devLogger.http(`Server listening on port http://localhost:${PORT}`)
  );
  const io = new Server(serverHttp);
  app.set("socketio", io);

  run(io, app);
} catch (error) {
  devLogger.error(`Cannot connect to dataBase: ${error}`);
  process.exit();
}
