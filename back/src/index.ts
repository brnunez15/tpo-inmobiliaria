import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import { router } from "./routes";

import { errorHandler } from "./middlewares/error-handler";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.use(router);
app.use(errorHandler);


if (process.env.NODE_ENV !== "test") {
  AppDataSource.initialize()
    .then(() => {
      console.log("Data source initialized");
      app.listen(port, () => {
        console.log(`API running on http://localhost:${port}`);
      });
    })
    .catch((error: unknown) => {
      console.error("Error initializing data source", error);
      process.exit(1);
    });
}

export { app };
