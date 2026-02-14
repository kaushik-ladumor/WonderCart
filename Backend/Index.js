const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const DbConnection = require("./Inits/DbConnection");
const mainRoutes = require("./Routes/Main.Routes");
const initSocket = require("./Inits/SocketIo");

DbConnection();

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://wonder-cart-three.vercel.app",
    "https://wonder-cart-p6ep8tntl-kaushik-ladumors-projects.vercel.app",
    "https://wonder-cart-gc1pbvdds-kaushik-ladumors-projects.vercel.app",
    "https://wonder-cart-git-main-kaushik-ladumors-projects.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mainRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://wonder-cart-three.vercel.app",
      "https://wonder-cart-p6ep8tntl-kaushik-ladumors-projects.vercel.app",
      "https://wonder-cart-gc1pbvdds-kaushik-ladumors-projects.vercel.app",
      "https://wonder-cart-git-main-kaushik-ladumors-projects.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST"]
  }
});

global.io = io;
initSocket(io);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
