"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Save,
  Download,
  Upload,
  Database,
  Bell,
  Shield,
  Globe,
  Palette,
  Mail,
  CheckCircle,
  AlertTriangle,
  HardDrive,
} from "lucide-react"

export default function ParametresPage() {
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // États pour les différents paramètres
  const [generalSettings, setGeneralSettings] = useState({
    company_name: "LOGI-ONE",
    company_address: "Zone Industrielle, Ouagadougou",
    company_phone: "+226 25 30 60 70",
    company_email: "contact@logi-one.bf",
    default_currency: "EUR",
    default_language: "fr",
    timezone: "Africa/Ouagadougou",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    stock_alerts: true,
    payment_alerts: true,
    transport_alerts: true,
    low_stock_threshold: 50,
    payment_delay_threshold: 7,
  })

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_auth: false,
    session_timeout: 60,
    password_expiry: 90,
    login_attempts: 5,
    audit_logs: true,
  })

  const [backupSettings, setBackupSettings] = useState({
    auto_backup: true,
    backup_frequency: "daily",
    backup_retention: 30,
    backup_location: "cloud",
    last_backup: "2025-01-26T02:00:00Z",
  })

  const handleSaveGeneral = async () => {
    setLoading(true)
    setError("")
    try {
      // Simulation de sauvegarde
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess("Paramètres généraux sauvegardés avec succès")
    } catch (err) {
      setError("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    setError("")
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess("Paramètres de notification sauvegardés avec succès")
    } catch (err) {
      setError("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSecurity = async () => {
    setLoading(true)
    setError("")
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess("Paramètres de sécurité sauvegardés avec succès")
    } catch (err) {
      setError("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const handleBackupNow = async () => {
    setLoading(true)
    setError("")
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setBackupSettings((prev) => ({
        ...prev,
        last_backup: new Date().toISOString(),
      }))
      setSuccess("Sauvegarde effectuée avec succès")
    } catch (err) {
      setError("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSuccess("Export des données initié. Vous recevrez un email avec le lien de téléchargement.")
    } catch (err) {
      setError("Erreur lors de l'export")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-[#0F4C75]" />
            Paramètres
          </h1>
          <p className="text-gray-600">Configuration et administration du système</p>
        </div>
      </div>

      {/* Messages de succès/erreur */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Onglets de paramètres */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sauvegarde
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Système
          </TabsTrigger>
        </TabsList>

        {/* Paramètres généraux */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#0F4C75]" />
                Paramètres généraux
              </CardTitle>
              <CardDescription>Configuration de base de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nom de l'entreprise</Label>
                  <Input
                    id="company_name"
                    value={generalSettings.company_name}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, company_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_email">Email de l'entreprise</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={generalSettings.company_email}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, company_email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Téléphone</Label>
                  <Input
                    id="company_phone"
                    value={generalSettings.company_phone}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, company_phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_currency">Devise par défaut</Label>
                  <Select
                    value={generalSettings.default_currency}
                    onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, default_currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar US (USD)</SelectItem>
                      <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_language">Langue par défaut</Label>
                  <Select
                    value={generalSettings.default_language}
                    onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, default_language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Ouagadougou">Ouagadougou (GMT+0)</SelectItem>
                      <SelectItem value="Africa/Abidjan">Abidjan (GMT+0)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_address">Adresse de l'entreprise</Label>
                <Textarea
                  id="company_address"
                  value={generalSettings.company_address}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, company_address: e.target.value }))}
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveGeneral} disabled={loading} className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#0F4C75]" />
                Paramètres de notifications
              </CardTitle>
              <CardDescription>Configuration des alertes et notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications SMS</Label>
                    <p className="text-sm text-gray-500">Recevoir les notifications par SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.sms_notifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, sms_notifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertes de stock</Label>
                    <p className="text-sm text-gray-500">Alertes quand le stock est faible</p>
                  </div>
                  <Switch
                    checked={notificationSettings.stock_alerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, stock_alerts: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertes de paiement</Label>
                    <p className="text-sm text-gray-500">Alertes pour les retards de paiement</p>
                  </div>
                  <Switch
                    checked={notificationSettings.payment_alerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, payment_alerts: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertes de transport</Label>
                    <p className="text-sm text-gray-500">Alertes pour les retards de transport</p>
                  </div>
                  <Switch
                    checked={notificationSettings.transport_alerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, transport_alerts: checked }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Seuil d'alerte stock (tonnes)</Label>
                  <Input
                    id="low_stock_threshold"
                    type="number"
                    value={notificationSettings.low_stock_threshold}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        low_stock_threshold: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_delay_threshold">Seuil retard paiement (jours)</Label>
                  <Input
                    id="payment_delay_threshold"
                    type="number"
                    value={notificationSettings.payment_delay_threshold}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        payment_delay_threshold: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="bg-[#0F4C75] hover:bg-[#0F4C75]/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#0F4C75]" />
                Paramètres de sécurité
              </CardTitle>
              <CardDescription>Configuration de la sécurité et des accès</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification à deux facteurs</Label>
                    <p className="text-sm text-gray-500">Activer la 2FA pour plus de sécurité</p>
                  </div>
                  <Switch
                    checked={securitySettings.two_factor_auth}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({ ...prev, two_factor_auth: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Journaux d'audit</Label>
                    <p className="text-sm text-gray-500">Enregistrer toutes les actions utilisateurs</p>
                  </div>
                  <Switch
                    checked={securitySettings.audit_logs}
                    onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, audit_logs: checked }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Timeout session (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={securitySettings.session_timeout}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        session_timeout: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_expiry">Expiration mot de passe (jours)</Label>
                  <Input
                    id="password_expiry"
                    type="number"
                    value={securitySettings.password_expiry}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        password_expiry: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login_attempts">Tentatives de connexion max</Label>
                  <Input
                    id="login_attempts"
                    type="number"
                    value={securitySettings.login_attempts}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        login_attempts: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveSecurity} disabled={loading} className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de sauvegarde */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-[#0F4C75]" />
                Sauvegarde et restauration
              </CardTitle>
              <CardDescription>Gestion des sauvegardes de données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sauvegarde automatique</Label>
                  <p className="text-sm text-gray-500">Effectuer des sauvegardes automatiques</p>
                </div>
                <Switch
                  checked={backupSettings.auto_backup}
                  onCheckedChange={(checked) => setBackupSettings((prev) => ({ ...prev, auto_backup: checked }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backup_frequency">Fréquence</Label>
                  <Select
                    value={backupSettings.backup_frequency}
                    onValueChange={(value) => setBackupSettings((prev) => ({ ...prev, backup_frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup_retention">Rétention (jours)</Label>
                  <Input
                    id="backup_retention"
                    type="number"
                    value={backupSettings.backup_retention}
                    onChange={(e) =>
                      setBackupSettings((prev) => ({
                        ...prev,
                        backup_retention: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup_location">Emplacement</Label>
                  <Select
                    value={backupSettings.backup_location}
                    onValueChange={(value) => setBackupSettings((prev) => ({ ...prev, backup_location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cloud">Cloud</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="both">Cloud + Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Dernière sauvegarde</Label>
                  <Badge className="bg-green-500">
                    {new Date(backupSettings.last_backup).toLocaleDateString("fr-FR")} à{" "}
                    {new Date(backupSettings.last_backup).toLocaleTimeString("fr-FR")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">La dernière sauvegarde automatique a été effectuée avec succès.</p>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBackupNow} disabled={loading} className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                  <Database className="mr-2 h-4 w-4" />
                  {loading ? "Sauvegarde..." : "Sauvegarder maintenant"}
                </Button>
                <Button variant="outline" onClick={handleExportData} disabled={loading}>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter les données
                </Button>
                <Button variant="outline" disabled={loading}>
                  <Upload className="mr-2 h-4 w-4" />
                  Restaurer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Informations système */}
        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-[#0F4C75]" />
                  Informations système
                </CardTitle>
                <CardDescription>État et performances du système</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Version LOGI-ONE</span>
                  <Badge>v1.0.0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Base de données</span>
                  <Badge className="bg-green-500">PostgreSQL 15.2</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Serveur</span>
                  <Badge className="bg-blue-500">Next.js 15</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm">15 jours, 8h 32min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Utilisateurs connectés</span>
                  <span className="text-sm">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Dernière mise à jour</span>
                  <span className="text-sm">26/01/2025</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-[#0F4C75]" />
                  Personnalisation
                </CardTitle>
                <CardDescription>Thème et apparence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Thème</Label>
                  <Select defaultValue="light">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="auto">Automatique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Couleur principale</Label>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-[#0F4C75] rounded-full border-2 border-gray-300" />
                    <div className="w-8 h-8 bg-blue-500 rounded-full" />
                    <div className="w-8 h-8 bg-green-500 rounded-full" />
                    <div className="w-8 h-8 bg-purple-500 rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Logo personnalisé</Label>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Télécharger logo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#0F4C75]" />
                  Configuration email
                </CardTitle>
                <CardDescription>Paramètres SMTP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">Serveur SMTP</Label>
                  <Input id="smtp_host" placeholder="smtp.gmail.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">Port</Label>
                    <Input id="smtp_port" placeholder="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_security">Sécurité</Label>
                    <Select defaultValue="tls">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_username">Nom d'utilisateur</Label>
                  <Input id="smtp_username" placeholder="votre@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">Mot de passe</Label>
                  <Input id="smtp_password" type="password" placeholder="••••••••" />
                </div>
                <Button variant="outline" size="sm">
                  Tester la connexion
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions système</CardTitle>
                <CardDescription>Maintenance et diagnostic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Database className="mr-2 h-4 w-4" />
                  Optimiser la base de données
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <HardDrive className="mr-2 h-4 w-4" />
                  Nettoyer le cache
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger les logs
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Réinitialiser le système
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
