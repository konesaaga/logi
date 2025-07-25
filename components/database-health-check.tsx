"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface DatabaseHealthCheckProps {
  onHealthCheck: (isHealthy: boolean, needsSetup: boolean) => void
}

export function DatabaseHealthCheck({ onHealthCheck }: DatabaseHealthCheckProps) {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkDatabaseHealth = async () => {
      try {
        // Try to query the roles table first
        const { data, error } = await supabase.from("roles").select("id").limit(1)

        if (error) {
          // Check for table not exists errors
          if (
            error.code === "PGRST116" ||
            error.message.includes("does not exist") ||
            error.message.includes("relation") ||
            error.code === "42P01"
          ) {
            console.log("Database needs setup - tables don't exist")
            onHealthCheck(false, true)
          } else {
            console.log("Database connection error:", error)
            onHealthCheck(false, false)
          }
        } else {
          console.log("Database is healthy")
          onHealthCheck(true, false)
        }
      } catch (error) {
        console.error("Database health check failed:", error)
        onHealthCheck(false, true)
      } finally {
        setChecking(false)
      }
    }

    checkDatabaseHealth()
  }, [onHealthCheck])

  return null // This component doesn't render anything
}
