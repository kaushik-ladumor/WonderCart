import { io } from "socket.io-client";
import { API_URL } from "./utils/constants";

const socket = io(API_URL, {
    autoConnect: false,
    auth: {
        token: localStorage.getItem("token"),
    },
});

export default socket;
