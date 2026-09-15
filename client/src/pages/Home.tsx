import { useMemo, useState } from "react";
import { startLogin } from "@/const";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarClock,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Gauge,
  MapPin,
  Menu,
  Navigation,
  Package,
  Plus,
  Search,
  Settings2,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";

type OrderStatus = "Em rota" | "Pendente" | "Agendado";
type View = "overview" | "orders" | "vehicles";

type Order = {
  id: string;
  code: string;
  client: string;
  address: string;
  zone: string;
  weight: number;
  distance: number;
  window: string;
  status: OrderStatus;
  priority: "Alta" | "Normal";
  point: { x: number; y: number };
};

type Vehicle = {
  id: string;
  name: string;
  plate: string;
  type: string;
  capacity: number;
  load: number;
  status: "Disponível" | "Em rota" | "Manutenção";
  color: string;
};

const initialOrders: Order[] = [
  { id: "o1", code: "RF-2048", client: "Mercado Aurora", address: "Av. Paulista, 1578", zone: "Bela Vista", weight: 420, distance: 13.4, window: "08:00 — 10:00", status: "Pendente", priority: "Alta", point: { x: 48, y: 30 } },
  { id: "o2", code: "RF-2049", client: "Restaurante Origami", address: "Rua dos Pinheiros, 610", zone: "Pinheiros", weight: 180, distance: 8.2, window: "09:00 — 12:00", status: "Em rota", priority: "Normal", point: { x: 33, y: 48 } },
  { id: "o3", code: "RF-2050", client: "Clínica Vitta", address: "R. Haddock Lobo, 955", zone: "Cerqueira César", weight: 95, distance: 6.8, window: "10:00 — 13:00", status: "Pendente", priority: "Alta", point: { x: 59, y: 49 } },
  { id: "o4", code: "RF-2051", client: "Loja Casa Nova", address: "Rua Harmonia, 285", zone: "Vila Madalena", weight: 260, distance: 12.1, window: "13:00 — 16:00", status: "Agendado", priority: "Normal", point: { x: 24, y: 69 } },
  { id: "o5", code: "RF-2052", client: "Escritório Nexo", address: "Al. Santos, 1293", zone: "Jardins", weight: 140, distance: 9.6, window: "14:00 — 17:00", status: "Agendado", priority: "Normal", point: { x: 72, y: 69 } },
];

const initialVehicles: Vehicle[] = [
  { id: "v1", name: "Truck 01", plate: "FRT-4A21", type: "VUC baú", capacity: 1200, load: 920, status: "Em rota", color: "#0d7489" },
  { id: "v2", name: "Van 02", plate: "GHE-8B94", type: "Van refrigerada", capacity: 650, load: 280, status: "Disponível", color: "#e4a72c" },
  { id: "v3", name: "Truck 03", plate: "KLM-2C77", type: "Toco baú", capacity: 2400, load: 0, status: "Disponível", color: "#cf6b4e" },
];

const navItems: { label: string; view: View; icon: typeof Gauge }[] = [
  { label: "Visão geral", view: "overview", icon: Gauge },
  { label: "Pedidos", view: "orders", icon: Package },
  { label: "Veículos", view: "vehicles", icon: Truck },
];

function formatKm(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function statusClass(status: OrderStatus | Vehicle["status"]) {
  if (status === "Em rota") return "bg-[#e7f5ef] text-[#1c8057]";
  if (status === "Agendado" || status === "Disponível") return "bg-[#f6f1df] text-[#9b7620]";
  if (status === "Manutenção") return "bg-[#fae9e4] text-[#bb5d48]";
  return "bg-[#f0f1f2] text-[#5f6871]";
}

function routeForOrders(orders: Order[]) {
  const selected = orders.filter((order) => order.status !== "Em rota");
  const ordered = [...selected].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === "Alta" ? -1 : 1;
    return a.point.y - b.point.y;
  });
  const distance = ordered.reduce((total, order, index) => total + order.distance + (index === 0 ? 8.6 : 1.8), 8.4);
  const minutes = Math.round(distance * 1.42 + ordered.length * 11);
  return { ordered, distance, minutes };
}

