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
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  Plus,
  Search,
  Edit,
  Eye,
  FileText,
  Euro,
  Calendar,
  User,
  Package,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

interface Vente {
  id: string
  numero_vente: string
  type_vente: "directe" | "normale" | "transfert"
  client_id: string
  client_name: string
  marchandise_id: string
  marchandise_name: string
  quantite: number
  prix_unitaire: number
  montant_ht: number
  montant_ttc: number
  devise: string
  date_vente: string
  date_echeance: string
  status_paiement: "en_attente" | "partiel" | "paye" | "retard"
  montant_paye: number
  vendeur_id: string
  vendeur_name: string
  observations: string
  created_at: string
}

const typeVenteLabels = {
  directe: "Vente directe",
  normale: "Vente normale",
  transfert: "Transfert",
}

const typeVenteColors = {
  directe: "#4CAF50",
  normale: "#2196F3",
  transfert: "#FF9800",
}

const statusPaiementLabels = {
  en_attente: "En attente",
  partiel: "Partiel",
  paye: "Payé",
  retard: "En retard",
}

const statusPaiementColors = {
  en_attente: "#9E9E9E",
  partiel: "#FF9800",
  paye: "#4CAF50",
  retard: "#F44336",
}

export default function VentesPage() {
  const [ventes, setVentes] = useState<Vente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingVente, setViewingVente] = useState<Vente | null>(null)
  const [editingVente, setEditingVente] = useState<Vente | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    type_vente: "normale" as "directe" | "normale" | "transfert",
    client_id: "",
    marchandise_id: "",
    quantite: 0,
    prix_unitaire: 0,
    devise: "EUR",
    date_vente: "",
    date_echeance: "",
    vendeur_id: "",
    observations: "",
  })

  // Données de démonstration
  const demoVentes: Vente[] = [
    {
      id: "1",
      numero_vente: "V-2025-001",
      type_vente: "normale",
      client_id: "1",
      client_name: "SONABHY SA",
      marchandise_id: "1",
      marchandise_name: "Blé dur",
      quantite: 150,
      prix_unitaire: 280,
      montant_ht: 42000,
      montant_ttc: 49560,
      devise: "EUR",
      date_vente: "2025-01-20T00:00:00Z",
      date_echeance: "2025-02-19T00:00:00Z",
      status_paiement: "paye",
      montant_paye: 49560,
      vendeur_id: "4",
      vendeur_name: "Fatou Traoré",
      observations: "Vente standard, paiement reçu",
      created_at: "2025-01-20T10:00:00Z",
    },
    {
      id: "2",
      numero_vente: "V-2025-002",
      type_vente: "directe",
      client_id: "2",
      client_name: "BURKINA DISTRIBUTION",
      marchandise_id: "2",
      marchandise_name: "Riz parfumé",
      quantite: 80,
      prix_unitaire: 320,
      montant_ht: 25600,
      montant_ttc: 30208,
      devise: "EUR",
      date_vente: "2025-01-22T00:00:00Z",
      date_echeance: "2025-01-22T00:00:00Z",
      status_paiement: "paye",
      montant_paye: 30208,
      vendeur_id: "4",
      vendeur_name: "Fatou Traoré",
      observations: "Vente directe, paiement comptant",
      created_at: "2025-01-22T14:30:00Z",
    },
    {
      id: "3",
      numero_vente: "V-2025-003",
      type_vente: "normale",
      client_id: "3",
      client_name: "COMMERCE GENERAL SARL",
      marchandise_id: "3",
      marchandise_name: "Huile de palme",
      quantite: 60,
      prix_unitaire: 450,
      montant_ht: 27000,
      montant_ttc: 31860,
      devise: "EUR",
      date_vente: "2025-01-25T00:00:00Z",
      date_echeance: "2025-02-09T00:00:00Z",
      status_paiement: "partiel",
      montant_paye: 15000,
      vendeur_id: "4",
      vendeur_name: "Fatou Traoré",
      observations: "Paiement partiel reçu, solde en attente",
      created_at: "2025-01-25T09:15:00Z",
    },
    {
      id: "4",
      numero_vente: "V-2025-004",
      type_vente: "transfert",
      client_id: "1",
      client_name: "SONABHY SA",
      marchandise_id: "1",
      marchandise_name: "Blé dur",
      quantite: 200,
      prix_unitaire: 275,
      montant_ht: 55000,
      montant_ttc: 64900,
      devise: "EUR",
      date_vente: "2025-01-26T00:00:00Z",
      date_echeance: "2025-03-27T00:00:00Z",
      status_paiement: "retard",
      montant_paye: 0,
      vendeur_id: "4",
      vendeur_name: "Fatou Traoré",
      observations: "Transfert vers entrepôt client, paiement en retard",
      created_at: "2025-01-26T11:00:00Z",
    },
  ]

  useEffect(() => {
    setVentes(demoVentes)
    setLoading(false)
  }, [])

  // Filtrer les ventes
  const filteredVentes = ventes.filter((vente) => {
    const matchesSearch =
      vente.numero_vente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vente.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vente.marchandise_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || vente.type_vente === filterType
    const matchesStatus = filterStatus === "all" || vente.status_paiement === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  // Calculer les statistiques
  const totalVentes = ventes.length
  const chiffreAffaire = ventes.reduce((sum, v) => sum + v.montant_ttc, 0)
  const ventesPayees = ventes.filter((v) => v.status_paiement === "paye").length
  const ventesEnRetard = ventes.filter((v) => v.status_paiement === "retard").length

  // Générer un nouveau numéro de vente
  const generateVenteNumber = () => {
    const year = new Date().getFullYear()
    const nextNumber = ventes.length + 1
    return `V-${year}-${nextNumber.toString().padStart(3, "0")}`
  }

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const montantHT = formData.quantite * formData.prix_unitaire
      const montantTTC = montantHT * 1.18 // TVA 18%

      const newVente: Vente = {
        id: Date.now().toString(),
        numero_vente: generateVenteNumber(),
        type_vente: formData.type_vente,
        client_id: formData.client_id,
        client_name: "Client sélectionné", // À remplacer par la vraie donnée
        marchandise_id: formData.marchandise_id,
        marchandise_name: "Marchandise sélectionnée", // À remplacer par la vraie donnée
        quantite: formData.quantite,
        prix_unitaire: formData.prix_unitaire,
        montant_ht: montantHT,
        montant_ttc: montantTTC,
        devise: formData.devise,
        date_vente: formData.date_vente,
        date_echeance: formData.date_echeance,
        status_paiement: formData.type_vente === "directe" ? "paye" : "en_attente",
        montant_paye: formData.type_vente === "directe" ? montantTTC : 0,
        vendeur_id: formData.vendeur_id,
        vendeur_name: "Vendeur sélectionné", // À remplacer par la vraie donnée
        observations: formData.observations,
        created_at: new Date().toISOString(),
      }

      if (editingVente) {
        // Mise à jour
        setVentes((prev) =>
          prev.map((v) =>
            v.id === editingVente.id
              ? {
                  ...v,
                  type_vente: formData.type_vente,
                  client_id: formData.client_id,
                  marchandise_id: formData.marchandise_id,
                  quantite: formData.quantite,
                  prix_unitaire: formData.prix_unitaire,
                  montant_ht: montantHT,
                  montant_ttc: montantTTC,
                  devise: formData.devise,
                  date_vente: formData.date_vente,
                  date_echeance: formData.date_echeance,
                  vendeur_id: formData.vendeur_id,
                  observations: formData.observations,
                }
              : v,
          ),
        )
        setSuccess("Vente mise à jour avec succès")
      } else {
        // Création
        setVentes((prev) => [newVente, ...prev])
        setSuccess("Vente créée avec succès")
      }

      handleCloseDialog()
    } catch (err: any) {
      console.error("Error saving vente:", err)
      setError("Erreur lors de la sauvegarde")
    }
  }

  // Marquer comme payé
  const handleMarkPaid = async (id: string) => {
    try {
      setVentes((prev) =>
        prev.map((v) =>
          v.id === id
            ? {
                ...v,
                status_paiement: "paye" as const,
                montant_paye: v.montant_ttc,
              }
            : v,
        ),
      )
      setSuccess("Vente marquée comme payée")
    } catch (err) {
      console.error("Error marking as paid:", err)
      setError("Erreur lors de la mise à jour")
    }
  }

  // Ouvrir le dialog pour édition
  const handleEdit = (vente: Vente) => {
    setEditingVente(vente)
    setFormData({
      type_vente: vente.type_vente,
      client_id: vente.client_id,
      marchandise_id: vente.marchandise_id,
      quantite: vente.quantite,
      prix_unitaire: vente.prix_unitaire,
      devise: vente.devise,
      date_vente: vente.date_vente.split("T")[0],
      date_echeance: vente.date_echeance.split("T")[0],
      vendeur_id: vente.vendeur_id,
      observations: vente.observations,
    })
    setIsDialogOpen(true)
  }

  // Voir les détails
  const handleView = (vente: Vente) => {
    setViewingVente(vente)
    setIsDialogOpen(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingVente(null)
    setViewingVente(null)
    setFormData({
      type_vente: "normale",
      client_id: "",
      marchandise_id: "",
      quantite: 0,
      prix_unitaire: 0,
      devise: "EUR",
      date_vente: "",
      date_echeance: "",
      vendeur_id: "",
      observations: "",
    })
    setError("")
  }

  // Calculer le pourcentage de paiement
  const getPaymentPercentage = (paye: number, total: number) => {
    return Math.round((paye / total) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-[#0F4C75]" />
            Ventes
          </h1>
          <p className="text-gray-600">Gestion des ventes et facturation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle vente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingVente ? "Détails de la vente" : editingVente ? "Modifier la vente" : "Nouvelle vente"}
              </DialogTitle>
              <DialogDescription>
                {viewingVente
                  ? "Informations détaillées de la vente"
                  : editingVente
                    ? "Modifiez les informations de la vente"
                    : "Créez une nouvelle vente"}
              </DialogDescription>
            </DialogHeader>

            {viewingVente ? (
              // Vue détaillée
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Numéro</Label>
                    <p className="font-semibold">{viewingVente.numero_vente}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Type</Label>
                    <Badge
                      style={{
                        backgroundColor: typeVenteColors[viewingVente.type_vente],
                        color: "white",
                      }}
                    >
                      {typeVenteLabels[viewingVente.type_vente]}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Client</Label>
                    <p className="font-semibold">{viewingVente.client_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Vendeur</Label>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold">{viewingVente.vendeur_name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Marchandise</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold">
                      {viewingVente.marchandise_name} - {viewingVente.quantite}T
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Prix unitaire: {viewingVente.devise} {viewingVente.prix_unitaire}/T
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Montant HT</Label>
                    <p className="font-semibold text-lg">
                      {viewingVente.devise} {viewingVente.montant_ht.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Montant TTC</Label>
                    <p className="font-semibold text-lg text-[#0F4C75]">
                      {viewingVente.devise} {viewingVente.montant_ttc.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Statut de paiement</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        style={{
                          backgroundColor: statusPaiementColors[viewingVente.status_paiement],
                          color: "white",
                        }}
                      >
                        {statusPaiementLabels[viewingVente.status_paiement]}
                      </Badge>
                      <span className="text-sm font-medium">
                        {viewingVente.devise} {viewingVente.montant_paye.toLocaleString()} /{" "}
                        {viewingVente.montant_ttc.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${getPaymentPercentage(viewingVente.montant_paye, viewingVente.montant_ttc)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date de vente</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(viewingVente.date_vente).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date d'échéance</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(viewingVente.date_echeance).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Observations</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{viewingVente.observations}</p>
                </div>

                <div className="flex gap-2">
                  {viewingVente.status_paiement !== "paye" && (
                    <Button onClick={() => handleMarkPaid(viewingVente.id)} className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marquer payé
                    </Button>
                  )}
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Facture
                  </Button>
                  <Button variant="outline">
                    <Euro className="mr-2 h-4 w-4" />
                    Paiement
                  </Button>
                </div>
              </div>
            ) : (
              // Formulaire d'édition/création
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type_vente">Type de vente *</Label>
                      <Select
                        value={formData.type_vente}
                        onValueChange={(value: "directe" | "normale" | "transfert") =>
                          setFormData((prev) => ({ ...prev, type_vente: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="directe">Vente directe</SelectItem>
                          <SelectItem value="normale">Vente normale</SelectItem>
                          <SelectItem value="transfert">Transfert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client">Client *</Label>
                      <Select
                        value={formData.client_id}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, client_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">SONABHY SA</SelectItem>
                          <SelectItem value="2">BURKINA DISTRIBUTION</SelectItem>
                          <SelectItem value="3">COMMERCE GENERAL SARL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="quantite">Quantité (tonnes) *</Label>
                      <Input
                        id="quantite"
                        type="number"
                        value={formData.quantite}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, quantite: Number.parseFloat(e.target.value) }))
                        }
                        placeholder="150"
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prix_unitaire">Prix unitaire *</Label>
                      <Input
                        id="prix_unitaire"
                        type="number"
                        value={formData.prix_unitaire}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, prix_unitaire: Number.parseFloat(e.target.value) }))
                        }
                        placeholder="280"
                        min="0"
                        step="0.01"
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_vente">Date de vente *</Label>
                      <Input
                        id="date_vente"
                        type="date"
                        value={formData.date_vente}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date_vente: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_echeance">Date d'échéance *</Label>
                      <Input
                        id="date_echeance"
                        type="date"
                        value={formData.date_echeance}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date_echeance: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendeur">Vendeur *</Label>
                    <Select
                      value={formData.vendeur_id}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, vendeur_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un vendeur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">Fatou Traoré</SelectItem>
                        <SelectItem value="2">Marie Ouédraogo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observations">Observations</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData((prev) => ({ ...prev, observations: e.target.value }))}
                      placeholder="Remarques particulières..."
                      rows={3}
                    />
                  </div>

                  {/* Calcul automatique */}
                  {formData.quantite > 0 && formData.prix_unitaire > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Calcul automatique</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Montant HT:</span>
                          <span className="font-semibold ml-2">
                            {formData.devise} {(formData.quantite * formData.prix_unitaire).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Montant TTC (18%):</span>
                          <span className="font-semibold ml-2 text-[#0F4C75]">
                            {formData.devise} {(formData.quantite * formData.prix_unitaire * 1.18).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
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
                    {editingVente ? "Mettre à jour" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            )}
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
            <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaire</CardTitle>
            <Euro className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{chiffreAffaire.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ventesPayees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{ventesEnRetard}</div>
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
                  placeholder="Rechercher une vente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="directe">Vente directe</SelectItem>
                  <SelectItem value="normale">Vente normale</SelectItem>
                  <SelectItem value="transfert">Transfert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="partiel">Partiel</SelectItem>
                  <SelectItem value="paye">Payé</SelectItem>
                  <SelectItem value="retard">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des ventes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des ventes</CardTitle>
          <CardDescription>{filteredVentes.length} vente(s) trouvée(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredVentes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Aucune vente ne correspond aux critères de recherche"
                : "Aucune vente enregistrée"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Marchandise</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Vendeur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVentes.map((vente) => (
                  <TableRow key={vente.id}>
                    <TableCell className="font-medium">{vente.numero_vente}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: typeVenteColors[vente.type_vente],
                          color: "white",
                        }}
                        className="text-xs"
                      >
                        {typeVenteLabels[vente.type_vente]}
                      </Badge>
                    </TableCell>
                    <TableCell>{vente.client_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {vente.marchandise_name} ({vente.quantite}T)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {vente.devise} {vente.montant_ttc.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          style={{
                            backgroundColor: statusPaiementColors[vente.status_paiement],
                            color: "white",
                          }}
                          className="text-xs"
                        >
                          {statusPaiementLabels[vente.status_paiement]}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {vente.montant_paye.toLocaleString()} / {vente.montant_ttc.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{vente.vendeur_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{new Date(vente.date_vente).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(vente)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(vente)}>
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
