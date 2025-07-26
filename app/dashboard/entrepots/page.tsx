"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Warehouse,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface Entrepot {
  id: string
  name: string
  location: string
  max_capacity_t: number
  current_stock: number
  responsable_id?: string
  created_at: string
}

// Données de démonstration pour les stocks
const stockData = [
  { entrepot_id: "1", total_stock: 650 },
  { entrepot_id: "2", total_stock: 520 },
  { entrepot_id: "3", total_stock: 450 },
]

export default function EntrepotsPage() {
  const [entrepots, setEntrepots] = useState<Entrepot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntrepot, setEditingEntrepot] = useState<Entrepot | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    max_capacity_t: 1000,
  })

  // Données de démonstration
  const demoEntrepots: Entrepot[] = [
    {
      id: "1",
      name: "Entrepôt Central Ouagadougou",
      location: "Zone Industrielle, Ouagadougou",
      max_capacity_t: 800,
      current_stock: 650,
      created_at: "2025-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "Entrepôt Bobo-Dioulasso",
      location: "Secteur 25, Bobo-Dioulasso",
      max_capacity_t: 600,
      current_stock: 520,
      created_at: "2025-01-02T00:00:00Z",
    },
    {
      id: "3",
      name: "Entrepôt Koudougou",
      location: "Route de Ouagadougou, Koudougou",
      max_capacity_t: 500,
      current_stock: 450,
      created_at: "2025-01-03T00:00:00Z",
    },
  ]

  useEffect(() => {
    // Utiliser les données de démonstration
    setEntrepots(demoEntrepots)
    setLoading(false)
  }, [])

  // Filtrer les entrepôts
  const filteredEntrepots = entrepots.filter(
    (entrepot) =>
      entrepot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrepot.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculer le pourcentage d'utilisation
  const getUsagePercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100)
  }

  // Obtenir la couleur selon le taux d'utilisation
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-orange-600"
    return "text-green-600"
  }

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const newEntrepot: Entrepot = {
        id: Date.now().toString(),
        name: formData.name,
        location: formData.location,
        max_capacity_t: formData.max_capacity_t,
        current_stock: 0,
        created_at: new Date().toISOString(),
      }

      if (editingEntrepot) {
        // Mise à jour
        setEntrepots((prev) =>
          prev.map((e) =>
            e.id === editingEntrepot.id
              ? { ...e, name: formData.name, location: formData.location, max_capacity_t: formData.max_capacity_t }
              : e,
          ),
        )
        setSuccess("Entrepôt mis à jour avec succès")
      } else {
        // Création
        setEntrepots((prev) => [newEntrepot, ...prev])
        setSuccess("Entrepôt créé avec succès")
      }

      handleCloseDialog()
    } catch (err: any) {
      console.error("Error saving entrepot:", err)
      setError("Erreur lors de la sauvegarde")
    }
  }

  // Supprimer un entrepôt
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet entrepôt ?")) return

    try {
      setEntrepots((prev) => prev.filter((e) => e.id !== id))
      setSuccess("Entrepôt supprimé avec succès")
    } catch (err) {
      console.error("Error deleting entrepot:", err)
      setError("Erreur lors de la suppression")
    }
  }

  // Ouvrir le dialog pour édition
  const handleEdit = (entrepot: Entrepot) => {
    setEditingEntrepot(entrepot)
    setFormData({
      name: entrepot.name,
      location: entrepot.location,
      max_capacity_t: entrepot.max_capacity_t,
    })
    setIsDialogOpen(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEntrepot(null)
    setFormData({
      name: "",
      location: "",
      max_capacity_t: 1000,
    })
    setError("")
  }

  // Calculer les statistiques
  const totalCapacity = entrepots.reduce((sum, e) => sum + e.max_capacity_t, 0)
  const totalStock = entrepots.reduce((sum, e) => sum + e.current_stock, 0)
  const averageUsage = entrepots.length > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Warehouse className="h-8 w-8 text-[#0F4C75]" />
            Entrepôts
          </h1>
          <p className="text-gray-600">Gestion des entrepôts et suivi des stocks</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel entrepôt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingEntrepot ? "Modifier l'entrepôt" : "Nouvel entrepôt"}</DialogTitle>
              <DialogDescription>
                {editingEntrepot ? "Modifiez les informations de l'entrepôt" : "Ajoutez un nouvel entrepôt au système"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'entrepôt *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Entrepôt Central"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: Zone Industrielle, Ouagadougou"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacité maximale (tonnes) *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.max_capacity_t}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, max_capacity_t: Number.parseInt(e.target.value) }))
                    }
                    placeholder="1000"
                    min="1"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                  {editingEntrepot ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
            <CardTitle className="text-sm font-medium">Total Entrepôts</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entrepots.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacité Totale</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity.toLocaleString()}T</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toLocaleString()}T</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisation Moyenne</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageUsage}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un entrepôt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des entrepôts */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des entrepôts</CardTitle>
          <CardDescription>{filteredEntrepots.length} entrepôt(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredEntrepots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "Aucun entrepôt ne correspond aux critères de recherche" : "Aucun entrepôt enregistré"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Stock Actuel</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntrepots.map((entrepot) => {
                  const usagePercentage = getUsagePercentage(entrepot.current_stock, entrepot.max_capacity_t)
                  return (
                    <TableRow key={entrepot.id}>
                      <TableCell className="font-medium">{entrepot.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {entrepot.location}
                        </div>
                      </TableCell>
                      <TableCell>{entrepot.max_capacity_t.toLocaleString()}T</TableCell>
                      <TableCell>{entrepot.current_stock.toLocaleString()}T</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${getUsageColor(usagePercentage)}`}>
                              {usagePercentage}%
                            </span>
                          </div>
                          <Progress value={usagePercentage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{new Date(entrepot.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(entrepot)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(entrepot.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
