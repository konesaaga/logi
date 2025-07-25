"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Truck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité logistique</p>
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

      {/* Recent Activities */}
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
            <CardTitle>Statut des transports</CardTitle>
            <CardDescription>Suivi en temps réel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">En route</span>
                </div>
                <Badge className="bg-green-500">8 camions</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium">À la frontière</span>
                </div>
                <Badge className="bg-orange-500">3 camions</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Chargement port</span>
                </div>
                <Badge className="bg-blue-500">1 camion</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
