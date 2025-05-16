import React from "react";
import { UseAuth } from "../hooks/UseAuth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({children, roles}) => {
    const { isUser } = UseAuth();

    if(!isUser) return <Navigate to="/" replace />

    if(!roles || roles.length === 0) return children;

    const hasRequireRole = isUser.roles.some(role => roles.includes(role));
    if(!hasRequireRole) return <Navigate to="/" replace />

  return children;
}
export default ProtectedRoute