import express from "express";
import { Request, Response, NextFunction, Application } from "express";
import { Server } from "http";
import createHttpError from "http-errors";
const Redis = require("ioredis");
const cors = require("cors");
const client = new Redis({
  port: 6379,
  host: "redis-bayut",
});
// const client = new Redis(6379, "172.17.0.3");

require("dotenv").config();
const app: Application = express();

const allowedOrigins = ["http://bayut-client:3000", "http://localhost:3000" ,"127.0.0.1:3000"];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET"],
}));
app.get("/", async (req: Request, res: Response) => {
  res.send("Hello World3!🌏");
});
// Routes
app.use("/auto-complete", require("./routes/auto-complete"));
app.use("/properties", require("./routes/properties"));
app.use("/agencies", require("./routes/agencies"));
const acceptOnlyGetRequsets = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.method !== "GET") {
    return next(createHttpError(405, "Method Not Allowed"));
  }
};
//  accept Only Get Requsets
app.use(acceptOnlyGetRequsets);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new createHttpError.NotFound());
});

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    status: err.status,
  });
};

app.use(errorHandler);
const PORT = process.env.PORT || 4000;
const server: Server = app.listen(PORT, () =>
  console.log(`=>  http://localhost:${PORT}/
  ⌛ ${new Date().toLocaleTimeString("en-us", { timeStyle: "medium" })}
  `)
);

export const redisClient = client;
