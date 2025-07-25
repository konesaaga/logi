"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthUser extends User {
  user_metadata?: {
    first_name?: string
    last_name?: string
    role_id?: string
    is_super_admin?: boolean
  }
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  checkSuperAdminExists: () => Promise<boolean>
  createSuperAdmin: (userData: any) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser((session?.user as AuthUser) || null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser((session?.user as AuthUser) || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const checkSuperAdminExists = async (): Promise<boolean> => {
    try {
      // First check if we can connect to the database and if tables exist
      const { data, error } = await supabase.from("users").select("id").eq("is_super_admin", true).limit(1)

      if (error) {
        // Check for specific error codes that indicate tables don't exist
        if (
          error.code === "PGRST116" ||
          error.message.includes("does not exist") ||
          error.message.includes("relation") ||
          error.code === "42P01"
        ) {
          // Tables don't exist, throw a specific error to trigger database setup
          throw new Error("TABLES_NOT_EXIST")
        }
        console.error("Error checking super admin:", error)
        return false
      }

      return data && data.length > 0
    } catch (error: any) {
      if (error.message === "TABLES_NOT_EXIST") {
        throw error // Re-throw to be caught by the calling function
      }
      console.error("Error checking super admin:", error)
      return false
    }
  }

  const createSuperAdmin = async (userData: any) => {
    try {
      // Create the auth user with email confirmation disabled for Super Admin
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            is_super_admin: true,
          },
          // Skip email confirmation for Super Admin setup
          emailRedirectTo: undefined,
        },
      })

      if (authError) {
        console.error("Auth signup error:", authError)
        return { error: authError }
      }

      // If user creation was successful but email confirmation is required
      if (authData.user && !authData.session) {
        console.log("User created but needs email confirmation")

        // For Super Admin, we'll create the user record anyway and provide instructions
        // Get the Super Admin role ID
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("id")
          .eq("name", "Super Admin")
          .single()

        if (roleError) {
          return {
            error: {
              message:
                "Erreur: Les tables de base de données n'existent pas. Veuillez exécuter les scripts SQL d'abord.",
            },
          }
        }

        // Create the user record in our users table
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          role_id: roleData.id,
          is_super_admin: true,
          is_active: true,
          password_hash: "handled_by_supabase_auth",
        })

        if (userError) {
          console.error("User record creation error:", userError)
          return { error: userError }
        }

        // Return success with email confirmation message
        return {
          error: null,
          needsEmailConfirmation: true,
          message: "Compte créé avec succès. Vérifiez votre email pour confirmer votre compte.",
        }
      }

      // If we have a session, the user is automatically confirmed
      if (authData.session) {
        // Get the Super Admin role ID
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("id")
          .eq("name", "Super Admin")
          .single()

        if (roleError) {
          return {
            error: {
              message:
                "Erreur: Les tables de base de données n'existent pas. Veuillez exécuter les scripts SQL d'abord.",
            },
          }
        }

        // Create the user record in our users table
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          role_id: roleData.id,
          is_super_admin: true,
          is_active: true,
          password_hash: "handled_by_supabase_auth",
        })

        return { error: userError }
      }

      return { error: null }
    } catch (error) {
      console.error("Super admin creation error:", error)
      return { error: { message: "Erreur lors de la création du compte" } }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    checkSuperAdminExists,
    createSuperAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
