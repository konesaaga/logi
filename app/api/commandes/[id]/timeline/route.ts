import { type NextRequest, NextResponse } from "next/server"

// Interface pour la réponse de timeline
interface CommandeTimeline {
  commandeId: string
  codeAlphaNum: string
  qteCommandee: number
  qteDechargee: number
  qteRestante: number
  dechargements: Array<{
    type: "camion" | "magasin"
    qte: number
    date: string
    details: string
  }>
  legs: Array<{
    legNumber: number
    status: string
    qteEnTransit: number
    positionGps?: { lat: number; lng: number }
  }>
  entrees: Array<{
    entrepot: string
    qteRecue: number
    date: string
  }>
  sorties: Array<{
    venteId: string
    client: string
    qteVendue: number
    date: string
  }>
  stocks: Array<{
    entrepot: string
    qteDispo: number
  }>
  depenses: Array<{
    libelle: string
    montant: number
    devise: string
  }>
  documents: Array<{
    nom: string
    status: string
    expireAt?: string
  }>
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const commandeId = params.id

    // Simulation de données agrégées pour la timeline
    const timelineData: CommandeTimeline = {
      commandeId,
      codeAlphaNum: "CMD-2025-001",
      qteCommandee: 500,
      qteDechargee: 350,
      qteRestante: 150,
      dechargements: [
        {
          type: "camion",
          qte: 150,
          date: "2025-01-20T14:30:00Z",
          details: "2 camions - Destination Ouagadougou",
        },
        {
          type: "camion",
          qte: 200,
          date: "2025-01-22T09:15:00Z",
          details: "3 camions - Destination Bobo-Dioulasso",
        },
      ],
      legs: [
        {
          legNumber: 1,
          status: "termine",
          qteEnTransit: 0,
        },
        {
          legNumber: 2,
          status: "en_cours",
          qteEnTransit: 150,
          positionGps: { lat: 11.5432, lng: -0.9876 },
        },
      ],
      entrees: [
        {
          entrepot: "Entrepôt Central Ouagadougou",
          qteRecue: 150,
          date: "2025-01-20T16:00:00Z",
        },
        {
          entrepot: "Entrepôt Bobo-Dioulasso",
          qteRecue: 200,
          date: "2025-01-22T11:30:00Z",
        },
      ],
      sorties: [
        {
          venteId: "V-2025-001",
          client: "SONABHY SA",
          qteVendue: 150,
          date: "2025-01-21T10:00:00Z",
        },
      ],
      stocks: [
        {
          entrepot: "Entrepôt Central Ouagadougou",
          qteDispo: 0,
        },
        {
          entrepot: "Entrepôt Bobo-Dioulasso",
          qteDispo: 200,
        },
      ],
      depenses: [
        {
          libelle: "Frais portuaires",
          montant: 2500,
          devise: "EUR",
        },
        {
          libelle: "Surestaries",
          montant: 1200,
          devise: "EUR",
        },
      ],
      documents: [
        {
          nom: "Facture Agro Export SA",
          status: "valide",
        },
        {
          nom: "BL Déchargement",
          status: "valide",
        },
        {
          nom: "CMC Transport",
          status: "expire_soon",
          expireAt: "2025-03-15T00:00:00Z",
        },
      ],
    }

    return NextResponse.json(timelineData)
  } catch (error) {
    console.error("Error fetching commande timeline:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de la timeline" }, { status: 500 })
  }
}
