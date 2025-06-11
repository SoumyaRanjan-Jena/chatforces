//backend/src/index.js
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import path from 'path';

import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { app, server } from './lib/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// before any routes or cors()
app.use(express.json({
  limit: '10mb'           // or whatever fits your needs
}));
app.use(express.urlencoded({
  limit: '10mb',
  extended: true
}));

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// debug‐only: list every registered route
console.log("🚀 Express routes:");
app._router.stack.forEach((layer) => {
  if (layer.route) {
    // direct routes
    const methods = Object.keys(layer.route.methods)
      .map((m) => m.toUpperCase())
      .join(",");
    console.log(`${methods}\t${layer.route.path}`);
  } else if (layer.name === "router") {
    // router middleware
    layer.handle.stack.forEach((sub) => {
      const methods = Object.keys(sub.route.methods)
        .map((m) => m.toUpperCase())
        .join(",");
      console.log(`${methods}\t${layer.regexp} → ${sub.route.path}`);
    });
  }
});


server.listen(PORT , () => {
    console.log('Server is running on port : ' + PORT);
    connectDB();
}); 