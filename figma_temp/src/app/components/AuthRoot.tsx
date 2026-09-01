import { Outlet } from "react-router";
import { AuthProvider } from "../context/AuthContext";

export function AuthRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
