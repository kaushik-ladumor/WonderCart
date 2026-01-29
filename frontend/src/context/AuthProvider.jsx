import { createContext, useContext, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const storedUser = localStorage.getItem("Users");

  const [authUser, setAuthUser] = useState( 
    storedUser ? JSON.parse(storedUser) : null
  );

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        isLoggedIn: !!authUser,
        role: authUser?.role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
