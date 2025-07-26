"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Plus, Search, Edit, Trash2, Filter, Download, Upload, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Marchandise {
  id: string
  name: string
  category: "perissable" | "dangereux" | "standard"
  color_hex: string
  default_unit: string
  created_at: string
  created_by_id?: string
}

const categoryColors = {
  perissable: "#FF5252",
  dangereux: "#9C27B0",
  standard: "#4CAF50",
}

const categoryLabels = {
  perissable: "Périssable",
  dangereux: "Dangereux",
  standard: "Standard",
}

export default function MarchandisesPage() {
  const [marchandises, setMarchandises] = useState<Marchandise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMarchandise, setEditingMarchandise] = useState<Marchandise | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    category: "standard" as "perissable" | "dangereux" | "standard",
    color_hex: "#4CAF50",
    default_unit: "Tonne",
  })

  // Charger les marchandises
  const loadMarchandises = async () => {
    try {
      const { data, error } = await supabase.from("marchandises").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading marchandises:", error)
        setError("Erreur lors du chargement des marchandises")
      } else {
        setMarchandises(data || [])
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarchandises()
  }, [])

  // Filtrer les marchandises
  const filteredMarchandises = marchandises.filter((marchandise) => {
    const matchesSearch = marchandise.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || marchandise.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      if (editingMarchandise) {
        // Mise à jour
        const { error } = await supabase
          .from("marchandises")
          .update({
            name: formData.name,
            category: formData.category,
            color_hex: formData.color_hex,
            default_unit: formData.default_unit,
          })
          .eq("id", editingMarchandise.id)

        if (error) throw error
        setSuccess("Marchandise mise à jour avec succès")
      } else {
        // Création
        const { error } = await supabase.from("marchandises").insert([
          {
            name: formData.name,
            category: formData.category,
            color_hex: formData.color_hex,
            default_unit: formData.default_unit,
          },
        ])

        if (error) throw error
        setSuccess("Marchandise créée avec succès")
      }

      // Recharger les données
      await loadMarchandises()
      handleCloseDialog()
    } catch (err: any) {
      console.error("Error saving marchandise:", err)
      if (err.code === "23505") {
        setError("Une marchandise avec ce nom existe déjà")
      } else {
        setError("Erreur lors de la sauvegarde")
      }
    }
  }

  // Supprimer une marchandise
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette marchandise ?")) return

    try {
      const { error } = await supabase.from("marchandises").delete().eq("id", id)

      if (error) throw error

      setSuccess("Marchandise supprimée avec succès")
      await loadMarchandises()
    } catch (err) {
      console.error("Error deleting marchandise:", err)
      setError("Erreur lors de la suppression")
    }
  }

  // Ouvrir le dialog pour édition
  const handleEdit = (marchandise: Marchandise) => {
    setEditingMarchandise(marchandise)
    setFormData({
      name: marchandise.name,
      category: marchandise.category,
      color_hex: marchandise.color_hex,
      default_unit: marchandise.default_unit,
    })
    setIsDialogOpen(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingMarchandise(null)
    setFormData({
      name: "",
      category: "standard",
      color_hex: "#4CAF50",
      default_unit: "Tonne",
    })
    setError("")
  }

  // Mettre à jour la couleur selon la catégorie
  const handleCategoryChange = (category: "perissable" | "dangereux" | "standard") => {
    setFormData((prev) => ({
      ...prev,
      category,
      color_hex: categoryColors[category],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-[#0F4C75]" />
            Marchandises
          </h1>
          <p className="text-gray-600">Gestion du catalogue des marchandises</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle marchandise
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingMarchandise ? "Modifier la marchandise" : "Nouvelle marchandise"}</DialogTitle>
                <DialogDescription>
                  {editingMarchandise
                    ? "Modifiez les informations de la marchandise"
                    : "Ajoutez une nouvelle marchandise au catalogue"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la marchandise *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Blé dur"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="perissable">Périssable</SelectItem>
                        <SelectItem value="dangereux">Dangereux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Couleur</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color_hex}
                        onChange={(e) => setFormData((prev) => ({ ...prev, color_hex: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.color_hex}
                        onChange={(e) => setFormData((prev) => ({ ...prev, color_hex: e.target.value }))}
                        placeholder="#4CAF50"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unité par défaut</Label>
                    <Select
                      value={formData.default_unit}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, default_unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tonne">Tonne</SelectItem>
                        <SelectItem value="Kg">Kilogramme</SelectItem>
                        <SelectItem value="Litre">Litre</SelectItem>
                        <SelectItem value="m³">Mètre cube</SelectItem>
                        <SelectItem value="Unité">Unité</SelectItem>
                      </SelectContent>
                    </Select>
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
                    {editingMarchandise ? "Mettre à jour" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Messages de succès */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une marchandise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="perissable">Périssable</SelectItem>
                  <SelectItem value="dangereux">Dangereux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des marchandises */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des marchandises</CardTitle>
          <CardDescription>{filteredMarchandises.length} marchandise(s) trouvée(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredMarchandises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterCategory !== "all"
                ? "Aucune marchandise ne correspond aux critères de recherche"
                : "Aucune marchandise enregistrée"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Couleur</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarchandises.map((marchandise) => (
                  <TableRow key={marchandise.id}>
                    <TableCell className="font-medium">{marchandise.name}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: marchandise.color_hex,
                          color: "white",
                        }}
                      >
                        {categoryLabels[marchandise.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: marchandise.color_hex }}
                        />
                        <span className="text-sm text-gray-600">{marchandise.color_hex}</span>
                      </div>
                    </TableCell>
                    <TableCell>{marchandise.default_unit}</TableCell>
                    <TableCell>{new Date(marchandise.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(marchandise)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(marchandise.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
