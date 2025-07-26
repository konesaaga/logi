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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ShoppingCart,
  Plus,
  Search,
  Edit,
  Eye,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  Trash2,
  DollarSign,
  Package,
  Truck,
  Warehouse,
  Calendar,
  AlertTriangle,
} from "lucide-react"

interface Depense {
  id: string
  type: string
  montant_ht: number
  devise: string
  taux_tva: number
  montant_ttc: number
  fichier_url?: string
  paye: boolean
  date_reglement?: string
  created_at: string
}

interface Dechargement {
  id: string
  mode: "camion" | "magasin"
  quantite: number
  date: string
  details: string
  bl_url?: string
}

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
  depenses: Depense[]
  dechargements: Dechargement[]
  total_depenses_ht: number
  total_depenses_ttc: number
  cout_reel_total: number
}

const statusLabels = {
  en_cours: "En cours",
  bouclee: "Bouclée",
}

const statusColors = {
  en_cours: "#FF9800",
  bouclee: "#4CAF50",
}

const typesDepense = [
  "Frais portuaires",
  "Surestaries",
  "Douane",
  "Transport interne",
  "Manutention",
  "Assurance",
  "Autres frais",
]

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingCommande, setViewingCommande] = useState<Commande | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  // États pour les dépenses
  const [nouvelleDepense, setNouvelleDepense] = useState({
    type: "",
    montant_ht: 0,
    devise: "EUR",
    taux_tva: 18,
    fichier_url: "",
  })

  const [formData, setFormData] = useState({
    marchandise_id: "",
    fournisseur_id: "",
    qte_cmd: 0,
    montant_ht: 0,
    devise: "EUR",
  })

  // Données de démonstration avec dépenses et déchargements
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
      depenses: [
        {
          id: "d1",
          type: "Frais portuaires",
          montant_ht: 2500,
          devise: "EUR",
          taux_tva: 18,
          montant_ttc: 2950,
          fichier_url: "/documents/facture-port-001.pdf",
          paye: true,
          date_reglement: "2025-01-20T00:00:00Z",
          created_at: "2025-01-16T00:00:00Z",
        },
        {
          id: "d2",
          type: "Surestaries",
          montant_ht: 1200,
          devise: "EUR",
          taux_tva: 18,
          montant_ttc: 1416,
          fichier_url: "/documents/surestaries-001.pdf",
          paye: false,
          created_at: "2025-01-18T00:00:00Z",
        },
      ],
      dechargements: [
        {
          id: "dc1",
          mode: "camion",
          quantite: 150,
          date: "2025-01-20T14:30:00Z",
          details: "2 camions - Destination Ouagadougou",
          bl_url: "/documents/bl-dech-001.pdf",
        },
        {
          id: "dc2",
          mode: "camion",
          quantite: 200,
          date: "2025-01-22T09:15:00Z",
          details: "3 camions - Destination Bobo-Dioulasso",
          bl_url: "/documents/bl-dech-002.pdf",
        },
      ],
      total_depenses_ht: 3700,
      total_depenses_ttc: 4366,
      cout_reel_total: 151866, // montant_ttc + total_depenses_ttc
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
      depenses: [
        {
          id: "d3",
          type: "Douane",
          montant_ht: 1800,
          devise: "EUR",
          taux_tva: 18,
          montant_ttc: 2124,
          fichier_url: "/documents/douane-002.pdf",
          paye: true,
          date_reglement: "2025-01-19T00:00:00Z",
          created_at: "2025-01-17T00:00:00Z",
        },
      ],
      dechargements: [
        {
          id: "dc3",
          mode: "magasin",
          quantite: 300,
          date: "2025-01-18T11:00:00Z",
          details: "Magasin A - Zone 1",
        },
      ],
      total_depenses_ht: 1800,
      total_depenses_ttc: 2124,
      cout_reel_total: 108324,
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
      depenses: [],
      dechargements: [],
      total_depenses_ht: 0,
      total_depenses_ttc: 0,
      cout_reel_total: 94400,
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
  const totalDepenses = commandes.reduce((sum, c) => sum + c.total_depenses_ttc, 0)
  const coutReelTotal = commandes.reduce((sum, c) => sum + c.cout_reel_total, 0)

  // Ajouter une dépense
  const ajouterDepense = async () => {
    if (!viewingCommande || !nouvelleDepense.type || nouvelleDepense.montant_ht <= 0) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const nouvelleDepenseComplete: Depense = {
        id: Date.now().toString(),
        type: nouvelleDepense.type,
        montant_ht: nouvelleDepense.montant_ht,
        devise: nouvelleDepense.devise,
        taux_tva: nouvelleDepense.taux_tva,
        montant_ttc: nouvelleDepense.montant_ht * (1 + nouvelleDepense.taux_tva / 100),
        fichier_url: nouvelleDepense.fichier_url,
        paye: false,
        created_at: new Date().toISOString(),
      }

      setCommandes((prev) =>
        prev.map((c) => {
          if (c.id === viewingCommande.id) {
            const nouvellesDepenses = [...c.depenses, nouvelleDepenseComplete]
            const totalHT = nouvellesDepenses.reduce((sum, d) => sum + d.montant_ht, 0)
            const totalTTC = nouvellesDepenses.reduce((sum, d) => sum + d.montant_ttc, 0)
            return {
              ...c,
              depenses: nouvellesDepenses,
              total_depenses_ht: totalHT,
              total_depenses_ttc: totalTTC,
              cout_reel_total: c.montant_ttc + totalTTC,
            }
          }
          return c
        }),
      )

      // Mettre à jour la commande visualisée
      setViewingCommande((prev) => {
        if (prev) {
          const nouvellesDepenses = [...prev.depenses, nouvelleDepenseComplete]
          const totalHT = nouvellesDepenses.reduce((sum, d) => sum + d.montant_ht, 0)
          const totalTTC = nouvellesDepenses.reduce((sum, d) => sum + d.montant_ttc, 0)
          return {
            ...prev,
            depenses: nouvellesDepenses,
            total_depenses_ht: totalHT,
            total_depenses_ttc: totalTTC,
            cout_reel_total: prev.montant_ttc + totalTTC,
          }
        }
        return prev
      })

      setNouvelleDepense({
        type: "",
        montant_ht: 0,
        devise: "EUR",
        taux_tva: 18,
        fichier_url: "",
      })

      setSuccess("Dépense ajoutée avec succès")
      setError("")
    } catch (err) {
      console.error("Error adding expense:", err)
      setError("Erreur lors de l'ajout de la dépense")
    }
  }

  // Marquer une dépense comme payée
  const marquerPayee = async (depenseId: string) => {
    if (!viewingCommande) return

    try {
      setCommandes((prev) =>
        prev.map((c) => {
          if (c.id === viewingCommande.id) {
            return {
              ...c,
              depenses: c.depenses.map((d) =>
                d.id === depenseId ? { ...d, paye: true, date_reglement: new Date().toISOString() } : d,
              ),
            }
          }
          return c
        }),
      )

      setViewingCommande((prev) => {
        if (prev) {
          return {
            ...prev,
            depenses: prev.depenses.map((d) =>
              d.id === depenseId ? { ...d, paye: true, date_reglement: new Date().toISOString() } : d,
            ),
          }
        }
        return prev
      })

      setSuccess("Dépense marquée comme payée")
    } catch (err) {
      console.error("Error marking expense as paid:", err)
      setError("Erreur lors de la mise à jour")
    }
  }

  // Supprimer une dépense
  const supprimerDepense = async (depenseId: string) => {
    if (!viewingCommande) return

    try {
      setCommandes((prev) =>
        prev.map((c) => {
          if (c.id === viewingCommande.id) {
            const nouvellesDepenses = c.depenses.filter((d) => d.id !== depenseId)
            const totalHT = nouvellesDepenses.reduce((sum, d) => sum + d.montant_ht, 0)
            const totalTTC = nouvellesDepenses.reduce((sum, d) => sum + d.montant_ttc, 0)
            return {
              ...c,
              depenses: nouvellesDepenses,
              total_depenses_ht: totalHT,
              total_depenses_ttc: totalTTC,
              cout_reel_total: c.montant_ttc + totalTTC,
            }
          }
          return c
        }),
      )

      setViewingCommande((prev) => {
        if (prev) {
          const nouvellesDepenses = prev.depenses.filter((d) => d.id !== depenseId)
          const totalHT = nouvellesDepenses.reduce((sum, d) => sum + d.montant_ht, 0)
          const totalTTC = nouvellesDepenses.reduce((sum, d) => sum + d.montant_ttc, 0)
          return {
            ...prev,
            depenses: nouvellesDepenses,
            total_depenses_ht: totalHT,
            total_depenses_ttc: totalTTC,
            cout_reel_total: prev.montant_ttc + totalTTC,
          }
        }
        return prev
      })

      setSuccess("Dépense supprimée avec succès")
    } catch (err) {
      console.error("Error deleting expense:", err)
      setError("Erreur lors de la suppression")
    }
  }

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
        marchandise_name: "Marchandise sélectionnée",
        fournisseur_id: formData.fournisseur_id,
        fournisseur_name: "Fournisseur sélectionné",
        qte_cmd: formData.qte_cmd,
        qte_livree: 0,
        montant_ht: formData.montant_ht,
        montant_ttc: formData.montant_ht * 1.18,
        devise: formData.devise,
        status: "en_cours",
        color_status: "#FF9800",
        created_at: new Date().toISOString(),
        depenses: [],
        dechargements: [],
        total_depenses_ht: 0,
        total_depenses_ttc: 0,
        cout_reel_total: formData.montant_ht * 1.18,
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
    setSuccess("")
  }

  // Calculer le pourcentage de livraison
  const getDeliveryPercentage = (livree: number, commande: number) => {
    return Math.round((livree / commande) * 100)
  }

  // Voir les détails d'une commande
  const handleView = (commande: Commande) => {
    setViewingCommande(commande)
    setActiveTab("details")
    setIsDialogOpen(true)
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
          <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingCommande ? `Commande ${viewingCommande.code_alpha_num}` : "Nouvelle commande"}
              </DialogTitle>
              <DialogDescription>
                {viewingCommande ? "Détails et gestion de la commande" : "Créez une nouvelle commande fournisseur"}
              </DialogDescription>
            </DialogHeader>

            {viewingCommande ? (
              // Vue détaillée avec onglets
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="depenses">
                    Dépenses
                    {viewingCommande.depenses.length > 0 && (
                      <Badge className="ml-2 bg-red-500">{viewingCommande.depenses.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="dechargements">
                    Déchargements
                    {viewingCommande.dechargements.length > 0 && (
                      <Badge className="ml-2 bg-blue-500">{viewingCommande.dechargements.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="historique">Historique</TabsTrigger>
                </TabsList>

                {/* Onglet Détails */}
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informations générales</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Code commande</Label>
                            <p className="font-semibold">{viewingCommande.code_alpha_num}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Statut</Label>
                            <Badge
                              style={{
                                backgroundColor: viewingCommande.color_status,
                                color: "white",
                              }}
                            >
                              {statusLabels[viewingCommande.status]}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Marchandise</Label>
                            <p className="font-semibold">{viewingCommande.marchandise_name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Fournisseur</Label>
                            <p className="font-semibold">{viewingCommande.fournisseur_name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Date création</Label>
                            <p>{new Date(viewingCommande.created_at).toLocaleDateString("fr-FR")}</p>
                          </div>
                          {viewingCommande.closed_at && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Date clôture</Label>
                              <p>{new Date(viewingCommande.closed_at).toLocaleDateString("fr-FR")}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quantités et montants</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Quantité commandée:</span>
                            <span className="font-semibold">{viewingCommande.qte_cmd}T</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Quantité livrée:</span>
                            <span className="font-semibold">{viewingCommande.qte_livree}T</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Montant HT:</span>
                            <span className="font-semibold">
                              {viewingCommande.devise} {viewingCommande.montant_ht.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Montant TTC:</span>
                            <span className="font-semibold">
                              {viewingCommande.devise} {viewingCommande.montant_ttc.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span className="text-sm font-medium">Total dépenses:</span>
                            <span className="font-semibold">
                              {viewingCommande.devise} {viewingCommande.total_depenses_ttc.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Coût réel total:</span>
                            <span className="text-blue-600">
                              {viewingCommande.devise} {viewingCommande.cout_reel_total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Jauge de progression */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Progression de la livraison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="relative w-32 h-32">
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-gray-200"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={`${
                                  getDeliveryPercentage(viewingCommande.qte_livree, viewingCommande.qte_cmd) === 100
                                    ? "text-green-500"
                                    : getDeliveryPercentage(viewingCommande.qte_livree, viewingCommande.qte_cmd) >= 50
                                      ? "text-orange-500"
                                      : "text-red-500"
                                }`}
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray={`${getDeliveryPercentage(viewingCommande.qte_livree, viewingCommande.qte_cmd)}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold">
                                {getDeliveryPercentage(viewingCommande.qte_livree, viewingCommande.qte_cmd)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">
                            {viewingCommande.qte_livree}T / {viewingCommande.qte_cmd}T livrées
                          </p>
                          <p className="text-sm text-gray-600">
                            Reste à livrer: {(viewingCommande.qte_cmd - viewingCommande.qte_livree).toFixed(1)}T
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Dépenses */}
                <TabsContent value="depenses" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulaire d'ajout de dépense */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Ajouter une dépense
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Type de dépense *</Label>
                          <Select
                            value={nouvelleDepense.type}
                            onValueChange={(value) => setNouvelleDepense((prev) => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                              {typesDepense.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Montant HT *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={nouvelleDepense.montant_ht || ""}
                              onChange={(e) =>
                                setNouvelleDepense((prev) => ({
                                  ...prev,
                                  montant_ht: Number.parseFloat(e.target.value) || 0,
                                }))
                              }
                              placeholder="2500.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Devise</Label>
                            <Select
                              value={nouvelleDepense.devise}
                              onValueChange={(value) => setNouvelleDepense((prev) => ({ ...prev, devise: value }))}
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
                          <Label>Taux TVA (%)</Label>
                          <Input
                            type="number"
                            value={nouvelleDepense.taux_tva}
                            onChange={(e) =>
                              setNouvelleDepense((prev) => ({
                                ...prev,
                                taux_tva: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fichier joint (facture)</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="URL du fichier"
                              value={nouvelleDepense.fichier_url}
                              onChange={(e) => setNouvelleDepense((prev) => ({ ...prev, fichier_url: e.target.value }))}
                            />
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>Montant TTC calculé:</span>
                            <span className="font-semibold">
                              {nouvelleDepense.devise}{" "}
                              {(nouvelleDepense.montant_ht * (1 + nouvelleDepense.taux_tva / 100)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Button onClick={ajouterDepense} className="w-full bg-green-600 hover:bg-green-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter la dépense
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Résumé des dépenses */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Résumé des dépenses
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Montant commande TTC:</span>
                            <span className="font-semibold">
                              {viewingCommande.devise} {viewingCommande.montant_ttc.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total dépenses HT:</span>
                            <span className="font-semibold">
                              {viewingCommande.devise} {viewingCommande.total_depenses_ht.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total dépenses TTC:</span>
                            <span className="font-semibold text-red-600">
                              {viewingCommande.devise} {viewingCommande.total_depenses_ttc.toLocaleString()}
                            </span>
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Coût réel total:</span>
                              <span className="text-blue-600">
                                {viewingCommande.devise} {viewingCommande.cout_reel_total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Impact des dépenses:</span>
                            <span className="font-semibold text-red-600">
                              +{((viewingCommande.total_depenses_ttc / viewingCommande.montant_ttc) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={(viewingCommande.total_depenses_ttc / viewingCommande.montant_ttc) * 100}
                            className="h-2"
                          />
                        </div>

                        {viewingCommande.depenses.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Répartition par type:</Label>
                            {Object.entries(
                              viewingCommande.depenses.reduce(
                                (acc, dep) => {
                                  acc[dep.type] = (acc[dep.type] || 0) + dep.montant_ttc
                                  return acc
                                },
                                {} as Record<string, number>,
                              ),
                            ).map(([type, montant]) => (
                              <div key={type} className="flex justify-between text-sm">
                                <span>{type}:</span>
                                <span className="font-medium">
                                  {viewingCommande.devise} {montant.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Liste des dépenses */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Liste des dépenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewingCommande.depenses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Aucune dépense enregistrée pour cette commande
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Montant HT</TableHead>
                              <TableHead>TVA</TableHead>
                              <TableHead>Montant TTC</TableHead>
                              <TableHead>Fichier</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewingCommande.depenses.map((depense) => (
                              <TableRow key={depense.id}>
                                <TableCell className="font-medium">{depense.type}</TableCell>
                                <TableCell>
                                  {depense.devise} {depense.montant_ht.toLocaleString()}
                                </TableCell>
                                <TableCell>{depense.taux_tva}%</TableCell>
                                <TableCell className="font-semibold">
                                  {depense.devise} {depense.montant_ttc.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {depense.fichier_url ? (
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {depense.paye ? (
                                    <Badge className="bg-green-500">
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Payé
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-orange-600">
                                      <Clock className="mr-1 h-3 w-3" />
                                      Non payé
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {new Date(depense.created_at).toLocaleDateString("fr-FR")}
                                  {depense.date_reglement && (
                                    <div className="text-xs text-green-600">
                                      Payé le {new Date(depense.date_reglement).toLocaleDateString("fr-FR")}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {!depense.paye && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => marquerPayee(depense.id)}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => supprimerDepense(depense.id)}
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
                </TabsContent>

                {/* Onglet Déchargements */}
                <TabsContent value="dechargements" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Suivi des déchargements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewingCommande.dechargements.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Aucun déchargement effectué pour cette commande</p>
                          <p className="text-sm">Les déchargements apparaîtront ici automatiquement</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {viewingCommande.dechargements.map((dechargement, index) => (
                            <Card key={dechargement.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                                    {dechargement.mode === "camion" ? (
                                      <Truck className="h-5 w-5 text-blue-600" />
                                    ) : (
                                      <Warehouse className="h-5 w-5 text-green-600" />
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold">Déchargement #{index + 1}</h4>
                                      <Badge
                                        className={dechargement.mode === "camion" ? "bg-blue-500" : "bg-green-500"}
                                      >
                                        {dechargement.mode === "camion" ? "Sur camion" : "En magasin"}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-600">Quantité:</span>
                                        <span className="font-semibold ml-2">{dechargement.quantite}T</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Date:</span>
                                        <span className="ml-2">
                                          {new Date(dechargement.date).toLocaleDateString("fr-FR")}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-gray-600">Détails:</span>
                                      <span className="ml-2">{dechargement.details}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {dechargement.bl_url && (
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}

                          {/* Résumé des déchargements */}
                          <Card className="bg-blue-50">
                            <CardContent className="pt-6">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-2xl font-bold text-blue-600">
                                    {viewingCommande.dechargements.reduce((sum, d) => sum + d.quantite, 0)}T
                                  </div>
                                  <div className="text-sm text-gray-600">Total déchargé</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-green-600">
                                    {viewingCommande.dechargements.length}
                                  </div>
                                  <div className="text-sm text-gray-600">Opérations</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-orange-600">
                                    {(viewingCommande.qte_cmd - viewingCommande.qte_livree).toFixed(1)}T
                                  </div>
                                  <div className="text-sm text-gray-600">Reste à décharger</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Historique */}
                <TabsContent value="historique" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Historique de la commande
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Timeline des événements */}
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                          {/* Création de la commande */}
                          <div className="relative flex items-start gap-4 pb-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 border-2 border-white">
                              <Plus className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">Commande créée</h4>
                                <Badge variant="outline">Système</Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                Commande {viewingCommande.code_alpha_num} créée pour {viewingCommande.qte_cmd}T de{" "}
                                {viewingCommande.marchandise_name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(viewingCommande.created_at).toLocaleString("fr-FR")}
                              </p>
                            </div>
                          </div>

                          {/* Dépenses ajoutées */}
                          {viewingCommande.depenses.map((depense) => (
                            <div key={depense.id} className="relative flex items-start gap-4 pb-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 border-2 border-white">
                                <DollarSign className="h-4 w-4 text-red-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">Dépense ajoutée</h4>
                                  <Badge variant="outline">Finance</Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {depense.type} - {depense.devise} {depense.montant_ttc.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(depense.created_at).toLocaleString("fr-FR")}
                                </p>
                              </div>
                            </div>
                          ))}

                          {/* Déchargements */}
                          {viewingCommande.dechargements.map((dechargement) => (
                            <div key={dechargement.id} className="relative flex items-start gap-4 pb-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 border-2 border-white">
                                {dechargement.mode === "camion" ? (
                                  <Truck className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Warehouse className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">Déchargement effectué</h4>
                                  <Badge variant="outline">Port</Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {dechargement.quantite}T déchargées - {dechargement.details}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(dechargement.date).toLocaleString("fr-FR")}
                                </p>
                              </div>
                            </div>
                          ))}

                          {/* Clôture si applicable */}
                          {viewingCommande.closed_at && (
                            <div className="relative flex items-start gap-4 pb-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 border-2 border-white">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">Commande bouclée</h4>
                                  <Badge className="bg-green-500">Terminé</Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Commande finalisée - Toutes les quantités ont été livrées
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(viewingCommande.closed_at).toLocaleString("fr-FR")}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              // Formulaire de création (simplifié)
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
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, qte_cmd: Number.parseFloat(e.target.value) }))
                        }
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
                    <AlertTriangle className="h-4 w-4" />
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
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages de succès */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques étendues */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
            <CardTitle className="text-sm font-medium">Montant Commandes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{montantTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Réel Total</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{coutReelTotal.toLocaleString()}</div>
            <div className="text-xs text-gray-500">+€{totalDepenses.toLocaleString()} dépenses</div>
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
                  <TableHead>Montant Initial</TableHead>
                  <TableHead>Dépenses</TableHead>
                  <TableHead>Coût Réel</TableHead>
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
                      {commande.total_depenses_ttc > 0 ? (
                        <div className="text-red-600 font-medium">
                          +{commande.devise} {commande.total_depenses_ttc.toLocaleString()}
                          <div className="text-xs text-gray-500">{commande.depenses.length} dépense(s)</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      {commande.devise} {commande.cout_reel_total.toLocaleString()}
                      {commande.total_depenses_ttc > 0 && (
                        <div className="text-xs text-red-500">
                          +{((commande.total_depenses_ttc / commande.montant_ttc) * 100).toFixed(1)}%
                        </div>
                      )}
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
                        <Button variant="outline" size="sm" onClick={() => handleView(commande)}>
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
