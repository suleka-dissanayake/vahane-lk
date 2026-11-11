import React, { createContext, useContext, useEffect, useState } from 'react';
import { initData, getSessionUser, loginUser, registerUser, clearSession, updateUser } from '../utils/storage';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initData();
      setUser(await getSessionUser());
      setReady(true);
    })();
  }, []);

  const login = async (username, password) => {
    const res = await loginUser(username, password);
    if (res.ok) setUser(res.user);
    return res;
  };
  const register = async (data) => {
    const res = await registerUser(data);
    if (res.ok) setUser(res.user);
    return res;
  };
  const logout = async () => {
    await clearSession();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updated = await updateUser(user.id, data);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