function MetricCard({ label, value, detail, trend, icon: Icon, tone = "teal" }: { label: string; value: string; detail: string; trend?: string; icon: typeof Gauge; tone?: "teal" | "amber" | "coral" | "ink" }) {
  const tones = {
    teal: "bg-[#e6f5f3] text-[#0d7489]",
    amber: "bg-[#f7f0dd] text-[#aa7923]",
    coral: "bg-[#fae9e4] text-[#bd604c]",
    ink: "bg-[#e9eef2] text-[#304c5d]",
  };
  return (
    <article className="group relative overflow-hidden rounded-[20px] border border-[#dfe6e8] bg-white p-5 shadow-[0_10px_30px_rgba(44,62,72,0.045)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(44,62,72,0.09)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon size={19} strokeWidth={1.8} /></div>
        {trend && <span className="flex items-center gap-1 text-[11px] font-semibold text-[#27815d]"><ArrowUpRight size={13} /> {trend}</span>}
      </div>
      <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7a858a]">{label}</p>
      <p className="mt-1 font-display text-[30px] font-semibold tracking-[-0.05em] text-[#1f3039]">{value}</p>
      <p className="mt-1 text-xs text-[#849097]">{detail}</p>
      <div className="pointer-events-none absolute -bottom-10 -right-7 h-24 w-24 rounded-full bg-[#eff6f6] opacity-60 transition-transform duration-300 group-hover:scale-125" />
    </article>
  );
}

