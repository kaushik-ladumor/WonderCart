import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import {CartProvider} from "./context/CartContext";
import { SocketProvider } from "./context/SocketProvider.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <SocketProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </SocketProvider>
  </AuthProvider>,
);
