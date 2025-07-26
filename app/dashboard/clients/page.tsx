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
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Star, TrendingUp, Clock } from "lucide-react"

interface Client {
  id: string
  name: string
  phone: string
  email: string
  address: string
  ice: string
  credit_days: number
  created_at: string
  total_orders: number
  total_amount: number
  last_order_date?: string
  payment_score: "bronze" | "silver" | "gold"
}

const scoreColors = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
}

const scoreLabels = {
  bronze: "Bronze",
  silver: "Argent",
  gold: "Or",
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    ice: "",
    credit_days: 30,
  })

  // Données de démonstration
  const demoClients: Client[] = [
    {
      id: "1",
      name: "SONABHY SA",
      phone: "+226 25 30 60 70",
      email: "contact@sonabhy.bf",
      address: "01 BP 4394 Ouagadougou 01",
      ice: "BF001234567890",
      credit_days: 45,
      created_at: "2024-01-15T00:00:00Z",
      total_orders: 25,
      total_amount: 2500000,
      last_order_date: "2025-01-20T00:00:00Z",
      payment_score: "gold",
    },
    {
      id: "2",
      name: "BURKINA DISTRIBUTION",
      phone: "+226 25 31 42 85",
      email: "info@burkinadist.bf",
      address: "Secteur 15, Ouagadougou",
      ice: "BF001234567891",
      credit_days: 30,
      created_at: "2024-03-10T00:00:00Z",
      total_orders: 18,
      total_amount: 1800000,
      last_order_date: "2025-01-18T00:00:00Z",
      payment_score: "silver",
    },
    {
      id: "3",
      name: "COMMERCE GENERAL SARL",
      phone: "+226 25 33 21 54",
      email: "cg@commercegeneral.bf",
      address: "Zone Industrielle, Bobo-Dioulasso",
      ice: "BF001234567892",
      credit_days: 15,
      created_at: "2024-06-20T00:00:00Z",
      total_orders: 8,
      total_amount: 650000,
      last_order_date: "2025-01-15T00:00:00Z",
      payment_score: "bronze",
    },
  ]

  useEffect(() => {
    setClients(demoClients)
    setLoading(false)
  }, [])

  // Filtrer les clients
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm),
  )

  // Calculer les statistiques
  const totalClients = clients.length
  const clientsActifs = clients.filter(
    (c) => c.last_order_date && new Date(c.last_order_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  ).length
  const chiffreAffaireTotal = clients.reduce((sum, c) => sum + c.total_amount, 0)
  const commandesTotales = clients.reduce((sum, c) => sum + c.total_orders, 0)

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const newClient: Client = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        ice: formData.ice,
        credit_days: formData.credit_days,
        created_at: new Date().toISOString(),
        total_orders: 0,
        total_amount: 0,
        payment_score: "bronze",
      }

      if (editingClient) {
        // Mise à jour
        setClients((prev) =>
          prev.map((c) =>
            c.id === editingClient.id
              ? {
                  ...c,
                  name: formData.name,
                  phone: formData.phone,
                  email: formData.email,
                  address: formData.address,
                  ice: formData.ice,
                  credit_days: formData.credit_days,
                }
              : c,
          ),
        )
        setSuccess("Client mis à jour avec succès")
      } else {
        // Création
        setClients((prev) => [newClient, ...prev])
        setSuccess("Client créé avec succès")
      }

      handleCloseDialog()
    } catch (err: any) {
      console.error("Error saving client:", err)
      setError("Erreur lors de la sauvegarde")
    }
  }

  // Supprimer un client
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return

    try {
      setClients((prev) => prev.filter((c) => c.id !== id))
      setSuccess("Client supprimé avec succès")
    } catch (err) {
      console.error("Error deleting client:", err)
      setError("Erreur lors de la suppression")
    }
  }

  // Ouvrir le dialog pour édition
  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      ice: client.ice,
      credit_days: client.credit_days,
    })
    setIsDialogOpen(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingClient(null)
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      ice: "",
      credit_days: 30,
    })
    setError("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-[#0F4C75]" />
            Clients
          </h1>
          <p className="text-gray-600">Gestion de la base clients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Modifier le client" : "Nouveau client"}</DialogTitle>
              <DialogDescription>
                {editingClient ? "Modifiez les informations du client" : "Ajoutez un nouveau client à la base"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'entreprise *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: SONABHY SA"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+226 25 30 60 70"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@entreprise.bf"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="01 BP 4394 Ouagadougou 01"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ice">Numéro ICE</Label>
                    <Input
                      id="ice"
                      value={formData.ice}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ice: e.target.value }))}
                      placeholder="BF001234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit_days">Délai de crédit (jours)</Label>
                    <Input
                      id="credit_days"
                      type="number"
                      value={formData.credit_days}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, credit_days: Number.parseInt(e.target.value) }))
                      }
                      placeholder="30"
                      min="0"
                      max="365"
                    />
                  </div>
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
                  {editingClient ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
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
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientsActifs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{chiffreAffaireTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commandesTotales}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>{filteredClients.length} client(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "Aucun client ne correspond aux critères de recherche" : "Aucun client enregistré"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>CA Total</TableHead>
                  <TableHead>Crédit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {client.phone}
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {client.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[200px]">{client.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: scoreColors[client.payment_score],
                          color: "white",
                        }}
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3" />
                        {scoreLabels[client.payment_score]}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.total_orders}</TableCell>
                    <TableCell>€{client.total_amount.toLocaleString()}</TableCell>
                    <TableCell>{client.credit_days} jours</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(client.id)}
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
    </div>
  )
}
