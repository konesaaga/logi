-- Insert default roles
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
ON CONFLICT (name) DO NOTHING;
