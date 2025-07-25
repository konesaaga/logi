"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExternalLink, Settings } from "lucide-react"

export function SupabaseConfigGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#0F4C75]" />
          <CardTitle className="text-[#0F4C75]">Configuration Supabase</CardTitle>
        </div>
        <CardDescription>Pour éviter la confirmation d'email lors de la création du Super-Admin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Option 1 (Recommandée):</strong> Désactiver temporairement la confirmation d'email
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold">Étapes dans Supabase Dashboard:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Allez dans votre projet Supabase</li>
            <li>Cliquez sur "Authentication" dans le menu de gauche</li>
            <li>Allez dans l'onglet "Settings"</li>
            <li>Trouvez "Email confirmation" et désactivez-le temporairement</li>
            <li>Sauvegardez les modifications</li>
            <li>Créez votre compte Super-Admin</li>
            <li>Réactivez la confirmation d'email après la création</li>
          </ol>
        </div>

        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            <strong>Option 2:</strong> Si vous préférez garder la confirmation d'email activée, vous devrez vérifier
            votre email après la création du compte.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir Supabase Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
