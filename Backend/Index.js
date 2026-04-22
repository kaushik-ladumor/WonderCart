const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const DbConnection = require("./Inits/DbConnection");
const mainRoutes = require("./Routes/Main.Routes");
const initSocket = require("./Inits/SocketIo");

const startServer = async () => {
  await DbConnection();

  const initTopSellerCron = require("./cron/topSellerCron");
  initTopSellerCron();

  const startDealCron = require("./cron/dealCron");
  startDealCron();

  const startPointsCron = require("./cron/pointsCron");
  const startRankingCron = require("./cron/rankingCron");
  startPointsCron();
  startRankingCron();

  const app = express();
  const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "https://wondercart-customer.netlify.app",
    "https://wondercart-seller.netlify.app",
    "https://wondercart-admin.netlify.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(mainRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "https://wondercart-customer.netlify.app",
      "https://wondercart-seller.netlify.app",
      "https://wondercart-admin.netlify.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
});

global.io = io;
initSocket(io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
