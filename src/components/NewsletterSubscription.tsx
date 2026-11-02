import React, { useState } from 'react';
import { Mail, CheckCircle2, Zap, Bell, ShieldCheck } from 'lucide-react';
import { LiveryStripe } from './EvLiveryDecals';

export const NewsletterSubscription: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
    }, 600);
  };

  return (
    <section className="relative py-12 sm:py-16 bg-gradient-to-r from-brand-primary via-slate-900 to-brand-primary text-white overflow-hidden border-t border-brand-teal/30">
      {/* Aksen Livery di Bagian Atas */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-lime via-brand-teal to-brand-primary" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-brand-teal/40 text-brand-lime text-xs font-black tracking-wider uppercase mb-3 shadow-xs">
          <Bell className="w-3.5 h-3.5" />
          <span>Info Promo &amp; Langganan Prioritas</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
          BERLANGGANAN PROMO &amp; DISKON KHUSUS
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
          Dapatkan kupon potongan harga sewa mobil listrik hingga 20%, info promo rute taksi bandara, dan update armada VinFast terbaru setiap bulan.
        </p>

        {/* Form Berlangganan */}
        <div className="mt-6 max-w-md mx-auto">
          {isSubscribed ? (
            <div className="p-4 rounded-2xl bg-brand-teal/30 border border-brand-lime/40 text-white flex items-center justify-center gap-2.5 shadow-md">
              <CheckCircle2 className="w-5 h-5 text-brand-lime shrink-0" />
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-brand-lime">
                  Pendaftaran Berlangganan Berhasil!
                </p>
                <p className="text-[11px] text-slate-200">
                  Voucher promo perdana Anda akan segera dikirimkan.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan Email atau No. WhatsApp Anda"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-lime border-0 shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-brand-lime hover:bg-brand-lime-hover text-brand-primary font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 active:scale-95 disabled:opacity-60"
              >
                <Zap className="w-4 h-4 fill-brand-primary" />
                <span>{isLoading ? 'Mendaftarkan...' : 'Berlangganan'}</span>
              </button>
            </form>
          )}

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-lime" />
            <span>Privasi terjaga 100%. Tanpa spam, dapat dibatalkan kapan saja.</span>
          </div>
        </div>

      </div>
    </section>
  );
};
