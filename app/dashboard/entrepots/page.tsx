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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  Eye,
  Upload,
  Download,
  QrCode,
  Users,
  FileText,
  DollarSign,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle,
  Clock,
  Camera,
  Zap,
  Shield,
  Wrench,
} from "lucide-react"

interface StockItem {
  marchandise_id: string
  marchandise_name: string
  qte_disponible: number
  qte_reservee: number
  qte_reelle: number
  seuil_minimum: number
  emplacement: string
  derniere_maj: string
}

interface Mouvement {
  id: string
  type: "entree" | "sortie" | "transfert" | "ajustement" | "inventaire"
  marchandise_name: string
  quantite: number
  source?: string
  destination?: string
  responsable: string
  date: string
  commentaire: string
  bl_reference?: string
}

interface Charge {
  id: string
  type: string
  description: string
  montant: number
  devise: string
  periode: string
  fichier_url?: string
  date_echeance: string
  paye: boolean
  created_at: string
}

interface Entrepot {
  id: string
  name: string
  location: string
  adresse_gps: string
  max_capacity_t: number
  current_stock: number
  responsable_id?: string
  responsable_name: string
  zones_internes: string[]
  photo_url?: string
  plan_pdf?: string
  stock_items: StockItem[]
  mouvements: Mouvement[]
  charges: Charge[]
  alertes_actives: number
  created_at: string
}

const typesMouvement = {
  entree: { label: "Entrée", color: "bg-green-500", icon: ArrowUp },
  sortie: { label: "Sortie", color: "bg-red-500", icon: ArrowDown },
  transfert: { label: "Transfert", color: "bg-blue-500", icon: RotateCcw },
  ajustement: { label: "Ajustement", color: "bg-orange-500", icon: Edit },
  inventaire: { label: "Inventaire", color: "bg-purple-500", icon: Package },
}

const typesCharge = ["Loyer", "Électricité", "Sécurité", "Manutention", "Assurance", "Maintenance", "Autres"]

