"""
Script untuk konversi CSV dari Supabase ke format D1 database
"""
import csv
import re

# Mapping header Supabase ke D1
HEADER_MAPPING = {
    'listing_code': 'listing_code',
    'judul_properti': 'title',
    'deskripsi': 'description',
    'jenis_properti': 'property_type',
    'luas_tanah': 'land_area',
    'luas_bangunan': 'building_area',
    'kamar_tidur': 'bedrooms',
    'kamar_mandi': 'bathrooms',
    'legalitas': 'legal_status',
    'harga_properti': 'price_offer',
    'provinsi': 'province',
    'kabupaten': 'city',
    'alamat_lengkap': 'address',
    'image_url': 'image_url1',
    'image_url1': 'image_url2',
    'image_url2': 'image_url3',
    'image_url3': 'image_url4',
    'image_url4': 'image_url5',
    'image_url5': 'image_url6',
    'image_url6': 'image_url7',
    'image_url7': 'image_url8',
    'image_url8': 'image_url9',
    'image_url9': 'image_url10',
    'is_premium': 'is_premium',
    'is_featured': 'is_featured',
    'is_hot': 'is_hot',
    'price_old': 'old_price',
    'is_property_pilihan': 'is_choice',
    'owner_contact': 'owner_whatsapp_1',
    'youtube_url': 'video_url',
    'kecamatan': 'district',
    'kelurahan': 'village',
    'lebar_depan': 'front_width',
    'jumlah_lantai': 'floors',
    'bank_terkait': 'bank_name',
    'outstanding_bank': 'outstanding_amount',
    'jarak_sungai': 'distance_to_river',
    'jarak_makam': 'distance_to_grave',
    'jarak_sutet': 'distance_to_powerline',
    'lebar_jalan': 'road_width',
    'alasan_dijual': 'selling_reason',
    'harga_sewa_tahunan': 'price_rent',
    'google_maps_link': 'google_maps_url',
}

# D1 headers (output format)
D1_HEADERS = [
    "listing_code", "title", "slug", "purpose", "property_type",
    "price_offer", "price_rent", "price_type", "old_price",
    "province", "city", "district", "village", "address",
    "latitude", "longitude", "land_area", "building_area",
    "front_width", "floors", "bedrooms", "bathrooms",
    "legal_status", "ownership_status", "bank_name", "outstanding_amount",
    "distance_to_river", "distance_to_grave", "distance_to_powerline", "road_width",
    "description", "facilities", "selling_reason",
    "owner_name", "owner_whatsapp_1", "owner_whatsapp_2",
    "google_maps_url", "video_url",
    "is_premium", "is_featured", "is_hot", "is_choice",
    "image_url1", "image_url2", "image_url3", "image_url4", "image_url5",
    "image_url6", "image_url7", "image_url8", "image_url9", "image_url10"
]

def generate_slug(title, listing_code):
    """Generate URL-friendly slug"""
    if not title:
        return ""
    slug = re.sub(r'[^a-z0-9\s-]', '', title.lower())
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return f"{slug}-{listing_code}".lower()

def convert_boolean(value):
    """Convert various boolean formats to TRUE/FALSE"""
    if not value:
        return "FALSE"
    value = str(value).upper().strip()
    if value in ['1', 'TRUE', 'YA', 'YES']:
        return "TRUE"
    return "FALSE"

def determine_purpose(price_offer, price_rent):
    """Determine purpose based on price fields"""
    has_offer = price_offer and str(price_offer).strip() != ''
    has_rent = price_rent and str(price_rent).strip() != ''
    
    if has_offer and has_rent:
        return "Dijual & Disewa"
    elif has_offer:
        return "Dijual"
    elif has_rent:
        return "Disewa"
    return "Dijual"

def clean_number(value):
    """Clean numeric value"""
    if not value:
        return ""
    value = str(value).strip()
    # Remove non-numeric characters except decimal
    value = re.sub(r'[^\d.]', '', value)
    return value

