import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database directory & persistent file
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dataDir = isServerless ? '/tmp' : path.resolve(process.cwd(), 'data');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (err) {
  console.warn('[DB] Could not create data directory, using /tmp as fallback:', err);
}

const dbPath = path.join(dataDir, 'sjtrans.db');
export const db = new Database(dbPath);

// Enable WAL mode for high concurrency & foreign keys
try {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (err) {
  console.warn('[DB Pragma warning]:', err);
}

export function initDatabase() {
  db.exec(`
    -- Tabel Konfigurasi Sistem
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabel Kendaraan (Armada Mobil Listrik)
    -- Setiap mobil langsung memuat informasi Plat Nomor dan Nama & Kontak Driver
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      model TEXT NOT NULL, -- 'VinFast VF 5' | 'VinFast VF e34'
      plate_number TEXT UNIQUE NOT NULL,
      city TEXT NOT NULL, -- 'Surabaya' | 'Sidoarjo' | 'Malang'
      driver_name TEXT,
      driver_phone TEXT,
      dedicated_driver_id TEXT,
      is_active INTEGER DEFAULT 1,
      in_maintenance INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabel Driver
    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      id_card_number TEXT,
      assigned_vehicle_id TEXT,
      is_active INTEGER DEFAULT 1,
      auth_pin TEXT DEFAULT '123456',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabel Aturan Harga Rental (Dinamis per Tipe, Durasi, Kota)
    CREATE TABLE IF NOT EXISTS rental_pricing (
      id TEXT PRIMARY KEY,
      vehicle_model TEXT NOT NULL,
      city TEXT NOT NULL,
      duration_hours INTEGER NOT NULL,
      km_limit INTEGER NOT NULL,
      price INTEGER NOT NULL,
      overtime_rate_per_hour INTEGER DEFAULT 50000,
      extra_km_rate INTEGER DEFAULT 2500,
      is_active INTEGER DEFAULT 1,
      UNIQUE(vehicle_model, city, duration_hours)
    );

    -- Tabel Booking Rental & Taksi
    -- Aturan bisnis: 1 kendaraan rental hanya menerima 1 booking per tanggal (kecuali cancelled / expired)
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_number TEXT UNIQUE NOT NULL,
      service_type TEXT NOT NULL, -- 'rental' | 'taxi'
      city TEXT NOT NULL,
      booking_date TEXT NOT NULL, -- YYYY-MM-DD
      booking_time TEXT, -- HH:MM
      
      -- Spesifik Rental
      vehicle_model TEXT,
      duration_hours INTEGER,
      km_limit INTEGER,
      assigned_vehicle_id TEXT,
      
      -- Spesifik Taksi
      pickup_address TEXT NOT NULL,
      dropoff_address TEXT NOT NULL,
      pickup_lat REAL,
      pickup_lng REAL,
      dropoff_lat REAL,
      dropoff_lng REAL,
      distance_km REAL,
      taxi_rate_per_km INTEGER DEFAULT 7000,
      
      -- Data Pelanggan
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      passenger_count INTEGER DEFAULT 1,
      notes TEXT,
      
      -- Keuangan & Pembayaran
      total_amount INTEGER NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'
      artopay_transaction_id TEXT,
      artopay_payment_url TEXT,
      paid_at DATETIME,
      expires_at DATETIME, -- Kunci sementara dilepas jika lewat waktu
      
      -- Operasional & Driver
      booking_status TEXT DEFAULT 'pending_payment', -- 'pending_payment' | 'confirmed' | 'driver_pending' | 'driver_ready' | 'in_progress' | 'completed' | 'cancelled'
      assigned_driver_id TEXT,
      driver_status TEXT DEFAULT 'waiting_confirmation', -- 'waiting_confirmation' | 'ready' | 'unable'
      driver_confirmed_at DATETIME,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indeks Unik Parsial: 1 kendaraan rental hanya boleh memiliki 1 booking per tanggal aktif
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_vehicle_rental_date 
    ON bookings(assigned_vehicle_id, booking_date) 
    WHERE service_type = 'rental' 
      AND assigned_vehicle_id IS NOT NULL 
      AND booking_status NOT IN ('cancelled') 
      AND payment_status NOT IN ('failed', 'expired');

    -- Tabel Log Audit & Webhook Idempotency
    CREATE TABLE IF NOT EXISTS webhook_logs (
      id TEXT PRIMARY KEY,
      reference_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload TEXT,
      processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_success INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrasi otomatis: Pastikan kolom driver_name dan driver_phone ada pada tabel vehicles
  try {
    db.exec(`ALTER TABLE vehicles ADD COLUMN driver_name TEXT;`);
  } catch {}
  try {
    db.exec(`ALTER TABLE vehicles ADD COLUMN driver_phone TEXT;`);
  } catch {}
  try {
    db.exec(`
      UPDATE vehicles 
      SET driver_name = (SELECT name FROM drivers WHERE drivers.id = vehicles.dedicated_driver_id)
      WHERE (driver_name IS NULL OR driver_name = '') AND dedicated_driver_id IS NOT NULL;
      UPDATE vehicles 
      SET driver_phone = (SELECT phone FROM drivers WHERE drivers.id = vehicles.dedicated_driver_id)
      WHERE (driver_phone IS NULL OR driver_phone = '') AND dedicated_driver_id IS NOT NULL;
    `);
  } catch {}

  seedInitialData();
}

function seedInitialData() {
  // 1. Cek & Isi Default Settings
  const settingsCount = (db.prepare('SELECT count(*) as count FROM system_settings').get() as { count: number }).count;
  if (settingsCount === 0) {
    const insertSetting = db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)');
    insertSetting.run('company_name', 'PT SAWAH JAYA TRANS');
    insertSetting.run('brand_power', 'Smart Journey');
    insertSetting.run('whatsapp_cs', '081234567890');
    insertSetting.run('taxi_base_fare_per_km', '7000');
    insertSetting.run('taxi_min_fare', '25000');
    insertSetting.run('admin_pin', 'admin2026');
    insertSetting.run('lock_timeout_minutes', '15');
  }

  // 2. Cek & Isi Data Driver Awal (5 Driver Profesional)
  const driversCount = (db.prepare('SELECT count(*) as count FROM drivers').get() as { count: number }).count;
  if (driversCount === 0) {
    const insertDriver = db.prepare(`
      INSERT INTO drivers (id, name, phone, id_card_number, auth_pin, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertDriver.run('DRV-001', 'Budi Santoso', '081234567801', '3578010203850001', '123456', 'Driver Senior Surabaya - Tersertifikasi EV');
    insertDriver.run('DRV-002', 'Ahmad Fauzi', '081234567802', '3578010203870002', '123456', 'Driver Surabaya - Spesialis Rute Bandara');
    insertDriver.run('DRV-003', 'Rudi Hermawan', '081234567803', '3515010203890003', '123456', 'Driver Sidoarjo - Pengalaman Luar Kota');
    insertDriver.run('DRV-004', 'Dwi Cahyono', '081234567804', '3573010203900004', '123456', 'Driver Malang - Paham Area Wisata Batu & Bromo');
    insertDriver.run('DRV-005', 'Joko Prasetyo', '081234567805', '3578010203920005', '123456', 'Driver Surabaya/Sidoarjo - Berpengalaman VinFast');
  }

  // 3. Cek & Isi Armada Awal (5 Unit Sesuai Spesifikasi Perusahaan)
  // Setiap mobil memuat kode, model, plat nomor, kota, nama driver, nomor HP driver, dan status
  const fleetCount = (db.prepare('SELECT count(*) as count FROM vehicles').get() as { count: number }).count;
  if (fleetCount === 0) {
    const insertVehicle = db.prepare(`
      INSERT INTO vehicles (id, code, model, plate_number, city, driver_name, driver_phone, dedicated_driver_id, is_active, in_maintenance, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?)
    `);

    // 3 Unit VinFast VF 5
    insertVehicle.run('VEH-001', 'SJT-VF5-01', 'VinFast VF 5', 'L 1821 EV', 'Surabaya', 'Budi Santoso', '081234567801', 'DRV-001', 'Armada Surabaya Pusat');
    insertVehicle.run('VEH-002', 'SJT-VF5-02', 'VinFast VF 5', 'L 1822 EV', 'Surabaya', 'Ahmad Fauzi', '081234567802', 'DRV-002', 'Armada Surabaya Timur & Bandara');
    insertVehicle.run('VEH-003', 'SJT-VF5-03', 'VinFast VF 5', 'W 1933 EV', 'Sidoarjo', 'Rudi Hermawan', '081234567803', 'DRV-003', 'Armada Sidoarjo');

    // 2 Unit VinFast VF e34
    insertVehicle.run('VEH-004', 'SJT-VFE34-01', 'VinFast VF e34', 'N 1744 EV', 'Malang', 'Dwi Cahyono', '081234567804', 'DRV-004', 'Armada Malang & Wisata');
    insertVehicle.run('VEH-005', 'SJT-VFE34-02', 'VinFast VF e34', 'L 1855 EV', 'Surabaya', 'Joko Prasetyo', '081234567805', 'DRV-005', 'Armada Surabaya');
  } else {
    // Pastikan data mobil yang sudah ada memiliki driver_name dan driver_phone
    db.prepare(`
      UPDATE vehicles 
      SET driver_name = CASE 
        WHEN code = 'SJT-VF5-01' THEN 'Budi Santoso'
        WHEN code = 'SJT-VF5-02' THEN 'Ahmad Fauzi'
        WHEN code = 'SJT-VF5-03' THEN 'Rudi Hermawan'
        WHEN code = 'SJT-VFE34-01' THEN 'Dwi Cahyono'
        WHEN code = 'SJT-VFE34-02' THEN 'Joko Prasetyo'
        ELSE COALESCE(driver_name, 'Driver Operasional')
      END,
      driver_phone = CASE 
        WHEN code = 'SJT-VF5-01' THEN '081234567801'
        WHEN code = 'SJT-VF5-02' THEN '081234567802'
        WHEN code = 'SJT-VF5-03' THEN '081234567803'
        WHEN code = 'SJT-VFE34-01' THEN '081234567804'
        WHEN code = 'SJT-VFE34-02' THEN '081234567805'
        ELSE COALESCE(driver_phone, '081234567890')
      END
      WHERE driver_name IS NULL OR driver_name = '';
    `).run();
  }

  // 4. Cek & Isi Matriks Harga Rental
  // Mengikuti instruksi resmi: 3 jam (45 km), 5 jam (75 km), 8 jam (120 km), 12 jam (180 km)
  // Harga VinFast VF 5 dan VF e34 dibedakan secara transparan
  const pricingCount = (db.prepare('SELECT count(*) as count FROM rental_pricing').get() as { count: number }).count;
  if (pricingCount === 0) {
    const insertPricing = db.prepare(`
      INSERT INTO rental_pricing (id, vehicle_model, city, duration_hours, km_limit, price, overtime_rate_per_hour, extra_km_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const cities = ['Surabaya', 'Sidoarjo', 'Malang'];

    // VinFast VF 5 (Harga referensi resmi perusahaan)
    const vf5Rates = [
      { hours: 3, km: 45, price: 240000 },
      { hours: 5, km: 75, price: 390000 },
      { hours: 8, km: 120, price: 620000 },
      { hours: 12, km: 180, price: 930000 }
    ];

    // VinFast VF e34 (Kapasitas & segmen lebih besar, harga khusus)
    const vfe34Rates = [
      { hours: 3, km: 45, price: 290000 },
      { hours: 5, km: 75, price: 460000 },
      { hours: 8, km: 120, price: 740000 },
      { hours: 12, km: 180, price: 1100000 }
    ];

    for (const city of cities) {
      for (const r of vf5Rates) {
        insertPricing.run(`PRC-VF5-${city}-${r.hours}H`, 'VinFast VF 5', city, r.hours, r.km, r.price, 50000, 2500);
      }
      for (const r of vfe34Rates) {
        insertPricing.run(`PRC-VFE34-${city}-${r.hours}H`, 'VinFast VF e34', city, r.hours, r.km, r.price, 60000, 3000);
      }
    }
  }
}

// Inisialisasi saat modul dimuat
initDatabase();
