import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const commandeId = params.id

    // Récupérer les informations de base de la commande
    const { data: commande, error: commandeError } = await supabase
      .from("commandes")
      .select(`
        *,
        marchandise:marchandises(*),
        fournisseur:fournisseurs(*)
      `)
      .eq("id", commandeId)
      .single()

    if (commandeError) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // Récupérer les déchargements (simulé - à adapter selon votre structure)
    const dechargements = [
      {
        type: "camion",
        camion: "CAM-001",
        qte: 15.5,
        date: "2024-01-15T10:30:00Z",
      },
      {
        type: "magasin",
        magasin: "Entrepôt Ouaga",
        qte: 10.0,
        date: "2024-01-15T14:20:00Z",
      },
    ]

    // Récupérer les segments de transport
    const { data: transportTrips } = await supabase
      .from("transport_trips")
      .select(`
        *,
        legs:transport_legs(*)
      `)
      .eq("commande_id", commandeId)

    const legs =
      transportTrips?.flatMap((trip) =>
        trip.legs.map((leg: any) => ({
          legNumber: leg.leg_number,
          status: leg.status,
          qteEnTransit: trip.qte,
          positionGps: leg.gps_last,
        })),
      ) || []

    // Récupérer les entrées en entrepôt (simulé)
    const entrees = [
      {
        entrepot: "Entrepôt Ouagadougou",
        qteRecue: 10.0,
        date: "2024-01-16T08:00:00Z",
      },
    ]

    // Récupérer les sorties/ventes
    const { data: ventes } = await supabase
      .from("ventes")
      .select(`
        *,
        client:clients(name)
      `)
      .eq("commande_id", commandeId)

    const sorties =
      ventes?.map((vente) => ({
        venteId: vente.id,
        client: vente.client?.name,
        qteVendue: vente.qte_vendue,
        date: vente.created_at,
      })) || []

    // Récupérer les stocks actuels (simulé)
    const stocks = [
      {
        entrepot: "Entrepôt Ouagadougou",
        qteDispo: 8.5,
      },
      {
        entrepot: "Entrepôt Bobo",
        qteDispo: 1.5,
      },
    ]

    // Récupérer les dépenses (simulé)
    const depenses = [
      {
        libelle: "Transport Port-Frontière",
        montant: 850.0,
        devise: "EUR",
      },
      {
        libelle: "Frais de douane",
        montant: 320.0,
        devise: "EUR",
      },
      {
        libelle: "Assurance transport",
        montant: 150.0,
        devise: "EUR",
      },
    ]

    // Récupérer les documents liés
    const { data: documents } = await supabase
      .from("documents")
      .select("*")
      .eq("entity_type", "commande")
      .eq("entity_id", commandeId)

    const documentsFormatted =
      documents?.map((doc) => ({
        nom: doc.name,
        status: doc.status,
        expireAt: doc.end_at,
      })) || []

    // Calculer les quantités
    const qteDechargee = dechargements.reduce((sum, d) => sum + d.qte, 0)
    const qteVendue = sorties.reduce((sum, s) => sum + s.qteVendue, 0)
    const qteStock = stocks.reduce((sum, s) => sum + s.qteDispo, 0)
    const qteRestante = commande.qte_cmd - qteDechargee

    const timeline = {
      commandeId: commande.id,
      codeAlphaNum: commande.code_alpha_num,
      qteCommandee: commande.qte_cmd,
      qteDechargee,
      qteRestante,
      qteVendue,
      qteStock,
      dechargements,
      legs,
      entrees,
      sorties,
      stocks,
      depenses,
      documents: documentsFormatted,

      // Informations supplémentaires
      marchandise: {
        name: commande.marchandise?.name,
        color_hex: commande.marchandise?.color_hex,
      },
      fournisseur: {
        name: commande.fournisseur?.name,
      },
      status: commande.status,
      montant_ht: commande.montant_ht,
      montant_ttc: commande.montant_ttc,
      devise: commande.devise,
      created_at: commande.created_at,
    }

    return NextResponse.json(timeline)
  } catch (error) {
    console.error("Erreur lors de la récupération de la timeline:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
