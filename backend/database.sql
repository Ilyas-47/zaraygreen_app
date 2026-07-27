-- ============================================================================
-- SQL SCRIPT FOR POSTGRESQL DATABASE CREATION (Zaray App)
-- Conforms strictly to the provided UML Class Diagram
-- Generated with industry best practices (Indexes, Triggers, Constraints)
-- ============================================================================

-- Enable UUID extension if not already enabled (for standard UUID primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUMS CREATION
-- ----------------------------------------------------------------------------

-- Role enum for User types
CREATE TYPE user_role AS ENUM (
    'CLIENT', 
    'LIVREUR', 
    'TECHNICIEN', 
    'ADMINISTRATEUR'
);

-- Document types as per UML
CREATE TYPE document_type AS ENUM (
    'DEVIS', 
    'FACTURE', 
    'BON_LIVRAISON', 
    'AVOIR', 
    'CONTRAT', 
    'BON_COMMANDE', 
    'PHOTO_INTERVENTION'
);

-- Document status states as per UML
CREATE TYPE document_status AS ENUM (
    'BROUILLON', 
    'ENVOYE', 
    'ACCEPTE', 
    'REFUSE', 
    'PAYE', 
    'ANNULE', 
    'ARCHIVE'
);

-- ----------------------------------------------------------------------------
-- 2. TABLES CREATION
-- ----------------------------------------------------------------------------

-- A. Table: Users (Single Table Inheritance model representing User, Client, Livreur, Technicien, Administrateur)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CLIENT',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. Table: Addresses (Address entity, possessed by a User)
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- "possède" relation: User (1) -> Address (0..*)
    rue VARCHAR(255) NOT NULL,
    ville VARCHAR(255) NOT NULL,
    code_postal VARCHAR(20) NOT NULL,
    pays VARCHAR(100) NOT NULL DEFAULT 'France',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C. Table: Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL UNIQUE,
    image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- D. Table: Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT, -- "appartientÀ" relation: Product (*) -> Category (1)
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    prix DECIMAL(10, 2) NOT NULL CHECK (prix >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    images TEXT[] DEFAULT '{}', -- Native PostgreSQL array to model List<String> of images
    note_moyenne DOUBLE PRECISION DEFAULT 0.0 CHECK (note_moyenne >= 0 AND note_moyenne <= 5),
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- E. Table: Services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    prix_base DECIMAL(10, 2) NOT NULL CHECK (prix_base >= 0),
    images TEXT[] DEFAULT '{}', -- Native PostgreSQL array to model List<String> of images
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- F. Table: Orders (Order entity)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- "passe" relation: Client/User (1) -> Order (*)
    adresse_livraison_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT, -- "adresseLivraison" relation: Address (1) -> Order (*)
    livreur_id UUID REFERENCES users(id) ON DELETE SET NULL, -- "assignéeÀ" relation: Livreur (1) -> Order (*)
    montant_total DECIMAL(10, 2) NOT NULL DEFAULT 0.0 CHECK (montant_total >= 0),
    statut VARCHAR(50) NOT NULL DEFAULT 'BROUILLON', -- e.g., 'EN_ATTENTE', 'LIVRE', etc.
    date_commande TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_livraison TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- G. Table: OrderItems (Order details connecting Product and Order)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- "contient" relation: Order (1) -> OrderItem (*)
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT, -- "contient" relation: Product (1) -> OrderItem (*)
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    prix_unitaire DECIMAL(10, 2) NOT NULL CHECK (prix_unitaire >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- H. Table: Payments (Payment entity linked to Order)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- "possède" relation: Order (1) -> Payment (*)
    montant DECIMAL(10, 2) NOT NULL CHECK (montant >= 0),
    methode VARCHAR(100) NOT NULL, -- e.g., 'CARTE_BANCAIRE', 'PAYPAL', 'ESPECES'
    statut VARCHAR(50) NOT NULL, -- e.g., 'VALIDE', 'REFUSE', 'EN_ATTENTE'
    date_paiement TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- I. Table: Appointments (Appointment/Rendez-vous entity)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- "client" relation: User (1) -> Appointment (*)
    technicien_id UUID REFERENCES users(id) ON DELETE SET NULL, -- "assignéÀ" relation: Technicien (1) -> Appointment (*)
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT, -- "concerne" relation: Service (1) -> Appointment (*)
    reserve_par_id UUID REFERENCES users(id) ON DELETE SET NULL, -- "réserve" relation: User (1) -> Appointment (*)
    date_rendez_vous TIMESTAMP WITH TIME ZONE NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'PLANIFIE', -- e.g., 'PLANIFIE', 'TERMINE', 'ANNULE'
    adresse VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- J. Table: Photos (Photos contained in Appointments)
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE, -- "contient" relation: Appointment (1) -> Photo (*)
    url VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g., 'AVANT', 'APRES' (Photo before/after intervention)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- K. Table: Reviews (Review/Avis entity)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- "écrit" relation: User (1) -> Review (*)
    product_id UUID REFERENCES products(id) ON DELETE CASCADE, -- "concerne" relation: Product (1) -> Review (*)
    technicien_id UUID REFERENCES users(id) ON DELETE CASCADE, -- "concerne" relation: Technicien (1) -> Review (*)
    note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Business constraint: a review can concern either a product or a technician, but not both at once.
    CONSTRAINT check_review_target CHECK (
        (product_id IS NOT NULL AND technicien_id IS NULL) OR 
        (product_id IS NULL AND technicien_id IS NOT NULL)
    )
);

-- L. Table: Documents (Invoices, Quotes, Contracts, etc.)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type document_type NOT NULL,
    numero_document VARCHAR(100) NOT NULL UNIQUE,
    date_emission TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_echeance TIMESTAMP WITH TIME ZONE NOT NULL,
    montant_ht DECIMAL(10, 2) NOT NULL CHECK (montant_ht >= 0),
    montant_ttc DECIMAL(10, 2) NOT NULL CHECK (montant_ttc >= 0),
    tva DECIMAL(5, 2) NOT NULL CHECK (tva >= 0),
    statut document_status NOT NULL DEFAULT 'BROUILLON',
    fichier_url VARCHAR(255) NOT NULL,
    notes TEXT,
    
    -- Relationships
    generer_par_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- "généréPar" relation: User (1) -> Document (*)
    client_id UUID REFERENCES users(id) ON DELETE RESTRICT,              -- "concerne" relation (Client)
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,               -- "liéÀ" relation: Order (0..1) -> Document (*)
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,   -- "liéÀ" relation: Appointment (0..1) -> Document (*)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OPTIONAL JOIN TABLE FOR STRICT MANY-TO-MANY RELATIONSHIP BETWEEN DOCUMENT & CLIENT
-- Un-comment if you literally need multiple clients linked to a single document, otherwise the standard 'client_id' foreign key above is cleaner.
-- CREATE TABLE document_clients (
--     document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
--     client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     PRIMARY KEY (document_id, client_id)
-- );


-- ----------------------------------------------------------------------------
-- 3. TRIGGERS FOR AUTOMATIC `updated_at` TIMESTAMPS
-- ----------------------------------------------------------------------------

-- Function to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables containing updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ----------------------------------------------------------------------------
-- 4. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ----------------------------------------------------------------------------

-- Indexes on foreign keys and highly queried fields (essential for professional production apps)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_livreur_id ON orders(livreur_id);
CREATE INDEX idx_orders_adresse_livraison_id ON orders(adresse_livraison_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_technicien_id ON appointments(technicien_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_photos_appointment_id ON photos(appointment_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_technicien_id ON reviews(technicien_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_order_id ON documents(order_id);
CREATE INDEX idx_documents_appointment_id ON documents(appointment_id);
