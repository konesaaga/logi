"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Package,
  Users,
  ShoppingCart,
  Building,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

// Données pour les graphiques
const monthlyData = [
  { name: "Jan", commandes: 65, ventes: 28 },
  { name: "Fév", commandes: 59, ventes: 48 },
  { name: "Mar", commandes: 80, ventes: 40 },
  { name: "Avr", commandes: 81, ventes: 19 },
  { name: "Mai", commandes: 56, ventes: 96 },
  { name: "Jun", commandes: 55, ventes: 27 },
]

const stockData = [
  { name: "Blé dur", value: 400, color: "#0F4C75" },
  { name: "Riz", value: 300, color: "#3B82F6" },
  { name: "Maïs", value: 200, color: "#10B981" },
  { name: "Sorgho", value: 100, color: "#F59E0B" },
]

const recentActivities = [
  {
    id: 1,
    type: "commande",
    title: "Nouvelle commande CMD-2025-005",
    description: "Commande de 50T de blé dur par SONABHY SA",
    time: "Il y a 5 minutes",
    icon: ShoppingCart,
    color: "text-blue-600",
  },
  {
    id: 2,
    type: "transport",
    title: "Transport TR-2025-003 terminé",
    description: "Livraison réussie à Bobo-Dioulasso",
    time: "Il y a 15 minutes",
    icon: Truck,
    color: "text-green-600",
  },
  {
    id: 3,
    type: "alerte",
    title: "Stock faible détecté",
    description: "Riz - Stock actuel: 25T (seuil: 50T)",
    time: "Il y a 30 minutes",
    icon: AlertTriangle,
    color: "text-yellow-600",
  },
  {
    id: 4,
    type: "validation",
    title: "Déchargement validé",
    description: "Port de Lomé - 100T de blé dur",
    time: "Il y a 1 heure",
    icon: CheckCircle,
    color: "text-green-600",
  },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCommandes: 0,
    totalVentes: 0,
    totalClients: 0,
    totalStock: 0,
    commandesEnCours: 0,
    transportActifs: 0,
    alertesActives: 0,
    chiffreAffaires: 0,
  })

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setStats({
        totalCommandes: 156,
        totalVentes: 89,
        totalClients: 45,
        totalStock: 1250,
        commandesEnCours: 12,
        transportActifs: 8,
        alertesActives: 3,
        chiffreAffaires: 2450000,
      })
      setLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité logistique</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCommandes}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+12% ce mois</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.chiffreAffaires)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+8% ce mois</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStock}T</p>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 ml-1">-3% ce mois</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients Actifs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+5% ce mois</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicateurs d'activité */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes en cours</p>
                <p className="text-2xl font-bold text-blue-600">{stats.commandesEnCours}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transports actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.transportActifs}</p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertes actives</p>
                <p className="text-2xl font-bold text-red-600">{stats.alertesActives}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entrepôts</p>
                <p className="text-2xl font-bold text-purple-600">5</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
            <CardDescription>Commandes et ventes par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="commandes" fill="#0F4C75" name="Commandes" />
                <Bar dataKey="ventes" fill="#3B82F6" name="Ventes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition du stock</CardTitle>
            <CardDescription>Stock par type de marchandise</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}T`}
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activité récente</span>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full bg-white`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
