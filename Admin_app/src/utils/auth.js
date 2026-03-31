// Utility function to handle token expiration and logout
export const handleTokenExpiration = (navigate, setAuthUser) => {
  // Clear all auth data
  localStorage.removeItem("token");
  localStorage.removeItem("Users");
  localStorage.removeItem("authToken");
  
  // Clear auth context
  if (setAuthUser) {
    setAuthUser(null);
  }
  
  // Redirect to home
  if (navigate) {
    navigate("/");
  } else {
    window.location.href = "/";
  }
};

// Check if error is due to token expiration
export const isTokenExpired = (error) => {
  if (!error) return false;
  
  // Check for 401 status
  if (error.response?.status === 401) {
    return true;
  }
  
  // Check for token-related error messages
  const message = error.response?.data?.message || error.message || "";
  const tokenMessages = [
    "token is not valid",
    "token expired",
    "no token",
    "authorization denied",
    "unauthorized"
  ];
  
  return tokenMessages.some(msg => 
    message.toLowerCase().includes(msg.toLowerCase())
  );
};
