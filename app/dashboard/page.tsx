"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Truck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Warehouse,
  BarChart3,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const stats = [
  {
    title: "Commandes en cours",
    value: "24",
    change: "+12%",
    changeType: "positive" as const,
    icon: ShoppingCart,
    color: "bg-blue-500",
  },
  {
    title: "Marchandises",
    value: "156",
    change: "+3%",
    changeType: "positive" as const,
    icon: Package,
    color: "bg-green-500",
  },
  {
    title: "Chiffre d'affaires",
    value: "€2.4M",
    change: "+8%",
    changeType: "positive" as const,
    icon: TrendingUp,
    color: "bg-[#0F4C75]",
  },
  {
    title: "Clients actifs",
    value: "89",
    change: "-2%",
    changeType: "negative" as const,
    icon: Users,
    color: "bg-purple-500",
  },
  {
    title: "Transports en cours",
    value: "12",
    change: "+5%",
    changeType: "positive" as const,
    icon: Truck,
    color: "bg-orange-500",
  },
  {
    title: "Alertes",
    value: "3",
    change: "-1",
    changeType: "positive" as const,
    icon: AlertTriangle,
    color: "bg-[#FF5722]",
  },
]

// Données pour les graphiques des stocks d'entrepôts
const stockData = [
  { month: "Jan", entrepotA: 450, entrepotB: 320, entrepotC: 280 },
  { month: "Fév", entrepotA: 520, entrepotB: 380, entrepotC: 310 },
  { month: "Mar", entrepotA: 480, entrepotB: 420, entrepotC: 350 },
  { month: "Avr", entrepotA: 600, entrepotB: 450, entrepotC: 380 },
  { month: "Mai", entrepotA: 580, entrepotB: 480, entrepotC: 420 },
  { month: "Jun", entrepotA: 650, entrepotB: 520, entrepotC: 450 },
]

// Données pour les marchandises stockées (camembert)
const marchandisesData = [
  { name: "Céréales", value: 35, color: "#4CAF50" },
  { name: "Produits chimiques", value: 25, color: "#9C27B0" },
  { name: "Textiles", value: 20, color: "#FF5722" },
  { name: "Métaux", value: 15, color: "#2196F3" },
  { name: "Autres", value: 5, color: "#FF9800" },
]

// Données pour l'évolution des stocks par catégorie
const stockEvolutionData = [
  { date: "01/01", perissable: 120, dangereux: 80, standard: 200 },
  { date: "15/01", perissable: 110, dangereux: 85, standard: 220 },
  { date: "01/02", perissable: 130, dangereux: 75, standard: 240 },
  { date: "15/02", perissable: 125, dangereux: 90, standard: 260 },
  { date: "01/03", perissable: 140, dangereux: 95, standard: 280 },
  { date: "15/03", perissable: 135, dangereux: 88, standard: 300 },
]

// Données pour les mouvements de stock quotidiens
const mouvementsData = [
  { jour: "Lun", entrees: 45, sorties: 38 },
  { jour: "Mar", entrees: 52, sorties: 42 },
  { jour: "Mer", entrees: 38, sorties: 35 },
  { jour: "Jeu", entrees: 48, sorties: 45 },
  { jour: "Ven", entrees: 55, sorties: 50 },
  { jour: "Sam", entrees: 32, sorties: 28 },
  { jour: "Dim", entrees: 25, sorties: 20 },
]

const recentActivities = [
  {
    id: 1,
    type: "Commande",
    description: "Nouvelle commande #CMD-2025-001 créée",
    time: "Il y a 2 minutes",
    status: "success",
  },
  {
    id: 2,
    type: "Transport",
    description: "Camion ABC-123 arrivé à destination",
    time: "Il y a 15 minutes",
    status: "success",
  },
  {
    id: 3,
    type: "Alerte",
    description: "Retard de paiement - Client XYZ",
    time: "Il y a 1 heure",
    status: "warning",
  },
  {
    id: 4,
    type: "Vente",
    description: "Vente #V-2025-045 validée",
    time: "Il y a 2 heures",
    status: "success",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Vue d'ensemble de votre activité logistique</p>
        </div>
        <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
          <BarChart3 className="mr-2 h-4 w-4" />
          Rapport complet
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center text-sm">
                {stat.changeType === "positive" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques des stocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des stocks par entrepôt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-[#0F4C75]" />
              Évolution des stocks par entrepôt
            </CardTitle>
            <CardDescription>Stocks en tonnes sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="entrepotA"
                  stackId="1"
                  stroke="#0F4C75"
                  fill="#0F4C75"
                  name="Entrepôt A"
                />
                <Area
                  type="monotone"
                  dataKey="entrepotB"
                  stackId="1"
                  stroke="#3282B8"
                  fill="#3282B8"
                  name="Entrepôt B"
                />
                <Area
                  type="monotone"
                  dataKey="entrepotC"
                  stackId="1"
                  stroke="#FF5722"
                  fill="#FF5722"
                  name="Entrepôt C"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des marchandises */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#0F4C75]" />
              Répartition des marchandises
            </CardTitle>
            <CardDescription>Pourcentage par type de marchandise</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marchandisesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {marchandisesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Stocks par catégorie</CardTitle>
            <CardDescription>Évolution des stocks selon la catégorie de marchandise</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="perissable"
                  stroke="#FF5252"
                  strokeWidth={2}
                  name="Périssable"
                  dot={{ fill: "#FF5252" }}
                />
                <Line
                  type="monotone"
                  dataKey="dangereux"
                  stroke="#9C27B0"
                  strokeWidth={2}
                  name="Dangereux"
                  dot={{ fill: "#9C27B0" }}
                />
                <Line
                  type="monotone"
                  dataKey="standard"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  name="Standard"
                  dot={{ fill: "#4CAF50" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mouvements quotidiens */}
        <Card>
          <CardHeader>
            <CardTitle>Mouvements de stock</CardTitle>
            <CardDescription>Entrées et sorties quotidiennes (cette semaine)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mouvementsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entrees" fill="#4CAF50" name="Entrées" />
                <Bar dataKey="sorties" fill="#FF5722" name="Sorties" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section activités et statuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "warning"
                          ? "bg-orange-500"
                          : "bg-red-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-900 mt-1">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut des entrepôts</CardTitle>
            <CardDescription>Capacité et utilisation en temps réel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <span className="text-sm font-medium">Entrepôt A - Ouagadougou</span>
                    <p className="text-xs text-gray-500">Capacité: 85% utilisée</p>
                  </div>
                </div>
                <Badge className="bg-green-500">650T</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <span className="text-sm font-medium">Entrepôt B - Bobo-Dioulasso</span>
                    <p className="text-xs text-gray-500">Capacité: 65% utilisée</p>
                  </div>
                </div>
                <Badge className="bg-blue-500">520T</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <span className="text-sm font-medium">Entrepôt C - Koudougou</span>
                    <p className="text-xs text-gray-500">Capacité: 90% utilisée</p>
                  </div>
                </div>
                <Badge className="bg-orange-500">450T</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
