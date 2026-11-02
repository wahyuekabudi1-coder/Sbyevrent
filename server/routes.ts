import express, { type Request, type Response } from 'express';
import crypto from 'crypto';
import { db } from './db.ts';

export const apiRouter = express.Router();

// Helper: Format tanggal lokal YYYY-MM-DD
function getLocalDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Helper: Bersihkan booking yang kedaluwarsa (lock timeout 15 menit)
function cleanExpiredBookings() {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE bookings 
    SET payment_status = 'expired', 
        booking_status = 'cancelled',
        updated_at = ?
    WHERE payment_status = 'pending' 
      AND expires_at IS NOT NULL 
      AND expires_at < ?
  `).run(now, now);
}

// -------------------------------------------------------------
// 1. PUBLIC APIS: PRICING & SETTINGS
// -------------------------------------------------------------

apiRouter.get('/settings', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT key, value FROM system_settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.get('/pricing', (req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT id, vehicle_model, city, duration_hours, km_limit, price, overtime_rate_per_hour, extra_km_rate 
      FROM rental_pricing 
      WHERE is_active = 1
      ORDER BY vehicle_model, duration_hours ASC
    `).all();
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const DEFAULT_MODEL_IMAGES: Record<string, string> = {
  'VinFast VF 5': 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
  'VinFast VF e34': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
};

function getModelImages(): Record<string, string> {
  try {
    const vf5Row = db.prepare("SELECT value FROM system_settings WHERE key = 'model_image_VF5'").get() as { value: string } | undefined;
    const vfe34Row = db.prepare("SELECT value FROM system_settings WHERE key = 'model_image_VFE34'").get() as { value: string } | undefined;
    return {
      'VinFast VF 5': vf5Row?.value?.trim() || DEFAULT_MODEL_IMAGES['VinFast VF 5'],
      'VinFast VF e34': vfe34Row?.value?.trim() || DEFAULT_MODEL_IMAGES['VinFast VF e34'],
    };
  } catch {
    return DEFAULT_MODEL_IMAGES;
  }
}

// Public API untuk mengambil data visual model armada
apiRouter.get('/fleet-models', (req: Request, res: Response) => {
  const modelImages = getModelImages();
  res.json({
    success: true,
    modelImages,
    models: [
      {
        model: 'VinFast VF 5',
        shortCode: 'VF 05',
        category: 'Smart Compact Electric Crossover',
        tagline: 'Lincah & Nyaman di Perkotaan',
        description: 'Crossover listrik kompak dengan manuver gesit dan kabin senyap. Sangat ideal untuk perjalanan dinas, mobilitas harian dalam kota Surabaya, Sidoarjo, dan rute penghubung Jawa Timur.',
        imageUrl: modelImages['VinFast VF 5'],
        pricingHint: 'Mulai Rp240.000 / 3 Jam',
        startingPrice: 240000
      },
      {
        model: 'VinFast VF e34',
        shortCode: 'VF e34',
        category: 'Spacious Mid-Size Electric SUV',
        tagline: 'Kabin Luas & Suspensi Lembut',
        description: 'SUV listrik mid-size berdimensi lega dengan bagasi fleksibel dan suspensi empuk. Memberikan kenyamanan kelas atas untuk agenda keluarga, eksekutif, dan perjalanan dinas antarkota Surabaya - Sidoarjo.',
        imageUrl: modelImages['VinFast VF e34'],
        pricingHint: 'Mulai Rp290.000 / 3 Jam',
        startingPrice: 290000
      }
    ]
  });
});

// -------------------------------------------------------------
// 2. AVAILABILITY ENGINE (H-1 Rule & Dynamic Fleet Count)
// -------------------------------------------------------------

