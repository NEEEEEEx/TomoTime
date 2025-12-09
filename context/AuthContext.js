// context/AuthContext.js
import React, { createContext, useState } from 'react';

// 1. Create the Context
export const AuthContext = createContext();

// 2. Create the Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // This is the global variable

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};