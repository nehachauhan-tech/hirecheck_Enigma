import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

 
app.use(cors());
app.use(express.json());

 
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
  });
});

 
app.get("/", (req, res) => {
  res.send("HireCheck Backend API");
});

 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

 
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});