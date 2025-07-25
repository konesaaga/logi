"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, AlertTriangle, Copy } from "lucide-react"
import { supabase } from "@/lib/supabase"

const SQL_SCRIPTS = {
  createTables: `-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    scopes JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role_id UUID REFERENCES roles(id),
    is_super_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marchandises table
CREATE TABLE IF NOT EXISTS marchandises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(20) CHECK (category IN ('perissable', 'dangereux', 'standard')) DEFAULT 'standard',
    color_hex VARCHAR(7) DEFAULT '#4CAF50',
    default_unit VARCHAR(20) DEFAULT 'Tonne',
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fournisseurs table
CREATE TABLE IF NOT EXISTS fournisseurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    ice VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commandes table
CREATE TABLE IF NOT EXISTS commandes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_alpha_num VARCHAR(50) UNIQUE NOT NULL,
    marchandise_id UUID REFERENCES marchandises(id),
    fournisseur_id UUID REFERENCES fournisseurs(id),
    qte_cmd DECIMAL(10,2) NOT NULL,
    qte_livree DECIMAL(10,2) DEFAULT 0,
    montant_ht DECIMAL(12,2),
    montant_ttc DECIMAL(12,2),
    devise VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) CHECK (status IN ('en_cours', 'bouclee')) DEFAULT 'en_cours',
    color_status VARCHAR(7) DEFAULT '#FF9800',
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    ice VARCHAR(50),
    credit_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs audit table
CREATE TABLE IF NOT EXISTS logs_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_commandes_status ON commandes(status);
CREATE INDEX IF NOT EXISTS idx_logs_audit_user_id ON logs_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_audit_created_at ON logs_audit(created_at);`,

  insertRoles: `-- Insert default roles
INSERT INTO roles (name, description, scopes) VALUES 
(
    'Super Admin',
    'Accès complet à toutes les fonctionnalités',
    '{
        "marchandises": {"create": true, "read": true, "update": true, "delete": true},
        "commandes": {"create": true, "read": true, "update": true, "delete": true},
        "port": {"create": true, "read": true, "update": true, "delete": true},
        "transport": {"create": true, "read": true, "update": true, "delete": true},
        "ventes": {"create": true, "read": true, "update": true, "delete": true},
        "entrepots": {"create": true, "read": true, "update": true, "delete": true},
        "clients": {"create": true, "read": true, "update": true, "delete": true},
        "utilisateurs": {"create": true, "read": true, "update": true, "delete": true},
        "rapports": {"create": true, "read": true, "update": true, "delete": true},
        "alertes": {"create": true, "read": true, "update": true, "delete": true},
        "parametres": {"create": true, "read": true, "update": true, "delete": true, "backup": true}
    }'
),
(
    'Admin',
    'Accès administrateur sans sauvegarde',
    '{
        "marchandises": {"create": true, "read": true, "update": true, "delete": true},
        "commandes": {"create": true, "read": true, "update": true, "delete": true},
        "port": {"create": true, "read": true, "update": true, "delete": true},
        "transport": {"create": true, "read": true, "update": true, "delete": true},
        "ventes": {"create": true, "read": true, "update": true, "delete": true},
        "entrepots": {"create": true, "read": true, "update": true, "delete": true},
        "clients": {"create": true, "read": true, "update": true, "delete": true},
        "utilisateurs": {"create": true, "read": true, "update": true, "delete": true},
        "rapports": {"create": true, "read": true, "update": true, "delete": true},
        "alertes": {"create": true, "read": true, "update": true, "delete": true},
        "parametres": {"create": true, "read": true, "update": true, "delete": true}
    }'
),
(
    'Gestionnaire Port',
    'Gestion des opérations portuaires et transport',
    '{
        "port": {"create": true, "read": true, "update": true, "delete": true},
        "transport": {"create": true, "read": true, "update": true, "delete": false},
        "commandes": {"create": false, "read": true, "update": true, "delete": false},
        "marchandises": {"create": false, "read": true, "update": false, "delete": false},
        "rapports": {"create": false, "read": true, "update": false, "delete": false}
    }'
),
(
    'Vendeur',
    'Gestion des ventes et clients',
    '{
        "ventes": {"create": true, "read": true, "update": true, "delete": false},
        "clients": {"create": true, "read": true, "update": true, "delete": false},
        "rapports": {"create": false, "read": true, "update": false, "delete": false},
        "entrepots": {"create": false, "read": true, "update": false, "delete": false}
    }'
)
ON CONFLICT (name) DO NOTHING;`,
}

export function DatabaseSetup() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const testConnection = async () => {
    setLoading(true)
    setError("")

    try {
      // Test if we can query the roles table (which should exist after setup)
      const { data: rolesData, error: rolesError } = await supabase.from("roles").select("id").limit(1)

      if (rolesError) {
        if (
          rolesError.code === "PGRST116" ||
          rolesError.message.includes("does not exist") ||
          rolesError.message.includes("relation") ||
          rolesError.code === "42P01"
        ) {
          setStep(1) // Show setup instructions
        } else {
          setError(`Erreur de connexion: ${rolesError.message}`)
        }
      } else {
        // Tables exist, now check if we have data
        const { data: usersData, error: usersError } = await supabase.from("users").select("id").limit(1)

        if (usersError) {
          setError(`Erreur lors de la vérification des utilisateurs: ${usersError.message}`)
        } else {
          setSuccess(true)
        }
      }
    } catch (err: any) {
      console.error("Connection test error:", err)
      setError(`Erreur de connexion: ${err.message}`)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F4C75] to-[#3282B8] p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#0F4C75] p-3 rounded-full">
              <Database className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#0F4C75]">Configuration de la base de données</CardTitle>
          <CardDescription>Initialisation de LOGI-ONE</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="text-center space-y-4">
              <p className="text-gray-600">Vérification de la configuration de la base de données...</p>
              <Button onClick={testConnection} disabled={loading} className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier la base de données"
                )}
              </Button>
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Les tables de base de données n'existent pas encore. Veuillez exécuter les scripts SQL suivants dans
                  votre tableau de bord Supabase.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Étape 1: Créer les tables</h3>
                  <div className="relative">
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-60">
                      <code>{SQL_SCRIPTS.createTables}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={() => copyToClipboard(SQL_SCRIPTS.createTables)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Étape 2: Insérer les rôles par défaut</h3>
                  <div className="relative">
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-60">
                      <code>{SQL_SCRIPTS.insertRoles}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={() => copyToClipboard(SQL_SCRIPTS.insertRoles)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Instructions:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Allez sur votre tableau de bord Supabase</li>
                      <li>Cliquez sur "SQL Editor" dans le menu de gauche</li>
                      <li>Copiez et collez le premier script, puis cliquez sur "Run"</li>
                      <li>Copiez et collez le deuxième script, puis cliquez sur "Run"</li>
                      <li>Revenez ici et cliquez sur "Vérifier à nouveau"</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={testConnection}
                  disabled={loading}
                  className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Vérifier à nouveau"
                  )}
                </Button>
              </div>
            </div>
          )}

          {success && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-bold text-green-600">Base de données configurée!</h3>
              <p className="text-gray-600">
                La base de données est maintenant prête. Vous pouvez procéder à la création du compte Super-Admin.
              </p>
              <Button onClick={() => window.location.reload()} className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                Continuer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
