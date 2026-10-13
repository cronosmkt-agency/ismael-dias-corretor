import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Key,
  LayoutDashboard,
  Home,
  BarChart3,
  Settings,
  Database,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  Eye,
  MousePointerClick,
  Download,
  RotateCcw,
  Sparkles,
  Lock,
  LogOut,
  Save,
  Check,
  AlertCircle,
  MapPin,
  Building2,
  DollarSign,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { ProductItem } from "@/components/ProductDetailModal";
import {
  getAllProperties,
  updateProperty,
  togglePropertyStatus,
  addProperty,
  deleteProperty,
  resetPropertiesToDefault,
  exportPropertiesJson,
} from "@/services/propertiesService";
import {
  getAnalyticsSummary,
  getTopClickedProperties,
  getPageViewsBreakdown,
  getDailyActivity,
  clearAnalyticsData,
  seedInitialAnalyticsIfEmpty,
  type AnalyticsSummary,
  type TopClickedProperty,
  type DailyMetric,
} from "@/services/analyticsService";
import {
  getSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
  type SiteSettings,
} from "@/services/settingsService";
import { fmt } from "@/data/storeData";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel do Corretor — Ismael Dias | Habittat House" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

type AdminTab = "imoveis" | "analytics" | "config" | "backup";

export function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("imoveis");

  // Settings
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings());
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  // Properties State
  const [properties, setProperties] = useState<ProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Editing / Creation Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ProductItem> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Analytics State
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalPageViews: 0,
    totalWhatsAppClicks: 0,
    conversionRate: "0%",
    uniqueDaysTracked: 1,
  });
  const [topProperties, setTopProperties] = useState<TopClickedProperty[]>([]);
  const [pageViewsList, setPageViewsList] = useState<{ path: string; label: string; count: number }[]>([]);
  const [dailyChart, setDailyChart] = useState<DailyMetric[]>([]);

  // Check auth session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("ismael_admin_auth") === "true";
      if (isAuth) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Load properties and analytics
  const refreshData = () => {
    const list = getAllProperties();
    setProperties(list);
    seedInitialAnalyticsIfEmpty(list);
    setSummary(getAnalyticsSummary());
    setTopProperties(getTopClickedProperties(10));
    setPageViewsList(getPageViewsBreakdown());
    setDailyChart(getDailyActivity(7));
    const currentSettings = getSiteSettings();
    setSettings(currentSettings);
    setSettingsForm(currentSettings);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  // Auth Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings.adminPin || "1234";
    if (enteredPin === correctPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem("ismael_admin_auth", "true");
      toast.success("Acesso autorizado! Bem-vindo, Ismael.");
    } else {
      toast.error("PIN de segurança incorreto. Tente novamente.");
      setEnteredPin("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ismael_admin_auth");
    setIsAuthenticated(false);
    setEnteredPin("");
    toast.info("Você saiu do painel administrativo.");
  };

  // Status Toggle
  const handleToggleStatus = (sku: string, currentBadge: string) => {
    let next = "Disponível";
    if (currentBadge === "Disponível" || !currentBadge) next = "VENDIDA";
    else if (currentBadge === "VENDIDA") next = "RESERVADO";
    else next = "Disponível";

    togglePropertyStatus(sku, next);
    refreshData();
    toast.success(`Status do imóvel #${sku} alterado para: ${next}`);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: ProductItem) => {
    setEditingItem({ ...item });
    setIsCreatingNew(false);
    setIsEditModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const newSku = String(Math.floor(100000 + Math.random() * 900000));
    setEditingItem({
      sku: newSku,
      name: "",
      cat: "Casas em Condomínio",
      bairro: "Albuquerque",
      screen: "Albuquerque, Teresópolis - RJ",
      price: 500000,
      storage: "150m²",
      specs: "3 Quartos (1 Suíte), 2 Vagas",
      badge: "Disponível",
      chip: "Financiamento Facilitado",
      description: "Excelente oportunidade em Teresópolis com vista panorâmica e fácil acesso.",
      img: "https://d3873uwf1n1xlo.cloudfront.net/CRM_WebP/HABITTAT%20HOUSE%20/uploads/20260423132613/IMG-20240905-WA0066-original.webp",
      images: [
        "https://d3873uwf1n1xlo.cloudfront.net/CRM_WebP/HABITTAT%20HOUSE%20/uploads/20260423132613/IMG-20240905-WA0066-original.webp",
      ],
    });
    setIsCreatingNew(true);
    setIsEditModalOpen(true);
  };

  // Save Edit / Create
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.sku) {
      toast.error("Preencha ao menos o nome e código do imóvel.");
      return;
    }

    if (isCreatingNew) {
      addProperty(editingItem as ProductItem);
      toast.success("Novo imóvel cadastrado com sucesso!");
    } else {
      updateProperty(String(editingItem.sku), editingItem);
      toast.success(`Imóvel #${editingItem.sku} atualizado com sucesso!`);
    }

    setIsEditModalOpen(false);
    refreshData();
  };

  // Delete Property
  const handleDelete = (sku: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o imóvel #${sku}?`)) {
      deleteProperty(sku);
      refreshData();
      toast.success(`Imóvel #${sku} removido.`);
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveSiteSettings(settingsForm);
    setSettings(updated);
    toast.success("Configurações do site salvas com sucesso!");
  };

  // Reset Settings
  const handleResetSettings = () => {
    if (window.confirm("Deseja restaurar as configurações padrão do site?")) {
      const def = resetSiteSettings();
      setSettings(def);
      setSettingsForm(def);
      toast.info("Configurações padrão restauradas.");
    }
  };

  // Backup Export
  const handleDownloadBackup = () => {
    const jsonStr = exportPropertiesJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_imoveis_habittat_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup do catálogo exportado com sucesso!");
  };

  // Reset Catalog
  const handleResetCatalog = () => {
    if (
      window.confirm(
        "Atenção: Isso restaurará todos os 175 imóveis originais da Habittat House e descartará edições manuais. Continuar?"
      )
    ) {
      resetPropertiesToDefault();
      refreshData();
      toast.success("Catálogo restaurado para o padrão original.");
    }
  };

  // Filtered Properties in Admin Table
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && String(p.sku).includes(q)) ||
        (p.bairro && p.bairro.toLowerCase().includes(q)) ||
        (p.screen && p.screen.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "disponivel" && p.badge !== "VENDIDA" && p.badge !== "RESERVADO") ||
        (statusFilter === "vendida" && p.badge === "VENDIDA") ||
        (statusFilter === "reservado" && p.badge === "RESERVADO");

      const matchCat = categoryFilter === "all" || p.cat === categoryFilter;

      return matchSearch && matchStatus && matchCat;
    });
  }, [properties, searchQuery, statusFilter, categoryFilter]);

  // Categories list for filter
  const categoriesList = useMemo(() => {
    const s = new Set<string>();
    properties.forEach((p) => {
      if (p.cat) s.add(p.cat);
    });
    return Array.from(s);
  }, [properties]);

  /* -------------------------------------------------------------
     TELA DE LOGIN DO ADMIN (PIN)
  ------------------------------------------------------------- */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Área do Corretor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Painel de controle de imóveis e analytics de Ismael Dias • Habittat House
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="text-left">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                PIN de Acesso
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={10}
                  placeholder="Digite o PIN (Padrão: 1234)"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 tracking-widest text-center font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm transition-all active:scale-98 shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>Acessar Painel</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-blue-400 transition">
              ← Voltar ao Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     PAINEL PRINCIPAL DO ADMIN (AUTENTICADO)
  ------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
            ID
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight flex items-center gap-1.5">
              <span>Painel do Corretor</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Ismael Dias • Habittat House
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/loja"
            target="_blank"
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1 text-slate-300"
          >
            <span>Ver Catálogo</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            title="Sair do painel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 px-4 sm:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab("imoveis")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "imoveis"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Imóveis ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Métricas & Leads ({summary.totalWhatsAppClicks})</span>
          </button>

          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "config"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações do Site</span>
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "backup"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Backup & Dados</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {/* =============================================================
            ABA 1: GESTÃO DE IMÓVEIS
        ============================================================= */}
        {activeTab === "imoveis" && (
          <div className="space-y-6">
            {/* Header com Ações Rápidas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Gestão do Catálogo de Imóveis
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Visualize, altere status de venda, edite preços ou cadastre novos imóveis
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Imóvel</span>
                </button>
              </div>
            </div>

            {/* Filtros e Barra de Busca */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por código (#SKU), nome ou bairro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Status: Todos ({properties.length})</option>
                  <option value="disponivel">🟢 Disponíveis</option>
                  <option value="vendida">🔴 Vendidos</option>
                  <option value="reservado">🟡 Reservados</option>
                </select>
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Categoria: Todas</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contagem de Resultados */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Mostrando <strong className="text-white">{filteredProperties.length}</strong> de{" "}
                {properties.length} imóveis cadastrados
              </span>
              <span className="text-[11px] text-slate-500">
                Dica: Clique no botão de status para alternar entre Disponível / VENDIDA / Reservado
              </span>
            </div>

            {/* Lista / Tabela de Imóveis */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-800/80 text-slate-300 text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Imóvel</th>
                      <th className="py-3 px-3">Bairro</th>
                      <th className="py-3 px-3">Valor</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProperties.slice(0, 50).map((prod) => (
                      <tr
                        key={String(prod.sku) + prod.name}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Imóvel + Foto */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.img}
                              alt={prod.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-800 border border-slate-700"
                              loading="lazy"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-blue-400 block">
                                #{prod.sku || "—"} • {prod.cat}
                              </span>
                              <h4
                                className="font-bold text-slate-100 truncate max-w-[240px] sm:max-w-md"
                                title={prod.name}
                              >
                                {prod.name}
                              </h4>
                              <span className="text-[10px] text-slate-400">
                                {prod.storage || "Área construída"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Bairro */}
                        <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                            <span>{prod.bairro || "Teresópolis"}</span>
                          </div>
                        </td>

                        {/* Valor */}
                        <td className="py-3 px-3 font-black text-slate-200 whitespace-nowrap">
                          {fmt(prod.price)}
                        </td>

                        {/* Status Toggle Button */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(String(prod.sku), prod.badge || "Disponível")}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border cursor-pointer transition active:scale-95 whitespace-nowrap ${
                              prod.badge === "VENDIDA"
                                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30"
                                : prod.badge === "RESERVADO"
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
                            }`}
                            title="Clique para alternar o status"
                          >
                            {prod.badge === "VENDIDA"
                              ? "🔴 Vendida"
                              : prod.badge === "RESERVADO"
                              ? "🟡 Reservado"
                              : "🟢 Disponível"}
                          </button>
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Editar imóvel"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(String(prod.sku))}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                              title="Excluir imóvel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProperties.length > 50 && (
                <div className="p-3 bg-slate-800/40 text-center text-xs text-slate-400 border-t border-slate-800">
                  Mostrando os primeiros 50 resultados. Use a busca acima para refinar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================
            ABA 2: ANALYTICS & MÉTRICAS
        ============================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Métricas de Acesso e Leads no WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Acompanhe o interesse dos clientes e veja quais imóveis geram mais contatos
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase">Visualizações</span>
                  <Eye className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {summary.totalPageViews}
                </div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>Acessos registrados</span>
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase">Leads no WhatsApp</span>
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {summary.totalWhatsAppClicks}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                  Cliques para conversar
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase">Taxa de Conversão</span>
                  <MousePointerClick className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-sky-400">
                  {summary.conversionRate}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                  Visitantes que clicaram
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase">Imóveis Ativos</span>
                  <Building2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {properties.filter((p) => p.badge !== "VENDIDA").length}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                  {properties.filter((p) => p.badge === "VENDIDA").length} vendidos
                </span>
              </div>
            </div>

            {/* Gráfico Diário de Visualizações e Cliques */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white">
                    Evolução dos Últimos 7 Dias
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comparativo diário entre visualizações de página e cliques no WhatsApp
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Visualizações</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>WhatsApp</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyChart}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      name="Visualizações"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="whatsappClicks"
                      name="Cliques WhatsApp"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorClicks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ranking dos Top Imóveis Mais Clicados */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <h3 className="font-black text-sm sm:text-base text-white mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Top Imóveis Mais Procurados no WhatsApp</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Imóveis que mais geraram intenção de visita e conversa
                </p>

                {topProperties.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    Ainda não há cliques registrados. Conforme clientes clicarem no WhatsApp, eles aparecerão aqui!
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {topProperties.map((p, idx) => (
                      <div
                        key={p.sku + idx}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                              idx === 0
                                ? "bg-amber-500 text-slate-950"
                                : idx === 1
                                ? "bg-slate-300 text-slate-950"
                                : idx === 2
                                ? "bg-amber-700 text-white"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                              {p.propertyName}
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              #{p.sku} • {p.bairro} • {fmt(p.price)}
                            </span>
                          </div>
                        </div>

                        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black shrink-0 border border-emerald-500/30 flex items-center gap-1">
                          <WhatsAppIcon className="w-3 h-3" />
                          <span>{p.clicks} cliques</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visualizações por Página */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <h3 className="font-black text-sm sm:text-base text-white mb-1">
                  Acessos por Página
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Distribuição de visitas entre as principais seções do site
                </p>

                <div className="space-y-3">
                  {pageViewsList.map((pv) => {
                    const total = summary.totalPageViews || 1;
                    const percent = Math.min(100, Math.round((pv.count / total) * 100));

                    return (
                      <div key={pv.path} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{pv.label}</span>
                          <span className="text-slate-400">
                            {pv.count} visitas ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================
            ABA 3: CONFIGURAÇÕES DO SITE
        ============================================================= */}
        {activeTab === "config" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Configurações do Site
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Altere seus telefones, WhatsApp, mensagem de atendimento e dados profissionais
              </p>
            </div>

            <form
              onSubmit={handleSaveSettings}
              className="bg-slate-900 p-5 sm:p-7 rounded-2xl border border-slate-800 space-y-4 shadow-xl"
            >
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nome do Corretor
                </label>
                <input
                  type="text"
                  value={settingsForm.realtorName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, realtorName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Número WhatsApp (apenas dígitos com DDI)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                    }
                    placeholder="Ex: 5521964639999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Atualiza todos os botões de WhatsApp do site
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Telefone de Exibição
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phoneDisplay}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phoneDisplay: e.target.value })
                    }
                    placeholder="Ex: (21) 96463-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Registro Profissional / CRECI
                  </label>
                  <input
                    type="text"
                    value={settingsForm.creci}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, creci: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Perfil no Instagram
                  </label>
                  <input
                    type="text"
                    value={settingsForm.instagramUrl}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mensagem Padrão de Atendimento no WhatsApp
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.defaultWhatsAppMessage}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, defaultWhatsAppMessage: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Alterar PIN de Acesso ao Painel
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={settingsForm.adminPin}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, adminPin: e.target.value })
                  }
                  className="w-36 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white font-mono font-bold text-center tracking-widest"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Restaurar Padrões
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =============================================================
            ABA 4: BACKUP & DADOS
        ============================================================= */}
        {activeTab === "backup" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Backup e Gerenciamento de Dados
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Exporte o catálogo para arquivo ou restaure os dados originais
              </p>
            </div>

            <div className="bg-slate-900 p-5 sm:p-7 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>Exportar Backup em JSON</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Baixe uma cópia de segurança com todos os {properties.length} imóveis cadastrados
                  </p>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs whitespace-nowrap cursor-pointer shadow-sm"
                >
                  Baixar Arquivo JSON
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>Restaurar Catálogo Original da Habittat</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Restaura os 175 imóveis originais minerados do site da Habittat House
                  </p>
                </div>
                <button
                  onClick={handleResetCatalog}
                  className="px-4 py-2 rounded-xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold text-xs whitespace-nowrap cursor-pointer"
                >
                  Restaurar Padrão
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-950/20 border border-red-900/40">
                <div>
                  <h4 className="font-bold text-sm text-red-300 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>Limpar Histórico de Analytics</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Zera todas as contagens de visualizações e cliques no WhatsApp registrados
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Zerar todas as métricas de analytics?")) {
                      clearAnalyticsData();
                      refreshData();
                      toast.info("Métricas de analytics zeradas.");
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 font-bold text-xs whitespace-nowrap cursor-pointer"
                >
                  Zerar Métricas
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =============================================================
          MODAL DE EDIÇÃO / CADASTRO DE IMÓVEL
      ============================================================= */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-black text-white">
                {isCreatingNew ? "Cadastrar Novo Imóvel" : `Editar Imóvel #${editingItem.sku}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Título do Imóvel *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="Ex: Linda Casa de 4 Quartos com Piscina em Albuquerque"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Código (SKU) *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.sku || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    required
                    value={editingItem.price || 0}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Status</label>
                  <select
                    value={editingItem.badge || "Disponível"}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white cursor-pointer"
                  >
                    <option value="Disponível">🟢 Disponível</option>
                    <option value="VENDIDA">🔴 VENDIDA</option>
                    <option value="RESERVADO">🟡 RESERVADO</option>
                    <option value="NOVO">✨ NOVO</option>
                    <option value="DESTAQUE">⭐ DESTAQUE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={editingItem.cat || "Casas em Condomínio"}
                    onChange={(e) => setEditingItem({ ...editingItem, cat: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white cursor-pointer"
                  >
                    <option value="Casas em Condomínio">Casas em Condomínio</option>
                    <option value="Casas">Casas</option>
                    <option value="Apartamentos">Apartamentos</option>
                    <option value="Coberturas">Coberturas</option>
                    <option value="Terrenos">Terrenos</option>
                    <option value="Sítios & Rurais">Sítios & Rurais</option>
                    <option value="Comerciais">Comerciais</option>
                    <option value="Lançamento">Lançamento</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Bairro</label>
                  <input
                    type="text"
                    value={editingItem.bairro || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, bairro: e.target.value })}
                    placeholder="Ex: Albuquerque"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Área / Metragem</label>
                  <input
                    type="text"
                    value={editingItem.storage || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, storage: e.target.value })}
                    placeholder="Ex: 240m²"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  URL da Foto de Capa
                </label>
                <input
                  type="url"
                  value={editingItem.img || ""}
                  onChange={(e) => {
                    const url = e.target.value;
                    setEditingItem({
                      ...editingItem,
                      img: url,
                      images: [url, ...(editingItem.images?.slice(1) || [])],
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Descrição do Imóvel</label>
                <textarea
                  rows={4}
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Imóvel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminDashboardPage;
