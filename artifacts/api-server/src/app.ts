import type { IncomingMessage, ServerResponse } from "http";
import express, { type RequestHandler } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { connectDB, isDatabaseConfigured } from "@workspace/db";

connectDB().catch((err) => {
  logger.error({ err }, "Failed to connect to MongoDB");
});

const app = express();

const requestLogger = pinoHttp<IncomingMessage, ServerResponse>({
  logger,
  serializers: {
    req(req: IncomingMessage & { id?: string | number | object }) {
      return {
        id: req.id,
        method: req.method,
        url: req.url?.split("?")[0],
      };
    },
    res(res: ServerResponse) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
}) as unknown as RequestHandler;

app.use(requestLogger);
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/api", async (req, res, next) => {
  if (req.path === "/healthz") {
    return next();
  }
  if (!isDatabaseConfigured()) {
    return res.status(503).json({
      message: "Database is not configured. Set MONGODB_URI in Vercel project settings.",
    });
  }
  try {
    await connectDB();
    return next();
  } catch (err) {
    logger.error({ err }, "Failed to connect to MongoDB");
    return res.status(503).json({
      message: "Database connection failed. Check MONGODB_URI in Vercel project settings.",
    });
  }
});

app.use("/api", router);

export default app;
