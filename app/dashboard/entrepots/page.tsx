"use client"

import { useState } from "react"
import { Edit, Package, ArrowUp, ArrowDown, RotateCcw } from "lucide-react"

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
          derniere_maj: "2025-01-\
