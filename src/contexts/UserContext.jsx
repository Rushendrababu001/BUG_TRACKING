import React, { createContext, useState, useCallback, useContext, useEffect } from "react";
import { subscribeToUserProfile } from "../services/userService";

export const UserContext = createContext();

export const UserProvider = ({ children, userId }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserProfile(userId, (profile) => {
      setUserProfile(profile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const updateProfile = useCallback((updates) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const value = {
    userProfile,
    loading,
    error,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within UserProvider");
  }
  return context;
};
