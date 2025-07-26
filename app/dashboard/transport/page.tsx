"use client"

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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Truck,
  Plus,
  Search,
  Edit,
  Eye,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Phone,
  User,
  QrCode,
  Filter,
  Route,
  Play,
  Flag,
  Camera,
  Users,
  Calendar,
} from "lucide-react"

interface TransportLeg {
  id: string
  leg_number: number
  type: "port->frontiere" | "frontiere->transit" | "transit->bobo" | "transit->ouaga"
  start_location: string
  end_location: string
  start_at?: string
  end_at?: string
  status: "en_cours" | "termine" | "retarde" | "panne"
  gps_last?: { lat: number; lng: number; ts: string }
  distance_km: number
  temps_prevu_h: number
  temps_reel_h?: number
  superviseur_id?: string
  superviseur_name?: string
}

interface TransportTrip {
  id: string
  numero_transport: string
  commande_id: string
  commande_code: string
  marchandise_name: string
  qte: number
  camion_id: string
  conducteur_name: string
  conducteur_telephone: string
  status: "planifie" | "en_cours" | "termine" | "retarde"
  legs: TransportLeg[]
  created_at: string
}

const legTypeLabels = {
  "port->frontiere": "Port → Frontière",
  "frontiere->transit": "Frontière → Transit",
  "transit->bobo": "Transit → Bobo",
  "transit->ouaga": "Transit → Ouaga",
}

const legStatusLabels = {
  en_cours: "En cours",
  termine: "Terminé",
  retarde: "En retard",
  panne: "Panne",
}

const legStatusColors = {
  en_cours: "#2196F3",
  termine: "#4CAF50",
  retarde: "#F44336",
  panne: "#FF5722",
}

