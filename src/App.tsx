import React, { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Users, Package, DollarSign, TrendingUp, Search, ChevronRight,
  ArrowLeft, RefreshCw, LogOut, Eye, EyeOff, Shield, AlertCircle,
  Calendar, Tag, CreditCard, Globe, BarChart3, X, Download
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string;
  name: string;
  language: string;
  base_currency: string;
  updated_at: string;
  sub_count?: number;
  total_monthly?: number;
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
  type?: string;
  isPromotional?: boolean;
  hasCashback?: boolean;
  cashbackPercentage?: number;
  hasIncome?: boolean;
  incomeAmount?: number;
  incomeCurrency?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://xrnfgdyqkqqpxjwpmkta.supabase.co';
const ADMIN_PASSWORD = 'boamanager2025';

const CURRENCY_SYMBOLS: Record<string, string> = {
  BRL: 'R$', USD: '$', EUR: '€', GBP: '£', JPY: '¥',
  TRY: '₺', ARS: '$', INR: '₹', CAD: 'C$', AUD: 'A$',
  CHF: 'CHF', CNY: '¥', MXN: '$', BTC: '₿', SATS: 'sats'
};

const formatCurrency = (amount: number, currency: string) =>
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

// ── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({ onConnect }: { onConnect: (client: SupabaseClient, key: string) => void }) {
  const [serviceKey, setServiceKey] = useState(() => localStorage.getItem('bgm_service_key') || '');
  const [password, setPassword] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (password !== ADMIN_PASSWORD) {
      setError('Senha incorreta.');
      return;
    }
    if (!serviceKey.trim()) {
      setError('Cole a Service Role Key do Supabase.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const client = createClient(SUPABASE_URL, serviceKey.trim(), {
        auth: { persistSession: false }
      });
      // Test connection
      const { error: testErr } = await client.from('subscriptions').select('id').limit(1);
      if (testErr) throw new Error(testErr.message);
      localStorage.setItem('bgm_service_key', serviceKey.trim());
      onConnect(client, serviceKey.trim());
    } catch (e: any) {
      setError('Falha na conexão: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-[#d0d0a0] rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
            <span className="text-[#0a0a0a] font-black text-4xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Constrictor</h1>
          <p className="text-gray-500 text-sm mt-1">Painel administrativo privado</p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 space-y-5">
          <div className="flex items-center gap-2 text-[#d0d0a0] mb-2">
            <Shield size={18} />
            <span className="text-sm font-semibold">Acesso Restrito</span>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Senha de Acesso</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d0d0a0]/50"
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
            />
          </div>

          {/* Service Key */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Supabase Service Role Key
              <span className="ml-2 text-gray-600 font-normal">— Project Settings → API</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={serviceKey}
                onChange={e => setServiceKey(e.target.value)}
                placeholder="eyJhbGci..."
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d0d0a0]/50 font-mono"
              />
              <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1.5">Guardada localmente no seu navegador. Nunca enviada a terceiros.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full py-3.5 bg-[#d0d0a0] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#e0e0b0] transition-colors disabled:opacity-50"
          >
            {loading ? 'Conectando...' : 'Entrar no Manager'}
          </button>

          <div className="text-xs text-gray-600 text-center pt-2 space-y-1">
            <p>Supabase URL: <span className="text-gray-500 font-mono text-[10px]">xrnfgdyqkqqpxjwpmkta.supabase.co</span></p>
            <p>Para obter a service key: supabase.com → seu projeto → Settings → API → service_role</p>
          </div>
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

// ── Dashboard (overview) ──────────────────────────────────────────────────────

function Dashboard({ users, subscriptions, onSelectUser }: {
  users: UserRow[];
  subscriptions: Subscription[];
  onSelectUser: (u: UserRow) => void;
}) {
  const [search, setSearch] = useState('');

  const activeSubs = subscriptions.filter(s => !s.status?.startsWith('cancelled'));
  const totalMonthlyBRL = activeSubs.reduce((acc, s) => acc + (s.costCurrency === 'BRL' ? monthlyAmount(s) : 0), 0);
  const categoryCount = activeSubs.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const enrichedUsers = users.map(u => ({
    ...u,
    sub_count: subscriptions.filter(s => s.user_id === u.id).length,
    active_count: subscriptions.filter(s => s.user_id === u.id && !s.status?.startsWith('cancelled')).length,
    total_monthly: subscriptions
      .filter(s => s.user_id === u.id && !s.status?.startsWith('cancelled') && s.costCurrency === 'BRL')
      .reduce((acc, s) => acc + monthlyAmount(s), 0),
  }));

  const filtered = enrichedUsers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const rows = [
      ['ID', 'Nome', 'Email', 'Idioma', 'Moeda Base', 'Total Itens', 'Itens Ativos', 'Gasto Mensal BRL', 'Última Atividade'],
      ...enrichedUsers.map(u => [
        u.id, u.name || '', u.email || '', u.language || '', u.base_currency || '',
        String(u.sub_count), String((u as any).active_count || 0),
        String(u.total_monthly?.toFixed(2)), u.updated_at || ''
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `constrictor-users-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18} />} label="Usuários" value={String(users.length)} sub="contas registradas" />
        <StatCard icon={<Package size={18} />} label="Total Itens" value={String(subscriptions.length)} sub={`${activeSubs.length} ativos`} />
        <StatCard icon={<DollarSign size={18} />} label="Gasto/mês (BRL)" value={`R$ ${totalMonthlyBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="apenas itens BRL ativos" />
        <StatCard icon={<TrendingUp size={18} />} label="Média/usuário" value={users.length ? String(Math.round(subscriptions.length / users.length)) : '0'} sub="itens por conta" />
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#d0d0a0]" />
            <span className="text-sm font-semibold">Top Categorias</span>
          </div>
          <div className="space-y-3">
            {topCategories.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-28 truncate">{cat}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-[#d0d0a0] h-1.5 rounded-full"
                    style={{ width: `${(count / activeSubs.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#d0d0a0]" />
            <span className="font-semibold text-sm">Usuários</span>
            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar usuário..."
                className="bg-[#1a1a1a] border border-gray-700 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d0d0a0]/40 w-48"
              />
            </div>
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-xl text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
              <Download size={13} /> CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Usuário</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Itens</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Ativos</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Gasto/mês (BRL)</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Última atividade</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className={`cursor-pointer hover:bg-[#1a1a1a] transition-colors ${i < filtered.length - 1 ? 'border-b border-gray-800/30' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d0d0a0]/20 border border-[#d0d0a0]/30 flex items-center justify-center text-xs font-bold text-[#d0d0a0]">
                        {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white text-sm">{u.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">{u.email || '—'}</td>
                  <td className="px-4 py-3.5 text-center text-gray-300">{u.sub_count ?? 0}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-emerald-400">{(u as any).active_count ?? 0}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[#d0d0a0] font-medium">
                    {u.total_monthly ? `R$ ${u.total_monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right text-gray-500 text-xs">
                    {u.updated_at ? new Date(u.updated_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-600">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── User Detail ───────────────────────────────────────────────────────────────

function UserDetail({ user, subscriptions, onBack }: {
  user: UserRow;
  subscriptions: Subscription[];
  onBack: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all');
  const [search, setSearch] = useState('');

  const userSubs = subscriptions.filter(s => s.user_id === user.id);
  const active = userSubs.filter(s => !s.status?.startsWith('cancelled'));
  const cancelled = userSubs.filter(s => s.status?.startsWith('cancelled'));

  const displayed = userSubs
    .filter(s => filter === 'all' ? true : filter === 'active' ? !s.status?.startsWith('cancelled') : s.status?.startsWith('cancelled'))
    .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase()));

  const totalMonthly = active.reduce((acc, s) => acc + monthlyAmount(s), 0);
  const totalYearly = totalMonthly * 12;

  const categoryMap = active.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + monthlyAmount(s);
    return acc;
  }, {} as Record<string, number>);

  const exportUserCSV = () => {
    const rows = [
      ['Nome', 'Categoria', 'Status', 'Custo', 'Moeda', 'Ciclo', 'Vencimento', 'Pagamento', 'Criado'],
      ...userSubs.map(s => [
        s.name, s.category, s.status, String(s.costAmount), s.costCurrency,
        s.billingCycle, String(s.dueDate), s.paymentMethod || '', s.createdAt || ''
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `user-${user.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center hover:border-gray-600 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-[#d0d0a0]/20 border border-[#d0d0a0]/30 flex items-center justify-center text-lg font-black text-[#d0d0a0]">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">{user.name || 'Sem nome'}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
        <button onClick={exportUserCSV} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-xl text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
          <Download size={13} /> Exportar CSV
        </button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Total itens</div>
          <div className="text-2xl font-bold">{userSubs.length}</div>
        </div>
        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Ativos</div>
          <div className="text-2xl font-bold text-emerald-400">{active.length}</div>
        </div>
        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Gasto/mês</div>
          <div className="text-lg font-bold text-[#d0d0a0]">R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Gasto/ano</div>
          <div className="text-lg font-bold text-[#d0d0a0]">R$ {totalYearly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Info row */}
      <div className="flex flex-wrap gap-3">
        {user.language && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5">
            <Globe size={12} /> {user.language.toUpperCase()}
          </div>
        )}
        {user.base_currency && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5">
            <DollarSign size={12} /> {user.base_currency}
          </div>
        )}
        {user.updated_at && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5">
            <Calendar size={12} /> Última atividade: {new Date(user.updated_at).toLocaleDateString('pt-BR')}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5 font-mono">
          ID: {user.id.slice(0, 8)}…
        </div>
      </div>

      {/* Categories breakdown */}
      {Object.keys(categoryMap).length > 0 && (
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold">
            <Tag size={14} className="text-[#d0d0a0]" /> Gastos por Categoria (mensal, BRL)
          </div>
          <div className="space-y-2">
            {Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-32 truncate">{cat}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-[#d0d0a0] h-1.5 rounded-full"
                    style={{ width: `${(val / totalMonthly) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-300 w-24 text-right">R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions list */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 gap-3 flex-wrap">
          <div className="flex gap-2">
            {(['all', 'active', 'cancelled'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-[#d0d0a0] text-[#0a0a0a]' : 'text-gray-500 hover:text-white'}`}
              >
                {f === 'all' ? `Todos (${userSubs.length})` : f === 'active' ? `Ativos (${active.length})` : `Cancelados (${cancelled.length})`}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="bg-[#1a1a1a] border border-gray-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none w-40"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-800/40">
          {displayed.map(sub => (
            <div key={sub.id} className="px-5 py-4 hover:bg-[#1a1a1a] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl shrink-0">{sub.emoji || '📦'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{sub.name}</span>
                      {sub.status?.startsWith('cancelled') && (
                        <span className="text-[10px] text-orange-400 border border-orange-800 rounded px-1.5 py-0.5 bg-orange-900/20">
                          {sub.status === 'cancelled_temporary' ? 'Pausado' : 'Cancelado'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Tag size={10} /> {sub.category}</span>
                      {sub.paymentMethod && <span className="text-xs text-gray-500 flex items-center gap-1"><CreditCard size={10} /> {sub.paymentMethod}{sub.paymentSource ? ` · ${sub.paymentSource}` : ''}</span>}
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={10} /> dia {sub.dueDate}</span>
                    </div>
                    {sub.notes && <p className="text-xs text-gray-600 mt-1 truncate">{sub.notes}</p>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[#d0d0a0]">{formatCurrency(sub.costAmount || 0, sub.costCurrency)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{sub.billingCycle === 'Monthly' ? '/mês' : sub.billingCycle === 'Yearly' ? '/ano' : sub.billingCycle === 'Weekly' ? '/sem' : ''}</div>
                  {sub.billingCycle !== 'Monthly' && sub.billingCycle !== 'Weekly' && (
                    <div className="text-xs text-gray-600 mt-0.5">≈ {formatCurrency(monthlyAmount(sub), sub.costCurrency)}/mês</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {displayed.length === 0 && (
            <div className="py-12 text-center text-gray-600 text-sm">Nenhum item encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshError, setRefreshError] = useState('');

  const handleConnect = (client: SupabaseClient) => {
    setSupabase(client);
  };

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setRefreshError('');
    try {
      // Fetch all subscriptions
      const { data: subs, error: subsErr } = await supabase.from('subscriptions').select('*').order('createdAt', { ascending: false });
      if (subsErr) throw new Error('subscriptions: ' + subsErr.message);
      setSubscriptions((subs as Subscription[]) || []);

      // Fetch all users from auth (admin API) + users table
      const { data: usersData, error: usersErr } = await supabase.from('users').select('*').order('updated_at', { ascending: false });

      if (usersErr || !usersData || usersData.length === 0) {
        // Fallback: derive users from subscriptions
        const userMap = new Map<string, UserRow>();
        ((subs as any[]) || []).forEach(s => {
          if (s.user_id && !userMap.has(s.user_id)) {
            userMap.set(s.user_id, {
              id: s.user_id,
              email: s.email || '',
              name: s.userName || '',
              language: s.language || '',
              base_currency: s.baseCurrency || '',
              updated_at: s.updatedAt || s.createdAt || '',
            });
          }
        });
        setUsers(Array.from(userMap.values()));
      } else {
        setUsers(usersData as UserRow[]);
      }

      setLastRefresh(new Date());
    } catch (e: any) {
      setRefreshError(e.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (supabase) fetchData();
  }, [supabase, fetchData]);

  const handleDisconnect = () => {
    localStorage.removeItem('bgm_service_key');
    setSupabase(null);
    setUsers([]);
    setSubscriptions([]);
    setSelectedUser(null);
  };

  if (!supabase) {
    return <SetupScreen onConnect={handleConnect} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#d0d0a0] rounded-xl flex items-center justify-center">
              <span className="text-[#0a0a0a] font-black text-lg">C</span>
            </div>
            <div>
              <span className="font-bold text-sm text-white">Constrictor</span>
              <span className="ml-2 text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-gray-600 hidden sm:block">
                Atualizado {lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {refreshError && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} /> {refreshError}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center hover:border-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#d0d0a0]' : 'text-gray-400'} />
            </button>
            <button
              onClick={handleDisconnect}
              className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center hover:border-red-900 hover:text-red-400 transition-colors text-gray-500"
              title="Desconectar"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-5 py-8">
        {loading && !users.length ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-gray-700 border-t-[#d0d0a0] animate-spin" />
            <p className="text-gray-500 text-sm">Carregando dados...</p>
          </div>
        ) : selectedUser ? (
          <UserDetail
            user={selectedUser}
            subscriptions={subscriptions}
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <Dashboard
            users={users}
            subscriptions={subscriptions}
            onSelectUser={setSelectedUser}
          />
        )}
      </main>
    </div>
  );
}
