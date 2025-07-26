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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Users, Plus, Search, Edit, Trash2, UserCheck, UserX, Crown } from "lucide-react"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role_id: string
  role_name: string
  is_super_admin: boolean
  is_active: boolean
  last_login_at?: string
  created_at: string
  avatar_url?: string
}

const roleColors = {
  "Super Admin": "#FF5722",
  Admin: "#9C27B0",
  "Gestionnaire Port": "#2196F3",
  Vendeur: "#4CAF50",
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role_id: "",
    is_active: true,
  })

  // Données de démonstration
  const demoUsers: User[] = [
    {
      id: "1",
      first_name: "Admin",
      last_name: "Principal",
      email: "admin@logi-one.com",
      phone: "+226 70 12 34 56",
      role_id: "1",
      role_name: "Super Admin",
      is_super_admin: true,
      is_active: true,
      last_login_at: "2025-01-26T08:30:00Z",
      created_at: "2025-01-01T00:00:00Z",
    },
    {
      id: "2",
      first_name: "Marie",
      last_name: "Ouédraogo",
      email: "marie.ouedraogo@logi-one.com",
      phone: "+226 70 23 45 67",
      role_id: "2",
      role_name: "Admin",
      is_super_admin: false,
      is_active: true,
      last_login_at: "2025-01-25T14:20:00Z",
      created_at: "2025-01-05T00:00:00Z",
    },
    {
      id: "3",
      first_name: "Ibrahim",
      last_name: "Sawadogo",
      email: "ibrahim.sawadogo@logi-one.com",
      phone: "+226 70 34 56 78",
      role_id: "3",
      role_name: "Gestionnaire Port",
      is_super_admin: false,
      is_active: true,
      last_login_at: "2025-01-26T07:45:00Z",
      created_at: "2025-01-10T00:00:00Z",
    },
    {
      id: "4",
      first_name: "Fatou",
      last_name: "Traoré",
      email: "fatou.traore@logi-one.com",
      phone: "+226 70 45 67 89",
      role_id: "4",
      role_name: "Vendeur",
      is_super_admin: false,
      is_active: false,
      last_login_at: "2025-01-20T16:30:00Z",
      created_at: "2025-01-15T00:00:00Z",
    },
  ]

  useEffect(() => {
    setUsers(demoUsers)
    setLoading(false)
  }, [])

  // Filtrer les utilisateurs
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role_id === filterRole
    const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? user.is_active : !user.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  // Calculer les statistiques
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.is_active).length
  const inactiveUsers = users.filter((u) => !u.is_active).length
  const superAdmins = users.filter((u) => u.is_super_admin).length

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const newUser: User = {
        id: Date.now().toString(),
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role_id: formData.role_id,
        role_name: getRoleName(formData.role_id),
        is_super_admin: false,
        is_active: formData.is_active,
        created_at: new Date().toISOString(),
      }

      if (editingUser) {
        // Mise à jour
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  first_name: formData.first_name,
                  last_name: formData.last_name,
                  email: formData.email,
                  phone: formData.phone,
                  role_id: formData.role_id,
                  role_name: getRoleName(formData.role_id),
                  is_active: formData.is_active,
                }
              : u,
          ),
        )
        setSuccess("Utilisateur mis à jour avec succès")
      } else {
        // Création
        setUsers((prev) => [newUser, ...prev])
        setSuccess("Utilisateur créé avec succès")
      }

      handleCloseDialog()
    } catch (err: any) {
      console.error("Error saving user:", err)
      setError("Erreur lors de la sauvegarde")
    }
  }

  // Obtenir le nom du rôle
  const getRoleName = (roleId: string) => {
    const roleNames = {
      "1": "Super Admin",
      "2": "Admin",
      "3": "Gestionnaire Port",
      "4": "Vendeur",
    }
    return roleNames[roleId as keyof typeof roleNames] || "Inconnu"
  }

  // Supprimer un utilisateur
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return

    try {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setSuccess("Utilisateur supprimé avec succès")
    } catch (err) {
      console.error("Error deleting user:", err)
      setError("Erreur lors de la suppression")
    }
  }

  // Basculer le statut actif/inactif
  const toggleUserStatus = async (id: string) => {
    try {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u)))
      setSuccess("Statut utilisateur mis à jour")
    } catch (err) {
      console.error("Error toggling user status:", err)
      setError("Erreur lors de la mise à jour du statut")
    }
  }

  // Ouvrir le dialog pour édition
  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      role_id: user.role_id,
      is_active: user.is_active,
    })
    setIsDialogOpen(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role_id: "",
      is_active: true,
    })
    setError("")
  }

  // Obtenir les initiales
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-[#0F4C75]" />
            Utilisateurs
          </h1>
          <p className="text-gray-600">Gestion des utilisateurs et des rôles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Modifiez les informations de l'utilisateur"
                  : "Ajoutez un nouvel utilisateur au système"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Prénom *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="jean.dupont@logi-one.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+226 70 12 34 56"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle *</Label>
                  <Select
                    value={formData.role_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">Admin</SelectItem>
                      <SelectItem value="3">Gestionnaire Port</SelectItem>
                      <SelectItem value="4">Vendeur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Compte actif</Label>
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
                  {editingUser ? "Mettre à jour" : "Créer"}
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
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-[#FF5722]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF5722]">{superAdmins}</div>
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
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="1">Super Admin</SelectItem>
                  <SelectItem value="2">Admin</SelectItem>
                  <SelectItem value="3">Gestionnaire Port</SelectItem>
                  <SelectItem value="4">Vendeur</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>{filteredUsers.length} utilisateur(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterRole !== "all" || filterStatus !== "all"
                ? "Aucun utilisateur ne correspond aux critères de recherche"
                : "Aucun utilisateur enregistré"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-[#0F4C75] text-white text-xs">
                            {getInitials(user.first_name, user.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {user.first_name} {user.last_name}
                            {user.is_super_admin && <Crown className="h-4 w-4 text-[#FF5722]" />}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: roleColors[user.role_name as keyof typeof roleColors],
                          color: "white",
                        }}
                      >
                        {user.role_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.is_active ? (
                          <Badge className="bg-green-500">Actif</Badge>
                        ) : (
                          <Badge variant="destructive">Inactif</Badge>
                        )}
                        <Switch checked={user.is_active} onCheckedChange={() => toggleUserStatus(user.id)} size="sm" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString("fr-FR") : "Jamais"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!user.is_super_admin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