function RouteMap({ orders, routeOrderIds }: { orders: Order[]; routeOrderIds: string[] }) {
  const lines = routeOrderIds.map((id, index) => {
    const from = index === 0 ? { x: 50, y: 80 } : orders.find((order) => order.id === routeOrderIds[index - 1])?.point ?? { x: 50, y: 80 };
    const to = orders.find((order) => order.id === id)?.point ?? { x: 50, y: 80 };
    return `${from.x},${from.y} ${to.x},${to.y}`;
  }).join(" ");
  const last = orders.find((order) => order.id === routeOrderIds[routeOrderIds.length - 1])?.point ?? { x: 50, y: 80 };
  return (
    <div className="relative min-h-[365px] overflow-hidden rounded-[22px] border border-[#cfe2e4] bg-[#eaf5f5]">
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(25deg, transparent 46%, rgba(131,174,179,.34) 47%, transparent 49%), linear-gradient(102deg, transparent 45%, rgba(131,174,179,.28) 46%, transparent 48%), linear-gradient(165deg, transparent 60%, rgba(131,174,179,.22) 61%, transparent 63%)", backgroundSize: "180px 140px, 220px 180px, 240px 170px" }} />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 12% 23%, rgba(255,255,255,.8) 0 1px, transparent 2px), radial-gradient(circle at 75% 18%, rgba(255,255,255,.7) 0 1px, transparent 2px), radial-gradient(circle at 40% 76%, rgba(255,255,255,.8) 0 1px, transparent 2px)", backgroundSize: "130px 130px" }} />
      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-[11px] font-semibold text-[#49636b] shadow-sm backdrop-blur"><span className="h-2 w-2 rounded-full bg-[#2b9b88]" /> São Paulo · Zona oeste</div>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points={lines} fill="none" stroke="#1f8994" strokeWidth="0.8" strokeDasharray="2.3 1.3" vectorEffect="non-scaling-stroke" opacity="0.9" />
        <line x1={last.x} y1={last.y} x2="50" y2="80" stroke="#1f8994" strokeWidth="0.45" strokeDasharray="1.6 1.3" vectorEffect="non-scaling-stroke" opacity="0.55" />
      </svg>
      <div className="absolute left-[50%] top-[80%] -translate-x-1/2 -translate-y-1/2"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border-4 border-white bg-[#193d4c] text-white shadow-[0_5px_15px_rgba(23,61,76,.28)]"><Truck size={18} /></div><span className="absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#193d4c] px-2 py-1 text-[10px] font-bold text-white">Depósito</span></div>
      {orders.map((order, index) => {
        const activeIndex = routeOrderIds.indexOf(order.id);
        const active = activeIndex >= 0;
        return <div key={order.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${order.point.x}%`, top: `${order.point.y}%` }}>
          <div className={`relative flex h-9 w-9 items-center justify-center rounded-full border-4 border-white shadow-[0_5px_12px_rgba(29,88,99,.2)] transition-all ${active ? "bg-[#efb741] text-[#574112]" : "bg-[#92b8bc] text-white opacity-65"}`}><MapPin size={15} fill="currentColor" strokeWidth={1.5} />{active && <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#193d4c] text-[9px] font-bold text-white">{activeIndex + 1}</span>}</div>
          <span className="absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#3d5961] shadow-sm">{order.client}</span>
        </div>;
      })}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl bg-white/88 px-3 py-2 text-[10px] text-[#718087] shadow-sm backdrop-blur"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#efb741]" /> parada selecionada</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#92b8bc]" /> não incluída</span></div>
    </div>
  );
}

function OrderRow({ order, selected, onToggle }: { order: Order; selected: boolean; onToggle: () => void }) {
  return <div className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#edf0f1] px-5 py-4 text-sm last:border-0 md:grid-cols-[28px_1.35fr_1fr_90px_100px] ${selected ? "bg-[#f4fbfa]" : "bg-white"}`}>
    <button onClick={onToggle} className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${selected ? "border-[#248c91] bg-[#248c91] text-white" : "border-[#cbd5d8] bg-white text-transparent"}`} aria-label={`Selecionar ${order.code}`}><Check size={13} strokeWidth={3} /></button>
    <div className="min-w-0"><div className="flex items-center gap-2"><span className="font-semibold text-[#263a44]">{order.code}</span>{order.priority === "Alta" && <span className="rounded-full bg-[#fff2cf] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#9b7620]">prioridade</span>}</div><p className="mt-1 truncate text-xs text-[#849097]">{order.client} · {order.address}</p></div>
    <div className="hidden md:block"><p className="font-medium text-[#40535b]">{order.zone}</p><p className="mt-1 text-xs text-[#89969b]">{order.weight} kg · {formatKm(order.distance)} km</p></div>
    <span className={`w-fit whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(order.status)}`}>{order.status}</span>
    <span className="hidden text-right text-xs font-medium text-[#718087] md:block">{order.window}</span>
  </div>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[18px] border border-dashed border-[#d8e1e3] bg-[#fbfcfc] p-8 text-center"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f4f3] text-[#278b91]"><Package size={20} /></div><h3 className="font-display text-lg font-semibold text-[#30434c]">{title}</h3><p className="mt-1 max-w-xs text-sm text-[#849097]">{body}</p></div>;
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [orders, setOrders] = useState(initialOrders);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedIds, setSelectedIds] = useState<string[]>(["o1", "o3", "o4", "o5"]);
  const [routeGenerated, setRouteGenerated] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [search, setSearch] = useState("");
  const [newOrder, setNewOrder] = useState({ client: "", address: "", weight: "" });
  const [newVehicle, setNewVehicle] = useState({ name: "", plate: "", capacity: "" });

  const selectedOrders = useMemo(() => orders.filter((order) => selectedIds.includes(order.id)), [orders, selectedIds]);
  const route = useMemo(() => routeForOrders(selectedOrders.length ? selectedOrders : orders), [selectedOrders, orders]);
  const routeOrderIds = routeGenerated ? route.ordered.map((order) => order.id) : [];
  const filteredOrders = orders.filter((order) => `${order.code} ${order.client} ${order.zone}`.toLowerCase().includes(search.toLowerCase()));
  const totalLoad = vehicles.reduce((sum, vehicle) => sum + vehicle.load, 0);
  const totalCapacity = vehicles.reduce((sum, vehicle) => sum + vehicle.capacity, 0);

  const toggleOrder = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const generateRoute = () => {
    setRouteGenerated(false);
    window.setTimeout(() => { setRouteGenerated(true); toast.success("Rota recalculada", { description: `${route.ordered.length} paradas organizadas pelo menor custo estimado.` }); }, 260);
  };
  const addOrder = () => {
    if (!newOrder.client || !newOrder.address || !newOrder.weight) { toast.error("Preencha cliente, endereço e peso."); return; }
    const order: Order = { id: `o${Date.now()}`, code: `RF-${2053 + orders.length}`, client: newOrder.client, address: newOrder.address, zone: "Nova região", weight: Number(newOrder.weight), distance: 7.4, window: "09:00 — 12:00", status: "Pendente", priority: "Normal", point: { x: 27 + Math.random() * 52, y: 25 + Math.random() * 48 } };
    setOrders((current) => [...current, order]); setSelectedIds((current) => [...current, order.id]); setNewOrder({ client: "", address: "", weight: "" }); setShowOrderForm(false); toast.success("Pedido adicionado à operação");
  };
  const addVehicle = () => {
    if (!newVehicle.name || !newVehicle.plate || !newVehicle.capacity) { toast.error("Preencha identificação e capacidade."); return; }
    setVehicles((current) => [...current, { id: `v${Date.now()}`, name: newVehicle.name, plate: newVehicle.plate, type: "Novo veículo", capacity: Number(newVehicle.capacity), load: 0, status: "Disponível", color: "#6d8c9f" }]); setNewVehicle({ name: "", plate: "", capacity: "" }); setShowVehicleForm(false); toast.success("Veículo adicionado à frota");
  };

  return <div className="min-h-screen bg-[#f6f8f8] text-[#263a44]">
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e1e7e8] bg-[#fbfcfc]/95 px-5 backdrop-blur md:px-8">
      <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#193d4c] text-[#d8a52d] shadow-sm"><Navigation size={18} strokeWidth={2.4} /></div><div><span className="font-display text-[20px] font-semibold tracking-[-0.04em] text-[#193d4c]">route<span className="text-[#d29628]">flow</span></span><span className="ml-2 hidden rounded-full bg-[#e5f2f2] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#278b91] sm:inline">operations</span></div></div>
      <div className="flex items-center gap-3"><div className="hidden items-center gap-2 text-right sm:flex"><p className="text-xs font-semibold text-[#40545d]">Translog Express</p><p className="text-[10px] text-[#8a969b]">Unidade São Paulo · SP</p></div><button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#e0e7e8] bg-white text-[#66767e] transition-colors hover:bg-[#f0f6f6]"><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e1a62b]" /></button><button onClick={() => startLogin()} className="hidden h-9 items-center gap-2 rounded-xl bg-[#193d4c] px-3 text-xs font-semibold text-white transition-transform active:scale-[.97] sm:flex"><UserRound size={14} /> Acessar conta</button><button className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#193d4c] text-white sm:hidden"><Menu size={17} /></button></div>
    </header>
    <div className="mx-auto flex max-w-[1500px]">
      <aside className="hidden w-[230px] shrink-0 border-r border-[#e5eaeb] bg-[#fbfcfc] px-4 py-7 lg:block"><div className="mb-8 px-3"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a0aaae]">Workspace</p><p className="mt-2 text-sm font-semibold text-[#334953]">Central de operações</p></div><nav className="space-y-1">{navItems.map((item) => { const Icon = item.icon; const active = item.view === view; return <button key={item.view} onClick={() => setView(item.view)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition-all ${active ? "bg-[#e8f4f3] text-[#167782] shadow-sm" : "text-[#77858b] hover:bg-[#f1f5f5] hover:text-[#354c56]"}`}><Icon size={17} strokeWidth={active ? 2.2 : 1.7} />{item.label}{active && <ChevronRight className="ml-auto" size={14} />}</button>; })}</nav><div className="my-7 h-px bg-[#e6ecec]" /><button onClick={() => toast.info("Integrações estarão disponíveis na próxima versão.")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium text-[#77858b] transition-colors hover:bg-[#f1f5f5]"><Settings2 size={17} />Configurações</button><button onClick={() => toast.info("Central de ajuda RouteFlow") } className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium text-[#77858b] transition-colors hover:bg-[#f1f5f5]"><CircleHelp size={17} />Ajuda</button><div className="mt-20 rounded-2xl bg-[#193d4c] p-4 text-white"><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-[#e4a72c] text-[#193d4c]"><Zap size={15} fill="currentColor" /></div><p className="text-sm font-semibold">Operação mais leve</p><p className="mt-1 text-[11px] leading-relaxed text-[#bed0d3]">Selecione seus pedidos e deixe o RouteFlow encontrar a melhor sequência.</p></div></aside>
      <main className="min-w-0 flex-1 px-5 py-7 md:px-8 md:py-9">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#829096]"><span>Terça-feira, 15 de setembro de 2026</span><span className="h-1 w-1 rounded-full bg-[#d3a33a]" /><span>07:42 BRT</span></div><h1 className="font-display text-[32px] font-semibold tracking-[-0.055em] text-[#243a45] md:text-[38px]">Bom dia, equipe <span className="text-[#1d8991]">Translog.</span></h1><p className="mt-1 text-sm text-[#7d8c92]">Aqui está o pulso da sua operação hoje.</p></div><div className="flex items-center gap-2"><button onClick={() => toast.success("Relatório preparado para download")} className="flex h-10 items-center gap-2 rounded-xl border border-[#dfe7e8] bg-white px-3.5 text-xs font-semibold text-[#5a6d75] shadow-sm transition-colors hover:bg-[#f4f8f8]"><Download size={15} /> Exportar</button><button onClick={() => { setView("orders"); setShowOrderForm(true); }} className="flex h-10 items-center gap-2 rounded-xl bg-[#d99e2c] px-4 text-xs font-bold text-[#3d2f11] shadow-[0_7px_18px_rgba(217,158,44,.2)] transition-transform hover:bg-[#e5aa37] active:scale-[.97]"><Plus size={15} strokeWidth={2.5} /> Novo pedido</button></div></div>
        {view === "overview" && <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Pedidos de hoje" value="24" detail="6 ainda aguardam despacho" trend="12,5%" icon={Package} tone="teal" /><MetricCard label="Em rota" value="08" detail="3 veículos ativos agora" icon={Navigation} tone="amber" /><MetricCard label="Distância planejada" value="482 km" detail="-8,4% vs. média semanal" trend="8,4%" icon={ArrowUpRight} tone="ink" /><MetricCard label="Entregas no prazo" value="96,2%" detail="Meta operacional: 95%" trend="2,1%" icon={Clock3} tone="coral" /></section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)]"><div className="rounded-[22px] border border-[#dfe7e8] bg-white p-5 shadow-[0_10px_30px_rgba(44,62,72,0.045)] md:p-6"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6f5f3] text-[#0d7489]"><Navigation size={16} /></span><h2 className="font-display text-[19px] font-semibold tracking-[-0.03em] text-[#2a414b]">Rota em planejamento</h2></div><p className="mt-2 text-xs text-[#849097]">{route.ordered.length} paradas selecionadas · Truck 01 · atualização em tempo real</p></div><button onClick={generateRoute} className="flex h-9 items-center justify-center gap-2 rounded-xl bg-[#193d4c] px-3.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#235264] active:scale-[.97]"><Zap size={14} fill="currentColor" /> Calcular melhor rota</button></div><RouteMap orders={orders} routeOrderIds={routeOrderIds} /><div className="mt-5 grid grid-cols-3 divide-x divide-[#e8eeee] rounded-2xl bg-[#f7faf9] py-3 text-center"><div><p className="font-display text-[21px] font-semibold text-[#2f505a]">{formatKm(route.distance)} km</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#89979c]">distância total</p></div><div><p className="font-display text-[21px] font-semibold text-[#2f505a]">{Math.floor(route.minutes / 60)}h{String(route.minutes % 60).padStart(2, "0")}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#89979c]">tempo estimado</p></div><div><p className="font-display text-[21px] font-semibold text-[#2f505a]">{route.ordered.length}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#89979c]">paradas</p></div></div></div>
            <div className="rounded-[22px] border border-[#dfe7e8] bg-white p-5 shadow-[0_10px_30px_rgba(44,62,72,0.045)] md:p-6"><div className="mb-5 flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f7f0dd] text-[#aa7923]"><Truck size={16} /></span><h2 className="font-display text-[19px] font-semibold tracking-[-0.03em] text-[#2a414b]">Status da frota</h2></div><p className="mt-2 text-xs text-[#849097]">{vehicles.length} veículos cadastrados</p></div><button onClick={() => setView("vehicles")} className="text-xs font-semibold text-[#21828b] hover:underline">Ver frota</button></div><div className="mb-5 flex items-center gap-4 rounded-2xl bg-[#f7faf9] p-4"><div className="relative flex h-20 w-20 items-center justify-center rounded-full" style={{ background: `conic-gradient(#288e8c ${(totalLoad / totalCapacity) * 100}%, #e3ecec 0)` }}><div className="flex h-[60px] w-[60px] flex-col items-center justify-center rounded-full bg-white"><span className="font-display text-lg font-semibold text-[#2e4e58]">{Math.round((totalLoad / totalCapacity) * 100)}%</span><span className="text-[9px] uppercase text-[#92a0a4]">ocupação</span></div></div><div><p className="text-sm font-semibold text-[#3a535c]">Capacidade utilizada</p><p className="mt-1 text-xs leading-relaxed text-[#849097]">{totalLoad.toLocaleString("pt-BR")} kg de {totalCapacity.toLocaleString("pt-BR")} kg disponíveis</p></div></div><div className="space-y-3">{vehicles.map((vehicle) => <div key={vehicle.id} className="flex items-center gap-3"><div className="h-2.5 w-2.5 rounded-full" style={{ background: vehicle.color }} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><span className="truncate text-xs font-semibold text-[#425861]">{vehicle.name}</span><span className="text-[10px] text-[#8b989d]">{vehicle.load} / {vehicle.capacity} kg</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf1f1]"><div className="h-full rounded-full" style={{ width: `${Math.min((vehicle.load / vehicle.capacity) * 100, 100)}%`, background: vehicle.color }} /></div></div></div>)}</div></div></section>
          <section className="mt-6 rounded-[22px] border border-[#dfe7e8] bg-white shadow-[0_10px_30px_rgba(44,62,72,0.045)]"><div className="flex flex-col justify-between gap-3 border-b border-[#edf0f1] px-5 py-5 sm:flex-row sm:items-center md:px-6"><div><h2 className="font-display text-[19px] font-semibold tracking-[-0.03em] text-[#2a414b]">Pedidos para despacho</h2><p className="mt-1 text-xs text-[#849097]">Selecione as entregas que farão parte da próxima rota.</p></div><button onClick={() => setView("orders")} className="flex items-center gap-1 text-xs font-semibold text-[#21828b]">Ver todos <ChevronRight size={14} /></button></div><div className="hidden grid-cols-[28px_1.35fr_1fr_90px_100px] gap-3 border-b border-[#edf0f1] px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#a0aaae] md:grid"><span /><span>Pedido / cliente</span><span>Região</span><span>Status</span><span className="text-right">Janela</span></div>{orders.slice(0, 4).map((order) => <OrderRow key={order.id} order={order} selected={selectedIds.includes(order.id)} onToggle={() => toggleOrder(order.id)} />)}</section>
        </>}
        {view === "orders" && <section className="rounded-[22px] border border-[#dfe7e8] bg-white shadow-[0_10px_30px_rgba(44,62,72,0.045)]"><div className="flex flex-col justify-between gap-4 border-b border-[#edf0f1] px-5 py-5 md:flex-row md:items-center md:px-6"><div><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f5f3] text-[#0d7489]"><Package size={17} /></span><div><h2 className="font-display text-[20px] font-semibold tracking-[-0.03em] text-[#2a414b]">Todos os pedidos</h2><p className="mt-1 text-xs text-[#849097]">{orders.length} pedidos na operação</p></div></div></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa6aa]" size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar pedido..." className="h-10 w-full rounded-xl border border-[#e0e7e8] bg-[#fbfcfc] pl-9 pr-3 text-xs outline-none transition-colors placeholder:text-[#aab4b7] focus:border-[#7eb6b8] sm:w-52" /></div><button onClick={() => setShowOrderForm(true)} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#d99e2c] px-3.5 text-xs font-bold text-[#3d2f11]"><Plus size={15} /> Novo pedido</button></div></div><div className="hidden grid-cols-[28px_1.35fr_1fr_90px_100px] gap-3 border-b border-[#edf0f1] px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#a0aaae] md:grid"><span /><span>Pedido / cliente</span><span>Região</span><span>Status</span><span className="text-right">Janela</span></div>{filteredOrders.length ? filteredOrders.map((order) => <OrderRow key={order.id} order={order} selected={selectedIds.includes(order.id)} onToggle={() => toggleOrder(order.id)} />) : <div className="p-6"><EmptyState title="Nenhum pedido encontrado" body="Tente buscar por código, cliente ou região." /></div>}</section>}
        {view === "vehicles" && <section><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#829096]"><Truck size={14} /> Base de veículos</div><h2 className="font-display text-[32px] font-semibold tracking-[-0.05em] text-[#243a45]">Sua frota, em movimento.</h2><p className="mt-1 text-sm text-[#7d8c92]">Acompanhe disponibilidade, capacidade e utilização.</p></div><button onClick={() => setShowVehicleForm(true)} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#d99e2c] px-4 text-xs font-bold text-[#3d2f11]"><Plus size={15} /> Adicionar veículo</button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{vehicles.map((vehicle) => <article key={vehicle.id} className="rounded-[20px] border border-[#dfe7e8] bg-white p-5 shadow-[0_10px_30px_rgba(44,62,72,0.045)]"><div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ background: vehicle.color }}><Truck size={20} /></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(vehicle.status)}`}>{vehicle.status}</span></div><h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.03em] text-[#304750]">{vehicle.name}</h3><p className="mt-1 text-xs text-[#849097]">{vehicle.type} · {vehicle.plate}</p><div className="mt-5 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#a0aaae]">Carga atual</p><p className="mt-1 font-display text-2xl font-semibold text-[#304750]">{vehicle.load} <span className="text-sm font-medium text-[#8b989d]">kg</span></p></div><p className="text-xs font-semibold text-[#718087]">de {vehicle.capacity} kg</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1f1]"><div className="h-full rounded-full" style={{ width: `${Math.min((vehicle.load / vehicle.capacity) * 100, 100)}%`, background: vehicle.color }} /></div><div className="mt-4 flex items-center justify-between border-t border-[#edf0f1] pt-4 text-[11px] text-[#849097]"><span>Utilização</span><span className="font-semibold text-[#4a6068]">{Math.round((vehicle.load / vehicle.capacity) * 100)}%</span></div></article>)}</div></section>}
      </main>
    </div>
    {showOrderForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173640]/30 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-[24px] border border-[#dfe7e8] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#21828b]">Novo pedido</p><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-.04em] text-[#2a414b]">Adicionar entrega</h2><p className="mt-1 text-xs text-[#849097]">O pedido entra como pendente e pode ser incluído na próxima rota.</p></div><button onClick={() => setShowOrderForm(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8b989d] hover:bg-[#f1f5f5]"><X size={17} /></button></div><div className="mt-6 space-y-4"><label className="block text-xs font-semibold text-[#54666e]">Cliente<input value={newOrder.client} onChange={(event) => setNewOrder({ ...newOrder, client: event.target.value })} placeholder="Ex.: Mercado Aurora" className="mt-2 h-11 w-full rounded-xl border border-[#dfe7e8] px-3 text-sm outline-none focus:border-[#66aeb1]" /></label><label className="block text-xs font-semibold text-[#54666e]">Endereço de entrega<input value={newOrder.address} onChange={(event) => setNewOrder({ ...newOrder, address: event.target.value })} placeholder="Rua, número e bairro" className="mt-2 h-11 w-full rounded-xl border border-[#dfe7e8] px-3 text-sm outline-none focus:border-[#66aeb1]" /></label><label className="block text-xs font-semibold text-[#54666e]">Peso da carga (kg)<input value={newOrder.weight} onChange={(event) => setNewOrder({ ...newOrder, weight: event.target.value })} type="number" placeholder="0" className="mt-2 h-11 w-full rounded-xl border border-[#dfe7e8] px-3 text-sm outline-none focus:border-[#66aeb1]" /></label></div><button onClick={addOrder} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#193d4c] text-sm font-semibold text-white hover:bg-[#235264]"><Check size={16} /> Salvar pedido</button></div></div>}
    {showVehicleForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173640]/30 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-[24px] border border-[#dfe7e8] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#21828b]">Nova frota</p><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-.04em] text-[#2a414b]">Adicionar veículo</h2></div><button onClick={() => setShowVehicleForm(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8b989d] hover:bg-[#f1f5f5]"><X size={17} /></button></div><div className="mt-6 space-y-4"><label className="block text-xs font-semibold text-[#54666e]">Nome<input value={newVehicle.name} onChange={(event) => setNewVehicle({ ...newVehicle, name: event.target.value })} placeholder="Ex.: Van 04" className="mt-2 h-11 w-full rounded-xl border border-[#dfe7e8] px-3 text-sm outline-none focus:border-[#66aeb1]" /></label><label className="block text-xs font-semibold text-[#54666e]">Placa<input value={newVehicle.plate} onChange={(event) => setNewVehicle({ ...newVehicle, plate: event.target.value })} placeholder="ABC-1D23" className="mt-2 h-11 w-full rounded-xl border border-[#dfe7e8] px-3 text-sm outline-none focus:border-[#66aeb1]" /></label><label className="block text-xs font-semibold text-[#54666e]">Capacidade (kg)<input value={newVehicle.capacity} onChange={(event) => setNewVehicle({ ...newVehicle, capacity: event.target.value })} type="number" placeholder="0" className="mt-2 h-11 w-full rounded-xl border border-[#dfe7e8] px-3 text-sm outline-none focus:border-[#66aeb1]" /></label></div><button onClick={addVehicle} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#193d4c] text-sm font-semibold text-white hover:bg-[#235264]"><Check size={16} /> Salvar veículo</button></div></div>}
  </div>;
}
