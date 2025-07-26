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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  FileText,
  Plus,
  Search,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Tag,
  ImageIcon,
  File,
  Archive,
  Users,
  Building,
  Truck,
  ShoppingCart,
  TrendingUp,
  Package,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Document {
  id: string
  name: string
  type: "facture" | "BL" | "CMC" | "assurance" | "permis" | "contrat" | "certificat" | "autre"
  file_url: string
  file_size: number
  mime_type: string
  start_at: string
  end_at?: string
  entity_type: "commande" | "vente" | "entrepot" | "camion" | "conducteur" | "client" | "fournisseur"
  entity_id: string
  entity_name: string
  status: "valide" | "expire" | "expire_soon"
  alert_days: number
  tags: string[]
  keywords: string
  created_by_name: string
  created_at: string
  updated_at: string
}

const documentTypes = {
  facture: { label: "Facture", icon: FileText, color: "bg-blue-500" },
  BL: { label: "Bon de Livraison", icon: Package, color: "bg-green-500" },
  CMC: { label: "CMC", icon: Truck, color: "bg-orange-500" },
  assurance: { label: "Assurance", icon: Archive, color: "bg-purple-500" },
  permis: { label: "Permis", icon: ImageIcon, color: "bg-red-500" },
  contrat: { label: "Contrat", icon: FileText, color: "bg-indigo-500" },
  certificat: { label: "Certificat", icon: CheckCircle, color: "bg-teal-500" },
  autre: { label: "Autre", icon: File, color: "bg-gray-500" },
}

const entityTypes = {
  commande: { label: "Commande", icon: ShoppingCart },
  vente: { label: "Vente", icon: TrendingUp },
  entrepot: { label: "Entrepôt", icon: Building },
  camion: { label: "Camion", icon: Truck },
  conducteur: { label: "Conducteur", icon: Users },
  client: { label: "Client", icon: Users },
  fournisseur: { label: "Fournisseur", icon: Building },
}

const statusLabels = {
  valide: "Valide",
  expire: "Expiré",
  expire_soon: "Expire bientôt",
}

