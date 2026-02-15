"use client";

import { AuthProvider } from "@refinedev/core";
import { signIn, signOut, getSession } from "next-auth/react";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        return {
          success: true,
          redirectTo: "/admin/dashboard",
        };
      }

      return {
        success: false,
        error: {
          name: "LoginError",
          message: result?.error || "Invalid email or password",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "An error occurred during login",
        },
      };
    }
  },
  logout: async () => {
    await signOut({ redirect: false, callbackUrl: "/admin/login" });
    return {
      success: true,
      redirectTo: "/admin/login",
    };
  },
  check: async () => {
    const session = await getSession();

    if (session) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/admin/login",
    };
  },
  getPermissions: async () => {
    const session = await getSession();
    return (session?.user as any)?.role || null;
  },
  getIdentity: async () => {
    const session = await getSession();
    if (session?.user) {
      return {
        id: (session.user as any).id || 1,
        name: session.user.name,
        avatar: session.user.image,
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
