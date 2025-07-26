"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  FileText,
  Upload,
  Search,
  CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Trash2,
  Tag,
  FileImage,
  FileIcon as FilePdf,
  FileSpreadsheet,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
  status: "valide" | "expire" | "expire_soon"
  alert_days: number
  tags: string[]
  keywords?: string
  created_by_id: string
  created_at: string
  entity_name?: string
  days_until_expiry?: number
}

interface DocumentStats {
  total: number
  valide: number
  expire_soon: number
  expire: number
}

// Fonction utilitaire pour formater les dates
const formatDate = (dateString: string, options?: { includeTime?: boolean }) => {
  const date = new Date(dateString)
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }

  if (options?.includeTime) {
    dateOptions.hour = "2-digit"
    dateOptions.minute = "2-digit"
  }

  return date.toLocaleDateString("fr-FR", dateOptions)
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<DocumentStats>({ total: 0, valide: 0, expire_soon: 0, expire: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Simuler les données
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: "1",
        name: "Assurance Camion CAM-001",
        type: "assurance",
        file_url: "/documents/assurance-cam-001.pdf",
        file_size: 2048576,
        mime_type: "application/pdf",
        start_at: "2024-01-01T00:00:00Z",
        end_at: "2024-12-31T23:59:59Z",
        entity_type: "camion",
        entity_id: "cam-001",
        status: "expire_soon",
        alert_days: 30,
        tags: ["assurance", "camion", "transport"],
        keywords: "assurance responsabilité civile transport",
        created_by_id: "user-001",
        created_at: "2024-01-01T10:00:00Z",
        entity_name: "Camion CAM-001",
        days_until_expiry: 15,
      },
      {
        id: "2",
        name: "Permis Conducteur Amadou Traoré",
        type: "permis",
        file_url: "/documents/permis-amadou.pdf",
        file_size: 1024768,
        mime_type: "application/pdf",
        start_at: "2023-06-15T00:00:00Z",
        end_at: "2025-06-15T23:59:59Z",
        entity_type: "conducteur",
        entity_id: "user-001",
        status: "valide",
        alert_days: 60,
        tags: ["permis", "conducteur", "poids-lourd"],
        created_by_id: "user-002",
        created_at: "2023-06-15T14:30:00Z",
        entity_name: "Amadou Traoré",
        days_until_expiry: 365,
      },
      {
        id: "3",
        name: "Facture CMD-2024-001",
        type: "facture",
        file_url: "/documents/facture-cmd-001.pdf",
        file_size: 512384,
        mime_type: "application/pdf",
        start_at: "2024-01-15T00:00:00Z",
        entity_type: "commande",
        entity_id: "cmd-001",
        status: "valide",
        alert_days: 0,
        tags: ["facture", "commande", "fournisseur"],
        created_by_id: "user-001",
        created_at: "2024-01-15T16:45:00Z",
        entity_name: "CMD-2024-001",
      },
      {
        id: "4",
        name: "Certificat Entrepôt Ouaga",
        type: "certificat",
        file_url: "/documents/cert-entrepot-ouaga.pdf",
        file_size: 768192,
        mime_type: "application/pdf",
        start_at: "2023-03-01T00:00:00Z",
        end_at: "2024-02-29T23:59:59Z",
        entity_type: "entrepot",
        entity_id: "ent-001",
        status: "expire",
        alert_days: 30,
        tags: ["certificat", "entrepôt", "conformité"],
        created_by_id: "user-003",
        created_at: "2023-03-01T09:15:00Z",
        entity_name: "Entrepôt Ouagadougou",
        days_until_expiry: -30,
      },
    ]

    setDocuments(mockDocuments)

    // Calculer les statistiques
    const newStats = {
      total: mockDocuments.length,
      valide: mockDocuments.filter((d) => d.status === "valide").length,
      expire_soon: mockDocuments.filter((d) => d.status === "expire_soon").length,
      expire: mockDocuments.filter((d) => d.status === "expire").length,
    }
    setStats(newStats)

    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valide":
        return "bg-green-100 text-green-800"
      case "expire_soon":
        return "bg-yellow-100 text-yellow-800"
      case "expire":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valide":
        return <CheckCircle className="h-4 w-4" />
      case "expire_soon":
        return <Clock className="h-4 w-4" />
      case "expire":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return <FilePdf className="h-5 w-5 text-red-500" />
    if (mimeType.includes("image")) return <FileImage className="h-5 w-5 text-blue-500" />
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: `${file.name} dépasse la limite de 20MB.`,
          variant: "destructive",
        })
        return
      }

      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Type de fichier non supporté",
          description: `${file.name} n'est pas un fichier PDF, JPG ou PNG.`,
          variant: "destructive",
        })
        return
      }

      // Simuler l'upload
      toast({
        title: "Document uploadé",
        description: `${file.name} a été uploadé avec succès.`,
      })
    })
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.keywords && doc.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === "all" || doc.type === typeFilter
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesEntity = entityFilter === "all" || doc.entity_type === entityFilter
    return matchesSearch && matchesType && matchesStatus && matchesEntity
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion Électronique de Documents</h1>
          <p className="text-muted-foreground">Centralisation et suivi des échéances documentaires</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Nouveau Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un Document</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Zone de drag & drop */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">Glissez-déposez vos fichiers ici</p>
                <p className="text-sm text-muted-foreground mb-4">
                  ou cliquez pour sélectionner (PDF, JPG, PNG - max 20MB)
                </p>
                <Button variant="outline">Sélectionner des fichiers</Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doc-name">Nom du document</Label>
                  <Input id="doc-name" placeholder="Ex: Assurance Camion CAM-001" />
                </div>
                <div>
                  <Label htmlFor="doc-type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facture">Facture</SelectItem>
                      <SelectItem value="BL">Bon de Livraison</SelectItem>
                      <SelectItem value="CMC">CMC</SelectItem>
                      <SelectItem value="assurance">Assurance</SelectItem>
                      <SelectItem value="permis">Permis</SelectItem>
                      <SelectItem value="contrat">Contrat</SelectItem>
                      <SelectItem value="certificat">Certificat</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="entity-type">Entité liée</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'entité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commande">Commande</SelectItem>
                      <SelectItem value="vente">Vente</SelectItem>
                      <SelectItem value="entrepot">Entrepôt</SelectItem>
                      <SelectItem value="camion">Camion</SelectItem>
                      <SelectItem value="conducteur">Conducteur</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="fournisseur">Fournisseur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="entity-id">Référence entité</Label>
                  <Input id="entity-id" placeholder="Ex: CAM-001, CMD-2024-001" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de début</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Sélectionner une date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Date d'expiration (optionnel)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Sélectionner une date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="alert-days">Alerte avant expiration (jours)</Label>
                <Input id="alert-days" type="number" defaultValue="30" />
              </div>

              <div>
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input id="tags" placeholder="Ex: assurance, transport, camion" />
              </div>

              <div>
                <Label htmlFor="keywords">Mots-clés pour recherche</Label>
                <Textarea id="keywords" placeholder="Mots-clés pour faciliter la recherche..." />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Document ajouté",
                    description: "Le document a été ajouté avec succès.",
                  })
                  setIsUploadDialogOpen(false)
                }}
              >
                Ajouter Document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.valide}</p>
                <p className="text-sm text-muted-foreground">Valides</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.expire_soon}</p>
                <p className="text-sm text-muted-foreground">Expirent bientôt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.expire}</p>
                <p className="text-sm text-muted-foreground">Expirés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, tags, mots-clés..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type de document" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="facture">Facture</SelectItem>
            <SelectItem value="BL">Bon de Livraison</SelectItem>
            <SelectItem value="CMC">CMC</SelectItem>
            <SelectItem value="assurance">Assurance</SelectItem>
            <SelectItem value="permis">Permis</SelectItem>
            <SelectItem value="contrat">Contrat</SelectItem>
            <SelectItem value="certificat">Certificat</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="valide">Valide</SelectItem>
            <SelectItem value="expire_soon">Expire bientôt</SelectItem>
            <SelectItem value="expire">Expiré</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Entité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les entités</SelectItem>
            <SelectItem value="commande">Commande</SelectItem>
            <SelectItem value="vente">Vente</SelectItem>
            <SelectItem value="entrepot">Entrepôt</SelectItem>
            <SelectItem value="camion">Camion</SelectItem>
            <SelectItem value="conducteur">Conducteur</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="fournisseur">Fournisseur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Vue grille</TabsTrigger>
          <TabsTrigger value="list">Vue liste</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier échéances</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedDocument(doc)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(doc.mime_type)}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm truncate">{doc.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{doc.entity_name}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(doc.status)} variant="secondary">
                      {getStatusIcon(doc.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{doc.type}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Taille:</span>
                      <span className="font-medium">{formatFileSize(doc.file_size)}</span>
                    </div>
                    {doc.end_at && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Expire:</span>
                        <span
                          className={`font-medium ${
                            doc.status === "expire"
                              ? "text-red-600"
                              : doc.status === "expire_soon"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {doc.days_until_expiry !== undefined && doc.days_until_expiry < 0
                            ? `Il y a ${Math.abs(doc.days_until_expiry)} jours`
                            : doc.days_until_expiry !== undefined && doc.days_until_expiry === 0
                              ? "Aujourd'hui"
                              : doc.days_until_expiry !== undefined
                                ? `Dans ${doc.days_until_expiry} jours`
                                : formatDate(doc.end_at)}
                        </span>
                      </div>
                    )}
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{doc.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => setSelectedDocument(doc)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(doc.mime_type)}
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doc.entity_name} • {doc.type} • {formatFileSize(doc.file_size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {doc.end_at && (
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {doc.days_until_expiry !== undefined && doc.days_until_expiry < 0
                              ? `Expiré il y a ${Math.abs(doc.days_until_expiry)} jours`
                              : doc.days_until_expiry !== undefined && doc.days_until_expiry === 0
                                ? "Expire aujourd'hui"
                                : doc.days_until_expiry !== undefined
                                  ? `Expire dans ${doc.days_until_expiry} jours`
                                  : formatDate(doc.end_at)}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(doc.end_at)}</p>
                        </div>
                      )}

                      <Badge className={getStatusColor(doc.status)} variant="secondary">
                        {getStatusIcon(doc.status)}
                        <span className="ml-1">{doc.status}</span>
                      </Badge>

                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {doc.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Calendrier des Échéances</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Documents expirés</h4>
                  <div className="space-y-2">
                    {documents
                      .filter((doc) => doc.status === "expire")
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-red-50 rounded border-l-4 border-red-500"
                        >
                          <div className="flex items-center space-x-2">
                            {getFileIcon(doc.mime_type)}
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.entity_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-red-600">
                              Expiré il y a {Math.abs(doc.days_until_expiry || 0)} jours
                            </p>
                            <p className="text-xs text-muted-foreground">{doc.end_at && formatDate(doc.end_at)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-yellow-600 mb-2">Expirent bientôt</h4>
                  <div className="space-y-2">
                    {documents
                      .filter((doc) => doc.status === "expire_soon")
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-yellow-50 rounded border-l-4 border-yellow-500"
                        >
                          <div className="flex items-center space-x-2">
                            {getFileIcon(doc.mime_type)}
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.entity_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-yellow-600">
                              Expire dans {doc.days_until_expiry} jours
                            </p>
                            <p className="text-xs text-muted-foreground">{doc.end_at && formatDate(doc.end_at)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-green-600 mb-2">Documents valides</h4>
                  <div className="space-y-2">
                    {documents
                      .filter((doc) => doc.status === "valide" && doc.end_at)
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-green-50 rounded border-l-4 border-green-500"
                        >
                          <div className="flex items-center space-x-2">
                            {getFileIcon(doc.mime_type)}
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.entity_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              Expire dans {doc.days_until_expiry} jours
                            </p>
                            <p className="text-xs text-muted-foreground">{doc.end_at && formatDate(doc.end_at)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog détails document */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getFileIcon(selectedDocument.mime_type)}
                <span>{selectedDocument.name}</span>
                <Badge className={getStatusColor(selectedDocument.status)} variant="secondary">
                  {getStatusIcon(selectedDocument.status)}
                  <span className="ml-1">{selectedDocument.status}</span>
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Informations générales</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedDocument.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taille:</span>
                      <span className="font-medium">{formatFileSize(selectedDocument.file_size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="font-medium">{selectedDocument.mime_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entité liée:</span>
                      <span className="font-medium">{selectedDocument.entity_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type d'entité:</span>
                      <span className="font-medium">{selectedDocument.entity_type}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Dates et échéances</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de début:</span>
                      <span className="font-medium">{formatDate(selectedDocument.start_at)}</span>
                    </div>
                    {selectedDocument.end_at && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date d'expiration:</span>
                          <span className="font-medium">{formatDate(selectedDocument.end_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jours restants:</span>
                          <span
                            className={`font-medium ${
                              selectedDocument.status === "expire"
                                ? "text-red-600"
                                : selectedDocument.status === "expire_soon"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {selectedDocument.days_until_expiry !== undefined && selectedDocument.days_until_expiry < 0
                              ? `Expiré il y a ${Math.abs(selectedDocument.days_until_expiry)} jours`
                              : selectedDocument.days_until_expiry !== undefined &&
                                  selectedDocument.days_until_expiry === 0
                                ? "Expire aujourd'hui"
                                : selectedDocument.days_until_expiry !== undefined
                                  ? `${selectedDocument.days_until_expiry} jours`
                                  : "N/A"}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alerte avant expiration:</span>
                      <span className="font-medium">{selectedDocument.alert_days} jours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Créé le:</span>
                      <span className="font-medium">
                        {formatDate(selectedDocument.created_at, { includeTime: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDocument.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedDocument.keywords && (
                <div>
                  <h4 className="font-medium mb-3">Mots-clés</h4>
                  <p className="text-sm text-muted-foreground">{selectedDocument.keywords}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-3">Prévisualisation</h4>
                <div className="border rounded-lg p-4 bg-gray-50 text-center">
                  {selectedDocument.mime_type === "application/pdf" ? (
                    <div>
                      <FilePdf className="h-16 w-16 mx-auto text-red-500 mb-2" />
                      <p className="text-sm text-muted-foreground">Prévisualisation PDF</p>
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        Ouvrir le PDF
                      </Button>
                    </div>
                  ) : selectedDocument.mime_type.includes("image") ? (
                    <div>
                      <FileImage className="h-16 w-16 mx-auto text-blue-500 mb-2" />
                      <p className="text-sm text-muted-foreground">Prévisualisation image</p>
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir l'image
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <FileText className="h-16 w-16 mx-auto text-gray-500 mb-2" />
                      <p className="text-sm text-muted-foreground">Prévisualisation non disponible</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Prévisualiser
                  </Button>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