def clean_legal_status(value):
    """Clean legal_status to match allowed values"""
    if not value:
        return ""
    
    value = str(value).strip()
    
    # Map common values to allowed format
    mappings = {
        'shm': 'SHM & IMB/PBG Lengkap',
        'shgb': 'SHGB & IMB/PBG Lengkap',
        'imb': 'SHM & IMB/PBG Lengkap',
        'pbg': 'SHM & IMB/PBG Lengkap',
        'lengkap': 'SHM & IMB/PBG Lengkap',
        'sertifikat': 'SHM & IMB/PBG Lengkap',
    }
    
    value_lower = value.lower()
    for key, mapped in mappings.items():
        if key in value_lower:
            return mapped
    
    # If contains "SHM" and "IMB"
    if 'shm' in value_lower and ('imb' in value_lower or 'pbg' in value_lower):
        return 'SHM & IMB/PBG Lengkap'
    
    # If contains "SHGB" and "IMB"
    if 'shgb' in value_lower and ('imb' in value_lower or 'pbg' in value_lower):
        return 'SHGB & IMB/PBG Lengkap'
    
    # Default to SHM & IMB/PBG Lengkap if unclear
    return 'SHM & IMB/PBG Lengkap'

def main():
    input_file = 'properties_rows-new.csv'
    output_file = 'test_supabase.csv'
    
    print(f"Reading {input_file}...")
    
    # Try different encodings
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    rows = None
    
    for encoding in encodings:
        try:
            with open(input_file, 'r', encoding=encoding) as infile:
                reader = csv.DictReader(infile)
                rows = list(reader)
                print(f"Successfully read with {encoding} encoding")
                break
        except UnicodeDecodeError:
            continue
    
    if rows is None:
        print("Failed to read file with any encoding")
        return
    
    print(f"Found {len(rows)} rows")
    
    # Get existing listing_codes from database to avoid duplicates
    existing_codes = set()
    try:
        import subprocess
        result = subprocess.run(
            ['wrangler', 'd1', 'execute', 'salambumi-property-db', '--local', 
             '--command', 'SELECT listing_code FROM properties'],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if '"' in line and 'listing_code' not in line:
                    code = line.strip().strip('"').strip(',')
                    if code:
                        existing_codes.add(code.upper())
    except:
        pass
    
    print(f"Found {len(existing_codes)} existing listing_codes in database")
    
    # Convert rows
    converted_rows = []
    skipped = 0
    
    for i, row in enumerate(rows):
        new_row = {}
        
        # Map fields
        for supabase_col, d1_col in HEADER_MAPPING.items():
            if supabase_col in row:
                new_row[d1_col] = row[supabase_col]
        
        # Skip if listing_code already exists
        listing_code = new_row.get('listing_code', '').strip().upper()
        if listing_code in existing_codes:
            skipped += 1
            continue
        
        # Generate slug
        title = new_row.get('title', '')
        new_row['slug'] = generate_slug(title, listing_code)
        
        # Skip if slug already exists (check in current batch)
        if any(r.get('slug') == new_row['slug'] for r in converted_rows):
            skipped += 1
            continue
        
        # Determine purpose
        price_offer = new_row.get('price_offer', '')
        price_rent = new_row.get('price_rent', '')
        new_row['purpose'] = determine_purpose(price_offer, price_rent)
        
        # Clean numeric fields
        for field in ['price_offer', 'price_rent', 'old_price', 'land_area', 'building_area',
                     'front_width', 'floors', 'bedrooms', 'bathrooms', 'outstanding_amount',
                     'distance_to_river', 'distance_to_grave', 'distance_to_powerline', 'road_width']:
            new_row[field] = clean_number(new_row.get(field, ''))
        
        # Clean legal_status
        new_row['legal_status'] = clean_legal_status(new_row.get('legal_status', ''))
        
        # Convert boolean fields
        for field in ['is_premium', 'is_featured', 'is_hot', 'is_choice']:
            new_row[field] = convert_boolean(new_row.get(field, ''))
        
        # Set defaults for missing fields
        new_row['price_type'] = 'Nego' if new_row.get('price_offer') else ''
        new_row['province'] = new_row.get('province', 'DI. Yogyakarta')
        new_row['ownership_status'] = 'On Hand'
        
        # Ensure all D1 headers exist
        for header in D1_HEADERS:
            if header not in new_row:
                new_row[header] = ''
        
        converted_rows.append(new_row)
        
        if (i + 1) % 100 == 0:
            print(f"Processed {i + 1} rows...")
    
    # Write output
    print(f"Writing {output_file}...")
    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=D1_HEADERS)
        writer.writeheader()
        writer.writerows(converted_rows)
    
    print(f"Done! Created {output_file} with {len(converted_rows)} rows")
    print(f"Skipped {skipped} duplicate rows")

if __name__ == '__main__':
    main()