const statusColors = {
  valide: "bg-green-500",
  expire: "bg-red-500",
  expire_soon: "bg-orange-500",
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterEntity, setFilterEntity] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // États pour le formulaire
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    entity_type: "",
    entity_id: "",
    start_at: new Date(),
    end_at: undefined as Date | undefined,
    alert_days: 30,
    tags: "",
    keywords: "",
    file: null as File | null,
  })

  // Données de démonstration
  const demoDocuments: Document[] = [
    {
      id: "doc-1",
      name: "Facture Agro Export SA - CMD-2025-001",
      type: "facture",
      file_url: "/documents/facture-agro-001.pdf",
      file_size: 245760,
      mime_type: "application/pdf",
      start_at: "2025-01-15T00:00:00Z",
      entity_type: "commande",
      entity_id: "cmd-1",
      entity_name: "CMD-2025-001",
      status: "valide",
      alert_days: 30,
      tags: ["facture", "fournisseur", "blé"],
      keywords: "facture agro export blé dur",
      created_by_name: "Marie Ouédraogo",
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-01-15T10:30:00Z",
    },
    {
      id: "doc-2",
      name: "Assurance Camion BF-001-ABC",
      type: "assurance",
      file_url: "/documents/assurance-bf001.pdf",
      file_size: 189440,
      mime_type: "application/pdf",
      start_at: "2025-01-01T00:00:00Z",
      end_at: "2025-12-31T23:59:59Z",
      entity_type: "camion",
      entity_id: "camion-1",
      entity_name: "BF-001-ABC",
      status: "expire_soon",
      alert_days: 30,
      tags: ["assurance", "camion", "transport"],
      keywords: "assurance véhicule transport",
      created_by_name: "Ibrahim Sawadogo",
      created_at: "2025-01-01T08:00:00Z",
      updated_at: "2025-01-01T08:00:00Z",
    },
    {
      id: "doc-3",
      name: "Permis de conduire Amadou Diallo",
      type: "permis",
      file_url: "/documents/permis-amadou.pdf",
      file_size: 156672,
      mime_type: "application/pdf",
      start_at: "2023-06-15T00:00:00Z",
      end_at: "2025-06-15T23:59:59Z",
      entity_type: "conducteur",
      entity_id: "conducteur-1",
      entity_name: "Amadou Diallo",
      status: "expire_soon",
      alert_days: 60,
      tags: ["permis", "conducteur", "transport"],
      keywords: "permis conduire poids lourd",
      created_by_name: "Fatou Traoré",
      created_at: "2023-06-15T14:20:00Z",
      updated_at: "2023-06-15T14:20:00Z",
    },
    {
      id: "doc-4",
      name: "BL Déchargement TR-2025-001",
      type: "BL",
      file_url: "/documents/bl-tr001.pdf",
      file_size: 98304,
      mime_type: "application/pdf",
      start_at: "2025-01-26T14:30:00Z",
      entity_type: "commande",
      entity_id: "cmd-1",
      entity_name: "CMD-2025-001",
      status: "valide",
      alert_days: 30,
      tags: ["BL", "déchargement", "transport"],
      keywords: "bon livraison déchargement port",
      created_by_name: "Système",
      created_at: "2025-01-26T14:30:00Z",
      updated_at: "2025-01-26T14:30:00Z",
    },
    {
      id: "doc-5",
      name: "Certificat Entrepôt Central",
      type: "certificat",
      file_url: "/documents/cert-entrepot-central.pdf",
      file_size: 312320,
      mime_type: "application/pdf",
      start_at: "2024-03-01T00:00:00Z",
      end_at: "2025-02-28T23:59:59Z",
      entity_type: "entrepot",
      entity_id: "entrepot-1",
      entity_name: "Entrepôt Central Ouagadougou",
      status: "expire",
      alert_days: 30,
      tags: ["certificat", "entrepôt", "conformité"],
      keywords: "certificat conformité stockage",
      created_by_name: "Admin",
      created_at: "2024-03-01T09:00:00Z",
      updated_at: "2024-03-01T09:00:00Z",
    },
  ]

  useEffect(() => {
    // Calculer le statut des documents
    const documentsWithStatus = demoDocuments.map((doc) => {
      if (!doc.end_at) return { ...doc, status: "valide" as const }

      const now = new Date()
      const endDate = new Date(doc.end_at)
      const alertDate = new Date(endDate.getTime() - doc.alert_days * 24 * 60 * 60 * 1000)

      let status: "valide" | "expire" | "expire_soon"
      if (now > endDate) {
        status = "expire"
      } else if (now > alertDate) {
        status = "expire_soon"
      } else {
        status = "valide"
      }

      return { ...doc, status }
    })

    setDocuments(documentsWithStatus)
    setLoading(false)
  }, [])

  // Filtrer les documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.keywords.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === "all" || doc.type === filterType
    const matchesEntity = filterEntity === "all" || doc.entity_type === filterEntity
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus

    return matchesSearch && matchesType && matchesEntity && matchesStatus
  })

  // Filtrer par onglet
  const getDocumentsByTab = (tab: string) => {
    switch (tab) {
      case "expire_soon":
        return filteredDocuments.filter((doc) => doc.status === "expire_soon")
      case "expire":
        return filteredDocuments.filter((doc) => doc.status === "expire")
      case "valide":
        return filteredDocuments.filter((doc) => doc.status === "valide")
      default:
        return filteredDocuments
    }
  }

  // Calculer les statistiques
  const totalDocuments = documents.length
  const documentsValides = documents.filter((d) => d.status === "valide").length
  const documentsExpireSoon = documents.filter((d) => d.status === "expire_soon").length
  const documentsExpires = documents.filter((d) => d.status === "expire").length

  // Gérer l'upload de fichier
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Vérifier la taille (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError("Le fichier ne peut pas dépasser 20 MB")
        return
      }

      // Vérifier le format
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        setError("Seuls les fichiers PDF, JPG et PNG sont autorisés")
        return
      }

      setFormData((prev) => ({ ...prev, file }))
      setError("")
    }
  }

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.file && !editingDocument) {
      setError("Veuillez sélectionner un fichier")
      return
    }

    try {
      const newDocument: Document = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type as any,
        file_url: `/documents/${formData.file?.name || "document.pdf"}`,
        file_size: formData.file?.size || 0,
        mime_type: formData.file?.type || "application/pdf",
        start_at: formData.start_at.toISOString(),
        end_at: formData.end_at?.toISOString(),
        entity_type: formData.entity_type as any,
        entity_id: formData.entity_id,
        entity_name: "Entité sélectionnée",
        status: "valide",
        alert_days: formData.alert_days,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        keywords: formData.keywords,
        created_by_name: "Utilisateur actuel",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (editingDocument) {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === editingDocument.id
              ? {
                  ...doc,
                  name: formData.name,
                  type: formData.type as any,
                  entity_type: formData.entity_type as any,
                  entity_id: formData.entity_id,
                  start_at: formData.start_at.toISOString(),
                  end_at: formData.end_at?.toISOString(),
                  alert_days: formData.alert_days,
                  tags: formData.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                  keywords: formData.keywords,
                  updated_at: new Date().toISOString(),
                }
              : doc,
          ),
        )
        setSuccess("Document mis à jour avec succès")
      } else {
        setDocuments((prev) => [newDocument, ...prev])
        setSuccess("Document ajouté avec succès")
      }

      handleCloseDialog()
    } catch (err: any) {
      console.error("Error saving document:", err)
      setError("Erreur lors de la sauvegarde")
    }
  }

  // Supprimer un document
  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id))
        setSuccess("Document supprimé avec succès")
      } catch (err) {
        console.error("Error deleting document:", err)
        setError("Erreur lors de la suppression")
      }
    }
  }

  // Ouvrir le dialog pour édition
  const handleEdit = (document: Document) => {
    setEditingDocument(document)
    setFormData({
      name: document.name,
      type: document.type,
      entity_type: document.entity_type,
      entity_id: document.entity_id,
      start_at: new Date(document.start_at),
      end_at: document.end_at ? new Date(document.end_at) : undefined,
      alert_days: document.alert_days,
      tags: document.tags.join(", "),
      keywords: document.keywords,
      file: null,
    })
    setIsDialogOpen(true)
  }

  // Voir les détails
  const handleView = (document: Document) => {
    setViewingDocument(document)
    setIsDialogOpen(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingDocument(null)
    setViewingDocument(null)
    setFormData({
      name: "",
      type: "",
      entity_type: "",
      entity_id: "",
      start_at: new Date(),
      end_at: undefined,
      alert_days: 30,
      tags: "",
      keywords: "",
      file: null,
    })
    setError("")
    setSuccess("")
  }

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // Calculer les jours restants
  const getDaysUntilExpiry = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-[#0F4C75]" />
            Documents
          </h1>
          <p className="text-gray-600">Gestion électronique des documents avec suivi des échéances</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingDocument
                  ? "Détails du document"
                  : editingDocument
                    ? "Modifier le document"
                    : "Nouveau document"}
              </DialogTitle>
              <DialogDescription>
                {viewingDocument
                  ? "Informations détaillées du document"
                  : editingDocument
                    ? "Modifiez les informations du document"
                    : "Ajoutez un nouveau document au système"}
              </DialogDescription>
            </DialogHeader>

            {viewingDocument ? (
              // Vue détaillée
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${documentTypes[viewingDocument.type].color}`}>
                    {documentTypes[viewingDocument.type].icon({ className: "h-6 w-6 text-white" })}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{viewingDocument.name}</h3>
                    <p className="text-sm text-gray-600">
                      {documentTypes[viewingDocument.type].label} - {formatFileSize(viewingDocument.file_size)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={statusColors[viewingDocument.status]}>
                        {statusLabels[viewingDocument.status]}
                      </Badge>
                      {viewingDocument.end_at && (
                        <Badge variant="outline">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {viewingDocument.status === "expire"
                            ? "Expiré"
                            : `${getDaysUntilExpiry(viewingDocument.end_at)} jours restants`}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Entité liée</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {entityTypes[viewingDocument.entity_type].icon({ className: "h-4 w-4 text-gray-400" })}
                      <span className="font-semibold">
                        {entityTypes[viewingDocument.entity_type].label} - {viewingDocument.entity_name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Créé par</Label>
                    <p className="font-semibold mt-1">{viewingDocument.created_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date de début</Label>
                    <p className="mt-1">{format(new Date(viewingDocument.start_at), "dd MMMM yyyy", { locale: fr })}</p>
                  </div>
                  {viewingDocument.end_at && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date d'expiration</Label>
                      <p className="mt-1">{format(new Date(viewingDocument.end_at), "dd MMMM yyyy", { locale: fr })}</p>
                    </div>
                  )}
                </div>

                {viewingDocument.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {viewingDocument.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {viewingDocument.keywords && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Mots-clés</Label>
                    <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{viewingDocument.keywords}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Eye className="mr-2 h-4 w-4" />
                    Prévisualiser
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                  <Button variant="outline" onClick={() => handleEdit(viewingDocument)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </div>
              </div>
            ) : (
              // Formulaire d'édition/création
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du document *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Facture Agro Export SA - CMD-2025-001"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type de document *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(documentTypes).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                {config.icon({ className: "h-4 w-4" })}
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entity_type">Type d'entité *</Label>
                      <Select
                        value={formData.entity_type}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, entity_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une entité" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(entityTypes).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                {config.icon({ className: "h-4 w-4" })}
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entity_id">Référence entité *</Label>
                    <Input
                      id="entity_id"
                      value={formData.entity_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, entity_id: e.target.value }))}
                      placeholder="CMD-2025-001, BF-001-ABC, etc."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date de début *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(formData.start_at, "dd MMMM yyyy", { locale: fr })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.start_at}
                            onSelect={(date) => date && setFormData((prev) => ({ ...prev, start_at: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Date d'expiration</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.end_at
                              ? format(formData.end_at, "dd MMMM yyyy", { locale: fr })
                              : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.end_at}
                            onSelect={(date) => setFormData((prev) => ({ ...prev, end_at: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alert_days">Alerte avant expiration (jours)</Label>
                    <Input
                      id="alert_days"
                      type="number"
                      value={formData.alert_days}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, alert_days: Number.parseInt(e.target.value) }))
                      }
                      placeholder="30"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                      placeholder="facture, fournisseur, blé"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Mots-clés pour recherche</Label>
                    <Textarea
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                      placeholder="Mots-clés pour faciliter la recherche..."
                      rows={2}
                    />
                  </div>

                  {!editingDocument && (
                    <div className="space-y-2">
                      <Label htmlFor="file">Fichier *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="file"
                          onChange={handleFileUpload}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                        />
                        <label htmlFor="file" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Cliquez pour sélectionner un fichier ou glissez-déposez
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG - Max 20 MB</p>
                        </label>
                        {formData.file && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">{formData.file.name}</span>
                              <span className="text-xs text-green-600">({formatFileSize(formData.file.size)})</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                    {editingDocument ? "Mettre à jour" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
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

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valides</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{documentsValides}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expire Bientôt</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{documentsExpireSoon}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirés</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{documentsExpires}</div>
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
                  placeholder="Rechercher dans les documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  {Object.entries(documentTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Entité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes entités</SelectItem>
                  {Object.entries(entityTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
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

      {/* Onglets de documents */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Tous
            <Badge className="ml-2 bg-gray-500">{getDocumentsByTab("all").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="valide">
            Valides
            <Badge className="ml-2 bg-green-500">{getDocumentsByTab("valide").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expire_soon">
            Expire Bientôt
            <Badge className="ml-2 bg-orange-500">{getDocumentsByTab("expire_soon").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expire">
            Expirés
            <Badge className="ml-2 bg-red-500">{getDocumentsByTab("expire").length}</Badge>
          </TabsTrigger>
        </TabsList>

        {["all", "valide", "expire_soon", "expire"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {tab === "all"
                    ? "Tous les documents"
                    : tab === "valide"
                      ? "Documents valides"
                      : tab === "expire_soon"
                        ? "Documents expirant bientôt"
                        : "Documents expirés"}
                </CardTitle>
                <CardDescription>{getDocumentsByTab(tab).length} document(s) trouvé(s)</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : getDocumentsByTab(tab).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm || filterType !== "all" || filterEntity !== "all" || filterStatus !== "all"
                      ? "Aucun document ne correspond aux critères de recherche"
                      : "Aucun document dans cette catégorie"}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Entité</TableHead>
                        <TableHead>Taille</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getDocumentsByTab(tab).map((document) => (
                        <TableRow key={document.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded ${documentTypes[document.type].color}`}>
                                {documentTypes[document.type].icon({ className: "h-4 w-4 text-white" })}
                              </div>
                              <div>
                                <div className="font-medium">{document.name}</div>
                                <div className="text-sm text-gray-500">
                                  Par {document.created_by_name} le{" "}
                                  {format(new Date(document.created_at), "dd/MM/yyyy", { locale: fr })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{documentTypes[document.type].label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {entityTypes[document.entity_type].icon({ className: "h-4 w-4 text-gray-400" })}
                              <span className="text-sm">{document.entity_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatFileSize(document.file_size)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Début: {format(new Date(document.start_at), "dd/MM/yyyy", { locale: fr })}</div>
                              {document.end_at && (
                                <div
                                  className={
                                    document.status === "expire"
                                      ? "text-red-600"
                                      : document.status === "expire_soon"
                                        ? "text-orange-600"
                                        : ""
                                  }
                                >
                                  Fin: {format(new Date(document.end_at), "dd/MM/yyyy", { locale: fr })}
                                  {document.status !== "expire" && (
                                    <span className="ml-1">({getDaysUntilExpiry(document.end_at)} j)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[document.status]}>
                              {document.status === "expire" && <AlertTriangle className="mr-1 h-3 w-3" />}
                              {document.status === "expire_soon" && <Clock className="mr-1 h-3 w-3" />}
                              {document.status === "valide" && <CheckCircle className="mr-1 h-3 w-3" />}
                              {statusLabels[document.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {document.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {document.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{document.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleView(document)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(document)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(document.id)}
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
        ))}
      </Tabs>
    </div>
  )
}
