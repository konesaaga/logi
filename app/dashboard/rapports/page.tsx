"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, FileText, TrendingUp, Package, Calendar } from "lucide-react"
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
  ResponsiveContainer,
} from "recharts"
import type { DateRange } from "react-day-picker"

// Données pour les rapports
const ventesData = [
  { month: "Jan", ventes: 450000, commandes: 25, clients: 12 },
  { month: "Fév", ventes: 520000, commandes: 28, clients: 15 },
  { month: "Mar", ventes: 480000, commandes: 22, clients: 14 },
  { month: "Avr", ventes: 600000, commandes: 35, clients: 18 },
  { month: "Mai", ventes: 580000, commandes: 32, clients: 16 },
  { month: "Jun", ventes: 650000, commandes: 38, clients: 20 },
]

const marchandisesData = [
  { name: "Blé dur", value: 35, color: "#4CAF50" },
  { name: "Riz parfumé", value: 25, color: "#2196F3" },
  { name: "Huile de palme", value: 20, color: "#FF9800" },
  { name: "Maïs", value: 15, color: "#9C27B0" },
  { name: "Autres", value: 5, color: "#FF5722" },
]

const performanceData = [
  { metric: "Délai moyen livraison", value: "3.2 jours", trend: "+0.5", color: "text-red-600" },
  { metric: "Taux de satisfaction", value: "94%", trend: "+2%", color: "text-green-600" },
  { metric: "Commandes à temps", value: "87%", trend: "-3%", color: "text-red-600" },
  { metric: "Stock rotation", value: "12.5x", trend: "+1.2x", color: "text-green-600" },
]

export default function RapportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedReport, setSelectedReport] = useState("ventes")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    // Logique d'export
    console.log(`Exporting ${selectedReport} report as ${format}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-[#0F4C75]" />
            Rapports
          </h1>
          <p className="text-gray-600">Analyses et rapports de performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-4">
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger className="w-[200px]">
                  <FileText className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type de rapport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ventes">Rapport des ventes</SelectItem>
                  <SelectItem value="stocks">Rapport des stocks</SelectItem>
                  <SelectItem value="transport">Rapport transport</SelectItem>
                  <SelectItem value="clients">Rapport clients</SelectItem>
                  <SelectItem value="performance">Performance globale</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 derniers jours</SelectItem>
                  <SelectItem value="30days">30 derniers jours</SelectItem>
                  <SelectItem value="3months">3 derniers mois</SelectItem>
                  <SelectItem value="6months">6 derniers mois</SelectItem>
                  <SelectItem value="1year">1 an</SelectItem>
                  <SelectItem value="custom">Période personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedPeriod === "custom" && <DatePickerWithRange date={dateRange} setDate={setDateRange} />}
          </div>
        </CardContent>
      </Card>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {performanceData.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className={`text-sm ${metric.color}`}>{metric.trend} vs période précédente</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des ventes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#0F4C75]" />
              Évolution des ventes
            </CardTitle>
            <CardDescription>Chiffre d'affaires sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ventesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`€${Number(value).toLocaleString()}`, "Ventes"]} />
                <Area type="monotone" dataKey="ventes" stroke="#0F4C75" fill="#0F4C75" fillOpacity={0.3} />
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

      {/* Graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nombre de commandes */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des commandes</CardTitle>
            <CardDescription>Nombre de commandes par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="commandes" fill="#3282B8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Nouveaux clients */}
        <Card>
          <CardHeader>
            <CardTitle>Nouveaux clients</CardTitle>
            <CardDescription>Acquisition de nouveaux clients</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="#FF5722"
                  strokeWidth={3}
                  dot={{ fill: "#FF5722", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau de synthèse */}
      <Card>
        <CardHeader>
          <CardTitle>Synthèse mensuelle</CardTitle>
          <CardDescription>Résumé des performances par mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Mois</th>
                  <th className="text-right p-2">Ventes (€)</th>
                  <th className="text-right p-2">Commandes</th>
                  <th className="text-right p-2">Nouveaux clients</th>
                  <th className="text-right p-2">Évolution</th>
                </tr>
              </thead>
              <tbody>
                {ventesData.map((data, index) => {
                  const prevMonth = index > 0 ? ventesData[index - 1] : null
                  const evolution = prevMonth ? ((data.ventes - prevMonth.ventes) / prevMonth.ventes) * 100 : 0
                  return (
                    <tr key={data.month} className="border-b">
                      <td className="p-2 font-medium">{data.month}</td>
                      <td className="text-right p-2">€{data.ventes.toLocaleString()}</td>
                      <td className="text-right p-2">{data.commandes}</td>
                      <td className="text-right p-2">{data.clients}</td>
                      <td className="text-right p-2">
                        <Badge
                          variant={evolution >= 0 ? "default" : "destructive"}
                          className={evolution >= 0 ? "bg-green-500" : ""}
                        >
                          {evolution >= 0 ? "+" : ""}
                          {evolution.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
