"use client";

import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

export interface SignInPayload {
   email: string;
   password: string;
}

export interface SignUpPayload {
   email: string;
   password: string;
}

export interface SignUpResult {
   message: string;
}

export interface Profile {
   name: string | null;
   email: string | null;
   role: "customer" | "admin";
}

interface AuthContextValue {
   user: User | null;
   profile: Profile | null;
   isAdmin: boolean;
   isLoading: boolean;
   isAuthenticated: boolean;
   signIn: (payload: SignInPayload) => Promise<User>;
   signUp: (payload: SignUpPayload) => Promise<SignUpResult>;
   logout: () => Promise<void>;
   refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [supabase] = useState(() => createClient());
   const [user, setUser] = useState<User | null>(null);
   const [profile, setProfile] = useState<Profile | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   const loadProfile = useCallback(
      async (userId: string) => {
         const { data } = await supabase
            .from("profiles")
            .select("name, email, role")
            .eq("id", userId)
            .maybeSingle();
         setProfile(data as Profile | null);
      },
      [supabase],
   );

   const refreshUser = useCallback(async () => {
      setIsLoading(true);

      try {
         const { data } = await supabase.auth.getUser();
         setUser(data.user);
         if (data.user) {
            await loadProfile(data.user.id);
         } else {
            setProfile(null);
         }
      } finally {
         setIsLoading(false);
      }
   }, [supabase, loadProfile]);

   useEffect(() => {
      void refreshUser();

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
         setUser(session?.user ?? null);
         if (session?.user) {
            void loadProfile(session.user.id);
         } else {
            setProfile(null);
         }
         setIsLoading(false);
      });

      return () => {
         listener.subscription.unsubscribe();
      };
   }, [refreshUser, supabase, loadProfile]);

   const signIn = useCallback(
      async ({ email, password }: SignInPayload) => {
         const { data, error } = await supabase.auth.signInWithPassword({ email, password });

         if (error) {
            throw error;
         }

         setUser(data.user);
         return data.user;
      },
      [supabase],
   );

   const signUp = useCallback(
      async ({ email, password }: SignUpPayload) => {
         const { error } = await supabase.auth.signUp({ email, password });

         if (error) {
            throw error;
         }

         return {
            message: "Registration successful, please check your email for verification.",
         };
      },
      [supabase],
   );

   const logout = useCallback(async () => {
      try {
         await supabase.auth.signOut();
      } finally {
         setUser(null);
         setProfile(null);
      }
   }, [supabase]);

   const value = useMemo<AuthContextValue>(
      () => ({
         user,
         profile,
         isAdmin: profile?.role === "admin",
         isLoading,
         isAuthenticated: user !== null,
         signIn,
         signUp,
         logout,
         refreshUser,
      }),
      [user, profile, isLoading, signIn, signUp, logout, refreshUser],
   );

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
   const context = useContext(AuthContext);

   if (!context) {
      throw new Error("useAuthContext must be used within an AuthProvider");
   }

   return context;
}
