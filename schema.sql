-- properties table
CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    listing_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    purpose TEXT NOT NULL,
    property_type TEXT NOT NULL,
    price_offer INTEGER,
    price_rent INTEGER,
    price_type TEXT,
    old_price INTEGER,
    is_premium BOOLEAN DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    is_hot BOOLEAN DEFAULT 0,
    is_sold BOOLEAN DEFAULT 0,
    is_choice BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'active',
    province TEXT,
    city TEXT,
    district TEXT,
    village TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    land_area INTEGER,
    building_area INTEGER,
    front_width INTEGER,
    floors INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    legal_status TEXT,
    legal_details TEXT,
    ownership_status TEXT,
    bank_name TEXT,
    outstanding_amount INTEGER,
    environmental_status TEXT DEFAULT 'Ya Jauh',
    distance_to_river INTEGER,
    distance_to_grave INTEGER,
    distance_to_powerline INTEGER,
    road_width INTEGER,
    description TEXT,
    facilities TEXT,
    selling_reason TEXT,
    owner_name TEXT,
    owner_whatsapp_1 TEXT,
    owner_whatsapp_2 TEXT,
    google_maps_url TEXT,
    video_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    views_count INTEGER DEFAULT 0
);

-- property_images table
CREATE TABLE IF NOT EXISTS property_images (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_webp_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- leads table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL,
    property_id TEXT,
    budget TEXT,
    payment_plan TEXT,
    message TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    priority TEXT DEFAULT 'warm',
    assigned_to TEXT,
    last_contact INTEGER,
    next_followup INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    listing_code TEXT NOT NULL,
    contract_type TEXT NOT NULL,
    contract_duration TEXT,
    fee_percentage REAL,
    owner_name TEXT,
    owner_ktp TEXT,
    owner_whatsapp TEXT,
    property_data TEXT,
    owner_signature TEXT,
    agent_signature TEXT,
    signed_at INTEGER,
    status TEXT DEFAULT 'draft',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (listing_code) REFERENCES properties(listing_code)
);

-- admins table
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    photo_url TEXT,
    whatsapp TEXT,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT 1,
    last_login INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    detail TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- import_logs table (for CSV bulk upload feature)
CREATE TABLE IF NOT EXISTS import_logs (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    total_rows INTEGER NOT NULL,
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'processing',
    error_log TEXT,
    imported_ids TEXT,
    rollback_available_until INTEGER,
    created_by TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (created_by) REFERENCES admins(id)
);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_offer);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(province, city, district);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(is_sold, is_premium, is_featured, is_hot);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_property_images_property ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_property ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_by ON import_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at);