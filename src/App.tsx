/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  FileText, 
  RotateCcw, 
  UserPlus, 
  ShieldCheck, 
  BarChart3, 
  BellRing, 
  Settings,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Calculator,
  ChevronLeft,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from './translations';
import dashboardImg from './assets/images/gold_software_dashboard_1790053267426.jpg';
import jewelryImg from './assets/images/luxury_gold_jewelry_display_1790053280753.jpg';
import barsImg from './assets/images/gold_silver_bars_setup_1790053296523.jpg';
import mockupImg from './assets/images/khazaneh_dashboard_mockup_1790052153876.jpg';

// --- Types ---
interface PriceData {
  gold_gram_24k_usd: number;
  silver_gram_999_usd: number;
  afghani_rate: number;
  updated_at_gold: string;
  updated_at_currency: string;
}

// --- Constants ---

const KARATS_GOLD = [
  { value: 24, key: 'karat24' },
  { value: 22, key: 'karat22' },
  { value: 21, key: 'karat21' },
  { value: 18, key: 'karat18' },
  { value: 14, key: 'karat14' },
];

const KARATS_SILVER = [
  { value: 999, key: 'silver999', multiplier: 1 },
  { value: 925, key: 'silver925', multiplier: 0.925 },
];

const Navbar = ({ lang, setLang }: { lang: Language, setLang: (l: Language) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[lang];
  const isRtl = lang !== 'en';

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldCheck className="text-slate-900 w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">{t.name}</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[t.home, t.intro, t.features, t.pricing, t.contact].map((item) => (
            <a key={item} href={`#${item}`} className="text-slate-300 hover:text-amber-400 transition-colors text-sm font-medium">
              {item}
            </a>
          ))}
          
          <div className="flex items-center gap-2 border-r border-white/10 px-4 h-6">
            <Globe className="w-4 h-4 text-slate-400" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent text-slate-300 text-xs font-bold focus:outline-none cursor-pointer hover:text-amber-400 transition-colors"
            >
              <option value="dr" className="bg-slate-900">دری</option>
              <option value="pa" className="bg-slate-900">پشتو</option>
              <option value="en" className="bg-slate-900">English</option>
            </select>
          </div>

          <a href="#request" className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105">
            {t.requestBtn}
          </a>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-slate-800 p-6 absolute top-20 w-full border-b border-white/5"
          >
            <div className="flex flex-col gap-4">
              {[t.home, t.intro, t.features, t.pricing, t.contact].map((item) => (
                <a key={item} href={`#${item}`} className="text-slate-300 py-2 border-b border-white/5" onClick={() => setIsOpen(false)}>
                  {item}
                </a>
              ))}
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400 text-sm">{lang === 'en' ? 'Language' : 'زبان'}</span>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="bg-transparent text-amber-500 text-sm font-bold"
                >
                  <option value="dr">دری</option>
                  <option value="pa">پشتو</option>
                  <option value="en">English</option>
                </select>
              </div>
              <a href="#request" className="bg-amber-500 text-slate-900 px-5 py-3 rounded-xl text-center font-bold" onClick={() => setIsOpen(false)}>
                {t.requestBtn}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('dr');
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calcType, setCalcType] = useState<'gold' | 'silver'>('gold');
  const [calculator, setCalculator] = useState({ 
    weight: 1, 
    karat: 18, 
    markupPercent: 14,
    currency: 72 
  });
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const t = translations[lang];
  const isRtl = lang !== 'en';

  useEffect(() => {
    const fetchAllPrices = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/prices');
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setPrices({
          gold_gram_24k_usd: data.gold24kUsdPerGram,
          silver_gram_999_usd: data.silver999UsdPerGram ?? data.gold24kUsdPerGram / 85,
          afghani_rate: data.usdToAfn,
          updated_at_gold: data.updatedAtGold,
          updated_at_currency: data.updatedAtCurrency
        });
        
        setCalculator(prev => ({ ...prev, currency: data.usdToAfn }));
        setError(null);
      } catch (err) {
        console.error("Error fetching rates:", err);
        setError(t.errorFetching);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPrices();
    const interval = setInterval(fetchAllPrices, 300000);
    return () => clearInterval(interval);
  }, [t.errorFetching]);

  const calculateFinalPrice = () => {
    if (!prices) return 0;
    
    let karatPrice = 0;
    if (calcType === 'gold') {
      const gold24kAfnPerGram = prices.gold_gram_24k_usd * prices.afghani_rate;
      karatPrice = gold24kAfnPerGram * (calculator.karat / 24);
    } else {
      const silver999AfnPerGram = prices.silver_gram_999_usd * prices.afghani_rate;
      const mult = (calculator.karat === 999 ? 1 : 0.925);
      karatPrice = silver999AfnPerGram * mult;
    }

    // Calculation: Total Price = karatPrice * (1 + markup/100) * weight
    const finalPricePerGram = karatPrice * (1 + (calculator.markupPercent / 100));
    const total = finalPricePerGram * calculator.weight;
    
    return total.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const currentFeatures = [
    { id: '1', title: t.feature1Title, desc: t.feature1Desc, icon: <LayoutDashboard className="w-6 h-6" /> },
    { id: '2', title: t.feature2Title, desc: t.feature2Desc, icon: <Package className="w-6 h-6" /> },
    { id: '3', title: t.feature3Title, desc: t.feature3Desc, icon: <ShoppingCart className="w-6 h-6" /> },
    { id: '4', title: t.feature4Title, desc: t.feature4Desc, icon: <TrendingUp className="w-6 h-6" /> },
    { id: '5', title: t.feature5Title, desc: t.feature5Desc, icon: <FileText className="w-6 h-6" /> },
    { id: '6', title: t.feature6Title, desc: t.feature6Desc, icon: <RotateCcw className="w-6 h-6" /> },
    { id: '7', title: t.feature7Title, desc: t.feature7Desc, icon: <UserPlus className="w-6 h-6" /> },
    { id: '8', title: t.feature8Title, desc: t.feature8Desc, icon: <ShieldCheck className="w-6 h-6" /> },
  ];

  const whyUs = [
    { title: t.why1Title, desc: t.why1Desc },
    { title: t.why2Title, desc: t.why2Desc },
    { title: t.why3Title, desc: t.why3Desc },
    { title: t.why4Title, desc: t.why4Desc },
  ];

  return (
    <div className={`min-h-screen bg-slate-950 selection:bg-amber-500/30 selection:text-amber-500 overflow-x-hidden ${isRtl ? 'font-vazir' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar lang={lang} setLang={setLang} />

      {/* --- HERO SECTION --- */}
      <section id={t.home} className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              {t.version}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t.title.split('؛')[0]}؛ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-amber-500 to-amber-200">
                {t.title.split('؛')[1]}
              </span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              {t.heroDesc}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#features" className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-amber-500/20 transition-all">
                {t.introBtn}
              </a>
              <a href="#request" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-sm transition-all">
                {t.demoBtn}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: isRtl ? 10 : -10 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-indigo-500 opacity-20 blur-2xl rounded-3xl" />
            <div className="relative rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-slate-900">
               <img 
                 src={dashboardImg} 
                 alt="Khazaneh Dashboard" 
                 referrerPolicy="no-referrer"
                 className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- INTRODUCTION --- */}
      <section id={t.intro} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-amber-600 font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-[2px] bg-amber-600" />
                {t.aboutTitle}
              </h2>
              <h3 className="text-4xl font-black text-slate-900 mb-8 leading-tight">
                {t.aboutSub}
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {t.aboutDesc}
              </p>
              <ul className="space-y-4">
                {[
                  lang === 'en' ? 'Full compliance with gold union standards' : 'تطبیق کامل با استانداردهای اتحادیه طلا',
                  lang === 'en' ? 'Support for major currencies (AFN, USD, IRR)' : 'پشتیبانی از انواع ارزهای رایج (افغانی، دلار، تومان)',
                  lang === 'en' ? 'Multi-layer security and automatic backup' : 'امنیت چندلایه داده‌ها و پشتیبان‌گیری خودکار'
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="text-amber-500 w-5 h-5" />
                    {text}
                  </li>
                ))}
              </ul>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                  <img 
                    src={jewelryImg} 
                    className="w-full h-full object-cover" 
                    alt="Jewelry Showcase" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="h-64 bg-amber-500 rounded-3xl p-8 flex flex-col justify-end">
                  <span className="text-5xl font-black text-white mb-2">۱۰۰٪</span>
                  <p className="text-amber-100 font-bold">{t.accuracy}</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 bg-slate-900 rounded-3xl p-8 flex flex-col justify-end">
                  <span className="text-5xl font-black text-white mb-2">+۵۰</span>
                  <p className="text-slate-400 font-bold">{t.activeShops}</p>
                </div>
                <div className="h-48 bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                   <img 
                     src={mockupImg} 
                     className="w-full h-full object-cover" 
                     alt="Gold Workspace" 
                     referrerPolicy="no-referrer"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id={t.features} className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-amber-600 font-bold mb-4 uppercase tracking-widest text-sm">{lang === 'en' ? 'ENDLESS POSSIBILITIES' : 'امکانات بی‌پایان'}</h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900">{t.keyFeatures}</h3>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentFeatures.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                {f.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- GOLD PRICE TOOL --- */}
      <section id={t.pricing} className="py-24 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
             <h2 className="text-amber-500 font-bold mb-4 flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" />
                {t.goldPriceSectionTitle}
              </h2>
              <h3 className="text-3xl md:text-4xl font-black text-white">{t.goldPriceSectionSub}</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-amber-500 font-bold animate-pulse">{t.calculatingPrices}</p>
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
              <BellRing className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-200 font-bold">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 bg-red-500 text-white px-6 py-2 rounded-xl font-bold"
              >
                {t.resubmit}
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <p className="text-slate-400 text-xs mb-2 uppercase font-bold tracking-wider">{t.globalGold}</p>
                    <p className="text-3xl font-black text-amber-500">
                      ${prices ? (prices.gold_gram_24k_usd * 31.1035).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-2">1 Troy Ounce</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <p className="text-slate-400 text-xs mb-2 uppercase font-bold tracking-wider">{t.usdPerGram}</p>
                    <p className="text-3xl font-black text-white">
                      ${prices ? prices.gold_gram_24k_usd.toFixed(2) : '0.00'}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-2">Pure 24K Gold</p>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm mb-8 flex items-center justify-between">
                   <div>
                      <p className="text-slate-400 text-xs font-bold mb-1">{t.exchangeRate}</p>
                      <p className="text-2xl font-black text-white">1 USD = {prices ? prices.afghani_rate.toFixed(2) : '0.00'} {t.afghani}</p>
                   </div>
                   <div className="text-left" dir="ltr">
                      <p className="text-slate-500 text-[10px] font-bold">{t.lastUpdate}</p>
                      <p className="text-slate-400 text-xs">{prices ? new Date(prices.updated_at_gold).toLocaleTimeString() : '...'}</p>
                   </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8 overflow-hidden">
                  <table className="w-full text-sm text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                    <thead>
                      <tr className="text-slate-500 border-b border-white/10">
                        <th className="pb-3 text-start font-bold">{t.karatLabel}</th>
                        <th className="pb-3 font-bold">{t.afghani} / Gram (+{calculator.markupPercent}%)</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {prices && KARATS_GOLD.map((k) => (
                        <tr key={k.value} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 text-start">{translations[lang][k.key as keyof typeof t]}</td>
                          <td className="py-3 font-bold text-white">
                            {(prices.gold_gram_24k_usd * prices.afghani_rate * (k.value / 24) * (1 + (calculator.markupPercent / 100))).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
                  <BellRing className="w-4 h-4 shrink-0 mt-0.5" />
                  {t.warning}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[40px] p-10 shadow-2xl text-right"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <h4 className="text-2xl font-black text-slate-900 mb-8 text-center flex items-center justify-center gap-2">
                  <Calculator className="text-amber-500" />
                  {t.calcTitle}
                </h4>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 text-xs font-bold mb-2 mr-1">{t.weight}</label>
                      <input 
                        type="number" 
                        value={calculator.weight}
                        onChange={(e) => setCalculator({...calculator, weight: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-xs font-bold mb-2 mr-1">{t.karatLabel}</label>
                      <select 
                        value={calculator.karat}
                        onChange={(e) => setCalculator({...calculator, karat: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        {KARATS_GOLD.map(k => (
                          <option key={k.value} value={k.value}>{translations[lang][k.key as keyof typeof t]}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 text-xs font-bold mb-2 mr-1">{t.markup}</label>
                      <input 
                        type="number" 
                        value={calculator.markupPercent}
                        onChange={(e) => setCalculator({...calculator, markupPercent: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-xs font-bold mb-2 mr-1">{t.exchangeRate}</label>
                      <input 
                        type="number" 
                        value={calculator.currency}
                        onChange={(e) => setCalculator({...calculator, currency: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-slate-400 text-center text-xs mb-2">{t.finalPrice}</p>
                    <p className="text-4xl font-black text-slate-900 text-center flex items-center justify-center gap-2">
                      {calculateFinalPrice()}
                      <span className="text-lg font-bold text-amber-600">{t.afghani}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* --- WHY KHAZANEH --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-4xl font-black text-slate-900 mb-12">{t.whyTitle}</h2>
              <div className="grid gap-6">
                {whyUs.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 p-6 rounded-3xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0 text-amber-600">
                      <CheckCircle2 />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="w-full aspect-square bg-slate-900 rounded-[60px] overflow-hidden shadow-2xl relative border border-white/10">
                <img 
                  src={barsImg} 
                  className="w-full h-full object-cover opacity-60" 
                  alt="Gold and Silver Setup" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[40px]">
                    <h5 className="text-2xl font-black text-white mb-4 italic">"{t.quote}"</h5>
                    <div className="w-12 h-1 bg-amber-500 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- REQUEST FORM --- */}
      <section id="request" className="py-24 bg-slate-950 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-black text-white mb-4">{t.requestTitle}</h3>
            <p className="text-slate-400">{t.requestSub}</p>
          </div>

          <motion.div 
            className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-[40px] p-10 md:p-16 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {formSent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">{t.successTitle}</h4>
                <p className="text-slate-400">{t.successSub}</p>
                <button 
                  onClick={() => setFormSent(false)}
                  className="mt-8 text-amber-500 font-bold hover:underline"
                >
                  {t.resubmit}
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFormError(null);
                  const form = e.currentTarget;
                  const data = new FormData(form);
                  const payload = {
                    fullName: String(data.get('fullName') || ''),
                    shopName: String(data.get('shopName') || ''),
                    phone: String(data.get('phone') || ''),
                    email: String(data.get('email') || ''),
                    description: String(data.get('description') || ''),
                  };
                  setFormSending(true);
                  try {
                    const res = await fetch('/api/contact', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                      const body = await res.json().catch(() => ({}));
                      throw new Error(body.error || 'ارسال درخواست ناموفق بود.');
                    }
                    form.reset();
                    setFormSent(true);
                  } catch (err: any) {
                    setFormError(err.message || 'ارسال درخواست ناموفق بود. لطفاً دوباره تلاش کنید.');
                  } finally {
                    setFormSending(false);
                  }
                }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="space-y-6 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                  <div className="group">
                    <label className="block text-slate-400 text-xs font-bold mb-2 mr-1">{t.fullName}</label>
                    <input name="fullName" required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all" />
                  </div>
                  <div className="group">
                    <label className="block text-slate-400 text-xs font-bold mb-2 mr-1">{t.shopName}</label>
                    <input name="shopName" required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all" />
                  </div>
                  <div className="group">
                    <label className="block text-slate-400 text-xs font-bold mb-2 mr-1">{t.phone}</label>
                    <input name="phone" required type="tel" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-left focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all" dir="ltr" placeholder="07XX XXX XXX" />
                  </div>
                </div>
                <div className="space-y-6 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                  <div className="group">
                    <label className="block text-slate-400 text-xs font-bold mb-2 mr-1">{t.email}</label>
                    <input name="email" type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-left focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all" dir="ltr" />
                  </div>
                  <div className="group">
                    <label className="block text-slate-400 text-xs font-bold mb-2 mr-1">{t.description}</label>
                    <textarea name="description" rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all"></textarea>
                  </div>
                </div>
                {formError && (
                  <div className="md:col-span-2 -mt-2 text-red-400 text-sm font-bold">{formError}</div>
                )}
                <div className="md:col-span-2 pt-4">
                  <button type="submit" disabled={formSending} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20">
                    {formSending ? t.sending : t.submitBtn}
                    <ChevronLeft className={`w-6 h-6 ${!isRtl && 'rotate-180'}`} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* --- CONTACT --- */}
      <section id={t.contact} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[50px] p-8 md:p-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full" />
            
            <div className="grid md:grid-cols-2 gap-16 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-white mb-8">{t.contactTitle}</h3>
                <div className="space-y-8">
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 text-amber-500">
                      <MapPin />
                    </div>
                    <div>
                      <h5 className="text-slate-400 text-sm font-bold mb-1">{t.centralOffice}</h5>
                      <p className="text-white text-lg">{t.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 text-amber-500">
                      <Phone />
                    </div>
                    <div>
                      <h5 className="text-slate-400 text-sm font-bold mb-1">{t.phoneLabel}</h5>
                      <p className="text-white text-lg" dir="ltr">0784345123</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 text-amber-500">
                      <Mail />
                    </div>
                    <div>
                      <h5 className="text-slate-400 text-sm font-bold mb-1">{t.emailLabel}</h5>
                      <p className="text-white text-lg">mostafamadadi.1382@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden grayscale opacity-50 contrast-125 border border-white/10">
                 <iframe 
                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3287.4981792644264!2d69.1352481!3d34.5155601!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d16eb664687d3d%3A0xc346646f9f65f37d!2z2b7ZhCDYs9ix2K7YjCDaqdin2KjZhCwg2KfZgdi62KfZhtiz2KrYp9mG!5e0!3m2!1sfa!2s!4v1700000000000!5m2!1sfa!2s" 
                   className="w-full h-full min-h-[300px]"
                   style={{ border: 0 }} 
                   allowFullScreen={true} 
                   loading="lazy"
                 ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
                <ShieldCheck className="text-slate-900 w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white">{t.name}</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t.footerDesc}
            </p>
          </div>
          
          <div>
            <h5 className="text-white font-bold mb-6">{t.quickAccess}</h5>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.home}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.features}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.pricing}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.demoBtn}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">{t.rules}</h5>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.privacy}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.terms}</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">{t.security}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">{t.support}</h5>
            <p className="text-slate-500 text-sm mb-4">
              {t.supportDesc}
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-slate-900 transition-all cursor-pointer">
                <Phone size={18} />
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-slate-900 transition-all cursor-pointer">
                <Mail size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-white/5 text-center">
          <p className="text-slate-600 text-xs">
            {t.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
