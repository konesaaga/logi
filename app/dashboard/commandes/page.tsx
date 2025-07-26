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
import { ShoppingCart, Plus, Search, Edit, Eye, Filter, TrendingUp, Clock, CheckCircle } from "lucide-react"

interface Commande {
  id: string
  code_alpha_num: string
  marchandise_id: string
  marchandise_name: string
  fournisseur_id: string
  fournisseur_name: string
  qte_cmd: number
  qte_livree: number
  montant_ht: number
  montant_ttc: number
  devise: string
  status: "en_cours" | "bouclee"
  color_status: string
  created_at: string
  closed_at?: string
}

const statusLabels = {
  en_cours: "En cours",
  bouclee: "Bouclée",
}

const statusColors = {
  en_cours: "#FF9800",
  bouclee: "#4CAF50",
}

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingCommande, setViewingCommande] = useState<Commande | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    marchandise_id: "",
    fournisseur_id: "",
    qte_cmd: 0,
    montant_ht: 0,
    devise: "EUR",
  })

  // Données de démonstration
  const demoCommandes: Commande[] = [
    {
      id: "1",
      code_alpha_num: "CMD-2025-001",
      marchandise_id: "1",
      marchandise_name: "Blé dur",
      fournisseur_id: "1",
      fournisseur_name: "Agro Export SA",
      qte_cmd: 500,
      qte_livree: 350,
      montant_ht: 125000,
      montant_ttc: 147500,
      devise: "EUR",
      status: "en_cours",
      color_status: "#FF9800",
      created_at: "2025-01-15T10:30:00Z",
    },
    {
      id: "2",
      code_alpha_num: "CMD-2025-002",
      marchandise_id: "2",
      marchandise_name: "Riz parfumé",
      fournisseur_id: "2",
      fournisseur_name: "Rice Trading Ltd",
      qte_cmd: 300,
      qte_livree: 300,
      montant_ht: 90000,
      montant_ttc: 106200,
      devise: "EUR",
      status: "bouclee",
      color_status: "#4CAF50",
      created_at: "2025-01-10T14:20:00Z",
      closed_at: "2025-01-20T16:45:00Z",
    },
    {
      id: "3",
      code_alpha_num: "CMD-2025-003",
      marchandise_id: "3",
      marchandise_name: "Huile de palme",
      fournisseur_id: "3",
      fournisseur_name: "Palm Oil Corp",
      qte_cmd: 200,
      qte_livree: 0,
      montant_ht: 80000,
      montant_ttc: 94400,
      devise: "EUR",
      status: "en_cours",
      color_status: "#FF9800",
      created_at: "2025-01-25T09:15:00Z",
    },
  ]

  useEffect(() => {
    setCommandes(demoCommandes)
    setLoading(false)
  }, [])

  // Filtrer les commandes
  const filteredCommandes = commandes.filter((commande) => {
    const matchesSearch =
      commande.code_alpha_num.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.marchandise_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.fournisseur_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || commande.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculer les statistiques
  const totalCommandes = commandes.length
  const commandesEnCours = commandes.filter((c) => c.status === "en_cours").length
  const commandesBouclees = commandes.filter((c) => c.status === "bouclee").length
  const montantTotal = commandes.reduce((sum, c) => sum + c.montant_ttc, 0)

  // Générer un nouveau code de commande
  const generateCommandeCode = () => {
    const year = new Date().getFullYear()
    const nextNumber = commandes.length + 1
    return `CMD-${year}-${nextNumber.toString().padStart(3, "0")}`
  }

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const newCommande: Commande = {
        id: Date.now().toString(),
        code_alpha_num: generateCommandeCode(),
        marchandise_id: formData.marchandise_id,
        marchandise_name: "Marchandise sélectionnée", // À remplacer par la vraie donnée
        fournisseur_id: formData.fournisseur_id,
        fournisseur_name: "Fournisseur sélectionné", // À remplacer par la vraie donnée
        qte_cmd: formData.qte_cmd,
        qte_livree: 0,
        montant_ht: formData.montant_ht,
        montant_ttc: formData.montant_ht * 1.18, // TVA 18%
        devise: formData.devise,
        status: "en_cours",
        color_status: "#FF9800",
        created_at: new Date().toISOString(),
      }

      setCommandes((prev) => [newCommande, ...prev])
      setSuccess("Commande créée avec succès")
      handleCloseDialog()
    } catch (err: any) {
      console.error("Error saving commande:", err)
      setError("Erreur lors de la sauvegarde")
    }
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setViewingCommande(null)
    setFormData({
      marchandise_id: "",
      fournisseur_id: "",
      qte_cmd: 0,
      montant_ht: 0,
      devise: "EUR",
    })
    setError("")
  }

  // Calculer le pourcentage de livraison
  const getDeliveryPercentage = (livree: number, commande: number) => {
    return Math.round((livree / commande) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-[#0F4C75]" />
            Commandes
          </h1>
          <p className="text-gray-600">Gestion des commandes fournisseurs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle commande
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nouvelle commande</DialogTitle>
              <DialogDescription>Créez une nouvelle commande fournisseur</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="marchandise">Marchandise *</Label>
                  <Select
                    value={formData.marchandise_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, marchandise_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une marchandise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Blé dur</SelectItem>
                      <SelectItem value="2">Riz parfumé</SelectItem>
                      <SelectItem value="3">Huile de palme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fournisseur">Fournisseur *</Label>
                  <Select
                    value={formData.fournisseur_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, fournisseur_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Agro Export SA</SelectItem>
                      <SelectItem value="2">Rice Trading Ltd</SelectItem>
                      <SelectItem value="3">Palm Oil Corp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qte">Quantité (tonnes) *</Label>
                    <Input
                      id="qte"
                      type="number"
                      value={formData.qte_cmd}
                      onChange={(e) => setFormData((prev) => ({ ...prev, qte_cmd: Number.parseFloat(e.target.value) }))}
                      placeholder="500"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="devise">Devise</Label>
                    <Select
                      value={formData.devise}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, devise: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="XOF">XOF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="montant">Montant HT *</Label>
                  <Input
                    id="montant"
                    type="number"
                    value={formData.montant_ht}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, montant_ht: Number.parseFloat(e.target.value) }))
                    }
                    placeholder="125000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                  Créer la commande
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
            <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommandes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{commandesEnCours}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bouclées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{commandesBouclees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{montantTotal.toLocaleString()}</div>
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
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="bouclee">Bouclées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
          <CardDescription>{filteredCommandes.length} commande(s) trouvée(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredCommandes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Aucune commande ne correspond aux critères de recherche"
                : "Aucune commande enregistrée"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Marchandise</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Livraison</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommandes.map((commande) => (
                  <TableRow key={commande.id}>
                    <TableCell className="font-medium">{commande.code_alpha_num}</TableCell>
                    <TableCell>{commande.marchandise_name}</TableCell>
                    <TableCell>{commande.fournisseur_name}</TableCell>
                    <TableCell>{commande.qte_cmd}T</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {commande.qte_livree}T / {commande.qte_cmd}T
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getDeliveryPercentage(commande.qte_livree, commande.qte_cmd)}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {commande.devise} {commande.montant_ttc.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: commande.color_status,
                          color: "white",
                        }}
                      >
                        {statusLabels[commande.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(commande.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setViewingCommande(commande)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
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