export default function EntrepotsPage() {
  const [entrepots, setEntrepots] = useState<Entrepot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingEntrepot, setViewingEntrepot] = useState<Entrepot | null>(null)
  const [editingEntrepot, setEditingEntrepot] = useState<Entrepot | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  // États pour les opérations
  const [nouvelleOperation, setNouvelleOperation] = useState({
    type: "",
    marchandise_id: "",
    quantite: 0,
    source: "",
    destination: "",
    commentaire: "",
  })

  // États pour les charges
  const [nouvelleCharge, setNouvelleCharge] = useState({
    type: "",
    description: "",
    montant: 0,
    devise: "EUR",
    periode: "mensuel",
    date_echeance: "",
  })

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    adresse_gps: "",
    max_capacity_t: 1000,
    responsable_name: "",
    zones_internes: "",
  })

  // Données de démonstration complètes
  const demoEntrepots: Entrepot[] = [
    {
      id: "1",
      name: "Entrepôt Central Ouagadougou",
      location: "Zone Industrielle, Ouagadougou",
      adresse_gps: "12.3714° N, 1.5197° W",
      max_capacity_t: 800,
      current_stock: 650,
      responsable_name: "Ibrahim Sawadogo",
      zones_internes: ["Zone A - Rack 1-10", "Zone B - Rack 11-20", "Zone C - Vrac"],
      photo_url: "/images/entrepot-ouaga.jpg",
      plan_pdf: "/documents/plan-entrepot-ouaga.pdf",
      alertes_actives: 2,
      stock_items: [
        {
          marchandise_id: "1",
          marchandise_name: "Blé dur",
          qte_disponible: 350,
          qte_reservee: 50,
          qte_reelle: 400,
          seuil_minimum: 100,
          emplacement: "Zone A - Rack 1-5",
          derniere_maj: "2025-01-26T14:30:00Z",
        },
        {
          marchandise_id: "2",
          marchandise_name: "Riz parfumé",
          qte_disponible: 200,
          qte_reservee: 30,
          qte_reelle: 230,
          seuil_minimum: 80,
          emplacement: "Zone B - Rack 11-15",
          derniere_maj: "2025-01-26T10:15:00Z",
        },
        {
          marchandise_id: "3",
          marchandise_name: "Huile de palme",
          qte_disponible: 15,
          qte_reservee: 5,
          qte_reelle: 20,
          seuil_minimum: 50,
          emplacement: "Zone C - Citerne 1",
          derniere_maj: "2025-01-25T16:45:00Z",
        },
      ],
      mouvements: [
        {
          id: "m1",
          type: "entree",
          marchandise_name: "Blé dur",
          quantite: 150,
          source: "Transport TR-2025-001",
          responsable: "Ibrahim Sawadogo",
          date: "2025-01-26T09:30:00Z",
          commentaire: "Livraison depuis port de Tema",
          bl_reference: "BL-TR-001",
        },
        {
          id: "m2",
          type: "sortie",
          marchandise_name: "Riz parfumé",
          quantite: 80,
          destination: "Client CLI-001",
          responsable: "Fatou Traoré",
          date: "2025-01-25T14:20:00Z",
          commentaire: "Vente directe",
        },
        {
          id: "m3",
          type: "ajustement",
          marchandise_name: "Huile de palme",
          quantite: -5,
          responsable: "Ibrahim Sawadogo",
          date: "2025-01-24T11:00:00Z",
          commentaire: "Correction après inventaire",
        },
      ],
      charges: [
        {
          id: "c1",
          type: "Loyer",
          description: "Loyer mensuel entrepôt",
          montant: 2500,
          devise: "EUR",
          periode: "mensuel",
          date_echeance: "2025-02-01T00:00:00Z",
          paye: false,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "c2",
          type: "Électricité",
          description: "Facture électricité janvier",
          montant: 450,
          devise: "EUR",
          periode: "mensuel",
          fichier_url: "/documents/facture-elec-jan.pdf",
          date_echeance: "2025-01-31T00:00:00Z",
          paye: true,
          created_at: "2025-01-15T00:00:00Z",
        },
      ],
      created_at: "2025-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "Entrepôt Bobo-Dioulasso",
      location: "Secteur 25, Bobo-Dioulasso",
      adresse_gps: "11.1775° N, 4.2975° W",
      max_capacity_t: 600,
      current_stock: 520,
      responsable_name: "Fatou Traoré",
      zones_internes: ["Zone A - Rack 1-8", "Zone B - Sol"],
      alertes_actives: 1,
      stock_items: [
        {
          marchandise_id: "1",
          marchandise_name: "Blé dur",
          qte_disponible: 280,
          qte_reservee: 20,
          qte_reelle: 300,
          seuil_minimum: 100,
          emplacement: "Zone A - Rack 1-6",
          derniere_maj: "2025-01-25T12:00:00Z",
        },
        {
          marchandise_id: "2",
          marchandise_name: "Riz parfumé",
          qte_disponible: 200,
          qte_reservee: 20,
          qte_reelle: 220,
          seuil_minimum: 80,
          emplacement: "Zone B - Sol",
          derniere_maj: "2025-01-24T15:30:00Z",
        },
      ],
      mouvements: [
        {
          id: "m4",
          type: "entree",
          marchandise_name: "Riz parfumé",
          quantite: 220,
          source: "Transport TR-2025-002",
          responsable: "Fatou Traoré",
          date: "2025-01-24T16:00:00Z",
          commentaire: "Livraison depuis port de Lomé",
          bl_reference: "BL-TR-002",
        },
      ],
      charges: [
        {
          id: "c3",
          type: "Sécurité",
          description: "Service de gardiennage",
          montant: 800,
          devise: "EUR",
          periode: "mensuel",
          date_echeance: "2025-02-01T00:00:00Z",
          paye: false,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
      created_at: "2025-01-01T00:00:00Z",
    },
  ]

  useEffect(() => {
    setEntrepots(demoEntrepots)
    setLoading(false)
  }, [])

  // Filtrer les entrepôts
  const filteredEntrepots = entrepots.filter(
    (entrepot) =>
      entrepot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrepot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrepot.responsable_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculer les statistiques globales
  const totalEntrepots = entrepots.length
  const capaciteTotale = entrepots.reduce((sum, e) => sum + e.max_capacity_t, 0)
  const stockTotal = entrepots.reduce((sum, e) => sum + e.current_stock, 0)
  const tauxOccupation = Math.round((stockTotal / capaciteTotale) * 100)
  const alertesTotales = entrepots.reduce((sum, e) => sum + e.alertes_actives, 0)

  // Ajouter une opération de stock
  const ajouterOperation = async () => {
    if (
      !viewingEntrepot ||
      !nouvelleOperation.type ||
      !nouvelleOperation.marchandise_id ||
      nouvelleOperation.quantite === 0
    ) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const nouvelleOperationComplete: Mouvement = {
        id: Date.now().toString(),
        type: nouvelleOperation.type as any,
        marchandise_name: "Marchandise sélectionnée",
        quantite: nouvelleOperation.quantite,
        source: nouvelleOperation.source,
        destination: nouvelleOperation.destination,
        responsable: viewingEntrepot.responsable_name,
        date: new Date().toISOString(),
        commentaire: nouvelleOperation.commentaire,
      }

      setEntrepots((prev) =>
        prev.map((e) => {
          if (e.id === viewingEntrepot.id) {
            return {
              ...e,
              mouvements: [nouvelleOperationComplete, ...e.mouvements],
              current_stock:
                e.current_stock +
                (nouvelleOperation.type === "entree" ? nouvelleOperation.quantite : -nouvelleOperation.quantite),
            }
          }
          return e
        }),
      )

      setViewingEntrepot((prev) => {
        if (prev) {
          return {
            ...prev,
            mouvements: [nouvelleOperationComplete, ...prev.mouvements],
            current_stock:
              prev.current_stock +
              (nouvelleOperation.type === "entree" ? nouvelleOperation.quantite : -nouvelleOperation.quantite),
          }
        }
        return prev
      })

      setNouvelleOperation({
        type: "",
        marchandise_id: "",
        quantite: 0,
        source: "",
        destination: "",
        commentaire: "",
      })

      setSuccess("Opération enregistrée avec succès")
      setError("")
    } catch (err) {
      console.error("Error adding operation:", err)
      setError("Erreur lors de l'ajout de l'opération")
    }
  }

  // Ajouter une charge
  const ajouterCharge = async () => {
    if (!viewingEntrepot || !nouvelleCharge.type || nouvelleCharge.montant <= 0) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const nouvelleChargeComplete: Charge = {
        id: Date.now().toString(),
        type: nouvelleCharge.type,
        description: nouvelleCharge.description,
        montant: nouvelleCharge.montant,
        devise: nouvelleCharge.devise,
        periode: nouvelleCharge.periode,
        date_echeance: nouvelleCharge.date_echeance,
        paye: false,
        created_at: new Date().toISOString(),
      }

      setEntrepots((prev) =>
        prev.map((e) => {
          if (e.id === viewingEntrepot.id) {
            return {
              ...e,
              charges: [nouvelleChargeComplete, ...e.charges],
            }
          }
          return e
        }),
      )

      setViewingEntrepot((prev) => {
        if (prev) {
          return {
            ...prev,
            charges: [nouvelleChargeComplete, ...prev.charges],
          }
        }
        return prev
      })

      setNouvelleCharge({
        type: "",
        description: "",
        montant: 0,
        devise: "EUR",
        periode: "mensuel",
        date_echeance: "",
      })

      setSuccess("Charge ajoutée avec succès")
      setError("")
    } catch (err) {
      console.error("Error adding charge:", err)
      setError("Erreur lors de l'ajout de la charge")
    }
  }

  // Marquer une charge comme payée
  const marquerChargePayee = async (chargeId: string) => {
    if (!viewingEntrepot) return

    try {
      setEntrepots((prev) =>
        prev.map((e) => {
          if (e.id === viewingEntrepot.id) {
            return {
              ...e,
              charges: e.charges.map((c) => (c.id === chargeId ? { ...c, paye: true } : c)),
            }
          }
          return e
        }),
      )

      setViewingEntrepot((prev) => {
        if (prev) {
          return {
            ...prev,
            charges: prev.charges.map((c) => (c.id === chargeId ? { ...c, paye: true } : c)),
          }
        }
        return prev
      })

      setSuccess("Charge marquée comme payée")
    } catch (err) {
      console.error("Error marking charge as paid:", err)
      setError("Erreur lors de la mise à jour")
    }
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
        adresse_gps: formData.adresse_gps,
        max_capacity_t: formData.max_capacity_t,
        current_stock: 0,
        responsable_name: formData.responsable_name,
        zones_internes: formData.zones_internes.split(",").map((z) => z.trim()),
        stock_items: [],
        mouvements: [],
        charges: [],
        alertes_actives: 0,
        created_at: new Date().toISOString(),
      }

      if (editingEntrepot) {
        setEntrepots((prev) =>
          prev.map((e) =>
            e.id === editingEntrepot.id
              ? {
                  ...e,
                  name: formData.name,
                  location: formData.location,
                  adresse_gps: formData.adresse_gps,
                  max_capacity_t: formData.max_capacity_t,
                  responsable_name: formData.responsable_name,
                  zones_internes: formData.zones_internes.split(",").map((z) => z.trim()),
                }
              : e,
          ),
        )
        setSuccess("Entrepôt mis à jour avec succès")
      } else {
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet entrepôt ?")) {
      try {
        setEntrepots((prev) => prev.filter((e) => e.id !== id))
        setSuccess("Entrepôt supprimé avec succès")
      } catch (err) {
        console.error("Error deleting entrepot:", err)
        setError("Erreur lors de la suppression")
      }
    }
  }

  // Ouvrir le dialog pour édition
  const handleEdit = (entrepot: Entrepot) => {
    setEditingEntrepot(entrepot)
    setFormData({
      name: entrepot.name,
      location: entrepot.location,
      adresse_gps: entrepot.adresse_gps,
      max_capacity_t: entrepot.max_capacity_t,
      responsable_name: entrepot.responsable_name,
      zones_internes: entrepot.zones_internes.join(", "),
    })
    setIsDialogOpen(true)
  }

  // Voir les détails
  const handleView = (entrepot: Entrepot) => {
    setViewingEntrepot(entrepot)
    setActiveTab("details")
    setIsDialogOpen(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEntrepot(null)
    setViewingEntrepot(null)
    setFormData({
      name: "",
      location: "",
      adresse_gps: "",
      max_capacity_t: 1000,
      responsable_name: "",
      zones_internes: "",
    })
    setError("")
    setSuccess("")
  }

  // Calculer le pourcentage d'occupation
  const getOccupancyPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100)
  }

  // Vérifier si le stock est en alerte
  const isStockAlert = (item: StockItem) => {
    return item.qte_disponible <= item.seuil_minimum
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Warehouse className="h-8 w-8 text-[#0F4C75]" />
            Entrepôts
          </h1>
          <p className="text-gray-600">Gestion complète des entrepôts et stocks</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel entrepôt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingEntrepot
                  ? `Entrepôt ${viewingEntrepot.name}`
                  : editingEntrepot
                    ? "Modifier l'entrepôt"
                    : "Nouvel entrepôt"}
              </DialogTitle>
              <DialogDescription>
                {viewingEntrepot
                  ? "Gestion complète de l'entrepôt"
                  : editingEntrepot
                    ? "Modifiez les informations de l'entrepôt"
                    : "Créez un nouvel entrepôt"}
              </DialogDescription>
            </DialogHeader>

            {viewingEntrepot ? (
              // Vue détaillée avec onglets complets
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="stock">
                    Stock
                    {viewingEntrepot.alertes_actives > 0 && (
                      <Badge className="ml-2 bg-red-500">{viewingEntrepot.alertes_actives}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="operations">
                    Opérations
                    <Badge className="ml-2 bg-blue-500">{viewingEntrepot.mouvements.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="charges">
                    Charges
                    <Badge className="ml-2 bg-orange-500">{viewingEntrepot.charges.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="plan">Plan</TabsTrigger>
                  <TabsTrigger value="alertes">
                    Alertes
                    {viewingEntrepot.alertes_actives > 0 && (
                      <Badge className="ml-2 bg-red-500">{viewingEntrepot.alertes_actives}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Onglet Détails */}
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Warehouse className="h-5 w-5" />
                          Informations générales
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Nom</Label>
                            <p className="font-semibold">{viewingEntrepot.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Responsable</Label>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-semibold">{viewingEntrepot.responsable_name}</span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-sm font-medium text-gray-500">Localisation</Label>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{viewingEntrepot.location}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">GPS: {viewingEntrepot.adresse_gps}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Camera className="mr-2 h-4 w-4" />
                            Photos
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Plan PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <MapPin className="mr-2 h-4 w-4" />
                            Voir sur carte
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Capacité et occupation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Capacité maximale:</span>
                            <span className="font-semibold">{viewingEntrepot.max_capacity_t}T</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Stock actuel:</span>
                            <span className="font-semibold">{viewingEntrepot.current_stock}T</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Espace disponible:</span>
                            <span className="font-semibold text-green-600">
                              {viewingEntrepot.max_capacity_t - viewingEntrepot.current_stock}T
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Taux d'occupation</span>
                            <span className="font-semibold">
                              {getOccupancyPercentage(viewingEntrepot.current_stock, viewingEntrepot.max_capacity_t)}%
                            </span>
                          </div>
                          <Progress
                            value={getOccupancyPercentage(
                              viewingEntrepot.current_stock,
                              viewingEntrepot.max_capacity_t,
                            )}
                            className="h-3"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Zones internes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {viewingEntrepot.zones_internes.map((zone, index) => (
                          <Card key={index} className="p-4 bg-gray-50">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{zone}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Stock */}
                <TabsContent value="stock" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Stock temps réel</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <QrCode className="mr-2 h-4 w-4" />
                        Inventaire
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="pt-6">
                      {viewingEntrepot.stock_items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Aucun stock dans cet entrepôt</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Marchandise</TableHead>
                              <TableHead>Disponible</TableHead>
                              <TableHead>Réservée</TableHead>
                              <TableHead>Réelle</TableHead>
                              <TableHead>Seuil Min</TableHead>
                              <TableHead>Emplacement</TableHead>
                              <TableHead>Dernière MAJ</TableHead>
                              <TableHead>Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewingEntrepot.stock_items.map((item) => (
                              <TableRow key={item.marchandise_id} className={isStockAlert(item) ? "bg-red-50" : ""}>
                                <TableCell className="font-medium">{item.marchandise_name}</TableCell>
                                <TableCell>{item.qte_disponible}T</TableCell>
                                <TableCell>{item.qte_reservee}T</TableCell>
                                <TableCell className="font-semibold">{item.qte_reelle}T</TableCell>
                                <TableCell>{item.seuil_minimum}T</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm">{item.emplacement}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{new Date(item.derniere_maj).toLocaleDateString("fr-FR")}</TableCell>
                                <TableCell>
                                  {isStockAlert(item) ? (
                                    <Badge className="bg-red-500">
                                      <AlertTriangle className="mr-1 h-3 w-3" />
                                      Alerte
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-green-500">Normal</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Opérations */}
                <TabsContent value="operations" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulaire nouvelle opération */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Nouvelle opération
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Type d'opération *</Label>
                          <Select
                            value={nouvelleOperation.type}
                            onValueChange={(value) => setNouvelleOperation((prev) => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(typesMouvement).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <config.icon className="h-4 w-4" />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Marchandise *</Label>
                          <Select
                            value={nouvelleOperation.marchandise_id}
                            onValueChange={(value) =>
                              setNouvelleOperation((prev) => ({ ...prev, marchandise_id: value }))
                            }
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
                          <Label>Quantité (T) *</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={nouvelleOperation.quantite || ""}
                            onChange={(e) =>
                              setNouvelleOperation((prev) => ({
                                ...prev,
                                quantite: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder="150.000"
                          />
                        </div>
                        {(nouvelleOperation.type === "entree" || nouvelleOperation.type === "transfert") && (
                          <div className="space-y-2">
                            <Label>Source</Label>
                            <Input
                              value={nouvelleOperation.source}
                              onChange={(e) => setNouvelleOperation((prev) => ({ ...prev, source: e.target.value }))}
                              placeholder="Transport TR-2025-001"
                            />
                          </div>
                        )}
                        {(nouvelleOperation.type === "sortie" || nouvelleOperation.type === "transfert") && (
                          <div className="space-y-2">
                            <Label>Destination</Label>
                            <Input
                              value={nouvelleOperation.destination}
                              onChange={(e) =>
                                setNouvelleOperation((prev) => ({ ...prev, destination: e.target.value }))
                              }
                              placeholder="Client CLI-001"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Commentaire</Label>
                          <Textarea
                            value={nouvelleOperation.commentaire}
                            onChange={(e) => setNouvelleOperation((prev) => ({ ...prev, commentaire: e.target.value }))}
                            placeholder="Remarques particulières..."
                            rows={3}
                          />
                        </div>
                        <Button onClick={ajouterOperation} className="w-full bg-blue-600 hover:bg-blue-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Enregistrer l'opération
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Résumé des mouvements */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Résumé des mouvements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(typesMouvement).map(([key, config]) => {
                            const count = viewingEntrepot.mouvements.filter((m) => m.type === key).length
                            return (
                              <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`p-2 rounded-full ${config.color}`}>
                                  <config.icon className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold">{count}</div>
                                  <div className="text-sm text-gray-600">{config.label}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Historique des mouvements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Historique des mouvements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewingEntrepot.mouvements.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Aucun mouvement enregistré</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Marchandise</TableHead>
                              <TableHead>Quantité</TableHead>
                              <TableHead>Source/Destination</TableHead>
                              <TableHead>Responsable</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Commentaire</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewingEntrepot.mouvements.map((mouvement) => {
                              const config = typesMouvement[mouvement.type]
                              return (
                                <TableRow key={mouvement.id}>
                                  <TableCell>
                                    <Badge className={config.color}>
                                      <config.icon className="mr-1 h-3 w-3" />
                                      {config.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-medium">{mouvement.marchandise_name}</TableCell>
                                  <TableCell>
                                    <span className={mouvement.type === "sortie" ? "text-red-600" : "text-green-600"}>
                                      {mouvement.type === "sortie" ? "-" : "+"}
                                      {mouvement.quantite}T
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {mouvement.source && (
                                      <div className="text-sm">
                                        <span className="text-gray-500">De:</span> {mouvement.source}
                                      </div>
                                    )}
                                    {mouvement.destination && (
                                      <div className="text-sm">
                                        <span className="text-gray-500">Vers:</span> {mouvement.destination}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3 text-gray-400" />
                                      <span className="text-sm">{mouvement.responsable}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{new Date(mouvement.date).toLocaleDateString("fr-FR")}</TableCell>
                                  <TableCell className="max-w-[200px] truncate">{mouvement.commentaire}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Charges */}
                <TabsContent value="charges" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulaire nouvelle charge */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Nouvelle charge
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Type de charge *</Label>
                          <Select
                            value={nouvelleCharge.type}
                            onValueChange={(value) => setNouvelleCharge((prev) => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                              {typesCharge.map((type) => (
                                <SelectItem key={type} value={type}>
                                  <div className="flex items-center gap-2">
                                    {type === "Loyer" && <Warehouse className="h-4 w-4" />}
                                    {type === "Électricité" && <Zap className="h-4 w-4" />}
                                    {type === "Sécurité" && <Shield className="h-4 w-4" />}
                                    {type === "Maintenance" && <Wrench className="h-4 w-4" />}
                                    {!["Loyer", "Électricité", "Sécurité", "Maintenance"].includes(type) && (
                                      <DollarSign className="h-4 w-4" />
                                    )}
                                    {type}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Description *</Label>
                          <Input
                            value={nouvelleCharge.description}
                            onChange={(e) => setNouvelleCharge((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Description de la charge"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Montant *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={nouvelleCharge.montant || ""}
                              onChange={(e) =>
                                setNouvelleCharge((prev) => ({
                                  ...prev,
                                  montant: Number.parseFloat(e.target.value) || 0,
                                }))
                              }
                              placeholder="2500.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Devise</Label>
                            <Select
                              value={nouvelleCharge.devise}
                              onValueChange={(value) => setNouvelleCharge((prev) => ({ ...prev, devise: value }))}
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
                          <Label>Période</Label>
                          <Select
                            value={nouvelleCharge.periode}
                            onValueChange={(value) => setNouvelleCharge((prev) => ({ ...prev, periode: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mensuel">Mensuel</SelectItem>
                              <SelectItem value="trimestriel">Trimestriel</SelectItem>
                              <SelectItem value="annuel">Annuel</SelectItem>
                              <SelectItem value="ponctuel">Ponctuel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Date d'échéance</Label>
                          <Input
                            type="date"
                            value={nouvelleCharge.date_echeance}
                            onChange={(e) => setNouvelleCharge((prev) => ({ ...prev, date_echeance: e.target.value }))}
                          />
                        </div>
                        <Button onClick={ajouterCharge} className="w-full bg-orange-600 hover:bg-orange-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter la charge
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Résumé des charges */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Résumé des charges</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total charges:</span>
                            <span className="font-semibold">
                              EUR {viewingEntrepot.charges.reduce((sum, c) => sum + c.montant, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Charges payées:</span>
                            <span className="font-semibold text-green-600">
                              EUR{" "}
                              {viewingEntrepot.charges
                                .filter((c) => c.paye)
                                .reduce((sum, c) => sum + c.montant, 0)
                                .toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Charges impayées:</span>
                            <span className="font-semibold text-red-600">
                              EUR{" "}
                              {viewingEntrepot.charges
                                .filter((c) => !c.paye)
                                .reduce((sum, c) => sum + c.montant, 0)
                                .toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {viewingEntrepot.charges.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Répartition par type:</Label>
                            {Object.entries(
                              viewingEntrepot.charges.reduce(
                                (acc, charge) => {
                                  acc[charge.type] = (acc[charge.type] || 0) + charge.montant
                                  return acc
                                },
                                {} as Record<string, number>,
                              ),
                            ).map(([type, montant]) => (
                              <div key={type} className="flex justify-between text-sm">
                                <span>{type}:</span>
                                <span className="font-medium">EUR {montant.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Liste des charges */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Liste des charges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewingEntrepot.charges.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Aucune charge enregistrée pour cet entrepôt
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Montant</TableHead>
                              <TableHead>Période</TableHead>
                              <TableHead>Échéance</TableHead>
                              <TableHead>Fichier</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewingEntrepot.charges.map((charge) => (
                              <TableRow key={charge.id}>
                                <TableCell className="font-medium">{charge.type}</TableCell>
                                <TableCell>{charge.description}</TableCell>
                                <TableCell>
                                  {charge.devise} {charge.montant.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{charge.periode}</Badge>
                                </TableCell>
                                <TableCell>{new Date(charge.date_echeance).toLocaleDateString("fr-FR")}</TableCell>
                                <TableCell>
                                  {charge.fichier_url ? (
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {charge.paye ? (
                                    <Badge className="bg-green-500">
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Payé
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-red-600">
                                      <Clock className="mr-1 h-3 w-3" />
                                      Impayé
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {!charge.paye && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => marquerChargePayee(charge.id)}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    )}
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
                </TabsContent>

                {/* Onglet Plan */}
                <TabsContent value="plan" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Plan de l'entrepôt</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-16 text-gray-500">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">Plan 2D simplifié</p>
                        <p className="mb-4">Visualisation interactive des zones et emplacements</p>
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Télécharger plan
                          </Button>
                          <Button variant="outline">
                            <Camera className="mr-2 h-4 w-4" />
                            Prendre photo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Alertes */}
                <TabsContent value="alertes" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Alertes stock
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewingEntrepot.stock_items.filter(isStockAlert).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                          <p className="text-lg font-medium mb-2">Aucune alerte active</p>
                          <p>Tous les stocks sont au-dessus des seuils minimums</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {viewingEntrepot.stock_items.filter(isStockAlert).map((item) => (
                            <Alert key={item.marchandise_id} variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="font-semibold">{item.marchandise_name}</span> - Stock faible
                                    <div className="text-sm mt-1">
                                      Disponible: {item.qte_disponible}T / Seuil minimum: {item.seuil_minimum}T
                                    </div>
                                  </div>
                                  <Button size="sm" variant="outline">
                                    Réapprovisionner
                                  </Button>
                                </div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              // Formulaire de création/édition (simplifié)
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de l'entrepôt *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Entrepôt Central Ouagadougou"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsable">Responsable *</Label>
                      <Input
                        id="responsable"
                        value={formData.responsable_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, responsable_name: e.target.value }))}
                        placeholder="Ibrahim Sawadogo"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Zone Industrielle, Ouagadougou"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gps">Adresse GPS</Label>
                      <Input
                        id="gps"
                        value={formData.adresse_gps}
                        onChange={(e) => setFormData((prev) => ({ ...prev, adresse_gps: e.target.value }))}
                        placeholder="12.3714° N, 1.5197° W"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacité max (T) *</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="zones">Zones internes (séparées par des virgules)</Label>
                    <Textarea
                      id="zones"
                      value={formData.zones_internes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, zones_internes: e.target.value }))}
                      placeholder="Zone A - Rack 1-10, Zone B - Rack 11-20, Zone C - Vrac"
                      rows={3}
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

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entrepôts</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntrepots}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacité Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capaciteTotale.toLocaleString()}T</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockTotal.toLocaleString()}T</div>
            <div className="text-xs text-gray-500">{tauxOccupation}% d'occupation</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertesTotales}</div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Chargement...</div>
        ) : filteredEntrepots.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {searchTerm ? "Aucun entrepôt ne correspond à votre recherche" : "Aucun entrepôt enregistré"}
          </div>
        ) : (
          filteredEntrepots.map((entrepot) => (
            <Card key={entrepot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{entrepot.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {entrepot.location}
                    </CardDescription>
                  </div>
                  {entrepot.alertes_actives > 0 && (
                    <Badge className="bg-red-500">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {entrepot.alertes_actives}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{entrepot.responsable_name}</span>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Occupation</span>
                    <span className="font-semibold">
                      {entrepot.current_stock}T / {entrepot.max_capacity_t}T
                    </span>
                  </div>
                  <Progress
                    value={getOccupancyPercentage(entrepot.current_stock, entrepot.max_capacity_t)}
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {getOccupancyPercentage(entrepot.current_stock, entrepot.max_capacity_t)}% occupé
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-blue-600">{entrepot.stock_items.length}</div>
                    <div className="text-xs text-gray-600">Produits</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-green-600">{entrepot.mouvements.length}</div>
                    <div className="text-xs text-gray-600">Mouvements</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-orange-600">{entrepot.charges.length}</div>
                    <div className="text-xs text-gray-600">Charges</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(entrepot)} className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir
                  </Button>
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
