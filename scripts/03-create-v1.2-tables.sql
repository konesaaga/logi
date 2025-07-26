-- Créer les tables manquantes d'abord
CREATE TABLE IF NOT EXISTS entrepots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    capacity_max DECIMAL(12,2),
    capacity_current DECIMAL(12,2) DEFAULT 0,
    type VARCHAR(50) DEFAULT 'standard',
    superviseur_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_alpha_num VARCHAR(50) UNIQUE NOT NULL,
    commande_id UUID REFERENCES commandes(id),
    client_id UUID REFERENCES clients(id),
    marchandise_id UUID REFERENCES marchandises(id),
    qte_vendue DECIMAL(10,2) NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    montant_ht DECIMAL(12,2) NOT NULL,
    montant_ttc DECIMAL(12,2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) CHECK (status IN ('brouillon', 'confirmee', 'livree', 'annulee')) DEFAULT 'brouillon',
    validation_status VARCHAR(20) CHECK (validation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    validation_step INTEGER DEFAULT 1,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport multi-tronçon
CREATE TABLE IF NOT EXISTS transport_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commande_id UUID REFERENCES commandes(id),
    marchandise_id UUID REFERENCES marchandises(id),
    qte DECIMAL(10,2) NOT NULL,
    camion_id VARCHAR(50) NOT NULL,
    conducteur_id UUID REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('planifie', 'en_cours', 'termine', 'retarde')) DEFAULT 'planifie',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_legs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transport_trip_id UUID REFERENCES transport_trips(id) ON DELETE CASCADE,
    leg_number INTEGER NOT NULL,
    type VARCHAR(30) CHECK (type IN ('port->frontiere', 'frontiere->transit', 'transit->bobo', 'transit->ouaga')) NOT NULL,
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('en_cours', 'termine', 'retarde', 'panne')) DEFAULT 'en_cours',
    gps_last JSONB,
    distance_km DECIMAL(8,2),
    temps_prevu_h DECIMAL(5,2),
    temps_reel_h DECIMAL(5,2),
    superviseur_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS camion_gps_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camion_id VARCHAR(50) NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    speed DECIMAL(5,2),
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validation des entrepôts
CREATE TABLE IF NOT EXISTS entrepot_validation_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entrepot_id UUID REFERENCES entrepots(id),
    operation VARCHAR(20) CHECK (operation IN ('in', 'out', 'transfer')) NOT NULL,
    step_order INTEGER NOT NULL,
    validator_role VARCHAR(50),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operation_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL,
    operation_type VARCHAR(20) NOT NULL,
    step INTEGER NOT NULL,
    validator_id UUID REFERENCES users(id),
    decision VARCHAR(20) CHECK (decision IN ('approve', 'reject', 'pending')) DEFAULT 'pending',
    comment TEXT,
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validation des ventes
CREATE TABLE IF NOT EXISTS vente_validation_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vente_id UUID NOT NULL,
    step_order INTEGER NOT NULL,
    validator_role VARCHAR(50),
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('facture', 'BL', 'CMC', 'assurance', 'permis', 'contrat', 'certificat', 'autre')) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_at TIMESTAMP WITH TIME ZONE,
    entity_type VARCHAR(50) CHECK (entity_type IN ('commande', 'vente', 'entrepot', 'camion', 'conducteur', 'client', 'fournisseur')) NOT NULL,
    entity_id UUID NOT NULL,
    status VARCHAR(20) CHECK (status IN ('valide', 'expire', 'expire_soon')) DEFAULT 'valide',
    alert_days INTEGER DEFAULT 30,
    tags TEXT[],
    keywords TEXT,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_transport_legs_trip_id ON transport_legs(transport_trip_id);
CREATE INDEX IF NOT EXISTS idx_transport_legs_status ON transport_legs(status);
CREATE INDEX IF NOT EXISTS idx_camion_gps_logs_camion_ts ON camion_gps_logs(camion_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_end_at ON documents(end_at);
CREATE INDEX IF NOT EXISTS idx_operation_validations_operation ON operation_validations(operation_id, operation_type);
CREATE INDEX IF NOT EXISTS idx_entrepots_superviseur ON entrepots(superviseur_id);
CREATE INDEX IF NOT EXISTS idx_ventes_validation ON ventes(validation_status, validation_step);