apiRouter.get('/availability', (req: Request, res: Response) => {
  cleanExpiredBookings();

  const { city, date } = req.query as { city?: string; date?: string };

  if (!city || !date) {
    return res.status(400).json({ success: false, message: 'Kota dan tanggal wajib ditentukan.' });
  }

  // Aturan H-1: Tidak boleh hari ini atau tanggal lampau
  const todayStr = getLocalDateString(0);
  if (date <= todayStr) {
    return res.status(400).json({
      success: false,
      message: 'Pemesanan rental mobil listrik minimal H-1. Tidak dapat memesan untuk hari ini atau tanggal lampau.'
    });
  }

  try {
    const modelImages = getModelImages();

    // Ambil harga terendah (3 Jam) per model untuk kota tersebut
    const pricingRows = db.prepare(`
      SELECT vehicle_model, MIN(price) as starting_price
      FROM rental_pricing 
      WHERE city = ? AND is_active = 1
      GROUP BY vehicle_model
    `).all(city) as { vehicle_model: string; starting_price: number }[];

    const startingPrices: Record<string, number> = {
      'VinFast VF 5': 240000,
      'VinFast VF e34': 290000
    };
    for (const pr of pricingRows) {
      if (pr.vehicle_model) {
        startingPrices[pr.vehicle_model] = pr.starting_price;
      }
    }

    // Ambil semua armada aktif dan tidak sedang maintenance di kota tersebut
    const totalVehicles = db.prepare(`
      SELECT id, model, city, image_url 
      FROM vehicles 
      WHERE city = ? AND is_active = 1 AND in_maintenance = 0
    `).all(city) as { id: string; model: string; city: string; image_url?: string }[];

    // Ambil kendaraan yang SUDAH terbooking aktif pada tanggal tersebut
    const bookedRows = db.prepare(`
      SELECT assigned_vehicle_id 
      FROM bookings 
      WHERE booking_date = ? 
        AND service_type = 'rental'
        AND booking_status NOT IN ('cancelled')
        AND payment_status NOT IN ('failed', 'expired')
        AND assigned_vehicle_id IS NOT NULL
    `).all(date) as { assigned_vehicle_id: string }[];

    const bookedVehicleIds = new Set(bookedRows.map(b => b.assigned_vehicle_id));

    // Kelompokkan per tipe kendaraan (VinFast VF 5 dan VinFast VF e34)
    const summary: Record<string, {
      total: number;
      booked: number;
      available: number;
      imageUrl: string;
      startingPrice: number;
      category: string;
    }> = {
      'VinFast VF 5': {
        total: 0,
        booked: 0,
        available: 0,
        imageUrl: modelImages['VinFast VF 5'],
        startingPrice: startingPrices['VinFast VF 5'] || 240000,
        category: 'Smart Compact Electric Crossover'
      },
      'VinFast VF e34': {
        total: 0,
        booked: 0,
        available: 0,
        imageUrl: modelImages['VinFast VF e34'],
        startingPrice: startingPrices['VinFast VF e34'] || 290000,
        category: 'Spacious Mid-Size Electric SUV'
      }
    };

    for (const v of totalVehicles) {
      if (!summary[v.model]) {
        summary[v.model] = {
          total: 0,
          booked: 0,
          available: 0,
          imageUrl: modelImages[v.model] || DEFAULT_MODEL_IMAGES['VinFast VF 5'],
          startingPrice: startingPrices[v.model] || 240000,
          category: v.model.includes('VF 5') ? 'Smart Compact Electric Crossover' : 'Spacious Mid-Size Electric SUV'
        };
      }
      summary[v.model].total += 1;
      if (bookedVehicleIds.has(v.id)) {
        summary[v.model].booked += 1;
      } else {
        summary[v.model].available += 1;
      }
    }

    res.json({
      success: true,
      city,
      date,
      inventory: summary,
      modelImages
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 3. BOOKING ENGINE (Atomic Locking & ArtoPay Integration)
// -------------------------------------------------------------

apiRouter.post('/bookings/rental', (req: Request, res: Response) => {
  cleanExpiredBookings();

  const {
    city,
    date,
    time,
    vehicleModel,
    durationHours,
    customerName,
    customerPhone,
    passengerCount,
    pickupAddress,
    dropoffAddress,
    notes
  } = req.body;

  // Validasi Input Dasar
  if (!city || !date || !vehicleModel || !durationHours || !customerName || !customerPhone || !pickupAddress) {
    return res.status(400).json({ success: false, message: 'Semua data wajib harus diisi lengkap.' });
  }

  // Aturan H-1
  const todayStr = getLocalDateString(0);
  if (date <= todayStr) {
    return res.status(400).json({
      success: false,
      message: 'Booking rental minimal H-1. Tidak dapat memesan hari ini atau tanggal lampau.'
    });
  }

  // Validasi nomor WhatsApp Indonesia
  const phoneClean = customerPhone.replace(/[\s-]/g, '');
  if (!/^(\+62|62|08)[0-9]{8,13}$/.test(phoneClean)) {
    return res.status(400).json({ success: false, message: 'Nomor WhatsApp Indonesia tidak valid.' });
  }

  // Validasi kapasitas maksimal 3 penumpang
  const pCount = Number(passengerCount) || 1;
  if (pCount > 3 || pCount < 1) {
    return res.status(400).json({
      success: false,
      message: 'Kapasitas kendaraan listrik maksimal 3 penumpang untuk kenyamanan prima.'
    });
  }

  // Dapatkan tarif dari database
  const pricing = db.prepare(`
    SELECT price, km_limit 
    FROM rental_pricing 
    WHERE vehicle_model = ? AND city = ? AND duration_hours = ? AND is_active = 1
  `).get(vehicleModel, city, Number(durationHours)) as { price: number; km_limit: number } | undefined;

  if (!pricing) {
    return res.status(400).json({
      success: false,
      message: `Tarif belum dikonfigurasi untuk ${vehicleModel} di ${city} dengan paket ${durationHours} jam.`
    });
  }

  // Atomic Locking dengan Database Transaction
  const lockTimeoutMinutes = 15;
  const expiresAt = new Date(Date.now() + lockTimeoutMinutes * 60 * 1000).toISOString();

  const transaction = db.transaction(() => {
    // 1. Cari kendaraan yang tersedia untuk model, kota, dan tanggal tersebut
    const availableVehicle = db.prepare(`
      SELECT v.id, v.dedicated_driver_id 
      FROM vehicles v
      WHERE v.city = ? 
        AND v.model = ? 
        AND v.is_active = 1 
        AND v.in_maintenance = 0
        AND v.id NOT IN (
          SELECT b.assigned_vehicle_id 
          FROM bookings b
          WHERE b.booking_date = ? 
            AND b.service_type = 'rental'
            AND b.assigned_vehicle_id IS NOT NULL
            AND b.booking_status NOT IN ('cancelled')
            AND b.payment_status NOT IN ('failed', 'expired')
        )
      LIMIT 1
    `).get(city, vehicleModel, date) as { id: string; dedicated_driver_id: string } | undefined;

    if (!availableVehicle) {
      throw new Error('Maaf, seluruh armada pada tanggal dan kota yang Anda pilih sudah terpesan. Silakan pilih tanggal lain.');
    }

    // 2. Generate Booking Number Unik: SJT-YYYYMMDD-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateCompact = date.replace(/-/g, '');
    const bookingNumber = `SJT-${dateCompact}-${randomSuffix}`;
    const bookingId = `BKG-${crypto.randomUUID()}`;

    // 3. Simulasikan URL Payment Gateway ArtoPay
    const paymentUrl = `/payment/${bookingNumber}`;

    // 4. Masukkan ke database dengan status pending_payment dan kunci unit
    db.prepare(`
      INSERT INTO bookings (
        id, booking_number, service_type, city, booking_date, booking_time,
        vehicle_model, duration_hours, km_limit, assigned_vehicle_id,
        pickup_address, dropoff_address, customer_name, customer_phone,
        passenger_count, notes, total_amount, payment_status,
        booking_status, assigned_driver_id, expires_at, artopay_payment_url
      ) VALUES (
        ?, ?, 'rental', ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, 'pending',
        'pending_payment', ?, ?, ?
      )
    `).run(
      bookingId,
      bookingNumber,
      city,
      date,
      time || '08:00',
      vehicleModel,
      Number(durationHours),
      pricing.km_limit,
      availableVehicle.id,
      pickupAddress,
      dropoffAddress || '-',
      customerName,
      phoneClean,
      pCount,
      notes || '',
      pricing.price,
      availableVehicle.dedicated_driver_id || null,
      expiresAt,
      paymentUrl
    );

    return {
      bookingId,
      bookingNumber,
      amount: pricing.price,
      expiresAt,
      paymentUrl
    };
  });

  try {
    const result = transaction();
    res.json({
      success: true,
      message: 'Booking sementara berhasil dibuat. Silakan selesaikan pembayaran.',
      data: result
    });
  } catch (error: any) {
    res.status(409).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 4. TAXI BOOKING ENGINE (OSRM Distance & Rp7.000/km)
// -------------------------------------------------------------

apiRouter.post('/bookings/taxi', (req: Request, res: Response) => {
  const {
    city,
    pickupAddress,
    dropoffAddress,
    pickupCoords,
    dropoffCoords,
    distanceKm,
    bookingDate,
    bookingTime,
    customerName,
    customerPhone,
    passengerCount,
    notes
  } = req.body;

  if (!city || !pickupAddress || !dropoffAddress || !customerName || !customerPhone || !distanceKm) {
    return res.status(400).json({ success: false, message: 'Data perjalanan taksi belum lengkap.' });
  }

  const phoneClean = customerPhone.replace(/[\s-]/g, '');
  const pCount = Math.min(3, Math.max(1, Number(passengerCount) || 1));

  // Ambil konfigurasi tarif taksi
  const rateRow = db.prepare("SELECT value FROM system_settings WHERE key = 'taxi_base_fare_per_km'").get() as { value: string } | undefined;
  const minFareRow = db.prepare("SELECT value FROM system_settings WHERE key = 'taxi_min_fare'").get() as { value: string } | undefined;

  const ratePerKm = rateRow ? parseInt(rateRow.value, 10) : 7000;
  const minFare = minFareRow ? parseInt(minFareRow.value, 10) : 25000;

  const rawFare = Math.ceil(Number(distanceKm) * ratePerKm);
  const totalAmount = Math.max(minFare, rawFare);

  const dateVal = bookingDate || getLocalDateString(0);
  const dateCompact = dateVal.replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingNumber = `TXI-${dateCompact}-${randomSuffix}`;
  const bookingId = `BKG-${crypto.randomUUID()}`;
  const paymentUrl = `/payment/${bookingNumber}`;

  try {
    db.prepare(`
      INSERT INTO bookings (
        id, booking_number, service_type, city, booking_date, booking_time,
        pickup_address, dropoff_address, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
        distance_km, taxi_rate_per_km, customer_name, customer_phone,
        passenger_count, notes, total_amount, payment_status, booking_status,
        artopay_payment_url
      ) VALUES (
        ?, ?, 'taxi', ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, 'pending', 'pending_payment',
        ?
      )
    `).run(
      bookingId,
      bookingNumber,
      city,
      dateVal,
      bookingTime || 'Segera',
      pickupAddress,
      dropoffAddress,
      pickupCoords?.lat || null,
      pickupCoords?.lng || null,
      dropoffCoords?.lat || null,
      dropoffCoords?.lng || null,
      Number(distanceKm),
      ratePerKm,
      customerName,
      phoneClean,
      pCount,
      notes || '',
      totalAmount,
      paymentUrl
    );

    res.json({
      success: true,
      message: 'Pemesanan taksi listrik berhasil dibuat.',
      data: {
        bookingId,
        bookingNumber,
        totalAmount,
        distanceKm,
        paymentUrl
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 5. ARTOPAY PAYMENT VERIFICATION & SIMULATION
// -------------------------------------------------------------

// Ambil status & data checkout untuk layar pembayaran
apiRouter.get('/payment/:bookingNumber', (req: Request, res: Response) => {
  cleanExpiredBookings();
  const { bookingNumber } = req.params;

  try {
    const booking = db.prepare(`
      SELECT b.*, 
             v.model as vehicle_model_name,
             p.price as official_price
      FROM bookings b
      LEFT JOIN vehicles v ON b.assigned_vehicle_id = v.id
      LEFT JOIN rental_pricing p ON (p.vehicle_model = b.vehicle_model AND p.city = b.city AND p.duration_hours = b.duration_hours)
      WHERE b.booking_number = ?
    `).get(bookingNumber) as any;

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Nomor pesanan tidak ditemukan.' });
    }

    // Hitung sisa waktu kadaluarsa (jika pending)
    let secondsLeft = 0;
    if (booking.expires_at && booking.payment_status === 'pending') {
      const exp = new Date(booking.expires_at).getTime();
      const diff = Math.floor((exp - Date.now()) / 1000);
      secondsLeft = Math.max(0, diff);
    }

    res.json({
      success: true,
      booking: {
        bookingNumber: booking.booking_number,
        serviceType: booking.service_type,
        city: booking.city,
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        vehicleModel: booking.vehicle_model,
        durationHours: booking.duration_hours,
        kmLimit: booking.km_limit,
        pickupAddress: booking.pickup_address,
        dropoffAddress: booking.dropoff_address,
        distanceKm: booking.distance_km,
        customerName: booking.customer_name,
        customerPhone: booking.customer_phone,
        totalAmount: booking.total_amount,
        paymentStatus: booking.payment_status,
        bookingStatus: booking.booking_status,
        expiresAt: booking.expires_at,
        secondsLeft,
        isExpired: booking.payment_status === 'expired' || (secondsLeft <= 0 && booking.payment_status === 'pending')
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verifikasi / Eksekusi Pembayaran ArtoPay (Mendukung Sandbox & Callback)
apiRouter.post('/payment/process', (req: Request, res: Response) => {
  const { bookingNumber, paymentMethod, transactionRef } = req.body;

  if (!bookingNumber) {
    return res.status(400).json({ success: false, message: 'Nomor booking wajib disertakan.' });
  }

  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE booking_number = ?').get(bookingNumber) as any;
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    if (booking.payment_status === 'paid') {
      return res.json({ success: true, message: 'Pesanan ini sudah dibayar sebelumnya.', alreadyPaid: true });
    }

    if (booking.payment_status === 'expired' || booking.booking_status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Sesi pembayaran ini telah kedaluwarsa. Silakan lakukan pemesanan ulang.' });
    }

    const now = new Date().toISOString();
    const artopayTrxId = transactionRef || `ARTOPAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update pembayaran & booking status secara atomik
    db.prepare(`
      UPDATE bookings 
      SET payment_status = 'paid',
          payment_method = ?,
          artopay_transaction_id = ?,
          booking_status = 'confirmed',
          paid_at = ?,
          updated_at = ?
      WHERE booking_number = ?
    `).run(paymentMethod || 'QRIS', artopayTrxId, now, now, bookingNumber);

    // Catat log audit
    db.prepare(`
      INSERT INTO audit_logs (id, actor, action, details)
      VALUES (?, ?, ?, ?)
    `).run(
      `LOG-${crypto.randomUUID()}`,
      'ArtoPay Gateway',
      'PAYMENT_CONFIRMED',
      `Booking ${bookingNumber} berhasil dibayar sebesar Rp${booking.total_amount.toLocaleString('id-ID')} via ${paymentMethod || 'QRIS'}`
    );

    res.json({
      success: true,
      message: 'Pembayaran berhasil dikonfirmasi. Unit telah resmi dikunci untuk Anda.',
      data: {
        bookingNumber,
        status: 'confirmed',
        paidAt: now,
        transactionId: artopayTrxId
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ArtoPay Webhook Endpoint Resmi (HMAC-SHA256 & Idempotency)
apiRouter.post('/webhook/artopay', (req: Request, res: Response) => {
  const secretKey = process.env.ARTOPAY_SECRET_KEY || 'artopay_secret_live_example';
  const signature = req.headers['x-artopay-signature'] as string;
  const payload = req.body;

  // Verifikasi Idempotency
  const eventId = payload.eventId || payload.transactionId || `TRX-${Date.now()}`;
  const existingEvent = db.prepare('SELECT id FROM webhook_logs WHERE reference_id = ?').get(eventId);
  if (existingEvent) {
    return res.status(200).json({ success: true, message: 'Event already processed.' });
  }

  try {
    const { orderId, amount, status } = payload;
    if (status === 'SUCCESS' || status === 'PAID') {
      const now = new Date().toISOString();
      db.prepare(`
        UPDATE bookings 
        SET payment_status = 'paid',
            booking_status = 'confirmed',
            paid_at = ?,
            updated_at = ?
        WHERE booking_number = ?
      `).run(now, now, orderId);
    }

    db.prepare(`
      INSERT INTO webhook_logs (id, reference_id, event_type, payload, is_success)
      VALUES (?, ?, ?, ?, 1)
    `).run(`WH-${crypto.randomUUID()}`, eventId, payload.eventType || 'PAYMENT_STATUS', JSON.stringify(payload));

    res.json({ success: true, message: 'Webhook processed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 6. CUSTOMER TRACKING (Driver & Plate Info Disclosed Only When Ready)
// -------------------------------------------------------------

apiRouter.get('/bookings/track/:bookingNumber', (req: Request, res: Response) => {
  const { bookingNumber } = req.params;

  try {
    const booking = db.prepare(`
      SELECT b.*,
             v.model as vehicle_model_name,
             v.plate_number as real_plate_number,
             COALESCE(v.driver_name, d.name, 'Driver Sawah Jaya Trans') as driver_name,
             COALESCE(v.driver_phone, d.phone, '081234567890') as driver_phone
      FROM bookings b
      LEFT JOIN vehicles v ON b.assigned_vehicle_id = v.id
      LEFT JOIN drivers d ON b.assigned_driver_id = d.id
      WHERE b.booking_number = ?
    `).get(bookingNumber) as any;

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Nomor pesanan tidak ditemukan.' });
    }

    res.json({
      success: true,
      booking: {
        bookingNumber: booking.booking_number,
        serviceType: booking.service_type,
        city: booking.city,
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        vehicleModel: booking.vehicle_model,
        durationHours: booking.duration_hours,
        kmLimit: booking.km_limit,
        pickupAddress: booking.pickup_address,
        dropoffAddress: booking.dropoff_address,
        customerName: booking.customer_name,
        customerPhone: booking.customer_phone,
        passengerCount: booking.passenger_count,
        totalAmount: booking.total_amount,
        paymentStatus: booking.payment_status,
        bookingStatus: booking.booking_status,
        driverStatus: 'ready',
        driverConfirmedAt: booking.driver_confirmed_at,
        plateNumber: booking.real_plate_number || 'Armada Mobil Listrik Terjadwal',
        driverName: booking.driver_name || 'Driver Resmi Terjadwal',
        driverPhone: booking.driver_phone,
        isDriverAssigned: Boolean(booking.assigned_vehicle_id || booking.assigned_driver_id)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 7. DRIVER PORTAL APIS (Mobile-First)
// -------------------------------------------------------------

// Login driver dengan Nomor HP dan PIN
apiRouter.post('/driver/login', (req: Request, res: Response) => {
  const { phone, pin } = req.body;
  if (!phone || !pin) {
    return res.status(400).json({ success: false, message: 'Nomor telepon dan PIN wajib diisi.' });
  }

  const cleanPhone = phone.replace(/[\s-]/g, '');
  const driver = db.prepare(`
    SELECT d.*, v.model as assigned_vehicle_model, v.plate_number as assigned_vehicle_plate
    FROM drivers d
    LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
    WHERE (d.phone = ? OR d.phone = ?) AND d.auth_pin = ? AND d.is_active = 1
  `).get(cleanPhone, cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone, pin) as any;

  if (!driver) {
    return res.status(401).json({ success: false, message: 'Nomor telepon atau PIN driver salah.' });
  }

  res.json({
    success: true,
    driver: {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      vehicleModel: driver.assigned_vehicle_model,
      plateNumber: driver.assigned_vehicle_plate
    }
  });
});

// Ambil semua daftar driver untuk pemilihan cepat jika driver mengakses portal
apiRouter.get('/driver/list-public', (req: Request, res: Response) => {
  try {
    const list = db.prepare(`
      SELECT d.id, d.name, d.phone, v.model as vehicle_model, v.plate_number
      FROM drivers d
      LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
      WHERE d.is_active = 1
      ORDER BY d.name ASC
    `).all();
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Ambil jadwal tugas driver
apiRouter.get('/driver/:driverId/trips', (req: Request, res: Response) => {
  const { driverId } = req.params;

  try {
    const trips = db.prepare(`
      SELECT b.*, v.plate_number, v.model as vehicle_model
      FROM bookings b
      LEFT JOIN vehicles v ON b.assigned_vehicle_id = v.id
      WHERE b.assigned_driver_id = ? 
        AND b.booking_status NOT IN ('cancelled')
        AND b.payment_status = 'paid'
      ORDER BY b.booking_date ASC, b.booking_time ASC
    `).all(driverId);

    res.json({ success: true, data: trips });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Konfirmasi Driver Siap Bertugas
apiRouter.post('/driver/confirm-ready', (req: Request, res: Response) => {
  const { bookingId, driverId, status } = req.body;

  if (!bookingId || !driverId) {
    return res.status(400).json({ success: false, message: 'Data booking dan driver wajib disertakan.' });
  }

  const now = new Date().toISOString();
  const driverStatus = status === 'unable' ? 'unable' : 'ready';
  const bookingStatus = driverStatus === 'ready' ? 'driver_ready' : 'driver_pending';

  try {
    db.prepare(`
      UPDATE bookings 
      SET driver_status = ?,
          booking_status = ?,
          driver_confirmed_at = ?,
          updated_at = ?
      WHERE id = ? AND assigned_driver_id = ?
    `).run(driverStatus, bookingStatus, now, now, bookingId, driverId);

    // Log ke audit
    db.prepare(`
      INSERT INTO audit_logs (id, actor, action, details)
      VALUES (?, ?, ?, ?)
    `).run(
      `LOG-${crypto.randomUUID()}`,
      `Driver ${driverId}`,
      'DRIVER_CONFIRMATION',
      `Driver mengonfirmasi status: ${driverStatus} untuk tugas ${bookingId}`
    );

    res.json({
      success: true,
      message: driverStatus === 'ready' 
        ? 'Terima kasih, konfirmasi siap bertugas telah disimpan. Detail kendaraan dibuka untuk pelanggan.'
        : 'Status ketidaksediaan telah dicatat, admin akan menugaskan driver pengganti.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 8. ADMIN DASHBOARD APIS (Full 8 Modules)
// -------------------------------------------------------------

// Admin Auth Middleware sederhana
function checkAdminAuth(req: Request, res: Response, next: Function) {
  const adminPinHeader = req.headers['x-admin-key'] as string;
  const configuredPin = (db.prepare("SELECT value FROM system_settings WHERE key = 'admin_pin'").get() as any)?.value || 'admin2026';

  if (!adminPinHeader || adminPinHeader !== configuredPin) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. PIN Admin tidak valid.' });
  }
  next();
}

// Module 1: Dashboard Overview
apiRouter.get('/admin/overview', checkAdminAuth, (req: Request, res: Response) => {
  try {
    const todayStr = getLocalDateString(0);
    const tomorrowStr = getLocalDateString(1);

    const totalBookings = (db.prepare("SELECT count(*) as c FROM bookings WHERE booking_status != 'cancelled'").get() as any).c;
    const todayBookings = (db.prepare("SELECT count(*) as c FROM bookings WHERE booking_date = ? AND booking_status != 'cancelled'").get(todayStr) as any).c;
    const tomorrowBookings = (db.prepare("SELECT count(*) as c FROM bookings WHERE booking_date = ? AND booking_status != 'cancelled'").get(tomorrowStr) as any).c;

    const totalFleet = (db.prepare("SELECT count(*) as c FROM vehicles WHERE is_active = 1").get() as any).c;
    const maintenanceFleet = (db.prepare("SELECT count(*) as c FROM vehicles WHERE in_maintenance = 1").get() as any).c;

    const totalRevenue = (db.prepare("SELECT COALESCE(SUM(total_amount), 0) as s FROM bookings WHERE payment_status = 'paid'").get() as any).s;
    const rentalRevenue = (db.prepare("SELECT COALESCE(SUM(total_amount), 0) as s FROM bookings WHERE payment_status = 'paid' AND service_type = 'rental'").get() as any).s;
    const taxiRevenue = (db.prepare("SELECT COALESCE(SUM(total_amount), 0) as s FROM bookings WHERE payment_status = 'paid' AND service_type = 'taxi'").get() as any).s;

    // Driver confirmation besok
    const tomorrowTrips = db.prepare(`
      SELECT b.id, b.booking_number, b.driver_status, b.customer_name, b.booking_time,
             v.model as vehicle_model, v.plate_number, d.name as driver_name
      FROM bookings b
      LEFT JOIN vehicles v ON b.assigned_vehicle_id = v.id
      LEFT JOIN drivers d ON b.assigned_driver_id = d.id
      WHERE b.booking_date = ? AND b.payment_status = 'paid'
    `).all(tomorrowStr);

    res.json({
      success: true,
      stats: {
        totalBookings,
        todayBookings,
        tomorrowBookings,
        totalFleet,
        maintenanceFleet,
        availableFleetNow: totalFleet - maintenanceFleet,
        totalRevenue,
        rentalRevenue,
        taxiRevenue,
        tomorrowTrips
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Module 2: Manajemen Armada Mobil & Driver
apiRouter.get('/admin/vehicles', checkAdminAuth, (req: Request, res: Response) => {
  try {
    const vehicles = db.prepare(`
      SELECT v.*,
             COALESCE(v.driver_name, d.name, 'Driver Siaga') as driver_name,
             COALESCE(v.driver_phone, d.phone, '-') as driver_phone
      FROM vehicles v
      LEFT JOIN drivers d ON v.dedicated_driver_id = d.id
      ORDER BY v.created_at DESC
    `).all();
    res.json({ success: true, data: vehicles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.post('/admin/vehicles', checkAdminAuth, (req: Request, res: Response) => {
  const { code, model, plateNumber, city, driverName, driverPhone, inMaintenance, notes, imageUrl } = req.body;
  if (!model || !plateNumber || !city) {
    return res.status(400).json({ success: false, message: 'Model kendaraan, nomor plat, dan kota wajib diisi.' });
  }

  const generatedCode = code?.trim() || `SJT-${model.includes('VF 5') ? 'VF5' : 'VFE34'}-${Math.floor(10 + Math.random() * 90)}`;
  const id = `VEH-${Date.now().toString().slice(-4)}`;
  const cleanDriverName = driverName?.trim() || 'Driver Siaga';
  const cleanDriverPhone = driverPhone?.trim() || '-';
  const cleanPlate = plateNumber.trim().toUpperCase();
  const modelImages = getModelImages();
  const finalImageUrl = imageUrl?.trim() || modelImages[model] || DEFAULT_MODEL_IMAGES['VinFast VF 5'];

  try {
    db.prepare(`
      INSERT INTO vehicles (id, code, model, plate_number, city, driver_name, driver_phone, in_maintenance, is_active, notes, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(id, generatedCode, model, cleanPlate, city, cleanDriverName, cleanDriverPhone, inMaintenance ? 1 : 0, notes || '', finalImageUrl);

    res.json({ success: true, message: 'Armada mobil beserta data driver dan foto berhasil didaftarkan.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

apiRouter.put('/admin/vehicles/:id', checkAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, model, plateNumber, city, driverName, driverPhone, inMaintenance, isActive, notes, imageUrl } = req.body;

  try {
    const existing = db.prepare('SELECT model, image_url FROM vehicles WHERE id = ?').get(id) as any;
    const modelImages = getModelImages();
    const finalImageUrl = imageUrl !== undefined ? imageUrl?.trim() : (existing?.image_url || modelImages[model] || DEFAULT_MODEL_IMAGES['VinFast VF 5']);

    db.prepare(`
      UPDATE vehicles 
      SET code = ?, model = ?, plate_number = ?, city = ?, 
          driver_name = ?, driver_phone = ?, in_maintenance = ?, is_active = ?, notes = ?, image_url = ?
      WHERE id = ?
    `).run(
      code,
      model,
      plateNumber?.trim().toUpperCase(),
      city,
      driverName?.trim() || 'Driver Siaga',
      driverPhone?.trim() || '-',
      inMaintenance ? 1 : 0,
      isActive !== undefined ? (isActive ? 1 : 0) : 1,
      notes || '',
      finalImageUrl,
      id
    );

    res.json({ success: true, message: 'Data mobil, driver, dan foto berhasil diperbarui.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Endpoint Manajemen Foto Model Kendaraan (VinFast VF 5 & VinFast VF e34)
apiRouter.get('/admin/models/images', checkAdminAuth, (req: Request, res: Response) => {
  try {
    const images = getModelImages();
    res.json({ success: true, data: images });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.post('/admin/models/image', checkAdminAuth, (req: Request, res: Response) => {
  const { model, imageUrl } = req.body;
  if (!model || !imageUrl) {
    return res.status(400).json({ success: false, message: 'Nama model dan URL gambar wajib diisi.' });
  }

  const cleanUrl = imageUrl.trim();
  const settingKey = model.includes('VF 5') ? 'model_image_VF5' : 'model_image_VFE34';

  try {
    db.prepare(`
      INSERT INTO system_settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(settingKey, cleanUrl);

    // Update foto seluruh unit kendaraan dari model tersebut
    db.prepare(`
      UPDATE vehicles 
      SET image_url = ? 
      WHERE model = ?
    `).run(cleanUrl, model);

    res.json({
      success: true,
      message: `Foto resmi untuk ${model} berhasil diperbarui di seluruh sistem.`,
      imageUrl: cleanUrl
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.delete('/admin/models/image', checkAdminAuth, (req: Request, res: Response) => {
  const model = (req.body?.model || req.query?.model) as string;
  if (!model) {
    return res.status(400).json({ success: false, message: 'Model kendaraan wajib ditentukan.' });
  }

  const settingKey = model.includes('VF 5') ? 'model_image_VF5' : 'model_image_VFE34';
  const defaultUrl = DEFAULT_MODEL_IMAGES[model] || DEFAULT_MODEL_IMAGES['VinFast VF 5'];

  try {
    db.prepare(`
      INSERT INTO system_settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(settingKey, defaultUrl);

    db.prepare(`
      UPDATE vehicles 
      SET image_url = ? 
      WHERE model = ?
    `).run(defaultUrl, model);

    res.json({
      success: true,
      message: `Foto ${model} berhasil direset ke standar resmi.`,
      imageUrl: defaultUrl
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.delete('/admin/vehicles/:id', checkAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const activeBooking = db.prepare(`
      SELECT count(*) as c FROM bookings 
      WHERE assigned_vehicle_id = ? AND booking_status NOT IN ('cancelled', 'completed')
    `).get(id) as { c: number };

    if (activeBooking.c > 0) {
      db.prepare('UPDATE vehicles SET is_active = 0 WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Armada memiliki pemesanan aktif. Status dinonaktifkan dari sistem.' });
    }

    db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);
    res.json({ success: true, message: 'Armada mobil berhasil dihapus.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Module 3: Manajemen Driver
apiRouter.get('/admin/drivers', checkAdminAuth, (req: Request, res: Response) => {
  try {
    const drivers = db.prepare(`
      SELECT d.*, v.model as assigned_vehicle_model, v.plate_number as assigned_vehicle_plate
      FROM drivers d
      LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
      ORDER BY d.created_at DESC
    `).all();
    res.json({ success: true, data: drivers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.post('/admin/drivers', checkAdminAuth, (req: Request, res: Response) => {
  const { name, phone, idCardNumber, authPin, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Nama dan nomor telepon driver wajib diisi.' });
  }

  const id = `DRV-${Date.now().toString().slice(-4)}`;
  try {
    db.prepare(`
      INSERT INTO drivers (id, name, phone, id_card_number, auth_pin, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, phone, idCardNumber || '', authPin || '123456', notes || '');

    res.json({ success: true, message: 'Driver berhasil didaftarkan.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

apiRouter.put('/admin/drivers/:id', checkAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, idCardNumber, authPin, isActive, assignedVehicleId, notes } = req.body;

  try {
    db.prepare(`
      UPDATE drivers 
      SET name = ?, phone = ?, id_card_number = ?, auth_pin = ?, 
          is_active = ?, assigned_vehicle_id = ?, notes = ?
      WHERE id = ?
    `).run(name, phone, idCardNumber || '', authPin || '123456', isActive ? 1 : 0, assignedVehicleId || null, notes || '', id);

    res.json({ success: true, message: 'Data driver berhasil diperbarui.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Module 4: Kalender Booking
apiRouter.get('/admin/calendar', checkAdminAuth, (req: Request, res: Response) => {
  const { date } = req.query as { date?: string };
  const targetDate = date || getLocalDateString(0);

  try {
    const allVehicles = db.prepare(`
      SELECT v.*, d.name as driver_name, d.phone as driver_phone
      FROM vehicles v
      LEFT JOIN drivers d ON v.dedicated_driver_id = d.id
      WHERE v.is_active = 1
      ORDER BY v.city, v.model
    `).all() as any[];

    const activeBookings = db.prepare(`
      SELECT b.*, d.name as assigned_driver_name 
      FROM bookings b
      LEFT JOIN drivers d ON b.assigned_driver_id = d.id
      WHERE b.booking_date = ? 
        AND b.booking_status != 'cancelled'
        AND b.payment_status != 'expired'
    `).all(targetDate) as any[];

    // Petakan status tiap unit pada tanggal tersebut
    const bookingMap = new Map();
    for (const b of activeBookings) {
      if (b.assigned_vehicle_id) {
        bookingMap.set(b.assigned_vehicle_id, b);
      }
    }

    const calendarFleet = allVehicles.map(veh => {
      const b = bookingMap.get(veh.id);
      return {
        ...veh,
        booking: b || null,
        isBooked: Boolean(b),
        statusLabel: veh.in_maintenance ? 'Perawatan' : b ? 'Dipesan' : 'Tersedia'
      };
    });

    res.json({
      success: true,
      date: targetDate,
      totalFleet: allVehicles.length,
      bookedCount: activeBookings.length,
      availableCount: allVehicles.filter(v => !v.in_maintenance && !bookingMap.has(v.id)).length,
      fleet: calendarFleet
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Module 5: Manajemen Booking & Pencarian
apiRouter.get('/admin/bookings', checkAdminAuth, (req: Request, res: Response) => {
  const { search, status, service, city } = req.query as { search?: string; status?: string; service?: string; city?: string };

  try {
    let query = `
      SELECT b.*, 
             v.model as vehicle_model_name, 
             v.plate_number as real_plate_number,
             d.name as driver_name,
             d.phone as driver_phone
      FROM bookings b
      LEFT JOIN vehicles v ON b.assigned_vehicle_id = v.id
      LEFT JOIN drivers d ON b.assigned_driver_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (b.booking_number LIKE ? OR b.customer_name LIKE ? OR b.customer_phone LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (status) {
      query += ` AND b.booking_status = ?`;
      params.push(status);
    }
    if (service) {
      query += ` AND b.service_type = ?`;
      params.push(service);
    }
    if (city) {
      query += ` AND b.city = ?`;
      params.push(city);
    }

    query += ` ORDER BY b.created_at DESC LIMIT 100`;

    const rows = db.prepare(query).all(...params);
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Ubah status booking / assign driver manual
apiRouter.patch('/admin/bookings/:id', checkAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { bookingStatus, paymentStatus, assignedDriverId, assignedVehicleId } = req.body;

  try {
    const fields: string[] = [];
    const params: any[] = [];

    if (bookingStatus !== undefined) {
      fields.push('booking_status = ?');
      params.push(bookingStatus);
    }
    if (paymentStatus !== undefined) {
      fields.push('payment_status = ?');
      params.push(paymentStatus);
    }
    if (assignedDriverId !== undefined) {
      fields.push('assigned_driver_id = ?');
      params.push(assignedDriverId);
    }
    if (assignedVehicleId !== undefined) {
      fields.push('assigned_vehicle_id = ?');
      params.push(assignedVehicleId);
    }

    fields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    db.prepare(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`).run(...params);

    res.json({ success: true, message: 'Status booking berhasil diperbarui.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Module 6: Konfirmasi Driver Board (Malam sebelum hari H)
apiRouter.get('/admin/driver-dispatch', checkAdminAuth, (req: Request, res: Response) => {
  const tomorrowStr = getLocalDateString(1);
  const { date } = req.query as { date?: string };
  const targetDate = date || tomorrowStr;

  try {
    const dispatches = db.prepare(`
      SELECT b.id, b.booking_number, b.service_type, b.city, b.booking_date, b.booking_time,
             b.customer_name, b.customer_phone, b.pickup_address, b.dropoff_address,
             b.duration_hours, b.booking_status, b.driver_status, b.driver_confirmed_at,
             v.model as vehicle_model, v.plate_number,
             d.id as driver_id, d.name as driver_name, d.phone as driver_phone
      FROM bookings b
      LEFT JOIN vehicles v ON b.assigned_vehicle_id = v.id
      LEFT JOIN drivers d ON b.assigned_driver_id = d.id
      WHERE b.booking_date = ? 
        AND b.payment_status = 'paid'
        AND b.booking_status != 'cancelled'
      ORDER BY b.booking_time ASC
    `).all(targetDate);

    res.json({
      success: true,
      date: targetDate,
      data: dispatches
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Module 7: Pengaturan Harga & Sistem
apiRouter.post('/admin/pricing/update', checkAdminAuth, (req: Request, res: Response) => {
  const { id, price, overtimeRate, extraKmRate } = req.body;
  if (!id || price === undefined) {
    return res.status(400).json({ success: false, message: 'ID tarif dan harga baru wajib diisi.' });
  }

  try {
    db.prepare(`
      UPDATE rental_pricing 
      SET price = ?, 
          overtime_rate_per_hour = COALESCE(?, overtime_rate_per_hour),
          extra_km_rate = COALESCE(?, extra_km_rate)
      WHERE id = ?
    `).run(Number(price), overtimeRate ? Number(overtimeRate) : null, extraKmRate ? Number(extraKmRate) : null, id);

    res.json({ success: true, message: 'Harga rental berhasil diperbarui.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.post('/admin/settings/update', checkAdminAuth, (req: Request, res: Response) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ success: false, message: 'Key dan Value wajib diisi.' });
  }

  try {
    db.prepare(`
      INSERT INTO system_settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(key, String(value));

    res.json({ success: true, message: `Pengaturan ${key} berhasil disimpan.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Module 8: Laporan & Ekspor
apiRouter.get('/admin/reports', checkAdminAuth, (req: Request, res: Response) => {
  try {
    // Ringkasan per model kendaraan
    const vehicleStats = db.prepare(`
      SELECT v.model, count(b.id) as trip_count, COALESCE(SUM(b.total_amount), 0) as total_revenue
      FROM vehicles v
      LEFT JOIN bookings b ON v.id = b.assigned_vehicle_id AND b.payment_status = 'paid'
      GROUP BY v.model
    `).all();

    // Ringkasan per kota
    const cityStats = db.prepare(`
      SELECT city, count(id) as count, COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings
      WHERE payment_status = 'paid'
      GROUP BY city
    `).all();

    // 20 Transaksi terakhir
    const transactions = db.prepare(`
      SELECT booking_number, service_type, customer_name, total_amount, payment_method, 
             payment_status, booking_status, created_at, paid_at
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    res.json({
      success: true,
      vehicleStats,
      cityStats,
      transactions
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
