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
import { Progress } from "@/components/ui/progress"
import {
  Truck,
  Plus,
  Search,
  Edit,
  Eye,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Phone,
  User,
} from "lucide-react"

interface Transport {
  id: string
  numero_transport: string
  chauffeur_nom: string
  chauffeur_telephone: string
  numero_camion: string
  type_camion: string
  marchandise_id: string
  marchandise_name: string
  quantite: number
  origine: string
  destination: string
  date_depart: string
  date_arrivee_prevue: string
  date_arrivee_reelle?: string
  status: "planifie" | "en_route" | "arrive" | "livre" | "retard"
  position_actuelle: string
  distance_parcourue: number
  distance_totale: number
  observations: string
  created_at: string
}

const statusLabels = {
  planifie: "Planifié",
  en_route: "En route",
  arrive: "Arrivé",
  livre: "Livré",
  retard: "En retard",
}

const statusColors = {
  planifie: "#9E9E9E",
  en_route: "#2196F3",
  arrive: "#FF9800",
  livre: "#4CAF50",
  retard: "#F44336",
}

const typesCamion = [
  "Semi-remorque 40T",
  "Camion benne 20T",
  "Camion citerne 30T",
  "Camion frigorifique 25T",
  "Camion plateau 15T",
]

export default function TransportPage() {
  const [transports, setTransports] = useState<Transport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingTransport, setViewingTransport] = useState<Transport | null>(null)
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    chauffeur_nom: "",
    chauffeur_telephone: "",
    numero_camion: "",
    type_camion: "",
    marchandise_id: "",
    quantite: 0,
    origine: "",
    destination: "",
    date_depart: "",
    date_arrivee_prevue: "",
    observations: "",
  })

  // Données de démonstration
  const demoTransports: Transport[] = [
    {
      id: "1",
      numero_transport: "TR-2025-001",
      chauffeur_nom: "Amadou Diallo",
      chauffeur_telephone: "+226 70 12 34 56",
      numero_camion: "BF-001-ABC",
      type_camion: "Semi-remorque 40T",
      marchandise_id: "1",
      marchandise_name: "Blé dur",
      quantite: 35,
      origine: "Port de Tema (Ghana)",
      destination: "Entrepôt Ouagadougou",
      date_depart: "2025-01-25T06:00:00Z",
      date_arrivee_prevue: "2025-01-26T18:00:00Z",
      status: "en_route",
      position_actuelle: "Pô, Burkina Faso",
      distance_parcourue: 180,
      distance_totale: 320,
      observations: "Transport en cours, conditions normales",
      created_at: "2025-01-24T14:00:00Z",
    },
    {
      id: "2",
      numero_transport: "TR-2025-002",
      chauffeur_nom: "Salif Ouédraogo",
      chauffeur_telephone: "+226 70 23 45 67",
      numero_camion: "BF-002-DEF",
      type_camion: "Camion benne 20T",
      marchandise_id: "2",
      marchandise_name: "Riz parfumé",
      quantite: 18,
      origine: "Port de Lomé (Togo)",
      destination: "Entrepôt Bobo-Dioulasso",
      date_depart: "2025-01-24T08:00:00Z",
      date_arrivee_prevue: "2025-01-25T16:00:00Z",
      date_arrivee_reelle: "2025-01-25T15:30:00Z",
      status: "livre",
      position_actuelle: "Entrepôt Bobo-Dioulasso",
      distance_parcourue: 450,
      distance_totale: 450,
      observations: "Livraison effectuée avec succès",
      created_at: "2025-01-23T10:00:00Z",
    },
    {
      id: "3",
      numero_transport: "TR-2025-003",
      chauffeur_nom: "Ibrahim Kaboré",
      chauffeur_telephone: "+226 70 34 56 78",
      numero_camion: "BF-003-GHI",
      type_camion: "Camion citerne 30T",
      marchandise_id: "3",
      marchandise_name: "Huile de palme",
      quantite: 25,
      origine: "Port d'Abidjan (Côte d'Ivoire)",
      destination: "Entrepôt Koudougou",
      date_depart: "2025-01-26T05:00:00Z",
      date_arrivee_prevue: "2025-01-27T20:00:00Z",
      status: "retard",
      position_actuelle: "Bobo-Dioulasso",
      distance_parcourue: 280,
      distance_totale: 520,
      observations: "Retard dû à un contrôle douanier prolongé",
      created_at: "2025-01-25T16:00:00Z",
    },
  ]

  useEffect(() => {
    setTransports(demoTransports)
    setLoading(false)
  }, [])

  // Filtrer les transports
  const filteredTransports = transports.filter((transport) => {
    const matchesSearch =
      transport.numero_transport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.chauffeur_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.numero_camion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || transport.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculer les statistiques
  const totalTransports = transports.length
  const transportsEnRoute = transports.filter((t) => t.status === "en_route").length
  const transportsLivres = transports.filter((t) => t.status === "livre").length
  const transportsRetard = transports.filter((t) => t.status === "retard").length

  // Générer un nouveau numéro de transport
  const generateTransportNumber = () => {
    const year = new Date().getFullYear()
    const nextNumber = transports.length + 1
    return `TR-${year}-${nextNumber.toString().padStart(3, "0")}`
  }

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const newTransport: Transport = {
        id: Date.now().toString(),
        numero_transport: generateTransportNumber(),
        chauffeur_nom: formData.chauffeur_nom,
        chauffeur_telephone: formData.chauffeur_telephone,
        numero_camion: formData.numero_camion,
        type_camion: formData.type_camion,
        marchandise_id: formData.marchandise_id,
        marchandise_name: "Marchandise sélectionnée", // À remplacer par la vraie donnée
        quantite: formData.quantite,
        origine: formData.origine,
        destination: formData.destination,
        date_depart: formData.date_depart,
        date_arrivee_prevue: formData.date_arrivee_prevue,
        status: "planifie",
        position_actuelle: formData.origine,
        distance_parcourue: 0,
        distance_totale: 500, // À calculer selon l'itinéraire
        observations: formData.observations,
        created_at: new Date().toISOString(),
      }

      if (editingTransport) {
        // Mise à jour
        setTransports((prev) =>
          prev.map((t) =>
            t.id === editingTransport.id
              ? {
                  ...t,
                  chauffeur_nom: formData.chauffeur_nom,
                  chauffeur_telephone: formData.chauffeur_telephone,
                  numero_camion: formData.numero_camion,
                  type_camion: formData.type_camion,
                  marchandise_id: formData.marchandise_id,
                  quantite: formData.quantite,
                  origine: formData.origine,
                  destination: formData.destination,
                  date_depart: formData.date_depart,
                  date_arrivee_prevue: formData.date_arrivee_prevue,
                  observations: formData.observations,
                }
              : t,
          ),
        )
        setSuccess("Transport mis à jour avec succès")
      } else {
        // Création
        setTransports((prev) => [newTransport, ...prev])
        setSuccess("Transport créé avec succès")
      }

      handleCloseDialog()
    } catch (err: any) {
      console.error("Error saving transport:", err)
      setError("Erreur lors de la sauvegarde")
    }
  }

  // Démarrer le transport
  const handleStartTransport = async (id: string) => {
    try {
      setTransports((prev) => prev.map((t) => (t.id === id ? { ...t, status: "en_route" as const } : t)))
      setSuccess("Transport démarré")
    } catch (err) {
      console.error("Error starting transport:", err)
      setError("Erreur lors du démarrage")
    }
  }

  // Marquer comme livré
  const handleMarkDelivered = async (id: string) => {
    try {
      setTransports((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: "livre" as const,
                date_arrivee_reelle: new Date().toISOString(),
                distance_parcourue: t.distance_totale,
                position_actuelle: t.destination,
              }
            : t,
        ),
      )
      setSuccess("Transport marqué comme livré")
    } catch (err) {
      console.error("Error marking as delivered:", err)
      setError("Erreur lors de la mise à jour")
    }
  }

  // Ouvrir le dialog pour édition
  const handleEdit = (transport: Transport) => {
    setEditingTransport(transport)
    setFormData({
      chauffeur_nom: transport.chauffeur_nom,
      chauffeur_telephone: transport.chauffeur_telephone,
      numero_camion: transport.numero_camion,
      type_camion: transport.type_camion,
      marchandise_id: transport.marchandise_id,
      quantite: transport.quantite,
      origine: transport.origine,
      destination: transport.destination,
      date_depart: transport.date_depart.split("T")[0],
      date_arrivee_prevue: transport.date_arrivee_prevue.split("T")[0],
      observations: transport.observations,
    })
    setIsDialogOpen(true)
  }

  // Voir les détails
  const handleView = (transport: Transport) => {
    setViewingTransport(transport)
    setIsDialogOpen(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTransport(null)
    setViewingTransport(null)
    setFormData({
      chauffeur_nom: "",
      chauffeur_telephone: "",
      numero_camion: "",
      type_camion: "",
      marchandise_id: "",
      quantite: 0,
      origine: "",
      destination: "",
      date_depart: "",
      date_arrivee_prevue: "",
      observations: "",
    })
    setError("")
  }

  // Calculer le pourcentage de progression
  const getProgressPercentage = (parcourue: number, totale: number) => {
    return Math.round((parcourue / totale) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-8 w-8 text-[#0F4C75]" />
            Transport
          </h1>
          <p className="text-gray-600">Gestion et suivi des transports</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau transport
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingTransport
                  ? "Détails du transport"
                  : editingTransport
                    ? "Modifier le transport"
                    : "Nouveau transport"}
              </DialogTitle>
              <DialogDescription>
                {viewingTransport
                  ? "Informations détaillées du transport"
                  : editingTransport
                    ? "Modifiez les informations du transport"
                    : "Planifiez un nouveau transport"}
              </DialogDescription>
            </DialogHeader>

            {viewingTransport ? (
              // Vue détaillée
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Numéro</Label>
                    <p className="font-semibold">{viewingTransport.numero_transport}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Statut</Label>
                    <Badge
                      style={{
                        backgroundColor: statusColors[viewingTransport.status],
                        color: "white",
                      }}
                    >
                      {statusLabels[viewingTransport.status]}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Chauffeur</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold">{viewingTransport.chauffeur_nom}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{viewingTransport.chauffeur_telephone}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Camion</Label>
                    <p className="font-semibold">{viewingTransport.numero_camion}</p>
                    <p className="text-sm text-gray-600">{viewingTransport.type_camion}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Itinéraire</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{viewingTransport.origine}</span>
                    <span className="text-gray-400">→</span>
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{viewingTransport.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Navigation className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Position actuelle: {viewingTransport.position_actuelle}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Progression</Label>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {viewingTransport.distance_parcourue}km / {viewingTransport.distance_totale}km
                      </span>
                      <span>
                        {getProgressPercentage(viewingTransport.distance_parcourue, viewingTransport.distance_totale)}%
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(
                        viewingTransport.distance_parcourue,
                        viewingTransport.distance_totale,
                      )}
                      className="h-3"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Marchandise</Label>
                  <p className="font-semibold">
                    {viewingTransport.marchandise_name} - {viewingTransport.quantite}T
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Observations</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{viewingTransport.observations}</p>
                </div>

                <div className="flex gap-2">
                  {viewingTransport.status === "planifie" && (
                    <Button
                      onClick={() => handleStartTransport(viewingTransport.id)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Démarrer transport
                    </Button>
                  )}
                  {(viewingTransport.status === "en_route" || viewingTransport.status === "arrive") && (
                    <Button
                      onClick={() => handleMarkDelivered(viewingTransport.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marquer livré
                    </Button>
                  )}
                  <Button variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Voir sur carte
                  </Button>
                </div>
              </div>
            ) : (
              // Formulaire d'édition/création
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chauffeur_nom">Nom du chauffeur *</Label>
                      <Input
                        id="chauffeur_nom"
                        value={formData.chauffeur_nom}
                        onChange={(e) => setFormData((prev) => ({ ...prev, chauffeur_nom: e.target.value }))}
                        placeholder="Amadou Diallo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chauffeur_telephone">Téléphone chauffeur</Label>
                      <Input
                        id="chauffeur_telephone"
                        value={formData.chauffeur_telephone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, chauffeur_telephone: e.target.value }))}
                        placeholder="+226 70 12 34 56"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero_camion">Numéro camion *</Label>
                      <Input
                        id="numero_camion"
                        value={formData.numero_camion}
                        onChange={(e) => setFormData((prev) => ({ ...prev, numero_camion: e.target.value }))}
                        placeholder="BF-001-ABC"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type_camion">Type de camion *</Label>
                      <Select
                        value={formData.type_camion}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, type_camion: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {typesCamion.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
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
                        placeholder="35"
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origine">Origine *</Label>
                      <Input
                        id="origine"
                        value={formData.origine}
                        onChange={(e) => setFormData((prev) => ({ ...prev, origine: e.target.value }))}
                        placeholder="Port de Tema (Ghana)"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination *</Label>
                      <Input
                        id="destination"
                        value={formData.destination}
                        onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
                        placeholder="Entrepôt Ouagadougou"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_depart">Date de départ *</Label>
                      <Input
                        id="date_depart"
                        type="date"
                        value={formData.date_depart}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date_depart: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_arrivee_prevue">Date d'arrivée prévue *</Label>
                      <Input
                        id="date_arrivee_prevue"
                        type="date"
                        value={formData.date_arrivee_prevue}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date_arrivee_prevue: e.target.value }))}
                        required
                      />
                    </div>
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
                    {editingTransport ? "Mettre à jour" : "Créer"}
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
            <CardTitle className="text-sm font-medium">Total Transports</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Route</CardTitle>
            <Navigation className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{transportsEnRoute}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livrés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{transportsLivres}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{transportsRetard}</div>
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
                  placeholder="Rechercher un transport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="planifie">Planifiés</SelectItem>
                  <SelectItem value="en_route">En route</SelectItem>
                  <SelectItem value="arrive">Arrivés</SelectItem>
                  <SelectItem value="livre">Livrés</SelectItem>
                  <SelectItem value="retard">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des transports */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des transports</CardTitle>
          <CardDescription>{filteredTransports.length} transport(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredTransports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Aucun transport ne correspond aux critères de recherche"
                : "Aucun transport enregistré"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Chauffeur</TableHead>
                  <TableHead>Camion</TableHead>
                  <TableHead>Marchandise</TableHead>
                  <TableHead>Itinéraire</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransports.map((transport) => (
                  <TableRow key={transport.id}>
                    <TableCell className="font-medium">{transport.numero_transport}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{transport.chauffeur_nom}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{transport.numero_camion}</span>
                        <p className="text-xs text-gray-500">{transport.type_camion}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {transport.marchandise_name} ({transport.quantite}T)
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3 text-green-500" />
                          <span className="truncate max-w-[100px]">{transport.origine}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span className="truncate max-w-[100px]">{transport.destination}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {transport.distance_parcourue}km / {transport.distance_totale}km
                          </span>
                          <span>{getProgressPercentage(transport.distance_parcourue, transport.distance_totale)}%</span>
                        </div>
                        <Progress
                          value={getProgressPercentage(transport.distance_parcourue, transport.distance_totale)}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: statusColors[transport.status],
                          color: "white",
                        }}
                      >
                        {statusLabels[transport.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(transport)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(transport)}>
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
