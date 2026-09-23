import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import acceptRouter from "./routes/accept.route";
import { connectDb, FounderOutput } from "db";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api/v1", acceptRouter);

app.listen(3000, async () => {
  await connectDb();
  console.log("Server is running on port 3000");
});
