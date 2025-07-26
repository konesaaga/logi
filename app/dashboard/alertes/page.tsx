"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bell,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  CreditCard,
  Package,
} from "lucide-react"

interface Alerte {
  id: string
  type: "retard_paiement" | "stock_faible" | "transport_retard" | "commande_urgente"
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  status: "active" | "resolved" | "dismissed"
  entity_id: string
  entity_name: string
  created_at: string
  resolved_at?: string
  resolved_by?: string
}

const typeLabels = {
  retard_paiement: "Retard de paiement",
  stock_faible: "Stock faible",
  transport_retard: "Transport en retard",
  commande_urgente: "Commande urgente",
}

const typeIcons = {
  retard_paiement: CreditCard,
  stock_faible: Package,
  transport_retard: Clock,
  commande_urgente: AlertTriangle,
}

const severityColors = {
  low: "#4CAF50",
  medium: "#FF9800",
  high: "#FF5722",
  critical: "#F44336",
}

const severityLabels = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  critical: "Critique",
}

const statusColors = {
  active: "#FF9800",
  resolved: "#4CAF50",
  dismissed: "#9E9E9E",
}

const statusLabels = {
  active: "Active",
  resolved: "Résolue",
  dismissed: "Ignorée",
}

export default function AlertesPage() {
  const [alertes, setAlertes] = useState<Alerte[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("active")
  const [success, setSuccess] = useState("")

  // Données de démonstration
  const demoAlertes: Alerte[] = [
    {
      id: "1",
      type: "retard_paiement",
      title: "Retard de paiement - SONABHY SA",
      description: "Facture #F-2025-001 en retard de 15 jours (échéance: 10/01/2025)",
      severity: "high",
      status: "active",
      entity_id: "1",
      entity_name: "SONABHY SA",
      created_at: "2025-01-25T08:00:00Z",
    },
    {
      id: "2",
      type: "stock_faible",
      title: "Stock faible - Blé dur",
      description: "Stock actuel: 25T, seuil d'alerte: 50T dans l'entrepôt A",
      severity: "medium",
      status: "active",
      entity_id: "1",
      entity_name: "Blé dur",
      created_at: "2025-01-26T06:30:00Z",
    },
    {
      id: "3",
      type: "transport_retard",
      title: "Transport en retard - Camion ABC-123",
      description: "Retard de 3h sur la livraison prévue à Bobo-Dioulasso",
      severity: "medium",
      status: "active",
      entity_id: "1",
      entity_name: "ABC-123",
      created_at: "2025-01-26T09:15:00Z",
    },
    {
      id: "4",
      type: "commande_urgente",
      title: "Commande urgente - CMD-2025-004",
      description: "Commande prioritaire à traiter avant 16h aujourd'hui",
      severity: "critical",
      status: "active",
      entity_id: "4",
      entity_name: "CMD-2025-004",
      created_at: "2025-01-26T10:00:00Z",
    },
    {
      id: "5",
      type: "retard_paiement",
      title: "Retard de paiement résolu - Commerce Général",
      description: "Paiement reçu pour la facture #F-2025-002",
      severity: "medium",
      status: "resolved",
      entity_id: "3",
      entity_name: "Commerce Général SARL",
      created_at: "2025-01-20T14:00:00Z",
      resolved_at: "2025-01-25T16:30:00Z",
      resolved_by: "Marie Ouédraogo",
    },
  ]

  useEffect(() => {
    setAlertes(demoAlertes)
    setLoading(false)
  }, [])

  // Filtrer les alertes
  const filteredAlertes = alertes.filter((alerte) => {
    const matchesSearch =
      alerte.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerte.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerte.entity_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || alerte.type === filterType
    const matchesSeverity = filterSeverity === "all" || alerte.severity === filterSeverity
    const matchesStatus = filterStatus === "all" || alerte.status === filterStatus
    return matchesSearch && matchesType && matchesSeverity && matchesStatus
  })

  // Calculer les statistiques
  const totalAlertes = alertes.length
  const alertesActives = alertes.filter((a) => a.status === "active").length
  const alertesCritiques = alertes.filter((a) => a.severity === "critical" && a.status === "active").length
  const alertesResolues = alertes.filter((a) => a.status === "resolved").length

  // Résoudre une alerte
  const handleResolve = async (id: string) => {
    try {
      setAlertes((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "resolved" as const,
                resolved_at: new Date().toISOString(),
                resolved_by: "Utilisateur actuel",
              }
            : a,
        ),
      )
      setSuccess("Alerte marquée comme résolue")
    } catch (err) {
      console.error("Error resolving alert:", err)
    }
  }

  // Ignorer une alerte
  const handleDismiss = async (id: string) => {
    try {
      setAlertes((prev) => prev.map((a) => (a.id === id ? { ...a, status: "dismissed" as const } : a)))
      setSuccess("Alerte ignorée")
    } catch (err) {
      console.error("Error dismissing alert:", err)
    }
  }

  // Obtenir l'icône du type
  const getTypeIcon = (type: string) => {
    const IconComponent = typeIcons[type as keyof typeof typeIcons] || AlertTriangle
    return IconComponent
  }

  // Calculer le temps écoulé
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Il y a moins d'1h"
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-8 w-8 text-[#0F4C75]" />
            Alertes
          </h1>
          <p className="text-gray-600">Suivi des alertes et notifications système</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilterStatus("active")}>
            Voir les alertes actives
          </Button>
          <Button variant="outline" onClick={() => setFilterStatus("all")}>
            Voir toutes les alertes
          </Button>
        </div>
      </div>

      {/* Messages de succès */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alertes</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlertes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alertesActives}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertesCritiques}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolues</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alertesResolues}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une alerte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="retard_paiement">Retard paiement</SelectItem>
                  <SelectItem value="stock_faible">Stock faible</SelectItem>
                  <SelectItem value="transport_retard">Transport retard</SelectItem>
                  <SelectItem value="commande_urgente">Commande urgente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sévérité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Faible</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actives</SelectItem>
                  <SelectItem value="resolved">Résolues</SelectItem>
                  <SelectItem value="dismissed">Ignorées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des alertes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des alertes</CardTitle>
          <CardDescription>{filteredAlertes.length} alerte(s) trouvée(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredAlertes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterType !== "all" || filterSeverity !== "all" || filterStatus !== "all"
                ? "Aucune alerte ne correspond aux critères de recherche"
                : "Aucune alerte"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlertes.map((alerte) => {
                const TypeIcon = getTypeIcon(alerte.type)
                return (
                  <div
                    key={alerte.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alerte.status === "active"
                        ? "bg-white border-l-orange-500"
                        : alerte.status === "resolved"
                          ? "bg-green-50 border-l-green-500"
                          : "bg-gray-50 border-l-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="p-2 rounded-full"
                          style={{
                            backgroundColor: `${severityColors[alerte.severity]}20`,
                            color: severityColors[alerte.severity],
                          }}
                        >
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{alerte.title}</h3>
                            <Badge
                              style={{
                                backgroundColor: severityColors[alerte.severity],
                                color: "white",
                              }}
                              className="text-xs"
                            >
                              {severityLabels[alerte.severity]}
                            </Badge>
                            <Badge
                              style={{
                                backgroundColor: statusColors[alerte.status],
                                color: "white",
                              }}
                              className="text-xs"
                            >
                              {statusLabels[alerte.status]}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{alerte.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{typeLabels[alerte.type]}</span>
                            <span>•</span>
                            <span>{alerte.entity_name}</span>
                            <span>•</span>
                            <span>{getTimeAgo(alerte.created_at)}</span>
                            {alerte.resolved_at && (
                              <>
                                <span>•</span>
                                <span>Résolue par {alerte.resolved_by}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {alerte.status === "active" && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolve(alerte.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Résoudre
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismiss(alerte.id)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Ignorer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
