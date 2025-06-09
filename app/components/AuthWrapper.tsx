"use client";

import React from "react";
import { useAuth } from "../firebase/context/auth";
import LoadingSpinner from "./LoadingSpinner";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isLoading } = useAuth();

  return (
    <>
      {children}
      {isLoading && <LoadingSpinner />}
    </>
  );
};

export default AuthWrapper;