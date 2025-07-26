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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Ship,
  Plus,
  Search,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Camera,
  Users,
  QrCode,
  Truck,
  Warehouse,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Copy,
  Phone,
  MapPin,
  Package,
} from "lucide-react"

interface Commande {
  id: string
  code_alpha_num: string
  marchandise_name: string
  qte_cmd: number
  qte_livree: number
  reste_a_decharger: number
  fournisseur_name: string
  status: string
}

interface Camion {
  id: string
  immatriculation: string
  conducteur_nom: string
  conducteur_prenom: string
  conducteur_telephone: string
  conducteur_photo?: string
  quantite: number
  destination: string
  commentaire: string
}

interface MagasinPort {
  id: string
  nom: string
  localisation: string
  responsable: string
  capacite_max: number
  stock_actuel: number
}

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
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [viewingOperation, setViewingOperation] = useState<OperationPort | null>(null)
  const [editingOperation, setEditingOperation] = useState<OperationPort | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // États du wizard de déchargement
  const [wizardStep, setWizardStep] = useState(1)
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null)
  const [modeDecharge, setModeDecharge] = useState<"camion" | "magasin" | "">("")
  const [camions, setCamions] = useState<Camion[]>([])
  const [magasinSelectionne, setMagasinSelectionne] = useState<MagasinPort | null>(null)
  const [quantiteDecharge, setQuantiteDecharge] = useState(0)
  const [commandeSearch, setCommandeSearch] = useState("")

  const [formData, setFormData] = useState({
    numero_bl: "",
    navire: "",
    marchandise_id: "",
    qte_prevue: 0,
    date_arrivee: "",
    responsable_port: "",
    observations: "",
  })

  // Données de démonstration - Commandes
  const demoCommandes: Commande[] = [
    {
      id: "1",
      code_alpha_num: "CMD-2025-001",
      marchandise_name: "Blé dur",
      qte_cmd: 500,
      qte_livree: 350,
      reste_a_decharger: 150,
      fournisseur_name: "Agro Export SA",
      status: "en_cours",
    },
    {
      id: "2",
      code_alpha_num: "CMD-2025-003",
      marchandise_name: "Huile de palme",
      qte_cmd: 200,
      qte_livree: 0,
      reste_a_decharger: 200,
      fournisseur_name: "Palm Oil Corp",
      status: "en_cours",
    },
  ]

  // Données de démonstration - Magasins port
  const demoMagasinsPort: MagasinPort[] = [
    {
      id: "1",
      nom: "Magasin A - Zone 1",
      localisation: "Quai Nord",
      responsable: "Ibrahim Sawadogo",
      capacite_max: 1000,
      stock_actuel: 650,
    },
    {
      id: "2",
      nom: "Magasin B - Zone 2",
      localisation: "Quai Sud",
      responsable: "Fatou Traoré",
      capacite_max: 800,
      stock_actuel: 320,
    },
  ]

  // Données de démonstration - Opérations
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

  // Filtrer les commandes pour la recherche
  const filteredCommandes = demoCommandes.filter(
    (cmd) =>
      cmd.code_alpha_num.toLowerCase().includes(commandeSearch.toLowerCase()) ||
      cmd.marchandise_name.toLowerCase().includes(commandeSearch.toLowerCase()),
  )

  // Calculer les statistiques
  const totalOperations = operations.length
  const operationsEnCours = operations.filter((o) => o.status === "en_cours").length
  const operationsTerminees = operations.filter((o) => o.status === "termine").length
  const operationsEnAttente = operations.filter((o) => o.status === "attente").length

  // Ajouter un camion
  const ajouterCamion = () => {
    const nouveauCamion: Camion = {
      id: Date.now().toString(),
      immatriculation: "",
      conducteur_nom: "",
      conducteur_prenom: "",
      conducteur_telephone: "",
      quantite: 0,
      destination: "",
      commentaire: "",
    }
    setCamions([...camions, nouveauCamion])
  }

  // Supprimer un camion
  const supprimerCamion = (id: string) => {
    setCamions(camions.filter((c) => c.id !== id))
  }

  // Dupliquer un camion
  const dupliquerCamion = (camion: Camion) => {
    const nouveauCamion: Camion = {
      ...camion,
      id: Date.now().toString(),
      quantite: 0,
    }
    setCamions([...camions, nouveauCamion])
  }

  // Mettre à jour un camion
  const mettreAJourCamion = (id: string, field: keyof Camion, value: string | number) => {
    setCamions(camions.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  // Calculer le total des quantités camions
  const totalQuantiteCamions = camions.reduce((sum, c) => sum + (c.quantite || 0), 0)

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
        marchandise_name: "Marchandise sélectionnée",
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
        setOperations((prev) => [newOperation, ...prev])
        setSuccess("Opération créée avec succès")
      }

      handleCloseDialog()
    } catch (err: any) {
      console.error("Error saving operation:", err)
      setError("Erreur lors de la sauvegarde")
    }
  }

  // Finaliser le déchargement (wizard étape 4)
  const finaliserDechargement = async () => {
    setError("")
    try {
      if (modeDecharge === "camion") {
        // Validation des camions
        if (camions.length === 0) {
          setError("Veuillez ajouter au moins un camion")
          return
        }

        const camionsInvalides = camions.filter(
          (c) => !c.immatriculation || !c.conducteur_nom || !c.quantite || c.quantite <= 0,
        )
        if (camionsInvalides.length > 0) {
          setError("Veuillez remplir tous les champs obligatoires des camions")
          return
        }

        if (totalQuantiteCamions > (selectedCommande?.reste_a_decharger || 0)) {
          setError("La quantité totale des camions dépasse le reste à décharger")
          return
        }

        // Créer les trips de transport
        for (const camion of camions) {
          // Simulation de création de trip transport
          console.log("Création trip transport:", camion)
        }

        setSuccess(`Déchargement direct sur ${camions.length} camion(s) finalisé avec succès`)
      } else if (modeDecharge === "magasin") {
        if (!magasinSelectionne || quantiteDecharge <= 0) {
          setError("Veuillez sélectionner un magasin et saisir une quantité valide")
          return
        }

        if (quantiteDecharge > (selectedCommande?.reste_a_decharger || 0)) {
          setError("La quantité dépasse le reste à décharger")
          return
        }

        // Simulation de mise à jour stock magasin
        console.log("Mise à jour stock magasin:", {
          magasin: magasinSelectionne,
          quantite: quantiteDecharge,
        })

        setSuccess(`Déchargement en magasin ${magasinSelectionne.nom} finalisé avec succès`)
      }

      // Fermer le wizard
      setIsWizardOpen(false)
      resetWizard()
    } catch (err) {
      console.error("Error finalizing discharge:", err)
      setError("Erreur lors de la finalisation")
    }
  }

  // Réinitialiser le wizard
  const resetWizard = () => {
    setWizardStep(1)
    setSelectedCommande(null)
    setModeDecharge("")
    setCamions([])
    setMagasinSelectionne(null)
    setQuantiteDecharge(0)
    setCommandeSearch("")
    setError("")
  }

  // Navigation wizard
  const nextStep = () => {
    if (wizardStep === 1 && !selectedCommande) {
      setError("Veuillez sélectionner une commande")
      return
    }
    if (wizardStep === 2 && !modeDecharge) {
      setError("Veuillez choisir un mode de déchargement")
      return
    }
    setError("")
    setWizardStep(wizardStep + 1)
  }

  const prevStep = () => {
    setError("")
    setWizardStep(wizardStep - 1)
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
        <div className="flex gap-2">
          <Button onClick={() => setIsWizardOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
            <Package className="mr-2 h-4 w-4" />
            Nouveau déchargement
          </Button>
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
                // Vue détaillée (contenu existant)
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
                // Formulaire d'édition/création (contenu existant simplifié)
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
      </div>

      {/* Wizard de déchargement */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Nouveau déchargement - Étape {wizardStep}/4
            </DialogTitle>
            <DialogDescription>Wizard de déchargement avec validation en 4 étapes</DialogDescription>
          </DialogHeader>

          {/* Stepper horizontal */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= wizardStep ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && <div className={`w-16 h-1 mx-2 ${step < wizardStep ? "bg-green-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {/* Étape 1 - Sélection de la commande */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Étape 1 - Sélection de la commande</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="commande-search">Recherche commande</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="commande-search"
                          placeholder="Code commande ou marchandise..."
                          value={commandeSearch}
                          onChange={(e) => setCommandeSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button variant="outline" className="mt-6 bg-transparent">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Marchandise</TableHead>
                          <TableHead>Qté Commandée</TableHead>
                          <TableHead>Qté Déchargée</TableHead>
                          <TableHead>Reste</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCommandes.map((commande) => (
                          <TableRow
                            key={commande.id}
                            className={selectedCommande?.id === commande.id ? "bg-green-50" : ""}
                          >
                            <TableCell className="font-medium">{commande.code_alpha_num}</TableCell>
                            <TableCell>{commande.marchandise_name}</TableCell>
                            <TableCell>{commande.qte_cmd}T</TableCell>
                            <TableCell>{commande.qte_livree}T</TableCell>
                            <TableCell className="font-semibold text-orange-600">
                              {commande.reste_a_decharger}T
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={selectedCommande?.id === commande.id ? "default" : "outline"}
                                onClick={() => setSelectedCommande(commande)}
                                className={
                                  selectedCommande?.id === commande.id ? "bg-green-600 hover:bg-green-700" : ""
                                }
                              >
                                {selectedCommande?.id === commande.id ? "Sélectionnée" : "Sélectionner"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {selectedCommande && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Commande sélectionnée</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Code:</span> {selectedCommande.code_alpha_num}
                        </div>
                        <div>
                          <span className="text-gray-600">Marchandise:</span> {selectedCommande.marchandise_name}
                        </div>
                        <div>
                          <span className="text-gray-600">Fournisseur:</span> {selectedCommande.fournisseur_name}
                        </div>
                        <div>
                          <span className="text-gray-600">Reste à décharger:</span>{" "}
                          <span className="font-semibold text-orange-600">{selectedCommande.reste_a_decharger}T</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 - Choix du mode de déchargement */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Étape 2 - Choix du mode de déchargement</h3>
                <RadioGroup
                  value={modeDecharge}
                  onValueChange={(value) => setModeDecharge(value as "camion" | "magasin")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="camion" id="camion" />
                      <div className="flex-1">
                        <Label htmlFor="camion" className="flex items-center gap-2 cursor-pointer">
                          <Truck className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Directement sur camion(s)</div>
                            <div className="text-sm text-gray-500">Déchargement direct pour transport immédiat</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="magasin" id="magasin" />
                      <div className="flex-1">
                        <Label htmlFor="magasin" className="flex items-center gap-2 cursor-pointer">
                          <Warehouse className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium">Dans un magasin de port</div>
                            <div className="text-sm text-gray-500">Stockage temporaire au port</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {modeDecharge === "camion" && (
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Configuration des camions</h4>
                      <Button onClick={ajouterCamion} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un camion
                      </Button>
                    </div>

                    {camions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Aucun camion ajouté. Cliquez sur "Ajouter un camion" pour commencer.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {camions.map((camion, index) => (
                          <Card key={camion.id} className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h5 className="font-medium">Camion {index + 1}</h5>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => dupliquerCamion(camion)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => supprimerCamion(camion.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Immatriculation *</Label>
                                <Input
                                  placeholder="BF-001-ABC"
                                  value={camion.immatriculation}
                                  onChange={(e) => mettreAJourCamion(camion.id, "immatriculation", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Nom conducteur *</Label>
                                <Input
                                  placeholder="Amadou"
                                  value={camion.conducteur_nom}
                                  onChange={(e) => mettreAJourCamion(camion.id, "conducteur_nom", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Prénom conducteur</Label>
                                <Input
                                  placeholder="Diallo"
                                  value={camion.conducteur_prenom}
                                  onChange={(e) => mettreAJourCamion(camion.id, "conducteur_prenom", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Téléphone</Label>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="+226 70 12 34 56"
                                    value={camion.conducteur_telephone}
                                    onChange={(e) =>
                                      mettreAJourCamion(camion.id, "conducteur_telephone", e.target.value)
                                    }
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Quantité (T) *</Label>
                                <Input
                                  type="number"
                                  step="0.001"
                                  placeholder="35.000"
                                  value={camion.quantite || ""}
                                  onChange={(e) =>
                                    mettreAJourCamion(camion.id, "quantite", Number.parseFloat(e.target.value) || 0)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Destination *</Label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="Entrepôt Ouagadougou"
                                    value={camion.destination}
                                    onChange={(e) => mettreAJourCamion(camion.id, "destination", e.target.value)}
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Label>Commentaire / BL portuaire</Label>
                              <Textarea
                                placeholder="Remarques particulières..."
                                value={camion.commentaire}
                                onChange={(e) => mettreAJourCamion(camion.id, "commentaire", e.target.value)}
                                rows={2}
                              />
                            </div>
                          </Card>
                        ))}

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total quantité camions:</span>
                            <span className="text-lg font-bold text-blue-600">{totalQuantiteCamions.toFixed(3)}T</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-600">Reste à décharger:</span>
                            <span className="text-sm font-medium text-orange-600">
                              {selectedCommande?.reste_a_decharger}T
                            </span>
                          </div>
                          {totalQuantiteCamions > (selectedCommande?.reste_a_decharger || 0) && (
                            <div className="mt-2 text-sm text-red-600">
                              ⚠️ La quantité totale dépasse le reste à décharger
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {modeDecharge === "magasin" && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold">Configuration magasin de port</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sélection magasin *</Label>
                        <Select
                          value={magasinSelectionne?.id || ""}
                          onValueChange={(value) => {
                            const magasin = demoMagasinsPort.find((m) => m.id === value)
                            setMagasinSelectionne(magasin || null)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un magasin" />
                          </SelectTrigger>
                          <SelectContent>
                            {demoMagasinsPort.map((magasin) => (
                              <SelectItem key={magasin.id} value={magasin.id}>
                                <div className="flex items-center gap-2">
                                  <Warehouse className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{magasin.nom}</div>
                                    <div className="text-xs text-gray-500">{magasin.localisation}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantité déchargée (T) *</Label>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="150.000"
                          value={quantiteDecharge || ""}
                          onChange={(e) => setQuantiteDecharge(Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {magasinSelectionne && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-800 mb-2">Magasin sélectionné</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Nom:</span> {magasinSelectionne.nom}
                          </div>
                          <div>
                            <span className="text-gray-600">Localisation:</span> {magasinSelectionne.localisation}
                          </div>
                          <div>
                            <span className="text-gray-600">Responsable:</span> {magasinSelectionne.responsable}
                          </div>
                          <div>
                            <span className="text-gray-600">Capacité disponible:</span>{" "}
                            <span className="font-medium">
                              {(magasinSelectionne.capacite_max - magasinSelectionne.stock_actuel).toFixed(0)}T
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Utilisation actuelle</span>
                            <span>
                              {Math.round((magasinSelectionne.stock_actuel / magasinSelectionne.capacite_max) * 100)}%
                            </span>
                          </div>
                          <Progress
                            value={(magasinSelectionne.stock_actuel / magasinSelectionne.capacite_max) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Étape 3 - Validation finale */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Étape 3 - Validation finale</h3>
                <div className="space-y-6">
                  {/* Récapitulatif commande */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Récapitulatif de la commande</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Code commande:</span> {selectedCommande?.code_alpha_num}
                      </div>
                      <div>
                        <span className="text-gray-600">Marchandise:</span> {selectedCommande?.marchandise_name}
                      </div>
                      <div>
                        <span className="text-gray-600">Quantité commandée:</span> {selectedCommande?.qte_cmd}T
                      </div>
                      <div>
                        <span className="text-gray-600">Déjà déchargée:</span> {selectedCommande?.qte_livree}T
                      </div>
                    </div>
                  </Card>

                  {/* Récapitulatif déchargement */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Récapitulatif du déchargement</h4>
                    {modeDecharge === "camion" ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Truck className="h-5 w-5" />
                          <span className="font-medium">Déchargement direct sur {camions.length} camion(s)</span>
                        </div>
                        <div className="space-y-2">
                          {camions.map((camion, index) => (
                            <div key={camion.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Camion {index + 1}:</span> {camion.immatriculation}
                                </div>
                                <div>
                                  <span className="font-medium">Conducteur:</span> {camion.conducteur_nom}{" "}
                                  {camion.conducteur_prenom}
                                </div>
                                <div>
                                  <span className="font-medium">Quantité:</span> {camion.quantite}T
                                </div>
                                <div className="col-span-3">
                                  <span className="font-medium">Destination:</span> {camion.destination}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total à décharger:</span>
                            <span className="text-lg font-bold text-blue-600">{totalQuantiteCamions.toFixed(3)}T</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <Warehouse className="h-5 w-5" />
                          <span className="font-medium">Déchargement en magasin de port</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Magasin:</span> {magasinSelectionne?.nom}
                            </div>
                            <div>
                              <span className="font-medium">Localisation:</span> {magasinSelectionne?.localisation}
                            </div>
                            <div>
                              <span className="font-medium">Responsable:</span> {magasinSelectionne?.responsable}
                            </div>
                            <div>
                              <span className="font-medium">Quantité:</span> {quantiteDecharge}T
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Zone de signature */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Signature numérique</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="text-gray-500 mb-2">Zone de signature</div>
                      <Button variant="outline" size="sm">
                        Signer sur tablette/mobile
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4 - Notifications */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Déchargement finalisé avec succès !</h3>
                <p className="text-gray-600 mb-6">
                  Le BL de déchargement a été généré et les notifications ont été envoyées.
                </p>

                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Actions effectuées</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✓ Mise à jour de la quantité livrée dans la commande</li>
                      <li>✓ Génération du BL de déchargement PDF</li>
                      {modeDecharge === "camion" && (
                        <>
                          <li>✓ Création de {camions.length} trip(s) de transport</li>
                          <li>✓ Notification WebSocket vers le module Transport</li>
                          <li>✓ Génération des QR codes pour suivi GPS</li>
                        </>
                      )}
                      {modeDecharge === "magasin" && (
                        <>
                          <li>✓ Mise à jour du stock magasin de port</li>
                          <li>✓ Notification au responsable magasin</li>
                          <li>✓ Notification au contrôleur pour validation</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Télécharger BL
                    </Button>
                    <Button variant="outline">
                      <QrCode className="mr-2 h-4 w-4" />
                      Voir QR codes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages d'erreur */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation du wizard */}
          <DialogFooter className="flex justify-between">
            <div>
              {wizardStep > 1 && wizardStep < 4 && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsWizardOpen(false)
                  resetWizard()
                }}
              >
                {wizardStep === 4 ? "Fermer" : "Annuler"}
              </Button>
              {wizardStep < 3 && (
                <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {wizardStep === 3 && (
                <Button onClick={finaliserDechargement} className="bg-green-600 hover:bg-green-700">
                  Finaliser le déchargement
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages de succès */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
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