export default function TransportPage() {
  const [trips, setTrips] = useState<TransportTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterLegType, setFilterLegType] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingTrip, setViewingTrip] = useState<TransportTrip | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // États pour nouveau segment
  const [newLegData, setNewLegData] = useState({
    type: "",
    start_location: "",
    end_location: "",
    distance_km: 0,
    temps_prevu_h: 0,
    superviseur_id: "",
  })

  // Données de démonstration avec segments multi-tronçon
  const demoTrips: TransportTrip[] = [
    {
      id: "trip-1",
      numero_transport: "TR-2025-001",
      commande_id: "cmd-1",
      commande_code: "CMD-2025-001",
      marchandise_name: "Blé dur",
      qte: 35,
      camion_id: "BF-001-ABC",
      conducteur_name: "Amadou Diallo",
      conducteur_telephone: "+226 70 12 34 56",
      status: "en_cours",
      legs: [
        {
          id: "leg-1",
          leg_number: 1,
          type: "port->frontiere",
          start_location: "Port de Tema (Ghana)",
          end_location: "Frontière Paga",
          start_at: "2025-01-26T06:00:00Z",
          end_at: "2025-01-26T14:00:00Z",
          status: "termine",
          gps_last: { lat: 10.9883, lng: -0.8432, ts: "2025-01-26T14:00:00Z" },
          distance_km: 120,
          temps_prevu_h: 8,
          temps_reel_h: 8,
          superviseur_id: "sup-1",
          superviseur_name: "Kwame Asante",
        },
        {
          id: "leg-2",
          leg_number: 2,
          type: "frontiere->transit",
          start_location: "Frontière Paga",
          end_location: "Transit Ouagadougou",
          start_at: "2025-01-26T15:00:00Z",
          status: "en_cours",
          gps_last: { lat: 11.5432, lng: -0.9876, ts: "2025-01-26T18:30:00Z" },
          distance_km: 180,
          temps_prevu_h: 12,
          temps_reel_h: 3.5,
          superviseur_id: "sup-2",
          superviseur_name: "Ibrahim Sawadogo",
        },
        {
          id: "leg-3",
          leg_number: 3,
          type: "transit->ouaga",
          start_location: "Transit Ouagadougou",
          end_location: "Entrepôt Central Ouaga",
          status: "en_cours",
          distance_km: 20,
          temps_prevu_h: 1,
          superviseur_id: "sup-2",
          superviseur_name: "Ibrahim Sawadogo",
        },
      ],
      created_at: "2025-01-26T06:00:00Z",
    },
    {
      id: "trip-2",
      numero_transport: "TR-2025-002",
      commande_id: "cmd-2",
      commande_code: "CMD-2025-002",
      marchandise_name: "Riz parfumé",
      qte: 25,
      camion_id: "BF-002-DEF",
      conducteur_name: "Fatou Traoré",
      conducteur_telephone: "+226 70 23 45 67",
      status: "planifie",
      legs: [
        {
          id: "leg-4",
          leg_number: 1,
          type: "port->frontiere",
          start_location: "Port de Lomé (Togo)",
          end_location: "Frontière Cinkansé",
          status: "en_cours",
          distance_km: 150,
          temps_prevu_h: 10,
          superviseur_id: "sup-3",
          superviseur_name: "Koffi Mensah",
        },
        {
          id: "leg-5",
          leg_number: 2,
          type: "frontiere->transit",
          start_location: "Frontière Cinkansé",
          end_location: "Transit Fada",
          status: "en_cours",
          distance_km: 200,
          temps_prevu_h: 14,
          superviseur_id: "sup-2",
          superviseur_name: "Ibrahim Sawadogo",
        },
        {
          id: "leg-6",
          leg_number: 3,
          type: "transit->bobo",
          start_location: "Transit Fada",
          end_location: "Entrepôt Bobo-Dioulasso",
          status: "en_cours",
          distance_km: 180,
          temps_prevu_h: 12,
          superviseur_id: "sup-4",
          superviseur_name: "Salif Ouédraogo",
        },
      ],
      created_at: "2025-01-25T08:00:00Z",
    },
  ]

  useEffect(() => {
    setTrips(demoTrips)
    setLoading(false)

    // Simulation WebSocket GPS en temps réel
    const interval = setInterval(() => {
      setTrips((prev) =>
        prev.map((trip) => ({
          ...trip,
          legs: trip.legs.map((leg) => {
            if (leg.status === "en_cours" && Math.random() > 0.7) {
              // Simulation mise à jour GPS
              const newLat = (leg.gps_last?.lat || 11.0) + (Math.random() - 0.5) * 0.01
              const newLng = (leg.gps_last?.lng || -1.0) + (Math.random() - 0.5) * 0.01
              return {
                ...leg,
                gps_last: {
                  lat: newLat,
                  lng: newLng,
                  ts: new Date().toISOString(),
                },
                temps_reel_h: (leg.temps_reel_h || 0) + 0.1,
              }
            }
            return leg
          }),
        })),
      )
    }, 30000) // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval)
  }, [])

  // Filtrer les trips
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.numero_transport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.conducteur_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.camion_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.commande_code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || trip.status === filterStatus

    const matchesLegType = filterLegType === "all" || trip.legs.some((leg) => leg.type === filterLegType)

    return matchesSearch && matchesStatus && matchesLegType
  })

  // Calculer les statistiques
  const totalTrips = trips.length
  const tripsEnCours = trips.filter((t) => t.status === "en_cours").length
  const tripsTermines = trips.filter((t) => t.status === "termine").length
  const tripsRetard = trips.filter((t) => t.status === "retarde").length
  const totalLegs = trips.reduce((sum, t) => sum + t.legs.length, 0)
  const legsTermines = trips.reduce((sum, t) => sum + t.legs.filter((l) => l.status === "termine").length, 0)

  // Démarrer un segment
  const startLeg = async (tripId: string, legId: string) => {
    try {
      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                legs: trip.legs.map((leg) =>
                  leg.id === legId
                    ? {
                        ...leg,
                        status: "en_cours" as const,
                        start_at: new Date().toISOString(),
                        gps_last: { lat: 11.0, lng: -1.0, ts: new Date().toISOString() },
                      }
                    : leg,
                ),
              }
            : trip,
        ),
      )
      setSuccess("Segment démarré avec succès")
    } catch (err) {
      console.error("Error starting leg:", err)
      setError("Erreur lors du démarrage du segment")
    }
  }

  // Terminer un segment
  const finishLeg = async (tripId: string, legId: string) => {
    try {
      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                legs: trip.legs.map((leg) =>
                  leg.id === legId
                    ? {
                        ...leg,
                        status: "termine" as const,
                        end_at: new Date().toISOString(),
                      }
                    : leg,
                ),
              }
            : trip,
        ),
      )
      setSuccess("Segment terminé avec succès")
    } catch (err) {
      console.error("Error finishing leg:", err)
      setError("Erreur lors de la finalisation du segment")
    }
  }

  // Ajouter un nouveau segment
  const addNewLeg = async () => {
    if (!viewingTrip || !newLegData.type || !newLegData.start_location) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const newLeg: TransportLeg = {
        id: Date.now().toString(),
        leg_number: viewingTrip.legs.length + 1,
        type: newLegData.type as any,
        start_location: newLegData.start_location,
        end_location: newLegData.end_location,
        status: "en_cours",
        distance_km: newLegData.distance_km,
        temps_prevu_h: newLegData.temps_prevu_h,
        superviseur_id: newLegData.superviseur_id,
        superviseur_name: "Superviseur sélectionné",
      }

      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === viewingTrip.id
            ? {
                ...trip,
                legs: [...trip.legs, newLeg],
              }
            : trip,
        ),
      )

      setViewingTrip((prev) => {
        if (prev) {
          return {
            ...prev,
            legs: [...prev.legs, newLeg],
          }
        }
        return prev
      })

      setNewLegData({
        type: "",
        start_location: "",
        end_location: "",
        distance_km: 0,
        temps_prevu_h: 0,
        superviseur_id: "",
      })

      setSuccess("Nouveau segment ajouté avec succès")
      setError("")
    } catch (err) {
      console.error("Error adding leg:", err)
      setError("Erreur lors de l'ajout du segment")
    }
  }

  // Voir les détails d'un trip
  const handleView = (trip: TransportTrip) => {
    setViewingTrip(trip)
    setActiveTab("overview")
    setIsDialogOpen(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setViewingTrip(null)
    setError("")
    setSuccess("")
  }

  // Calculer le pourcentage de progression d'un trip
  const getTripProgress = (trip: TransportTrip) => {
    const completedLegs = trip.legs.filter((leg) => leg.status === "termine").length
    return Math.round((completedLegs / trip.legs.length) * 100)
  }

  // Calculer l'ETA vs réel
  const getETAComparison = (leg: TransportLeg) => {
    if (!leg.temps_reel_h || !leg.temps_prevu_h) return null
    const difference = leg.temps_reel_h - leg.temps_prevu_h
    return {
      difference,
      percentage: Math.round((difference / leg.temps_prevu_h) * 100),
      isLate: difference > 0,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-8 w-8 text-[#0F4C75]" />
            Transport Multi-Tronçon
          </h1>
          <p className="text-gray-600">Gestion des segments de transport et suivi GPS temps réel</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingTrip ? `Trip ${viewingTrip.numero_transport}` : "Nouveau trip de transport"}
              </DialogTitle>
              <DialogDescription>
                {viewingTrip ? "Gestion des segments de transport" : "Créez un nouveau trip de transport"}
              </DialogDescription>
            </DialogHeader>

            {viewingTrip ? (
              // Vue détaillée avec onglets
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="legs">
                    Segments
                    <Badge className="ml-2 bg-blue-500">{viewingTrip.legs.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="gps">GPS Temps Réel</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Onglet Vue d'ensemble */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Truck className="h-5 w-5" />
                          Informations du trip
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Numéro</Label>
                            <p className="font-semibold">{viewingTrip.numero_transport}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Commande</Label>
                            <p className="font-semibold">{viewingTrip.commande_code}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Marchandise</Label>
                            <p className="font-semibold">
                              {viewingTrip.marchandise_name} ({viewingTrip.qte}T)
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Camion</Label>
                            <p className="font-semibold">{viewingTrip.camion_id}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Conducteur</Label>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-semibold">{viewingTrip.conducteur_name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{viewingTrip.conducteur_telephone}</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Statut</Label>
                            <Badge
                              className={
                                viewingTrip.status === "termine"
                                  ? "bg-green-500"
                                  : viewingTrip.status === "en_cours"
                                    ? "bg-blue-500"
                                    : viewingTrip.status === "retarde"
                                      ? "bg-red-500"
                                      : "bg-gray-500"
                              }
                            >
                              {viewingTrip.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Progression globale</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                                  getTripProgress(viewingTrip) === 100
                                    ? "text-green-500"
                                    : getTripProgress(viewingTrip) >= 50
                                      ? "text-blue-500"
                                      : "text-orange-500"
                                }`}
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray={`${getTripProgress(viewingTrip)}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold">{getTripProgress(viewingTrip)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">
                            {viewingTrip.legs.filter((l) => l.status === "termine").length} / {viewingTrip.legs.length}{" "}
                            segments terminés
                          </p>
                          <p className="text-sm text-gray-600">
                            Distance totale:{" "}
                            {viewingTrip.legs.reduce((sum, leg) => sum + leg.distance_km, 0).toFixed(0)} km
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline des segments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Timeline des segments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {viewingTrip.legs.map((leg, index) => (
                          <div key={leg.id} className="relative">
                            {index < viewingTrip.legs.length - 1 && (
                              <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                            )}
                            <div className="flex items-start gap-4">
                              <div
                                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 border-white ${
                                  leg.status === "termine"
                                    ? "bg-green-500"
                                    : leg.status === "en_cours"
                                      ? "bg-blue-500"
                                      : leg.status === "retarde"
                                        ? "bg-red-500"
                                        : "bg-gray-300"
                                }`}
                              >
                                <span className="text-white font-bold">{leg.leg_number}</span>
                              </div>
                              <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-semibold">{legTypeLabels[leg.type]}</h4>
                                    <p className="text-sm text-gray-600">
                                      {leg.start_location} → {leg.end_location}
                                    </p>
                                  </div>
                                  <Badge
                                    style={{
                                      backgroundColor: legStatusColors[leg.status],
                                      color: "white",
                                    }}
                                  >
                                    {legStatusLabels[leg.status]}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Distance:</span>
                                    <span className="font-medium ml-2">{leg.distance_km} km</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Temps prévu:</span>
                                    <span className="font-medium ml-2">{leg.temps_prevu_h}h</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Superviseur:</span>
                                    <span className="font-medium ml-2">{leg.superviseur_name || "Non assigné"}</span>
                                  </div>
                                </div>
                                {leg.start_at && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    Démarré le {new Date(leg.start_at).toLocaleString("fr-FR")}
                                    {leg.end_at && (
                                      <span> - Terminé le {new Date(leg.end_at).toLocaleString("fr-FR")}</span>
                                    )}
                                  </div>
                                )}
                                <div className="flex gap-2 mt-3">
                                  {leg.status === "en_cours" && !leg.start_at && (
                                    <Button
                                      size="sm"
                                      onClick={() => startLeg(viewingTrip.id, leg.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Play className="mr-1 h-3 w-3" />
                                      Démarrer
                                    </Button>
                                  )}
                                  {leg.status === "en_cours" && leg.start_at && !leg.end_at && (
                                    <Button
                                      size="sm"
                                      onClick={() => finishLeg(viewingTrip.id, leg.id)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Flag className="mr-1 h-3 w-3" />
                                      Terminer
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm">
                                    <QrCode className="mr-1 h-3 w-3" />
                                    QR Code
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    Localiser
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Segments */}
                <TabsContent value="legs" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulaire nouveau segment */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Nouveau segment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Type de segment *</Label>
                          <Select
                            value={newLegData.type}
                            onValueChange={(value) => setNewLegData((prev) => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(legTypeLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Lieu de départ *</Label>
                            <Input
                              value={newLegData.start_location}
                              onChange={(e) => setNewLegData((prev) => ({ ...prev, start_location: e.target.value }))}
                              placeholder="Port de Tema"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Lieu d'arrivée *</Label>
                            <Input
                              value={newLegData.end_location}
                              onChange={(e) => setNewLegData((prev) => ({ ...prev, end_location: e.target.value }))}
                              placeholder="Frontière Paga"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Distance (km)</Label>
                            <Input
                              type="number"
                              value={newLegData.distance_km || ""}
                              onChange={(e) =>
                                setNewLegData((prev) => ({
                                  ...prev,
                                  distance_km: Number.parseFloat(e.target.value) || 0,
                                }))
                              }
                              placeholder="120"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Temps prévu (h)</Label>
                            <Input
                              type="number"
                              step="0.5"
                              value={newLegData.temps_prevu_h || ""}
                              onChange={(e) =>
                                setNewLegData((prev) => ({
                                  ...prev,
                                  temps_prevu_h: Number.parseFloat(e.target.value) || 0,
                                }))
                              }
                              placeholder="8"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Superviseur</Label>
                          <Select
                            value={newLegData.superviseur_id}
                            onValueChange={(value) => setNewLegData((prev) => ({ ...prev, superviseur_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un superviseur" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sup-1">Kwame Asante</SelectItem>
                              <SelectItem value="sup-2">Ibrahim Sawadogo</SelectItem>
                              <SelectItem value="sup-3">Koffi Mensah</SelectItem>
                              <SelectItem value="sup-4">Salif Ouédraogo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={addNewLeg} className="w-full bg-blue-600 hover:bg-blue-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter le segment
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Statistiques des segments */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Statistiques des segments</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(legStatusLabels).map(([status, label]) => {
                            const count = viewingTrip.legs.filter((l) => l.status === status).length
                            return (
                              <div key={status} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div
                                  className="p-2 rounded-full"
                                  style={{ backgroundColor: legStatusColors[status as keyof typeof legStatusColors] }}
                                >
                                  <div className="w-4 h-4 bg-white rounded-full"></div>
                                </div>
                                <div>
                                  <div className="font-semibold">{count}</div>
                                  <div className="text-sm text-gray-600">{label}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="space-y-3 pt-4 border-t">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Distance totale:</span>
                            <span className="font-semibold">
                              {viewingTrip.legs.reduce((sum, leg) => sum + leg.distance_km, 0)} km
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Temps prévu total:</span>
                            <span className="font-semibold">
                              {viewingTrip.legs.reduce((sum, leg) => sum + leg.temps_prevu_h, 0)} h
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Temps réel total:</span>
                            <span className="font-semibold">
                              {viewingTrip.legs.reduce((sum, leg) => sum + (leg.temps_reel_h || 0), 0).toFixed(1)} h
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tableau détaillé des segments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Détail des segments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Trajet</TableHead>
                            <TableHead>Distance</TableHead>
                            <TableHead>Temps</TableHead>
                            <TableHead>ETA vs Réel</TableHead>
                            <TableHead>Superviseur</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewingTrip.legs.map((leg) => {
                            const etaComparison = getETAComparison(leg)
                            return (
                              <TableRow key={leg.id}>
                                <TableCell className="font-medium">{leg.leg_number}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{legTypeLabels[leg.type]}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-green-500" />
                                      <span className="truncate max-w-[100px]">{leg.start_location}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3 text-red-500" />
                                      <span className="truncate max-w-[100px]">{leg.end_location}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{leg.distance_km} km</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div>Prévu: {leg.temps_prevu_h}h</div>
                                    {leg.temps_reel_h && <div>Réel: {leg.temps_reel_h.toFixed(1)}h</div>}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {etaComparison && (
                                    <div className="text-sm">
                                      <div
                                        className={`font-medium ${
                                          etaComparison.isLate ? "text-red-600" : "text-green-600"
                                        }`}
                                      >
                                        {etaComparison.isLate ? "+" : ""}
                                        {etaComparison.difference.toFixed(1)}h
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ({etaComparison.percentage > 0 ? "+" : ""}
                                        {etaComparison.percentage}%)
                                      </div>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm">{leg.superviseur_name || "Non assigné"}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    style={{
                                      backgroundColor: legStatusColors[leg.status],
                                      color: "white",
                                    }}
                                  >
                                    {legStatusLabels[leg.status]}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet GPS Temps Réel */}
                <TabsContent value="gps" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Suivi GPS Temps Réel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {viewingTrip.legs
                          .filter((leg) => leg.gps_last)
                          .map((leg) => (
                            <Card key={leg.id} className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold">{legTypeLabels[leg.type]}</h4>
                                  <p className="text-sm text-gray-600">Segment {leg.leg_number}</p>
                                </div>
                                <Badge
                                  style={{
                                    backgroundColor: legStatusColors[leg.status],
                                    color: "white",
                                  }}
                                >
                                  {legStatusLabels[leg.status]}
                                </Badge>
                              </div>
                              {leg.gps_last && (
                                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Latitude:</span>
                                    <span className="font-medium ml-2">{leg.gps_last.lat.toFixed(6)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Longitude:</span>
                                    <span className="font-medium ml-2">{leg.gps_last.lng.toFixed(6)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Dernière MAJ:</span>
                                    <span className="font-medium ml-2">
                                      {new Date(leg.gps_last.ts).toLocaleTimeString("fr-FR")}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  Voir sur carte
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Camera className="mr-1 h-3 w-3" />
                                  Photo preuve
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Phone className="mr-1 h-3 w-3" />
                                  Contacter
                                </Button>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Analytics */}
                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance par segment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {viewingTrip.legs.map((leg) => {
                            const etaComparison = getETAComparison(leg)
                            return (
                              <div key={leg.id} className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Segment {leg.leg_number}</span>
                                  {etaComparison && (
                                    <span
                                      className={`text-sm font-medium ${
                                        etaComparison.isLate ? "text-red-600" : "text-green-600"
                                      }`}
                                    >
                                      {etaComparison.isLate ? "+" : ""}
                                      {etaComparison.percentage}%
                                    </span>
                                  )}
                                </div>
                                <Progress
                                  value={leg.temps_reel_h ? (leg.temps_reel_h / leg.temps_prevu_h) * 100 : 0}
                                  className="h-2"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Métriques clés</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {viewingTrip.legs.reduce((sum, leg) => sum + leg.distance_km, 0)}
                            </div>
                            <div className="text-sm text-gray-600">km total</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {viewingTrip.legs.filter((l) => l.status === "termine").length}
                            </div>
                            <div className="text-sm text-gray-600">segments terminés</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {viewingTrip.legs.reduce((sum, leg) => sum + leg.temps_prevu_h, 0)}
                            </div>
                            <div className="text-sm text-gray-600">heures prévues</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {viewingTrip.legs.reduce((sum, leg) => sum + (leg.temps_reel_h || 0), 0).toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600">heures réelles</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              // Formulaire de création (simplifié)
              <div className="text-center py-8">
                <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Création de trip</p>
                <p className="text-gray-600 mb-4">
                  Les trips sont créés automatiquement lors du déchargement direct sur camion
                </p>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Fermer
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages de succès/erreur */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrips}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Navigation className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{tripsEnCours}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tripsTermines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{tripsRetard}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segments</CardTitle>
            <Route className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalLegs}</div>
            <div className="text-xs text-gray-500">{legsTermines} terminés</div>
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
                  placeholder="Rechercher un trip..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="planifie">Planifiés</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="termine">Terminés</SelectItem>
                  <SelectItem value="retarde">En retard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLegType} onValueChange={setFilterLegType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  {Object.entries(legTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vue Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Trips de transport</CardTitle>
          <CardDescription>{filteredTrips.length} trip(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterStatus !== "all" || filterLegType !== "all"
                ? "Aucun trip ne correspond aux critères de recherche"
                : "Aucun trip enregistré"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrips.map((trip) => (
                <Card key={trip.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{trip.numero_transport}</h3>
                      <p className="text-sm text-gray-600">
                        {trip.commande_code} - {trip.marchandise_name} ({trip.qte}T)
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {trip.camion_id}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {trip.conducteur_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(trip.created_at).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          trip.status === "termine"
                            ? "bg-green-500"
                            : trip.status === "en_cours"
                              ? "bg-blue-500"
                              : trip.status === "retarde"
                                ? "bg-red-500"
                                : "bg-gray-500"
                        }
                      >
                        {trip.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleView(trip)}>
                        <Eye className="mr-1 h-3 w-3" />
                        Voir
                      </Button>
                    </div>
                  </div>

                  {/* Progression du trip */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progression</span>
                      <span className="font-semibold">{getTripProgress(trip)}%</span>
                    </div>
                    <Progress value={getTripProgress(trip)} className="h-2" />
                  </div>

                  {/* Mini timeline des segments */}
                  <div className="flex gap-2 overflow-x-auto">
                    {trip.legs.map((leg, index) => (
                      <div key={leg.id} className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            leg.status === "termine"
                              ? "bg-green-500"
                              : leg.status === "en_cours"
                                ? "bg-blue-500"
                                : leg.status === "retarde"
                                  ? "bg-red-500"
                                  : "bg-gray-300"
                          }`}
                        >
                          {leg.leg_number}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium truncate">{legTypeLabels[leg.type]}</div>
                          <div className="text-xs text-gray-500">{leg.distance_km}km</div>
                        </div>
                        {index < trip.legs.length - 1 && <div className="w-4 h-0.5 bg-gray-200 flex-shrink-0"></div>}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
