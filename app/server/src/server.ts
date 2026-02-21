import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

// Routes
import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/sessions";
import problemRoutes from "./routes/problems";
import verdictRoutes from "./routes/verdicts";
import statsRoutes from "./routes/stats";
import compassRoutes from "./routes/compass";
import leetcodeRoutes from "./routes/leetcode";
import diagRoutes from "./routes/diag";

import path from "path";

dotenv.config({ path: path.join(process.cwd(), "server", ".env") });

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hirecheck";

// Restrict CORS to only the known frontend origin
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/verdicts", verdictRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/compass", compassRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/diag", diagRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
  });
});

app.get("/", (req, res) => {
  res.send("HireCheck Backend API");
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Services for Socket context
import { InterviewEngine } from "./services/InterviewEngine";
import { SessionManager } from "./services/SessionManager";
import { AIAdapter } from "./services/AIAdapter";
import { VerdictEngine } from "./services/VerdictEngine";
import { problems } from "./routes/problems";

const interviewEngine = new InterviewEngine();
const sessionManager = new SessionManager();
const aiAdapter = new AIAdapter();
const verdictEngine = new VerdictEngine();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_interview", ({ sessionId }) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on("request_explanation", async ({ sessionId, context: userMessage }) => {
    try {
      console.log(`[Socket] request_explanation for session ${sessionId}`);
      const session = await interviewEngine.getSession(sessionId);
      if (!session) {
        console.error(`[Socket] Session ${sessionId} not found`);
        return;
      }

      // 1. Add candidate message to history
      await sessionManager.addChatMessage(sessionId, 'candidate', userMessage);

      // 2. Prepare context for AI
      const problem = problems.find(p => p.id === session.problemId);
      if (!problem) {
        console.error(`[Socket] Problem ${session.problemId} not found`);
        return;
      }

      const aiContext: any = {
        state: session.state,
        code: session.code,
        previousMessages: session.chatHistory.map(m => m.content),
        behavioralMetrics: {}, // TODO: Extract from signals
        persona: session.interviewerPersona,
        mode: session.interviewMode,
        targetCompany: session.metadata?.targetCompany,
        targetRole: session.metadata?.targetRole,
        experienceLevel: session.metadata?.experienceLevel,
        probingStage: session.roundScopedMemory?.probeHistory?.length || 1
      };

      // 3. Generate AI response
      const aiResponse = await aiAdapter.generatePersonaChat(
        aiContext,
        problem as any,
        userMessage,
        session.code || ""
      );

      // 4. Add AI message to history
      await sessionManager.addChatMessage(sessionId, 'interviewer', aiResponse.message);

      // 5. Emit back to client
      socket.emit("interviewer_message", {
        message: aiResponse.message
      });

    } catch (error) {
      console.error("[Socket] request_explanation error:", error);
    }
  });

  socket.on("code_update", async ({ sessionId, code, cursor }) => {
    try {
      await sessionManager.saveSnapshot(sessionId, { code, cursor });
    } catch (error) {
      console.error("[Socket] code_update error:", error);
    }
  });

  socket.on("run_code", async ({ sessionId, code, language }) => {
    try {
      console.log(`[Socket] run_code for session ${sessionId}`);
      const result = await interviewEngine.executeCode(code, language || 'javascript');
      socket.emit("run_result", result);
    } catch (error) {
      console.error("[Socket] run_code error:", error);
    }
  });

  socket.on("submit_solution", async ({ sessionId, code }) => {
    try {
      console.log(`[Socket] submit_solution for session ${sessionId}`);
      const session = await interviewEngine.getSession(sessionId);
      if (!session) return;

      // Update final code
      await interviewEngine.updateCode(sessionId, code);

      // Calculate verdict (passing empty signals for now, 
      // in production these would be aggregated from snapshots)
      const verdict = verdictEngine.calculateVerdict(session, []);

      // Save verdict back to database
      await verdictEngine.saveVerdict(sessionId, session.userId.toString(), verdict);

      // End session
      await interviewEngine.endSession(sessionId);

      socket.emit("verdict_result", verdict);
    } catch (error: any) {
      console.error("[Socket] submit_solution error:", error.message || error);
    }
  });

  socket.on("heartbeat", async ({ sessionId }) => {
    try {
      await sessionManager.updateHeartbeat(sessionId);
    } catch (error) {
      console.error("[Socket] heartbeat error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ─── Database + Start ─────────────────────────────────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    httpServer.listen(PORT, () => {
      console.log(`🔥 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("⚠️  Starting server without database (auth will not work)");
    httpServer.listen(PORT, () => {
      console.log(`🔥 Server running on http://localhost:${PORT}`);
    });
  });