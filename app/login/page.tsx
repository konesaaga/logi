"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Package2, Info } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { DatabaseSetup } from "@/components/database-setup"
import { DatabaseHealthCheck } from "@/components/database-health-check"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuperAdminSetup, setShowSuperAdminSetup] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false)
  const [databaseHealthy, setDatabaseHealthy] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")

  const { signIn, checkSuperAdminExists, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleDatabaseHealthCheck = (isHealthy: boolean, needsSetup: boolean) => {
    setDatabaseHealthy(isHealthy)

    if (needsSetup) {
      setDebugInfo("Base de données non configurée - tables manquantes")
      setShowDatabaseSetup(true)
      setCheckingAdmin(false)
    } else if (isHealthy) {
      setDebugInfo("Base de données OK - vérification du Super-Admin...")
      // Database is healthy, now check for super admin
      checkForSuperAdmin()
    } else {
      // Database connection issues
      setDebugInfo("Problème de connexion à la base de données")
      setError("Problème de connexion à la base de données")
      setCheckingAdmin(false)
    }
  }

  const checkForSuperAdmin = async () => {
    try {
      const exists = await checkSuperAdminExists()
      if (exists) {
        setDebugInfo("Super-Admin existe - connexion disponible")
        setShowSuperAdminSetup(false)
      } else {
        setDebugInfo("Aucun Super-Admin trouvé - création requise")
        setShowSuperAdminSetup(true)
      }
      setCheckingAdmin(false)
    } catch (error: any) {
      console.log("Error checking super admin:", error)
      if (error.message === "TABLES_NOT_EXIST") {
        setDebugInfo("Tables manquantes - configuration requise")
        setShowDatabaseSetup(true)
      } else {
        setDebugInfo(`Erreur: ${error.message}`)
        setError("Erreur lors de la vérification du super administrateur")
      }
      setCheckingAdmin(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await signIn(email, password)

    if (error) {
      console.log("Login error:", error)
      if (error.message.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect")
      } else if (error.message.includes("Email not confirmed")) {
        setError("Veuillez confirmer votre email avant de vous connecter")
      } else {
        setError(`Erreur de connexion: ${error.message}`)
      }
    } else {
      router.push("/dashboard")
    }

    setLoading(false)
  }

  if (showDatabaseSetup) {
    return <DatabaseSetup />
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F4C75] to-[#3282B8]">
        <DatabaseHealthCheck onHealthCheck={handleDatabaseHealthCheck} />
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm opacity-80">Vérification de la configuration...</p>
          {debugInfo && <p className="text-xs opacity-60 mt-2">{debugInfo}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F4C75] to-[#3282B8] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#0F4C75] p-3 rounded-full">
              <Package2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#0F4C75]">LOGI-ONE</CardTitle>
          <CardDescription>Plateforme de gestion logistique</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Debug info for development */}
          {debugInfo && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">{debugInfo}</AlertDescription>
            </Alert>
          )}

          {showSuperAdminSetup && (
            <Alert className="mb-4 border-[#FF5722] bg-orange-50">
              <Info className="h-4 w-4 text-[#FF5722]" />
              <AlertDescription className="text-[#FF5722]">
                <strong>Première utilisation:</strong> Aucun compte administrateur n'existe. Vous devez créer le compte
                Super-Admin pour commencer.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                disabled={showSuperAdminSetup}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={showSuperAdminSetup}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!showSuperAdminSetup && (
              <Button type="submit" className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            )}

            {showSuperAdminSetup && (
              <Button
                type="button"
                className="w-full bg-[#FF5722] hover:bg-[#FF5722]/90 text-white"
                onClick={() => router.push("/setup")}
              >
                Créer mon compte Super-Admin
              </Button>
            )}
          </form>

          {!showSuperAdminSetup && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Première utilisation ?
                <button
                  type="button"
                  className="text-[#FF5722] hover:underline ml-1"
                  onClick={() => router.push("/setup")}
                >
                  Créer un compte Super-Admin
                </button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
