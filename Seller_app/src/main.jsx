import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketProvider.jsx";
import { Provider } from "react-redux";
import { store } from "./store";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <SocketProvider>
      <CartProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </CartProvider>
    </SocketProvider>
  </AuthProvider>,
);
