import React, { useState, useEffect, useCallback } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import {
  Users, Package, DollarSign, TrendingUp, Search, ChevronRight,
  ArrowLeft, RefreshCw, LogOut, Shield, AlertCircle,
  Calendar, Tag, CreditCard, Globe, BarChart3, Download
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://xrnfgdyqkqqpxjwpmkta.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kX5vf6Ocj3b7PljEywobMg_UL_MECHd';
const ADMIN_EMAIL = 'kauanfarias272@gmail.com';
const REDIRECT = Capacitor.isNativePlatform()
  ? 'io.constrictor.app://auth'
  : window.location.origin;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'constrictor_auth_v1',
  }
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string;
  name: string;
  language: string;
  base_currency: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  category: string;
  status: string;
  costAmount: number;
  costCurrency: string;
  billingCycle: string;
  dueDate: number;
  paymentMethod: string;
  paymentSource?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  BRL: 'R$', USD: '$', EUR: '€', GBP: '£', JPY: '¥',
  TRY: '₺', ARS: '$', INR: '₹', CAD: 'C$', AUD: 'A$',
  CHF: 'CHF', CNY: '¥', MXN: '$', BTC: '₿', SATS: 'sats'
};

const fmt = (amount: number, currency: string) =>
  `${CURRENCY_SYMBOLS[currency] ?? currency} ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const monthlyAmount = (sub: Subscription) => {
  if (!sub.costAmount) return 0;
  switch (sub.billingCycle) {
    case 'Monthly': return sub.costAmount;
    case 'Yearly': return sub.costAmount / 12;
    case 'Weekly': return sub.costAmount * 4.33;
    case 'Daily': return sub.costAmount * 30;
    case 'Quarterly': return sub.costAmount / 3;
    case 'SemiAnnual': return sub.costAmount / 6;
    default: return sub.costAmount;
  }
};

// ── Snake Logo SVG ────────────────────────────────────────────────────────────

function SnakeLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Body coil */}
      <path
        d="M 50 85 C 25 85 15 70 15 58 C 15 46 25 38 38 38 C 51 38 60 46 60 56 C 60 64 54 70 46 70 C 38 70 33 65 33 58 C 33 52 37 48 42 48"
        stroke="#0a0a0a" strokeWidth="9" strokeLinecap="round" fill="none"
      />
      {/* Head */}
      <ellipse cx="62" cy="30" rx="14" ry="11" fill="#0a0a0a" />
      {/* Eye */}
      <circle cx="67" cy="26" r="3" fill="#d0d0a0" />
      <circle cx="68" cy="25" r="1.2" fill="#0a0a0a" />
      {/* Tongue */}
      <path d="M 72 33 L 80 38 M 72 33 L 80 30" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" />
      {/* Tail tip */}
      <path d="M 42 48 C 46 44 52 43 55 46" stroke="#0a0a0a" strokeWidth="7" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────

function LoginScreen() {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const sendLink = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: REDIRECT, shouldCreateUser: true },
      });
      if (error) throw error;
      setInfo(`Link enviado para ${email.trim()}. Abra o email e toque no botão de login — o app abrirá automaticamente.`);
      setStep('code');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (code.trim().length < 6) { setError('Digite o código de 6 dígitos.'); return; }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email',
      });
      if (error) throw error;
    } catch (e: any) {
      setError('Código inválido ou expirado. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-[#d0d0a0] rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
            <SnakeLogo size={64} />
          </div>
          <h1 className="text-2xl font-bold text-white">Constrictor</h1>
          <p className="text-gray-500 text-sm mt-1">Painel administrativo privado</p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 space-y-5">
          <div className="flex items-center gap-2 text-[#d0d0a0]">
            <Shield size={18} />
            <span className="text-sm font-semibold">{step === 'email' ? 'Acesso Restrito' : 'Verifique seu email'}</span>
          </div>

          {step === 'email' ? (
            <>
              <p className="text-gray-400 text-sm">Um código de verificação será enviado para seu email.</p>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Email</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d0d0a0]/50"
                  placeholder="seu@email.com"
                  onKeyDown={e => e.key === 'Enter' && sendLink()}
                />
              </div>
              {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3"><AlertCircle size={16} className="shrink-0" />{error}</div>}
              <button onClick={sendLink} disabled={loading} className="w-full py-3.5 bg-[#d0d0a0] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#e0e0b0] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                {loading ? <div className="w-4 h-4 rounded-full border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] animate-spin" /> : null}
                {loading ? 'Enviando...' : 'Enviar link de acesso'}
              </button>
            </>
          ) : (
            <>
              {info && <div className="text-sm text-[#d0d0a0] bg-[#d0d0a0]/10 border border-[#d0d0a0]/20 rounded-xl px-4 py-3">{info}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Código de 6 dígitos</label>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-2xl text-white text-center tracking-[0.4em] placeholder-gray-600 focus:outline-none focus:border-[#d0d0a0]/50 font-mono"
                  placeholder="000000"
                  onKeyDown={e => e.key === 'Enter' && verifyCode()}
                />
              </div>
              {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3"><AlertCircle size={16} className="shrink-0" />{error}</div>}
              <button onClick={verifyCode} disabled={loading || code.length < 6} className="w-full py-3.5 bg-[#d0d0a0] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#e0e0b0] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                {loading ? <div className="w-4 h-4 rounded-full border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] animate-spin" /> : null}
                {loading ? 'Verificando...' : 'Entrar'}
              </button>
              <button onClick={() => { setStep('email'); setCode(''); setError(''); }} className="w-full py-2 text-gray-500 text-sm hover:text-gray-300 transition-colors">
                ← Voltar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="text-[#d0d0a0]">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ users, subscriptions, onSelectUser }: {
  users: UserRow[];
  subscriptions: Subscription[];
  onSelectUser: (u: UserRow) => void;
}) {
  const [search, setSearch] = useState('');

  const activeSubs = subscriptions.filter(s => !s.status?.startsWith('cancelled'));
  const totalMonthlyBRL = activeSubs.filter(s => s.costCurrency === 'BRL').reduce((acc, s) => acc + monthlyAmount(s), 0);
  const categoryCount = activeSubs.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const enrichedUsers = users.map(u => {
    const uSubs = subscriptions.filter(s => s.user_id === u.id);
    const uActive = uSubs.filter(s => !s.status?.startsWith('cancelled'));
    return {
      ...u,
      sub_count: uSubs.length,
      active_count: uActive.length,
      total_monthly: uActive.filter(s => s.costCurrency === 'BRL').reduce((acc, s) => acc + monthlyAmount(s), 0),
    };
  });

  const filtered = enrichedUsers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const rows = [
      ['ID', 'Nome', 'Email', 'Idioma', 'Moeda Base', 'Total Itens', 'Itens Ativos', 'Gasto Mensal BRL', 'Última Atividade'],
      ...enrichedUsers.map(u => [u.id, u.name || '', u.email || '', u.language || '', u.base_currency || '', String(u.sub_count), String(u.active_count), String(u.total_monthly.toFixed(2)), u.updated_at || ''])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `constrictor-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18} />} label="Usuários" value={String(users.length)} sub="contas registradas" />
        <StatCard icon={<Package size={18} />} label="Total Itens" value={String(subscriptions.length)} sub={`${activeSubs.length} ativos`} />
        <StatCard icon={<DollarSign size={18} />} label="Gasto/mês BRL" value={`R$ ${totalMonthlyBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="itens BRL ativos" />
        <StatCard icon={<TrendingUp size={18} />} label="Média/usuário" value={users.length ? String(Math.round(subscriptions.length / users.length)) : '0'} sub="itens por conta" />
      </div>

      {topCategories.length > 0 && (
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-[#d0d0a0]" /><span className="text-sm font-semibold">Top Categorias</span></div>
          <div className="space-y-3">
            {topCategories.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-28 truncate">{cat}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5"><div className="bg-[#d0d0a0] h-1.5 rounded-full" style={{ width: `${(count / activeSubs.length) * 100}%` }} /></div>
                <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#d0d0a0]" />
            <span className="font-semibold text-sm">Usuários</span>
            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-[#1a1a1a] border border-gray-700 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none w-40" />
            </div>
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-xl text-xs text-gray-400 hover:text-white transition-colors"><Download size={13} /> CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Usuário</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">Email</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Itens</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Ativos</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Gasto/mês</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} onClick={() => onSelectUser(u)} className={`cursor-pointer hover:bg-[#1a1a1a] transition-colors ${i < filtered.length - 1 ? 'border-b border-gray-800/30' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d0d0a0]/20 border border-[#d0d0a0]/30 flex items-center justify-center text-xs font-bold text-[#d0d0a0] shrink-0">{(u.name || u.email || 'U').charAt(0).toUpperCase()}</div>
                      <span className="font-medium text-white text-sm truncate max-w-[120px]">{u.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs font-mono hidden sm:table-cell">{u.email || '—'}</td>
                  <td className="px-4 py-3.5 text-center text-gray-300">{u.sub_count}</td>
                  <td className="px-4 py-3.5 text-center text-emerald-400">{u.active_count}</td>
                  <td className="px-5 py-3.5 text-right text-[#d0d0a0] font-medium hidden md:table-cell">{u.total_monthly > 0 ? `R$ ${u.total_monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}</td>
                  <td className="px-4 py-3.5 text-gray-600"><ChevronRight size={16} /></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-600">Nenhum usuário encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── User Detail ───────────────────────────────────────────────────────────────

function UserDetail({ user, subscriptions, onBack }: { user: UserRow; subscriptions: Subscription[]; onBack: () => void }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all');
  const [search, setSearch] = useState('');

  const userSubs = subscriptions.filter(s => s.user_id === user.id);
  const active = userSubs.filter(s => !s.status?.startsWith('cancelled'));
  const cancelled = userSubs.filter(s => s.status?.startsWith('cancelled'));
  const displayed = userSubs
    .filter(s => filter === 'all' ? true : filter === 'active' ? !s.status?.startsWith('cancelled') : s.status?.startsWith('cancelled'))
    .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase()));

  const totalMonthly = active.filter(s => s.costCurrency === 'BRL').reduce((acc, s) => acc + monthlyAmount(s), 0);
  const categoryMap = active.filter(s => s.costCurrency === 'BRL').reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + monthlyAmount(s); return acc; }, {} as Record<string, number>);

  const exportCSV = () => {
    const rows = [
      ['Nome', 'Categoria', 'Status', 'Custo', 'Moeda', 'Ciclo', 'Vencimento', 'Pagamento'],
      ...userSubs.map(s => [s.name, s.category, s.status, String(s.costAmount), s.costCurrency, s.billingCycle, String(s.dueDate), s.paymentMethod || ''])
    ];
    const csv = rows.map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `user-${user.id.slice(0, 8)}.csv` });
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center hover:border-gray-600 transition-colors shrink-0"><ArrowLeft size={16} /></button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#d0d0a0]/20 border border-[#d0d0a0]/30 flex items-center justify-center text-lg font-black text-[#d0d0a0] shrink-0">{(user.name || user.email || 'U').charAt(0).toUpperCase()}</div>
          <div className="min-w-0"><h2 className="font-bold text-lg text-white truncate">{user.name || 'Sem nome'}</h2><p className="text-gray-500 text-sm truncate">{user.email}</p></div>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-xl text-xs text-gray-400 hover:text-white transition-colors shrink-0"><Download size={13} /> CSV</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label: 'Total', value: String(userSubs.length), color: '' }, { label: 'Ativos', value: String(active.length), color: 'text-emerald-400' }, { label: 'Gasto/mês', value: `R$ ${totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-[#d0d0a0]' }, { label: 'Gasto/ano', value: `R$ ${(totalMonthly * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-[#d0d0a0]' }].map(s => (
          <div key={s.label} className="bg-[#111] border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {user.language && <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5"><Globe size={12} /> {user.language.toUpperCase()}</span>}
        {user.base_currency && <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5"><DollarSign size={12} /> {user.base_currency}</span>}
        {user.updated_at && <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5"><Calendar size={12} /> {new Date(user.updated_at).toLocaleDateString('pt-BR')}</span>}
        <span className="text-xs text-gray-600 bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5 font-mono">ID: {user.id.slice(0, 8)}…</span>
      </div>

      {Object.keys(categoryMap).length > 0 && (
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold"><Tag size={14} className="text-[#d0d0a0]" /> Gastos por Categoria</div>
          <div className="space-y-2">
            {Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-28 truncate">{cat}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5"><div className="bg-[#d0d0a0] h-1.5 rounded-full" style={{ width: `${totalMonthly > 0 ? (val / totalMonthly) * 100 : 0}%` }} /></div>
                <span className="text-xs text-gray-300 w-24 text-right">{fmt(val, 'BRL')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'cancelled'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-[#d0d0a0] text-[#0a0a0a]' : 'text-gray-500 hover:text-white'}`}>
                {f === 'all' ? `Todos (${userSubs.length})` : f === 'active' ? `Ativos (${active.length})` : `Cancelados (${cancelled.length})`}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-[#1a1a1a] border border-gray-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none w-36" />
          </div>
        </div>
        <div className="divide-y divide-gray-800/40">
          {displayed.map(sub => (
            <div key={sub.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl shrink-0">{sub.emoji || '📦'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{sub.name}</span>
                      {sub.status?.startsWith('cancelled') && <span className="text-[10px] text-orange-400 border border-orange-800 rounded px-1.5 py-0.5 bg-orange-900/20">{sub.status === 'cancelled_temporary' ? 'Pausado' : 'Cancelado'}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Tag size={10} /> {sub.category}</span>
                      {sub.paymentMethod && <span className="text-xs text-gray-500 flex items-center gap-1"><CreditCard size={10} /> {sub.paymentMethod}{sub.paymentSource ? ` · ${sub.paymentSource}` : ''}</span>}
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={10} /> dia {sub.dueDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[#d0d0a0]">{fmt(sub.costAmount || 0, sub.costCurrency)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{sub.billingCycle === 'Monthly' ? '/mês' : sub.billingCycle === 'Yearly' ? '/ano' : sub.billingCycle === 'Weekly' ? '/sem' : ''}</div>
                </div>
              </div>
            </div>
          ))}
          {displayed.length === 0 && <div className="py-12 text-center text-gray-600 text-sm">Nenhum item.</div>}
        </div>
      </div>
    </div>
  );
}

// ── Access Denied ─────────────────────────────────────────────────────────────

function AccessDenied({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="bg-[#111] border border-red-900/40 rounded-3xl p-8 max-w-sm w-full text-center space-y-4">
        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto"><Shield size={28} className="text-red-400" /></div>
        <h2 className="text-lg font-bold text-red-400">Acesso Negado</h2>
        <p className="text-gray-400 text-sm">A conta <span className="font-mono text-gray-300">{email}</span> não tem permissão de admin.</p>
        <button onClick={onLogout} className="w-full py-3 bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"><LogOut size={16} /> Sair</button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState('');

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Deep link handler: magic link opens io.constrictor.app://auth?code=…
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = CapApp.addListener('appUrlOpen', async (event) => {
      if (event.url.startsWith('io.constrictor.app://auth')) {
        await supabase.auth.exchangeCodeForSession(event.url);
      }
    });
    return () => { listener.then(l => l.remove()); };
  }, []);



  const fetchData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setError('');
    try {
      const { data: subs, error: subsErr } = await supabase.from('subscriptions').select('*').order('createdAt', { ascending: false });
      if (subsErr) throw new Error(subsErr.message);
      setSubscriptions((subs as Subscription[]) || []);

      const { data: usersData, error: usersErr } = await supabase.from('users').select('*').order('updated_at', { ascending: false });
      if (!usersErr && usersData && usersData.length > 0) {
        setUsers(usersData as UserRow[]);
      } else {
        const userMap = new Map<string, UserRow>();
        ((subs as any[]) || []).forEach((s: any) => {
          if (s.user_id && !userMap.has(s.user_id)) {
            userMap.set(s.user_id, { id: s.user_id, email: '', name: '', language: '', base_currency: '', updated_at: s.updatedAt || '' });
          }
        });
        setUsers(Array.from(userMap.values()));
      }
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsers([]); setSubscriptions([]); setSelectedUser(null);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-10 h-10 rounded-full border-2 border-gray-700 border-t-[#d0d0a0] animate-spin" /></div>;
  }

  if (!user) return <LoginScreen />;
  if (user.email !== ADMIN_EMAIL) return <AccessDenied email={user.email || ''} onLogout={handleLogout} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#d0d0a0] rounded-xl flex items-center justify-center">
              <SnakeLogo size={26} />
            </div>
            <div>
              <span className="font-bold text-sm text-white">Constrictor</span>
              <span className="ml-2 text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && <span className="text-xs text-gray-600 hidden sm:block">{lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
            {error && <span className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} /> Erro</span>}
            <button onClick={fetchData} disabled={dataLoading} className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center hover:border-gray-600 transition-colors disabled:opacity-50">
              <RefreshCw size={15} className={dataLoading ? 'animate-spin text-[#d0d0a0]' : 'text-gray-400'} />
            </button>
            <button onClick={handleLogout} className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center hover:border-red-900 hover:text-red-400 transition-colors text-gray-500">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {dataLoading && !users.length ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-gray-700 border-t-[#d0d0a0] animate-spin" />
            <p className="text-gray-500 text-sm">Carregando dados...</p>
          </div>
        ) : selectedUser ? (
          <UserDetail user={selectedUser} subscriptions={subscriptions} onBack={() => setSelectedUser(null)} />
        ) : (
          <Dashboard users={users} subscriptions={subscriptions} onSelectUser={setSelectedUser} />
        )}
      </main>
    </div>
  );
}
