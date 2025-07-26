"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Truck, MapPin, Clock, AlertTriangle, CheckCircle, Play, Navigation, Users, Route } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TransportTrip {
  id: string
  commande_id: string
  marchandise_id: string
  qte: number
  camion_id: string
  conducteur_id: string
  status: "planifie" | "en_cours" | "termine" | "retarde"
  created_at: string
  legs: TransportLeg[]
  commande?: {
    code_alpha_num: string
    marchandise: { name: string; color_hex: string }
  }
  conducteur?: {
    first_name: string
    last_name: string
  }
}

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
  distance_km?: number
  temps_prevu_h?: number
  temps_reel_h?: number
  superviseur_id?: string
  superviseur?: {
    first_name: string
    last_name: string
  }
}

interface GpsLog {
  camion_id: string
  lat: number
  lng: number
  speed: number
  ts: string
}

export default function TransportPage() {
  const [trips, setTrips] = useState<TransportTrip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<TransportTrip | null>(null)
  const [gpsLogs, setGpsLogs] = useState<GpsLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Simuler les données
  useEffect(() => {
    const mockTrips: TransportTrip[] = [
      {
        id: "1",
        commande_id: "cmd-001",
        marchandise_id: "march-001",
        qte: 25.5,
        camion_id: "CAM-001",
        conducteur_id: "user-001",
        status: "en_cours",
        created_at: "2024-01-15T08:00:00Z",
        commande: {
          code_alpha_num: "CMD-2024-001",
          marchandise: { name: "Riz Basmati", color_hex: "#4CAF50" },
        },
        conducteur: {
          first_name: "Amadou",
          last_name: "Traoré",
        },
        legs: [
          {
            id: "leg-1",
            leg_number: 1,
            type: "port->frontiere",
            start_location: "Port d'Abidjan",
            end_location: "Frontière Côte d'Ivoire",
            start_at: "2024-01-15T08:00:00Z",
            end_at: "2024-01-15T16:00:00Z",
            status: "termine",
            distance_km: 320,
            temps_prevu_h: 8,
            temps_reel_h: 8.5,
            gps_last: { lat: 5.3364, lng: -4.0267, ts: "2024-01-15T16:00:00Z" },
          },
          {
            id: "leg-2",
            leg_number: 2,
            type: "frontiere->transit",
            start_location: "Frontière Côte d'Ivoire",
            end_location: "Transit Burkina",
            start_at: "2024-01-15T17:00:00Z",
            status: "en_cours",
            distance_km: 450,
            temps_prevu_h: 12,
            gps_last: { lat: 9.5293, lng: -2.4584, ts: "2024-01-15T22:30:00Z" },
            superviseur_id: "user-002",
            superviseur: {
              first_name: "Fatou",
              last_name: "Sankara",
            },
          },
          {
            id: "leg-3",
            leg_number: 3,
            type: "transit->ouaga",
            start_location: "Transit Burkina",
            end_location: "Ouagadougou",
            status: "en_cours",
            distance_km: 180,
            temps_prevu_h: 6,
          },
        ],
      },
    ]

    setTrips(mockTrips)
    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planifie":
        return "bg-blue-100 text-blue-800"
      case "en_cours":
        return "bg-yellow-100 text-yellow-800"
      case "termine":
        return "bg-green-100 text-green-800"
      case "retarde":
        return "bg-red-100 text-red-800"
      case "panne":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planifie":
        return <Clock className="h-4 w-4" />
      case "en_cours":
        return <Play className="h-4 w-4" />
      case "termine":
        return <CheckCircle className="h-4 w-4" />
      case "retarde":
        return <AlertTriangle className="h-4 w-4" />
      case "panne":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const calculateProgress = (legs: TransportLeg[]) => {
    const completedLegs = legs.filter((leg) => leg.status === "termine").length
    return (completedLegs / legs.length) * 100
  }

  const calculateETA = (legs: TransportLeg[]) => {
    const currentLeg = legs.find((leg) => leg.status === "en_cours")
    if (!currentLeg) return "N/A"

    const remainingTime = (currentLeg.temps_prevu_h || 0) - (currentLeg.temps_reel_h || 0)
    return remainingTime > 0 ? `${remainingTime.toFixed(1)}h restantes` : "En retard"
  }

  const handleStartLeg = (tripId: string, legId: string) => {
    toast({
      title: "Segment démarré",
      description: "Le segment de transport a été démarré avec géolocalisation.",
    })
  }

  const handleFinishLeg = (tripId: string, legId: string) => {
    toast({
      title: "Segment terminé",
      description: "Le segment de transport a été marqué comme terminé.",
    })
  }

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.commande?.code_alpha_num.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.camion_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.conducteur?.first_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transport Multi-Tronçon</h1>
          <p className="text-muted-foreground">Gestion des segments de transport avec suivi GPS temps réel</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Truck className="mr-2 h-4 w-4" />
              Nouveau Transport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un Transport Multi-Tronçon</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commande">Commande</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une commande" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cmd-001">CMD-2024-001 - Riz Basmati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="camion">Camion</Label>
                <Input id="camion" placeholder="Ex: CAM-001" />
              </div>
              <div>
                <Label htmlFor="conducteur">Conducteur</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un conducteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user-001">Amadou Traoré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="qte">Quantité</Label>
                <Input id="qte" type="number" placeholder="25.5" />
              </div>
            </div>
            <div className="mt-4">
              <Label>Itinéraire Burkina Faso</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>1. Port d'Abidjan → Frontière CI</span>
                  <Badge variant="outline">8h prévues</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>2. Frontière CI → Transit Burkina</span>
                  <Badge variant="outline">12h prévues</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>3. Transit → Ouagadougou</span>
                  <Badge variant="outline">6h prévues</Badge>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Transport créé",
                    description: "Le transport multi-tronçon a été créé avec succès.",
                  })
                  setIsCreateDialogOpen(false)
                }}
              >
                Créer Transport
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="flex space-x-4">
        <Input
          placeholder="Rechercher par commande, camion, conducteur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="planifie">Planifié</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="termine">Terminé</SelectItem>
            <SelectItem value="retarde">Retardé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="trips" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trips">Voyages</TabsTrigger>
          <TabsTrigger value="legs">Segments</TabsTrigger>
          <TabsTrigger value="gps">Suivi GPS</TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="space-y-4">
          <div className="grid gap-4">
            {filteredTrips.map((trip) => (
              <Card
                key={trip.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTrip(trip)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Truck className="h-5 w-5" />
                        <span>{trip.commande?.code_alpha_num}</span>
                        <Badge className={getStatusColor(trip.status)} variant="secondary">
                          {getStatusIcon(trip.status)}
                          <span className="ml-1">{trip.status}</span>
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {trip.commande?.marchandise.name} - {trip.qte} tonnes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Camion: {trip.camion_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {trip.conducteur?.first_name} {trip.conducteur?.last_name}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progression</span>
                        <span>{Math.round(calculateProgress(trip.legs))}%</span>
                      </div>
                      <Progress value={calculateProgress(trip.legs)} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Segments</p>
                        <p className="font-medium">{trip.legs.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ETA</p>
                        <p className="font-medium">{calculateETA(trip.legs)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Distance totale</p>
                        <p className="font-medium">
                          {trip.legs.reduce((sum, leg) => sum + (leg.distance_km || 0), 0)} km
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {trip.legs.map((leg) => (
                        <div key={leg.id} className="flex-1">
                          <div
                            className={`h-2 rounded ${
                              leg.status === "termine"
                                ? "bg-green-500"
                                : leg.status === "en_cours"
                                  ? "bg-yellow-500"
                                  : leg.status === "retarde"
                                    ? "bg-red-500"
                                    : leg.status === "panne"
                                      ? "bg-red-600"
                                      : "bg-gray-300"
                            }`}
                          />
                          <p className="text-xs mt-1 text-center">Seg. {leg.leg_number}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="legs" className="space-y-4">
          <div className="grid gap-4">
            {filteredTrips.flatMap((trip) =>
              trip.legs.map((leg) => (
                <Card key={leg.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Route className="h-5 w-5" />
                          <span>
                            Segment {leg.leg_number} - {trip.commande?.code_alpha_num}
                          </span>
                          <Badge className={getStatusColor(leg.status)} variant="secondary">
                            {getStatusIcon(leg.status)}
                            <span className="ml-1">{leg.status}</span>
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {leg.start_location} → {leg.end_location}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {leg.status === "en_cours" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleStartLeg(trip.id, leg.id)}>
                              <Play className="h-4 w-4 mr-1" />
                              Démarrer
                            </Button>
                            <Button size="sm" onClick={() => handleFinishLeg(trip.id, leg.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Terminer
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Distance</p>
                        <p className="font-medium">{leg.distance_km || "N/A"} km</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Temps prévu</p>
                        <p className="font-medium">{leg.temps_prevu_h || "N/A"}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Temps réel</p>
                        <p className="font-medium">{leg.temps_reel_h || "En cours"}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Superviseur</p>
                        <p className="font-medium">
                          {leg.superviseur
                            ? `${leg.superviseur.first_name} ${leg.superviseur.last_name}`
                            : "Non assigné"}
                        </p>
                      </div>
                    </div>

                    {leg.gps_last && (
                      <div className="mt-3 p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2 text-sm">
                          <Navigation className="h-4 w-4" />
                          <span>Dernière position GPS:</span>
                          <span className="font-mono">
                            {leg.gps_last.lat.toFixed(4)}, {leg.gps_last.lng.toFixed(4)}
                          </span>
                          <span className="text-muted-foreground">{new Date(leg.gps_last.ts).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )),
            )}
          </div>
        </TabsContent>

        <TabsContent value="gps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Suivi GPS Temps Réel</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Carte GPS interactive</p>
                  <p className="text-sm text-gray-400">Positions mises à jour toutes les 30 secondes</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Camions actifs</h4>
                {filteredTrips
                  .filter((trip) => trip.status === "en_cours")
                  .map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium">{trip.camion_id}</span>
                        <span className="text-sm text-muted-foreground">
                          {trip.conducteur?.first_name} {trip.conducteur?.last_name}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Segment {trip.legs.find((leg) => leg.status === "en_cours")?.leg_number || "N/A"}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog détails voyage */}
      {selectedTrip && (
        <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails Transport - {selectedTrip.commande?.code_alpha_num}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations générales</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Marchandise:</span>{" "}
                      {selectedTrip.commande?.marchandise.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Quantité:</span> {selectedTrip.qte} tonnes
                    </p>
                    <p>
                      <span className="text-muted-foreground">Camion:</span> {selectedTrip.camion_id}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Conducteur:</span> {selectedTrip.conducteur?.first_name}{" "}
                      {selectedTrip.conducteur?.last_name}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Progression</h4>
                  <Progress value={calculateProgress(selectedTrip.legs)} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(calculateProgress(selectedTrip.legs))}% terminé
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Segments de transport</h4>
                <div className="space-y-3">
                  {selectedTrip.legs.map((leg, index) => (
                    <div key={leg.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium">Segment {leg.leg_number}</h5>
                          <p className="text-sm text-muted-foreground">
                            {leg.start_location} → {leg.end_location}
                          </p>
                        </div>
                        <Badge className={getStatusColor(leg.status)} variant="secondary">
                          {getStatusIcon(leg.status)}
                          <span className="ml-1">{leg.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Distance</p>
                          <p className="font-medium">{leg.distance_km || "N/A"} km</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Durée prévue</p>
                          <p className="font-medium">{leg.temps_prevu_h || "N/A"}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Durée réelle</p>
                          <p className="font-medium">{leg.temps_reel_h ? `${leg.temps_reel_h}h` : "En cours"}</p>
                        </div>
                      </div>

                      {leg.start_at && (
                        <div className="mt-2 text-sm">
                          <p className="text-muted-foreground">Démarré: {new Date(leg.start_at).toLocaleString()}</p>
                          {leg.end_at && (
                            <p className="text-muted-foreground">Terminé: {new Date(leg.end_at).toLocaleString()}</p>
                          )}
                        </div>
                      )}

                      {leg.superviseur && (
                        <div className="mt-2 flex items-center space-x-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span>
                            Superviseur: {leg.superviseur.first_name} {leg.superviseur.last_name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
