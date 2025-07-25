"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Package2, CheckCircle, AlertTriangle, Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function SetupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [checkingExisting, setCheckingExisting] = useState(true)

  const { createSuperAdmin, checkSuperAdminExists } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const exists = await checkSuperAdminExists()
        if (exists) {
          // Super admin already exists, redirect to login
          router.push("/login")
          return
        }
      } catch (error) {
        console.log("Error checking existing admin:", error)
        // Continue with setup even if check fails
      }
      setCheckingExisting(false)
    }
    checkAdmin()
  }, [checkSuperAdminExists, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      setLoading(false)
      return
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Le prénom et le nom sont obligatoires")
      setLoading(false)
      return
    }

    try {
      const result = await createSuperAdmin(formData)

      if (result.error) {
        console.log("Super admin creation error:", result.error)
        if (result.error.message.includes("User already registered")) {
          setError("Un compte avec cet email existe déjà")
        } else if (result.error.message.includes("base de données")) {
          setError("Erreur: Veuillez d'abord configurer la base de données")
        } else {
          setError(result.error.message || "Erreur lors de la création du compte")
        }
      } else {
        if (result.needsEmailConfirmation) {
          setNeedsEmailConfirmation(true)
        } else {
          setSuccess(true)
          setTimeout(() => {
            router.push("/login")
          }, 3000)
        }
      }
    } catch (err: any) {
      console.error("Setup error:", err)
      setError("Erreur inattendue lors de la création du compte")
    }

    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F4C75] to-[#3282B8]">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm opacity-80">Vérification...</p>
        </div>
      </div>
    )
  }

  if (needsEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F4C75] to-[#3282B8] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-blue-600 mb-2">Confirmez votre email</h2>
            <p className="text-gray-600 mb-4">
              Votre compte Super-Admin a été créé avec succès. Veuillez vérifier votre boîte email et cliquer sur le
              lien de confirmation.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {formData.email}
              </p>
            </div>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Vérifiez aussi votre dossier spam/courrier indésirable.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button onClick={() => router.push("/login")} className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                Aller à la page de connexion
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNeedsEmailConfirmation(false)
                  setSuccess(false)
                  setError("")
                }}
                className="w-full"
              >
                Créer un autre compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F4C75] to-[#3282B8] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-600 mb-2">Compte créé avec succès!</h2>
            <p className="text-gray-600 mb-4">Votre compte Super-Admin a été créé et est prêt à être utilisé.</p>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {formData.email}
              </p>
            </div>
            <p className="text-xs text-gray-500">Redirection automatique dans 3 secondes...</p>
            <Button onClick={() => router.push("/login")} className="mt-4 bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              Aller à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F4C75] to-[#3282B8] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#FF5722] p-3 rounded-full">
              <Package2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#0F4C75]">Configuration Initiale</CardTitle>
          <CardDescription>Créez votre compte Super-Administrateur</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Important:</strong> Ce compte aura tous les droits sur la plateforme. Vous devrez peut-être
              confirmer votre email selon la configuration Supabase.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Jean"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@entreprise.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe * (min. 8 caractères)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-[#FF5722] hover:bg-[#FF5722]/90" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer le compte Super-Admin"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/login")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Retour à la connexion
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
