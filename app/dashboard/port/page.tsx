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
import { Ship, Plus, Search, Edit, Eye, Clock, CheckCircle, AlertTriangle, FileText, Camera, Users } from "lucide-react"

interface OperationPort {
  id: string
  numero_bl: string
  navire: string
  marchandise_id: string
  marchandise_name: string
  qte_prevue: number
  qte_dechargee: number
  date_arrivee: string
  date_debut_dechargement?: string
  date_fin_dechargement?: string
  status: "attente" | "en_cours" | "termine" | "incident"
  responsable_port: string
  documents_requis: string[]
  documents_recus: string[]
  observations: string
  created_at: string
}

const statusLabels = {
  attente: "En attente",
  en_cours: "En cours",
  termine: "Terminé",
  incident: "Incident",
}

const statusColors = {
  attente: "#FF9800",
  en_cours: "#2196F3",
  termine: "#4CAF50",
  incident: "#F44336",
}

const documentsRequis = [
  "Connaissement (B/L)",
  "Facture commerciale",
  "Liste de colisage",
  "Certificat d'origine",
  "Certificat sanitaire",
  "Déclaration en douane",
]

export default function PortPage() {
  const [operations, setOperations] = useState<OperationPort[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingOperation, setViewingOperation] = useState<OperationPort | null>(null)
  const [editingOperation, setEditingOperation] = useState<OperationPort | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    numero_bl: "",
    navire: "",
    marchandise_id: "",
    qte_prevue: 0,
    date_arrivee: "",
    responsable_port: "",
    observations: "",
  })

  // Données de démonstration
  const demoOperations: OperationPort[] = [
    {
      id: "1",
      numero_bl: "BL-2025-001",
      navire: "MV ATLANTIC STAR",
      marchandise_id: "1",
      marchandise_name: "Blé dur",
      qte_prevue: 2500,
      qte_dechargee: 1800,
      date_arrivee: "2025-01-25T08:00:00Z",
      date_debut_dechargement: "2025-01-25T14:30:00Z",
      status: "en_cours",
      responsable_port: "Ibrahim Sawadogo",
      documents_requis: documentsRequis,
      documents_recus: ["Connaissement (B/L)", "Facture commerciale", "Liste de colisage"],
      observations: "Déchargement en cours, conditions météo favorables",
      created_at: "2025-01-24T10:00:00Z",
    },
    {
      id: "2",
      numero_bl: "BL-2025-002",
      navire: "MV SAHEL EXPRESS",
      marchandise_id: "2",
      marchandise_name: "Riz parfumé",
      qte_prevue: 1500,
      qte_dechargee: 1500,
      date_arrivee: "2025-01-20T06:00:00Z",
      date_debut_dechargement: "2025-01-20T09:00:00Z",
      date_fin_dechargement: "2025-01-22T17:00:00Z",
      status: "termine",
      responsable_port: "Fatou Traoré",
      documents_requis: documentsRequis,
      documents_recus: documentsRequis,
      observations: "Déchargement terminé sans incident",
      created_at: "2025-01-19T14:00:00Z",
    },
    {
      id: "3",
      numero_bl: "BL-2025-003",
      navire: "MV BURKINA TRADER",
      marchandise_id: "3",
      marchandise_name: "Huile de palme",
      qte_prevue: 800,
      qte_dechargee: 0,
      date_arrivee: "2025-01-26T12:00:00Z",
      status: "attente",
      responsable_port: "Moussa Ouédraogo",
      documents_requis: documentsRequis,
      documents_recus: ["Connaissement (B/L)"],
      observations: "En attente des documents douaniers",
      created_at: "2025-01-25T16:00:00Z",
    },
  ]

  useEffect(() => {
    setOperations(demoOperations)
    setLoading(false)
  }, [])

  // Filtrer les opérations
  const filteredOperations = operations.filter((operation) => {
    const matchesSearch =
      operation.numero_bl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.navire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.marchandise_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || operation.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculer les statistiques
  const totalOperations = operations.length
  const operationsEnCours = operations.filter((o) => o.status === "en_cours").length
  const operationsTerminees = operations.filter((o) => o.status === "termine").length
  const operationsEnAttente = operations.filter((o) => o.status === "attente").length

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const newOperation: OperationPort = {
        id: Date.now().toString(),
        numero_bl: formData.numero_bl,
        navire: formData.navire,
        marchandise_id: formData.marchandise_id,
        marchandise_name: "Marchandise sélectionnée", // À remplacer par la vraie donnée
        qte_prevue: formData.qte_prevue,
        qte_dechargee: 0,
        date_arrivee: formData.date_arrivee,
        status: "attente",
        responsable_port: formData.responsable_port,
        documents_requis: documentsRequis,
        documents_recus: [],
        observations: formData.observations,
        created_at: new Date().toISOString(),
      }

      if (editingOperation) {
        // Mise à jour
        setOperations((prev) =>
          prev.map((o) =>
            o.id === editingOperation.id
              ? {
                  ...o,
                  numero_bl: formData.numero_bl,
                  navire: formData.navire,
                  marchandise_id: formData.marchandise_id,
                  qte_prevue: formData.qte_prevue,
                  date_arrivee: formData.date_arrivee,
                  responsable_port: formData.responsable_port,
                  observations: formData.observations,
                }
              : o,
          ),
        )
        setSuccess("Opération mise à jour avec succès")
      } else {
        // Création
        setOperations((prev) => [newOperation, ...prev])
        setSuccess("Opération créée avec succès")
      }

      handleCloseDialog()
    } catch (err: any) {
      console.error("Error saving operation:", err)
      setError("Erreur lors de la sauvegarde")
    }
  }

  // Démarrer le déchargement
  const handleStartUnloading = async (id: string) => {
    try {
      setOperations((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: "en_cours" as const,
                date_debut_dechargement: new Date().toISOString(),
              }
            : o,
        ),
      )
      setSuccess("Déchargement démarré")
    } catch (err) {
      console.error("Error starting unloading:", err)
      setError("Erreur lors du démarrage")
    }
  }

  // Terminer le déchargement
  const handleFinishUnloading = async (id: string) => {
    try {
      setOperations((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: "termine" as const,
                date_fin_dechargement: new Date().toISOString(),
                qte_dechargee: o.qte_prevue, // Marquer comme entièrement déchargé
              }
            : o,
        ),
      )
      setSuccess("Déchargement terminé")
    } catch (err) {
      console.error("Error finishing unloading:", err)
      setError("Erreur lors de la finalisation")
    }
  }

  // Ouvrir le dialog pour édition
  const handleEdit = (operation: OperationPort) => {
    setEditingOperation(operation)
    setFormData({
      numero_bl: operation.numero_bl,
      navire: operation.navire,
      marchandise_id: operation.marchandise_id,
      qte_prevue: operation.qte_prevue,
      date_arrivee: operation.date_arrivee.split("T")[0],
      responsable_port: operation.responsable_port,
      observations: operation.observations,
    })
    setIsDialogOpen(true)
  }

  // Voir les détails
  const handleView = (operation: OperationPort) => {
    setViewingOperation(operation)
    setIsDialogOpen(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingOperation(null)
    setViewingOperation(null)
    setFormData({
      numero_bl: "",
      navire: "",
      marchandise_id: "",
      qte_prevue: 0,
      date_arrivee: "",
      responsable_port: "",
      observations: "",
    })
    setError("")
  }

  // Calculer le pourcentage de déchargement
  const getUnloadingPercentage = (dechargee: number, prevue: number) => {
    return Math.round((dechargee / prevue) * 100)
  }

  // Calculer le pourcentage de documents reçus
  const getDocumentsPercentage = (recus: string[], requis: string[]) => {
    return Math.round((recus.length / requis.length) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Ship className="h-8 w-8 text-[#0F4C75]" />
            Port / Déchargement
          </h1>
          <p className="text-gray-600">Gestion des opérations portuaires et déchargement</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle opération
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingOperation
                  ? "Détails de l'opération"
                  : editingOperation
                    ? "Modifier l'opération"
                    : "Nouvelle opération"}
              </DialogTitle>
              <DialogDescription>
                {viewingOperation
                  ? "Informations détaillées de l'opération portuaire"
                  : editingOperation
                    ? "Modifiez les informations de l'opération"
                    : "Créez une nouvelle opération de déchargement"}
              </DialogDescription>
            </DialogHeader>

            {viewingOperation ? (
              // Vue détaillée
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Numéro B/L</Label>
                    <p className="font-semibold">{viewingOperation.numero_bl}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Navire</Label>
                    <p className="font-semibold">{viewingOperation.navire}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Marchandise</Label>
                    <p className="font-semibold">{viewingOperation.marchandise_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Responsable</Label>
                    <p className="font-semibold">{viewingOperation.responsable_port}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Progression du déchargement</Label>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {viewingOperation.qte_dechargee}T / {viewingOperation.qte_prevue}T
                      </span>
                      <span>
                        {getUnloadingPercentage(viewingOperation.qte_dechargee, viewingOperation.qte_prevue)}%
                      </span>
                    </div>
                    <Progress
                      value={getUnloadingPercentage(viewingOperation.qte_dechargee, viewingOperation.qte_prevue)}
                      className="h-3"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Documents</Label>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {viewingOperation.documents_recus.length} / {viewingOperation.documents_requis.length} reçus
                      </span>
                      <span>
                        {getDocumentsPercentage(viewingOperation.documents_recus, viewingOperation.documents_requis)}%
                      </span>
                    </div>
                    <Progress
                      value={getDocumentsPercentage(
                        viewingOperation.documents_recus,
                        viewingOperation.documents_requis,
                      )}
                      className="h-3"
                    />
                    <div className="mt-3 space-y-1">
                      {viewingOperation.documents_requis.map((doc) => (
                        <div key={doc} className="flex items-center justify-between text-sm">
                          <span>{doc}</span>
                          {viewingOperation.documents_recus.includes(doc) ? (
                            <Badge className="bg-green-500">Reçu</Badge>
                          ) : (
                            <Badge variant="outline">En attente</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Observations</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{viewingOperation.observations}</p>
                </div>

                <div className="flex gap-2">
                  {viewingOperation.status === "attente" && (
                    <Button
                      onClick={() => handleStartUnloading(viewingOperation.id)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Démarrer déchargement
                    </Button>
                  )}
                  {viewingOperation.status === "en_cours" && (
                    <Button
                      onClick={() => handleFinishUnloading(viewingOperation.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Terminer déchargement
                    </Button>
                  )}
                  <Button variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    Photos
                  </Button>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Rapport
                  </Button>
                </div>
              </div>
            ) : (
              // Formulaire d'édition/création
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero_bl">Numéro B/L *</Label>
                      <Input
                        id="numero_bl"
                        value={formData.numero_bl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, numero_bl: e.target.value }))}
                        placeholder="BL-2025-001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="navire">Nom du navire *</Label>
                      <Input
                        id="navire"
                        value={formData.navire}
                        onChange={(e) => setFormData((prev) => ({ ...prev, navire: e.target.value }))}
                        placeholder="MV ATLANTIC STAR"
                        required
                      />
                    </div>
                  </div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="qte_prevue">Quantité prévue (tonnes) *</Label>
                      <Input
                        id="qte_prevue"
                        type="number"
                        value={formData.qte_prevue}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, qte_prevue: Number.parseFloat(e.target.value) }))
                        }
                        placeholder="2500"
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_arrivee">Date d'arrivée *</Label>
                      <Input
                        id="date_arrivee"
                        type="date"
                        value={formData.date_arrivee}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date_arrivee: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsable">Responsable port *</Label>
                    <Select
                      value={formData.responsable_port}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, responsable_port: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un responsable" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ibrahim Sawadogo">Ibrahim Sawadogo</SelectItem>
                        <SelectItem value="Fatou Traoré">Fatou Traoré</SelectItem>
                        <SelectItem value="Moussa Ouédraogo">Moussa Ouédraogo</SelectItem>
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
                    {editingOperation ? "Mettre à jour" : "Créer"}
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
            <CardTitle className="text-sm font-medium">Total Opérations</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOperations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{operationsEnAttente}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{operationsEnCours}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{operationsTerminees}</div>
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
                  placeholder="Rechercher une opération..."
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
                  <SelectItem value="attente">En attente</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="termine">Terminées</SelectItem>
                  <SelectItem value="incident">Incidents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des opérations */}
      <Card>
        <CardHeader>
          <CardTitle>Opérations portuaires</CardTitle>
          <CardDescription>{filteredOperations.length} opération(s) trouvée(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredOperations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Aucune opération ne correspond aux critères de recherche"
                : "Aucune opération enregistrée"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>B/L</TableHead>
                  <TableHead>Navire</TableHead>
                  <TableHead>Marchandise</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell className="font-medium">{operation.numero_bl}</TableCell>
                    <TableCell>{operation.navire}</TableCell>
                    <TableCell>{operation.marchandise_name}</TableCell>
                    <TableCell>{operation.qte_prevue}T</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {operation.qte_dechargee}T / {operation.qte_prevue}T
                          </span>
                          <span>{getUnloadingPercentage(operation.qte_dechargee, operation.qte_prevue)}%</span>
                        </div>
                        <Progress
                          value={getUnloadingPercentage(operation.qte_dechargee, operation.qte_prevue)}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{operation.responsable_port}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: statusColors[operation.status],
                          color: "white",
                        }}
                      >
                        {statusLabels[operation.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(operation)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(operation)}>
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
