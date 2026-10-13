import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useRef } from "react";
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
  EyeOff,
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
  ChevronLeft,
  Filter,
  Star,
  ArrowLeft,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Tag,
  AlignLeft,
  Compass,
  FileCheck2,
  X,
  CreditCard,
  Instagram,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Copy,
  Layers,
  Phone,
  ShieldCheck,
  Cloud,
  RefreshCw,
} from "lucide-react";
import {
  isSupabaseConfigured,
  testSupabaseConnection,
  syncAllPropertiesToSupabase,
  setCustomSupabaseCredentials,
  getSupabaseUrl,
  getSupabaseAnonKey,
} from "@/services/supabaseClient";
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
  component: AdminDashboardPage,
});

export function AdminDashboardPage() {
  // Auth PIN
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");

  // Navigation Tabs: "imoveis" | "analytics" | "config" | "backup"
  const [activeTab, setActiveTab] = useState<"imoveis" | "analytics" | "config" | "backup">("imoveis");

  // Properties State
  const [properties, setProperties] = useState<ProductItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings());
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(() => {
    const cur = getSiteSettings();
    return {
      ...cur,
      supabaseUrl: cur.supabaseUrl || getSupabaseUrl(),
      supabaseAnonKey: cur.supabaseAnonKey || getSupabaseAnonKey(),
    };
  });
  const [showPin, setShowPin] = useState(false);

  // Supabase Backend States
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    count?: number;
  }>({
    tested: false,
    success: false,
    message: "",
  });
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");

  // Pagination for Properties in Admin
  const [adminPage, setAdminPage] = useState(1);
  const [adminPageSize, setAdminPageSize] = useState(25);

  // Editing / Creation Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ProductItem> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [modalTab, setModalTab] = useState<"photos" | "basics" | "location" | "specs" | "description">("photos");

  // Image Management States inside Modal
  const [newImageUrl, setNewImageUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Feature Tag Input inside Modal
  const [newFeatureText, setNewFeatureText] = useState("");

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

  // Check auth session on mount
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

  // Status Toggle (1-click cycle com sincronização imediata no Supabase)
  const handleToggleStatus = async (sku: string, currentBadge: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let next = "Disponível";
    if (currentBadge === "Disponível" || !currentBadge) next = "VENDIDA";
    else if (currentBadge === "VENDIDA") next = "RESERVADO";
    else next = "Disponível";

    await togglePropertyStatus(sku, next);
    refreshData();
    if (next === "VENDIDA") {
      toast.warning(`Imóvel #${sku} marcado como VENDIDA (ocultado do site e salvo no Supabase).`);
    } else if (next === "RESERVADO") {
      toast.info(`Status do imóvel #${sku} alterado para RESERVADO (sincronizado no Supabase).`);
    } else {
      toast.success(`Status do imóvel #${sku} alterado para DISPONÍVEL (sincronizado no Supabase).`);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: ProductItem) => {
    const initialImages = item.images && item.images.length > 0
      ? [...item.images]
      : (item.img ? [item.img] : []);

    setEditingItem({
      ...item,
      images: initialImages,
      img: initialImages[0] || item.img || "",
      features: item.features || item.boxItems || [],
      boxItems: item.boxItems || item.features || [],
    });
    setModalTab("photos");
    setIsCreatingNew(false);
    setIsEditModalOpen(true);
    setNewImageUrl("");
    setBulkUrls("");
    setShowBulkAdd(false);
    setNewFeatureText("");
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const newSku = String(Math.floor(100000 + Math.random() * 900000));
    const defaultImg =
      "https://d3873uwf1n1xlo.cloudfront.net/CRM_WebP/HABITTAT%20HOUSE%20/uploads/20260423132613/IMG-20240905-WA0066-original.webp";

    setEditingItem({
      sku: newSku,
      name: "",
      cat: "Apartamentos",
      bairro: "Albuquerque",
      screen: "Albuquerque, Teresópolis - RJ",
      price: 450000,
      storage: "95m²",
      specs: "2 Quartos (1 Suíte), 1 Vaga",
      badge: "Disponível",
      chip: "Excelente Oportunidade",
      description: "Excelente apartamento em Teresópolis, ensolarado, arejado e com fino acabamento.",
      img: defaultImg,
      images: [defaultImg],
      condition: "R$ 450/mês",
      warranty: "R$ 800/ano",
      battery: "Plano e pronto para morar",
      features: ["Elevador", "Portaria", "Varanda"],
      boxItems: ["Elevador", "Portaria", "Varanda"],
    });
    setModalTab("basics");
    setIsCreatingNew(true);
    setIsEditModalOpen(true);
    setNewImageUrl("");
    setBulkUrls("");
    setShowBulkAdd(false);
    setNewFeatureText("");
  };

  // Duplicar Imóvel
  const handleDuplicateProperty = (prod: ProductItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSku = String(Math.floor(100000 + Math.random() * 900000));
    const duplicated: ProductItem = {
      ...prod,
      sku: newSku,
      name: `[Cópia] ${prod.name}`,
      badge: "Disponível",
    };
    addProperty(duplicated);
    refreshData();
    toast.success(`Imóvel duplicado! Novo código: #${newSku}`);
    handleOpenEdit(duplicated);
  };

  // Copiar Link Direto do Imóvel
  const handleCopyPropertyLink = (sku: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ismael-dias-corretor.vercel.app";
    const url = `${origin}/loja?sku=${sku}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Link do imóvel copiado para o WhatsApp!");
    } else {
      toast.info(`Link do imóvel: ${url}`);
    }
  };

  // Modal Image Helpers
  const modalImages: string[] = useMemo(() => {
    if (!editingItem) return [];
    if (editingItem.images && editingItem.images.length > 0) {
      return editingItem.images;
    }
    return editingItem.img ? [editingItem.img] : [];
  }, [editingItem]);

  const updateModalImages = (newImgs: string[]) => {
    if (!editingItem) return;
    const valid = newImgs.filter((u) => Boolean(u && u.trim()));
    const cover = valid.length > 0 ? valid[0] : "";
    setEditingItem({
      ...editingItem,
      images: valid,
      img: cover,
    });
  };

  // Definir como Capa (move para índice 0)
  const handleSetCover = (index: number) => {
    if (index <= 0 || index >= modalImages.length) return;
    const list = [...modalImages];
    const item = list.splice(index, 1)[0];
    list.unshift(item);
    updateModalImages(list);
    toast.success("Foto definida como Capa Principal!");
  };

  // Mover foto na ordem (esquerda/direita)
  const handleMoveImage = (index: number, direction: "prev" | "next") => {
    const targetIndex = direction === "prev" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modalImages.length) return;
    const list = [...modalImages];
    const item = list.splice(index, 1)[0];
    list.splice(targetIndex, 0, item);
    updateModalImages(list);
    toast.success("Ordem da foto atualizada!");
  };

  // Excluir foto
  const handleRemoveImage = (index: number) => {
    if (modalImages.length <= 1) {
      toast.error("O imóvel precisa ter pelo menos 1 foto na galeria.");
      return;
    }
    const list = modalImages.filter((_, i) => i !== index);
    updateModalImages(list);
    toast.info("Foto removida da galeria.");
  };

  // Adicionar URL de imagem única
  const handleAddSingleImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) {
      toast.error("Digite ou cole uma URL válida de imagem.");
      return;
    }
    const list = [...modalImages, url];
    updateModalImages(list);
    setNewImageUrl("");
    toast.success("Nova foto adicionada à galeria!");
  };

  // Adicionar várias URLs em lote
  const handleAddBulkUrls = () => {
    if (!bulkUrls.trim()) return;
    const urls = bulkUrls
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter((u) => u.length > 5);

    if (urls.length === 0) {
      toast.error("Nenhuma URL identificada no texto colado.");
      return;
    }

    const list = [...modalImages, ...urls];
    updateModalImages(list);
    setBulkUrls("");
    setShowBulkAdd(false);
    toast.success(`${urls.length} novas fotos adicionadas!`);
  };

  // Carregar fotos direto do celular ou computador (FileReader DataURL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newLoadedUrls: string[] = [];
    let completed = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEv) => {
        const dataUrl = loadEv.target?.result as string;
        if (dataUrl) {
          newLoadedUrls.push(dataUrl);
        }
        completed++;
        if (completed === files.length) {
          updateModalImages([...modalImages, ...newLoadedUrls]);
          toast.success(`${newLoadedUrls.length} foto(s) carregada(s) do dispositivo!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Diferenciais / Comodidades Tag Helpers
  const modalFeatures: string[] = useMemo(() => {
    if (!editingItem) return [];
    if (editingItem.features && editingItem.features.length > 0) return editingItem.features;
    if (editingItem.boxItems && editingItem.boxItems.length > 0) return editingItem.boxItems;
    return [];
  }, [editingItem]);

  const handleAddFeature = (feat: string) => {
    const trimmed = feat.trim();
    if (!trimmed || !editingItem) return;
    if (modalFeatures.includes(trimmed)) return;
    const updated = [...modalFeatures, trimmed];
    setEditingItem({
      ...editingItem,
      features: updated,
      boxItems: updated,
    });
    setNewFeatureText("");
  };

  const handleRemoveFeature = (feat: string) => {
    if (!editingItem) return;
    const updated = modalFeatures.filter((f) => f !== feat);
    setEditingItem({
      ...editingItem,
      features: updated,
      boxItems: updated,
    });
  };

  // Salvar Modal com garantia 100% no Supabase
  const handleSaveModal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.sku) {
      toast.error("Preencha ao menos o título e código (SKU) do imóvel.");
      return;
    }

    const finalImages = modalImages.length > 0 ? modalImages : [editingItem.img || ""];
    const finalCover = finalImages[0] || editingItem.img || "";

    const itemToSave: ProductItem = {
      ...(editingItem as ProductItem),
      img: finalCover,
      images: finalImages,
      features: modalFeatures,
      boxItems: modalFeatures,
    };

    setIsEditModalOpen(false);

    if (isCreatingNew) {
      toast.info("Salvando novo imóvel e sincronizando com o Supabase...");
      await addProperty(itemToSave);
      toast.success("Novo imóvel cadastrado e salvo no Supabase!");
    } else {
      toast.info(`Salvando imóvel #${editingItem.sku}...`);
      await updateProperty(String(editingItem.sku), itemToSave);
      toast.success(`Imóvel #${editingItem.sku} atualizado e sincronizado no Supabase!`);
    }

    refreshData();
  };

  // Excluir Imóvel localmente e no Supabase
  const handleDelete = async (sku: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir o imóvel #${sku}? Esta ação removerá o imóvel do site e do Supabase.`)) {
      toast.info(`Removendo imóvel #${sku}...`);
      await deleteProperty(sku);
      refreshData();
      toast.success(`Imóvel #${sku} removido do site e do Supabase.`);
    }
  };

  // Salvar Configurações
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomSupabaseCredentials(
      settingsForm.supabaseUrl || "",
      settingsForm.supabaseAnonKey || ""
    );
    const updated = saveSiteSettings(settingsForm);
    setSettings(updated);
    toast.success("Configurações do site e backend salvas com sucesso!");
  };

  // Testar Conexão com Supabase
  const handleTestSupabase = async () => {
    setSupabaseTesting(true);
    setCustomSupabaseCredentials(
      settingsForm.supabaseUrl || "",
      settingsForm.supabaseAnonKey || ""
    );
    const res = await testSupabaseConnection();
    setSupabaseStatus({
      tested: true,
      success: res.success,
      message: res.message,
      count: res.count,
    });
    setSupabaseTesting(false);
    if (res.success) {
      toast.success(
        `Backend Supabase Conectado! ${res.count ?? 0} imóveis encontrados na nuvem.`
      );
    } else {
      toast.error(`Falha no Supabase: ${res.message}`);
    }
  };

  // Sincronizar catálogo para o Supabase
  const handleSyncToSupabase = async () => {
    if (!settingsForm.supabaseUrl || !settingsForm.supabaseAnonKey) {
      toast.error(
        "Preencha a URL e a Chave Anon do Supabase nas configurações primeiro."
      );
      return;
    }
    setSupabaseSyncing(true);
    setCustomSupabaseCredentials(
      settingsForm.supabaseUrl,
      settingsForm.supabaseAnonKey
    );
    toast.info("Iniciando envio dos 175 imóveis para o PostgreSQL na nuvem...");
    const res = await syncAllPropertiesToSupabase(properties);
    setSupabaseSyncing(false);
    if (res.success) {
      toast.success(res.message);
      handleTestSupabase();
    } else {
      toast.error(res.message);
    }
  };

  // Resetar Configurações
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

  // Resetar Catálogo Original
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

  // Contagens para os Chips de Status
  const countDisponiveis = useMemo(
    () => properties.filter((p) => p.badge !== "VENDIDA" && p.badge !== "RESERVADO").length,
    [properties]
  );
  const countVendidos = useMemo(
    () => properties.filter((p) => p.badge === "VENDIDA").length,
    [properties]
  );
  const countReservados = useMemo(
    () => properties.filter((p) => p.badge === "RESERVADO").length,
    [properties]
  );

  // Filtered Properties
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

      let matchPrice = true;
      if (priceFilter === "under-300") matchPrice = p.price <= 300000;
      else if (priceFilter === "300-600") matchPrice = p.price > 300000 && p.price <= 600000;
      else if (priceFilter === "600-1000") matchPrice = p.price > 600000 && p.price <= 1000000;
      else if (priceFilter === "1000-2000") matchPrice = p.price > 1000000 && p.price <= 2000000;
      else if (priceFilter === "over-2000") matchPrice = p.price > 2000000;

      return matchSearch && matchStatus && matchCat && matchPrice;
    });
  }, [properties, searchQuery, statusFilter, categoryFilter, priceFilter]);

  // Reset pagination when filter changes
  useEffect(() => {
    setAdminPage(1);
  }, [searchQuery, statusFilter, categoryFilter, priceFilter, adminPageSize]);

  // Paginated Slice
  const totalFiltered = filteredProperties.length;
  const totalPages = adminPageSize > 0 ? Math.max(1, Math.ceil(totalFiltered / adminPageSize)) : 1;
  const paginatedProperties = useMemo(() => {
    if (adminPageSize <= 0) return filteredProperties;
    const start = (adminPage - 1) * adminPageSize;
    return filteredProperties.slice(start, start + adminPageSize);
  }, [filteredProperties, adminPage, adminPageSize]);

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
      {/* Top Bar Mobile & Desktop */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3.5 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm sm:text-base shadow-sm shrink-0">
            ID
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-black tracking-tight leading-tight flex items-center gap-1.5 truncate">
              <span>Painel do Corretor</span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
              Ismael Dias • Habittat House
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            to="/loja"
            target="_blank"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] sm:text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1 text-slate-300"
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

      {/* Navigation Tabs — Responsivo para Mobile (Grid 4x1) e Desktop (Flex) */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-2 sm:px-8 py-2">
        {/* Mobile View (Grid 4 colunas compacto) */}
        <div className="grid grid-cols-4 gap-1.5 sm:hidden">
          <button
            onClick={() => setActiveTab("imoveis")}
            className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === "imoveis"
                ? "bg-blue-600 text-white font-black shadow-sm"
                : "text-slate-400 hover:text-white bg-slate-800/40"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-bold leading-tight">Imóveis</span>
            <span className="text-[9px] opacity-75">({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white font-black shadow-sm"
                : "text-slate-400 hover:text-white bg-slate-800/40"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px] font-bold leading-tight">Métricas</span>
            <span className="text-[9px] opacity-75">({summary.totalWhatsAppClicks})</span>
          </button>

          <button
            onClick={() => setActiveTab("config")}
            className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === "config"
                ? "bg-blue-600 text-white font-black shadow-sm"
                : "text-slate-400 hover:text-white bg-slate-800/40"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px] font-bold leading-tight">Ajustes</span>
            <span className="text-[9px] opacity-75">Site</span>
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === "backup"
                ? "bg-blue-600 text-white font-black shadow-sm"
                : "text-slate-400 hover:text-white bg-slate-800/40"
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="text-[10px] font-bold leading-tight">Backup</span>
            <span className="text-[9px] opacity-75">Dados</span>
          </button>
        </div>

        {/* Desktop View (Flex horizontal espaçoso) */}
        <div className="hidden sm:flex items-center gap-2">
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
      <main className="flex-1 p-3 sm:p-8 max-w-7xl w-full mx-auto">
        {/* =============================================================
            ABA 1: GESTÃO DE IMÓVEIS
        ============================================================= */}
        {activeTab === "imoveis" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Header da Aba com Botão Cadastrar e Status Pills Rápidos */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight">
                  Gestão do Catálogo de Imóveis
                </h2>
                <p className="text-[11px] sm:text-sm text-slate-400 mt-0.5">
                  Clique em qualquer imóvel para editar. Imóveis marcados como "VENDIDA" são ocultados do site público automaticamente.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCreate}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer text-white"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Imóvel</span>
                </button>
              </div>
            </div>

            {/* Quick Status Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>Todos</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">
                  {properties.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("disponivel")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "disponivel"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white"
                }`}
              >
                <span>🟢 Disponíveis no Site</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">
                  {countDisponiveis}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("vendida")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "vendida"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-900 border border-slate-800 text-rose-400 hover:text-white"
                }`}
              >
                <span>🔴 Vendidos (Ocultos)</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">
                  {countVendidos}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("reservado")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "reservado"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-slate-900 border border-slate-800 text-amber-400 hover:text-white"
                }`}
              >
                <span>🟡 Reservados</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">
                  {countReservados}
                </span>
              </button>
            </div>

            {/* Filtros e Barra de Busca Compacta */}
            <div className="space-y-2.5 bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por código (#SKU), nome, rua ou bairro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Categoria: Todas</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Preço: Todas as faixas</option>
                    <option value="under-300">Até R$ 300 mil</option>
                    <option value="300-600">R$ 300k a R$ 600k</option>
                    <option value="600-1000">R$ 600k a R$ 1 Milhão</option>
                    <option value="1000-2000">R$ 1M a R$ 2 Milhões</option>
                    <option value="over-2000">Acima de R$ 2 Milhões</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <div className="text-right flex items-center justify-end h-full text-xs text-slate-400 pr-1">
                    <span>
                      Exibindo <strong className="text-white">{totalFiltered}</strong> imóveis
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dica de usabilidade */}
            <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-950/20 border border-blue-900/30 px-3 py-2 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                <strong>Dica:</strong> Clique em qualquer lugar do imóvel para abrir a edição completa.
              </span>
            </div>

            {/* =============================================================
                1. MODO MOBILE: CARDS MODERNOS TOUCH-FRIENDLY (md:hidden)
            ============================================================= */}
            <div className="block md:hidden space-y-3">
              {paginatedProperties.length === 0 ? (
                <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  Nenhum imóvel encontrado com os filtros atuais.
                </div>
              ) : (
                paginatedProperties.map((prod) => {
                  const isSold = prod.badge === "VENDIDA";

                  return (
                    <div
                      key={String(prod.sku) + prod.name}
                      onClick={() => handleOpenEdit(prod)}
                      className={`bg-slate-900 border rounded-2xl p-3.5 space-y-3 shadow-md transition cursor-pointer active:scale-99 ${
                        isSold
                          ? "border-rose-900/50 bg-rose-950/10 hover:border-rose-700"
                          : "border-slate-800 hover:border-blue-500/50"
                      }`}
                      title="Toque no imóvel para editar detalhes e fotos"
                    >
                      {/* Linha 1: Foto + Título + Bairro */}
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={prod.img}
                            alt={prod.name}
                            className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700"
                            loading="lazy"
                          />
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded-md bg-black/80 text-[9px] font-bold text-white flex items-center gap-0.5 shadow-xs">
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span>{prod.images?.length || 1}</span>
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold text-blue-400">
                              #{prod.sku || "—"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              • {prod.cat}
                            </span>
                            {isSold && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                Oculto do site
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-xs text-white line-clamp-2 mt-0.5 leading-snug">
                            {prod.name}
                          </h4>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-0.5 truncate">
                              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                              <span>{prod.bairro || "Teresópolis"}</span>
                            </span>
                            {prod.storage && (
                              <span className="shrink-0">• {prod.storage}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Linha 2: Valor & Status Ciclável */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">
                            Valor de Venda
                          </span>
                          <span className="text-sm font-black text-emerald-400">
                            {fmt(prod.price)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleToggleStatus(String(prod.sku), prod.badge || "Disponível", e)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide border cursor-pointer transition active:scale-95 flex items-center gap-1 ${
                            isSold
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                              : prod.badge === "RESERVADO"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          }`}
                          title="Toque para alternar o status de venda"
                        >
                          <span>
                            {isSold
                              ? "🔴 Vendida (Oculto)"
                              : prod.badge === "RESERVADO"
                              ? "🟡 Reservado"
                              : "🟢 Disponível"}
                          </span>
                        </button>
                      </div>

                      {/* Linha 3: Ações Rápidas Touch */}
                      <div className="space-y-1.5 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(prod);
                          }}
                          className="w-full py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Informações & Galeria de Fotos</span>
                        </button>

                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleDuplicateProperty(prod, e)}
                            className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Duplicar imóvel"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Copiar</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCopyPropertyLink(String(prod.sku), e)}
                            className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Copiar Link para WhatsApp"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Link</span>
                          </button>

                          <a
                            href={`/loja?sku=${encodeURIComponent(String(prod.sku))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition"
                            title="Ver no site público"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Ver</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => handleDelete(String(prod.sku), e)}
                            className="py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs flex items-center justify-center transition active:scale-95 cursor-pointer"
                            title="Excluir imóvel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* =============================================================
                2. MODO DESKTOP: TABELA COMPLETA (hidden md:block)
            ============================================================= */}
            <div className="hidden md:block bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-xs sm:text-sm">
                  <thead className="bg-slate-800/80 text-slate-300 text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Imóvel (Clique para Editar)</th>
                      <th className="py-3.5 px-3">Bairro</th>
                      <th className="py-3.5 px-3">Valor</th>
                      <th className="py-3.5 px-3 text-center">Fotos</th>
                      <th className="py-3.5 px-3 text-center">Status no Site</th>
                      <th className="py-3.5 px-4 text-right min-w-[200px] w-[200px] sticky right-0 bg-slate-800/95 backdrop-blur-xs z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.6)]">
                        Ações Rápidas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedProperties.map((prod) => {
                      const isSold = prod.badge === "VENDIDA";

                      return (
                        <tr
                          key={String(prod.sku) + prod.name}
                          onClick={() => handleOpenEdit(prod)}
                          className={`hover:bg-blue-900/15 transition-colors cursor-pointer group ${
                            isSold ? "bg-rose-950/5 hover:bg-rose-950/20" : ""
                          }`}
                          title="Clique em qualquer lugar da linha para editar o imóvel"
                        >
                          {/* Imóvel + Foto */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.img}
                                alt={prod.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-800 border border-slate-700 group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-blue-400">
                                    #{prod.sku || "—"} • {prod.cat}
                                  </span>
                                  {isSold && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-400">
                                      Oculto do Site
                                    </span>
                                  )}
                                </div>
                                <h4
                                  className="font-bold text-slate-100 truncate max-w-xs xl:max-w-md group-hover:text-blue-300 transition-colors"
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
                              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>{prod.bairro || "Teresópolis"}</span>
                            </div>
                          </td>

                          {/* Valor */}
                          <td className="py-3 px-3 font-black text-slate-200 whitespace-nowrap">
                            {fmt(prod.price)}
                          </td>

                          {/* Quantidade de Fotos */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300">
                              📷 {prod.images?.length || 1}
                            </span>
                          </td>

                          {/* Status Toggle Button */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => handleToggleStatus(String(prod.sku), prod.badge || "Disponível", e)}
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border cursor-pointer transition active:scale-95 whitespace-nowrap ${
                                isSold
                                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30"
                                  : prod.badge === "RESERVADO"
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
                              }`}
                              title="Clique para alternar o status de venda"
                            >
                              {isSold
                                ? "🔴 Vendida (Oculto)"
                                : prod.badge === "RESERVADO"
                                ? "🟡 Reservado"
                                : "🟢 Disponível"}
                            </button>
                          </td>

                          {/* Ações Rápidas — Fixado e 100% visível sem cortes */}
                          <td className="py-3 px-4 text-right whitespace-nowrap min-w-[200px] w-[200px] sticky right-0 bg-slate-900/95 group-hover:bg-slate-900 backdrop-blur-xs z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.6)]">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(prod);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                                title="Editar imóvel e fotos"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleDuplicateProperty(prod, e)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                                title="Duplicar imóvel"
                              >
                                <Layers className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleCopyPropertyLink(String(prod.sku), e)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                                title="Copiar Link para WhatsApp"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={`/loja?sku=${encodeURIComponent(String(prod.sku))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
                                title="Ver no site público"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                type="button"
                                onClick={(e) => handleDelete(String(prod.sku), e)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer shrink-0"
                                title="Excluir imóvel"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginação do Admin (Mobile & Desktop) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span>Exibir por página:</span>
                <select
                  value={adminPageSize}
                  onChange={(e) => setAdminPageSize(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs cursor-pointer"
                >
                  <option value={20}>20 imóveis</option>
                  <option value={25}>25 imóveis</option>
                  <option value={50}>50 imóveis</option>
                  <option value={100}>100 imóveis</option>
                  <option value={0}>Todos ({totalFiltered})</option>
                </select>
              </div>

              {adminPageSize > 0 && totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">
                    Página <strong className="text-white">{adminPage}</strong> de {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAdminPage((prev) => Math.max(1, prev - 1))}
                      disabled={adminPage <= 1}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white cursor-pointer"
                      title="Página Anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAdminPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={adminPage >= totalPages}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white cursor-pointer"
                      title="Próxima Página"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
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
                  <span className="text-[10px] sm:text-xs font-bold uppercase">Visualizações</span>
                  <Eye className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {summary.totalPageViews}
                </div>
                <span className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>Acessos registrados</span>
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase">Leads no WhatsApp</span>
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {summary.totalWhatsAppClicks}
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block font-medium">
                  Cliques para conversar
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase">Taxa Conversão</span>
                  <MousePointerClick className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-sky-400">
                  {summary.conversionRate}
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block font-medium">
                  Visitantes que clicaram
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase">Imóveis Ativos</span>
                  <Building2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {countDisponiveis}
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block font-medium">
                  {countVendidos} vendidos (ocultos)
                </span>
              </div>
            </div>

            {/* Gráfico Diário de Visualizações e Cliques */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
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

              <div className="h-60 sm:h-72 w-full">
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

                        <div className="text-right shrink-0">
                          <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1">
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                            <span>{p.clicks} {p.clicks === 1 ? "lead" : "leads"}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Páginas Mais Acessadas */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <h3 className="font-black text-sm sm:text-base text-white mb-1 flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>Acessos por Página do Site</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Distribuição de visitas entre Home, Loja e Lançamentos
                </p>

                <div className="space-y-4">
                  {pageViewsList.map((pv) => {
                    const pct = summary.totalPageViews > 0
                      ? Math.round((pv.count / summary.totalPageViews) * 100)
                      : 0;

                    return (
                      <div key={pv.path} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-300">{pv.label}</span>
                          <span className="text-slate-400">
                            {pv.count} visitas ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
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
            ABA 3: CONFIGURAÇÕES DO SITE (DESIGN E ESPAÇAMENTOS MELHORADOS)
        ============================================================= */}
        {activeTab === "config" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Configurações Gerais do Site
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Altere o WhatsApp de atendimento, telefone, CRECI, visibilidade de imóveis vendidos e PIN de segurança em tempo real
              </p>
            </div>

            <form
              onSubmit={handleSaveSettings}
              className="bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl"
            >
              {/* Seção 1: Dados do Corretor */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Building2 className="w-4 h-4" />
                  <span>Dados do Corretor & Imobiliária</span>
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Nome do Corretor / Imobiliária
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.realtorName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, realtorName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      WhatsApp para Receber Mensagens (Dígitos com DDD)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={settingsForm.whatsappNumber}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value.replace(/\D/g, "") })
                        }
                        placeholder="Ex: 5521964639999"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Número atual: +{settingsForm.whatsappNumber}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Telefone Formatado para Exibição
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.phoneDisplay}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, phoneDisplay: e.target.value })
                      }
                      placeholder="Ex: (21) 96463-9999"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Registro CRECI
                    </label>
                    <input
                      type="text"
                      value={settingsForm.creci}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, creci: e.target.value })
                      }
                      placeholder="Ex: CRECI-RJ Ativo"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Perfil no Instagram
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instagramUrl}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })
                      }
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Atendimento no WhatsApp */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                  <span>Mensagem Padrão de Atendimento</span>
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Texto Inicial ao Clicar no WhatsApp do Site
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.defaultWhatsAppMessage}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, defaultWhatsAppMessage: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Seção 3: Regras de Exibição de Imóveis Vendidos (NOVO) */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Visibilidade do Catálogo de Imóveis</span>
                </h3>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Ocultar Imóveis Vendidos da Vitrine Pública</span>
                      {settingsForm.hideSoldProperties !== false && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                          Ativo (Recomendado)
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Quando ativado, qualquer imóvel marcado com status <strong>"VENDIDA"</strong> não aparecerá para os clientes no catálogo público (/loja). Você continua vendo e gerenciando todos eles aqui no painel administrativo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSettingsForm({
                        ...settingsForm,
                        hideSoldProperties: settingsForm.hideSoldProperties === false ? true : false,
                      })
                    }
                    className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      settingsForm.hideSoldProperties !== false ? "bg-emerald-600" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                        settingsForm.hideSoldProperties !== false ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Seção 4: Segurança e PIN */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Segurança do Painel do Corretor</span>
                </h3>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-white block mb-0.5">
                      PIN de Acesso ao Painel Admin
                    </label>
                    <span className="text-xs text-slate-400">
                      Digite de 4 a 10 dígitos numéricos para proteger o acesso administrativo.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <input
                        type={showPin ? "text" : "password"}
                        maxLength={10}
                        value={settingsForm.adminPin}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, adminPin: e.target.value })
                        }
                        className="w-36 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono font-bold text-center tracking-widest focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
                      title={showPin ? "Ocultar PIN" : "Mostrar PIN"}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Seção 5: Backend & Banco de Dados em Nuvem (Supabase) */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>Backend em Nuvem (Banco de Dados PostgreSQL — Supabase)</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    {isSupabaseConfigured() ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Nuvem Ativa</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Modo Local (Offline)</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Conecte seu banco de dados 100% gratuito no <strong>Supabase</strong> para que todas as informações e fotos fiquem hospedadas em um servidor de nuvem de alta velocidade em São Paulo, sem depender de dados em código.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      URL do Projeto Supabase (Project URL)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.supabaseUrl || ""}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, supabaseUrl: e.target.value })
                      }
                      placeholder="https://sua-empresa.supabase.co"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Chave Pública Anon (anon public key)
                    </label>
                    <input
                      type="password"
                      value={settingsForm.supabaseAnonKey || ""}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, supabaseAnonKey: e.target.value })
                      }
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Ações de Teste e Sincronização */}
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    {supabaseStatus.tested ? (
                      <span className={supabaseStatus.success ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {supabaseStatus.message}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {isSupabaseConfigured()
                          ? "Credenciais inseridas. Teste a conexão para verificar."
                          : "Crie um projeto grátis no supabase.com para conectar."}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestSupabase}
                      disabled={supabaseTesting}
                      className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${supabaseTesting ? "animate-spin" : ""}`} />
                      <span>{supabaseTesting ? "Testando..." : "Testar Conexão"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSyncToSupabase}
                      disabled={supabaseSyncing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/20"
                    >
                      <Cloud className={`w-3.5 h-3.5 ${supabaseSyncing ? "animate-bounce" : ""}`} />
                      <span>{supabaseSyncing ? "Enviando Imóveis..." : "Enviar 175 Imóveis para Nuvem"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Barra de Ações do Formulário */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrões</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition active:scale-95"
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

            <div className="bg-slate-900 p-5 sm:p-7 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
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
          MODAL DE EDIÇÃO COMPLETA DE IMÓVEL & FOTOS
      ============================================================= */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-hidden">
          <div className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-3xl bg-slate-900 border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Top Bar Fixa do Modal (Sempre visível no mobile) */}
            <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-white truncate flex items-center gap-2">
                  <span>{isCreatingNew ? "Novo Imóvel" : `Editar Imóvel #${editingItem.sku}`}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    {editingItem.cat || "Imóvel"}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {editingItem.name || "Preencha as informações do anúncio"}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveModal()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>

            {/* Abas Internas de Navegação do Modal (Organização limpa) */}
            <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2 overflow-x-auto shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setModalTab("photos")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    modalTab === "photos"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Galeria de Fotos ({modalImages.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("basics")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    modalTab === "basics"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Dados Básicos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("location")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    modalTab === "location"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Local & Metragem</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("specs")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    modalTab === "specs"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Taxas & Vantagens</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("description")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    modalTab === "description"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Descrição</span>
                </button>
              </div>
            </div>

            {/* Conteúdo Rolável do Modal */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              
              {/* =========================================================
                  SUB-ABA 1: GALERIA DE FOTOS (EDIÇÃO, ORDEM E UPLOAD)
              ========================================================= */}
              {modalTab === "photos" && (
                <div className="space-y-4">
                  {/* Adicionar Fotos: Inputs e Ações */}
                  <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-400" />
                      <span>Adicionar Novas Fotos</span>
                    </h4>

                    {/* Linha 1: Input de URL direta */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        placeholder="Cole a URL da foto (WebP, JPG, PNG)..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSingleImageUrl();
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddSingleImageUrl}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shrink-0 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Foto</span>
                      </button>
                    </div>

                    {/* Linha 2: Botões de Carregar do Celular e Lote */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-700/50">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5 transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-400" />
                        <span>Escolher do Celular / Computador</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowBulkAdd(!showBulkAdd)}
                        className="px-3 py-1.5 rounded-xl border border-slate-600 hover:bg-slate-700/50 text-xs font-semibold text-slate-300 cursor-pointer flex items-center gap-1.5 transition"
                      >
                        <span>Colar Múltiplas URLs</span>
                        {showBulkAdd ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Caixa expansível para Lote de URLs */}
                    {showBulkAdd && (
                      <div className="pt-2 space-y-2">
                        <textarea
                          rows={3}
                          placeholder="Cole várias URLs de imagens aqui, uma por linha ou separadas por vírgula..."
                          value={bulkUrls}
                          onChange={(e) => setBulkUrls(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleAddBulkUrls}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white cursor-pointer shadow-sm"
                          >
                            Adicionar URLs em Lote
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grade Visual de Fotos com Ações de Reordenação */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                      <span>
                        Galeria Atual: <strong className="text-white">{modalImages.length} fotos</strong>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Use as setas para trocar posições
                      </span>
                    </div>

                    {modalImages.length === 0 ? (
                      <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400 text-xs">
                        Nenhuma foto adicionada. Cole uma URL acima ou envie uma foto do dispositivo.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                        {modalImages.map((imgUrl, idx) => {
                          const isCover = idx === 0;

                          return (
                            <div
                              key={imgUrl + idx}
                              className={`relative rounded-2xl overflow-hidden border bg-slate-800 flex flex-col group transition-all ${
                                isCover
                                  ? "border-amber-400 ring-2 ring-amber-400/30"
                                  : "border-slate-700/80 hover:border-slate-600"
                              }`}
                            >
                              {/* Thumbnail da Imagem */}
                              <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden">
                                <img
                                  src={imgUrl}
                                  alt={`Foto ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-102"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLElement).classList.add("opacity-30");
                                  }}
                                />

                                {/* Badge de Posição / Capa */}
                                <div className="absolute top-1.5 left-1.5 z-10">
                                  {isCover ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-md">
                                      <Star className="w-3 h-3 fill-slate-950" />
                                      <span>Capa</span>
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded-md bg-black/75 text-white font-bold text-[10px]">
                                      #{idx + 1}
                                    </span>
                                  )}
                                </div>

                                {/* Botão Rápido de Excluir */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition cursor-pointer z-10"
                                  title="Remover foto"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Barra Inferior de Controles / Reordenação */}
                              <div className="p-1.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-1">
                                {!isCover ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCover(idx)}
                                    className="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition shrink-0"
                                    title="Tornar Foto de Capa"
                                  >
                                    <Star className="w-2.5 h-2.5" />
                                    <span>Capa</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-amber-400 font-extrabold px-1">
                                    Principal
                                  </span>
                                )}

                                <div className="flex items-center gap-0.5 ml-auto">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, "prev")}
                                    disabled={idx === 0}
                                    className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed text-white cursor-pointer transition"
                                    title="Mover para esquerda"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, "next")}
                                    disabled={idx === modalImages.length - 1}
                                    className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed text-white cursor-pointer transition"
                                    title="Mover para direita"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-ABA 2: DADOS BÁSICOS (TÍTULO, SKU, PREÇO, STATUS)
              ========================================================= */}
              {modalTab === "basics" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Título do Anúncio *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.name || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      placeholder="Ex: Apartamento de 3 Quartos com Vista Panorâmica na Várzea"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Código (SKU / Referência) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.sku || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, sku: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Valor de Venda (R$) *
                      </label>
                      <input
                        type="number"
                        required
                        value={editingItem.price || 0}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, price: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white font-bold"
                      />
                      <span className="text-[10px] text-emerald-400 mt-1 block">
                        Formatado: {fmt(editingItem.price || 0)}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Status de Venda
                      </label>
                      <select
                        value={editingItem.badge || "Disponível"}
                        onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white cursor-pointer"
                      >
                        <option value="Disponível">🟢 Disponível (Visível no site)</option>
                        <option value="VENDIDA">🔴 VENDIDA (Oculto do site)</option>
                        <option value="RESERVADO">🟡 RESERVADO (Em negociação)</option>
                        <option value="NOVO">✨ NOVO</option>
                        <option value="DESTAQUE">⭐ DESTAQUE</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Categoria
                      </label>
                      <select
                        value={editingItem.cat || "Apartamentos"}
                        onChange={(e) => setEditingItem({ ...editingItem, cat: e.target.value })}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white cursor-pointer"
                      >
                        <option value="Apartamentos">Apartamentos</option>
                        <option value="Casas">Casas</option>
                        <option value="Casas em Condomínio">Casas em Condomínio</option>
                        <option value="Coberturas">Coberturas</option>
                        <option value="Terrenos">Terrenos</option>
                        <option value="Sítios & Rurais">Sítios & Rurais</option>
                        <option value="Comerciais">Comerciais</option>
                        <option value="Lançamento">Lançamento</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Selo / Destaque Comercial
                      </label>
                      <input
                        type="text"
                        value={editingItem.chip || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, chip: e.target.value })}
                        placeholder="Ex: Financiamento Facilitado, Vista Indevassável..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-ABA 3: LOCALIZAÇÃO E METRAGEM
              ========================================================= */}
              {modalTab === "location" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={editingItem.bairro || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, bairro: e.target.value })}
                        placeholder="Ex: Várzea, Agriões, Alto..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Endereço / Referência Completa
                      </label>
                      <input
                        type="text"
                        value={editingItem.screen || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, screen: e.target.value })}
                        placeholder="Ex: Várzea, Teresópolis - RJ"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Área Construída / Terreno (Metragem)
                      </label>
                      <input
                        type="text"
                        value={editingItem.storage || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, storage: e.target.value })}
                        placeholder="Ex: 120m²"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Resumo de Cômodos e Vagas
                      </label>
                      <input
                        type="text"
                        value={editingItem.specs || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, specs: e.target.value })}
                        placeholder="Ex: 3 Quartos (1 Suíte), 2 Banheiros, 2 Vagas"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-ABA 4: TAXAS & DIFERENCIAIS
              ========================================================= */}
              {modalTab === "specs" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Valor do Condomínio
                      </label>
                      <input
                        type="text"
                        value={editingItem.condition || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, condition: e.target.value })}
                        placeholder="Ex: R$ 450/mês"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Valor do IPTU
                      </label>
                      <input
                        type="text"
                        value={editingItem.warranty || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, warranty: e.target.value })}
                        placeholder="Ex: R$ 1.200/ano"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Topografia / Acabamento
                      </label>
                      <input
                        type="text"
                        value={editingItem.battery || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, battery: e.target.value })}
                        placeholder="Ex: Plano e pronto para morar"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Gerenciamento de Comodidades e Diferenciais */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">
                      Diferenciais & Comodidades do Imóvel
                    </label>

                    {/* Adicionar nova tag */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Piscina, Churrasqueira, Portaria 24h, Sauna..."
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFeature(newFeatureText);
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddFeature(newFeatureText)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>

                    {/* Tags ativas */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {modalFeatures.map((feat) => (
                        <span
                          key={feat}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5"
                        >
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(feat)}
                            className="text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Sugestões de 1 clique */}
                    <div className="pt-2 border-t border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block mb-1.5">
                        Sugestões Rápidas:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          "Piscina",
                          "Churrasqueira",
                          "Varanda Gourmet",
                          "Elevador",
                          "Portaria 24h",
                          "Sauna",
                          "Academia",
                          "Vista Panorâmica",
                          "Aceita Permuta",
                          "RGI Individual",
                        ].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleAddFeature(sug)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 cursor-pointer"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-ABA 5: DESCRIÇÃO COMPLETA & REDES
              ========================================================= */}
              {modalTab === "description" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Descrição Completa do Imóvel
                    </label>
                    <textarea
                      rows={8}
                      value={editingItem.description || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, description: e.target.value })
                      }
                      placeholder="Descreva todos os detalhes, pontos fortes, incidência de sol, acabamentos e condições..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Link do Instagram do Empreendimento (Opcional)
                    </label>
                    <input
                      type="url"
                      value={editingItem.instagramUrl || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, instagramUrl: e.target.value })
                      }
                      placeholder="https://www.instagram.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé Fixo do Modal */}
            <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-400">
                {modalImages.length} fotos na galeria
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveModal()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Imóvel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
