import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import macroRouter from "./routes/macroRoutes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());
app.use("/api", macroRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Macro Systems Lab backend listening on port ${port}`);
});
