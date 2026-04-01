
import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// ─── DATOS INICIALES ────────────────────────────────────────────────────────
const PRODUCTOS_INICIALES = [
  { id: 1, nombre: "Coca-Cola 600ml", categoria: "Bebidas", precio: 18, stock: 48, costo: 12, codigo: "COC600" },
  { id: 2, nombre: "Sabritas Original", categoria: "Botanas", precio: 22, stock: 30, costo: 14, codigo: "SAB001" },
  { id: 3, nombre: "Pan Bimbo Blanco", categoria: "Panadería", precio: 34, stock: 15, costo: 25, codigo: "PAN001" },
  { id: 4, nombre: "Leche Lala 1L", categoria: "Lácteos", precio: 28, stock: 20, costo: 20, codigo: "LAC001" },
  { id: 5, nombre: "Huevo Blanco (kg)", categoria: "Frescos", precio: 45, stock: 25, costo: 35, codigo: "HUE001" },
  { id: 6, nombre: "Agua Bonafont 1.5L", categoria: "Bebidas", precio: 16, stock: 60, costo: 10, codigo: "AGU001" },
  { id: 7, nombre: "Frijoles La Sierra", categoria: "Abarrotes", precio: 32, stock: 18, costo: 22, codigo: "FRI001" },
  { id: 8, nombre: "Arroz Morelos 1kg", categoria: "Abarrotes", precio: 24, stock: 22, costo: 16, codigo: "ARR001" },
  { id: 9, nombre: "Jabón Zote", categoria: "Limpieza", precio: 14, stock: 35, costo: 9, codigo: "JAB001" },
  { id: 10, nombre: "Tortillas 1kg", categoria: "Frescos", precio: 22, stock: 10, costo: 16, codigo: "TOR001" },
  { id: 11, nombre: "Azúcar 1kg", categoria: "Abarrotes", precio: 26, stock: 18, costo: 18, codigo: "AZU001" },
  { id: 12, nombre: "Pepsi 600ml", categoria: "Bebidas", precio: 17, stock: 40, costo: 11, codigo: "PEP600" },
];

const USUARIOS_INICIALES = [
  { id: 1, nombre: "Admin Principal", usuario: "admin", password: "admin123", rol: "admin", activo: true },
  { id: 2, nombre: "Juan Cajero", usuario: "cajero1", password: "caj123", rol: "cajero", activo: true },
];

function generarVentasEjemplo() {
  const ventas = [];
  const ahora = new Date();
  let idVenta = 1;
  for (let d = 6; d >= 0; d--) {
    const fecha = new Date(ahora);
    fecha.setDate(ahora.getDate() - d);
    const numVentas = 3 + Math.floor(Math.random() * 5);
    for (let v = 0; v < numVentas; v++) {
      const items = [];
      const numItems = 1 + Math.floor(Math.random() * 4);
      let total = 0;
      for (let i = 0; i < numItems; i++) {
        const prod = PRODUCTOS_INICIALES[Math.floor(Math.random() * PRODUCTOS_INICIALES.length)];
        const cant = 1 + Math.floor(Math.random() * 3);
        items.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: cant });
        total += prod.precio * cant;
      }
      ventas.push({
        id: idVenta++,
        items,
        total,
        pago: total + Math.floor(Math.random() * 50),
        cambio: 0,
        fecha: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 8 + v * 2, Math.floor(Math.random() * 60)).toISOString(),
        cajero: "cajero1",
      });
    }
  }
  return ventas;
}

// ─── ESTILOS GLOBALES ────────────────────────────────────────────────────────
const G = {
  bg: "#0d0f14",
  surface: "#13161e",
  card: "#1a1e2a",
  border: "#252a38",
  accent: "#f59e0b",
  accentDim: "#78450a",
  accentGlow: "rgba(245,158,11,0.15)",
  text: "#e8eaf0",
  textMuted: "#7a8099",
  textDim: "#4a5068",
  success: "#22c55e",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#8b5cf6",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${G.bg};color:${G.text};font-family:'Syne',sans-serif;overflow:hidden}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:${G.surface}}
  ::-webkit-scrollbar-thumb{background:${G.border};border-radius:2px}
  input,select,textarea{font-family:'Syne',sans-serif;outline:none}
  button{font-family:'Syne',sans-serif;cursor:pointer;border:none;outline:none}
  .mono{font-family:'JetBrains Mono',monospace}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
  @keyframes ripple{0%{transform:scale(0);opacity:.4}100%{transform:scale(2.5);opacity:0}}
  .fade-in{animation:fadeIn .25s ease both}
  .slide-in{animation:slideIn .2s ease both}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toFixed(2)}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
const today = () => new Date().toDateString();

// ─── COMPONENTES UI ──────────────────────────────────────────────────────────
function Badge({ color = G.accent, children, small }) {
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: small ? "1px 6px" : "2px 8px", fontSize: small ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, style: sx, icon }) {
  const variants = {
    primary: { bg: G.accent, color: "#000", hov: "#fbbf24" },
    ghost: { bg: "transparent", color: G.text, hov: G.card, border: G.border },
    danger: { bg: G.danger, color: "#fff", hov: "#dc2626" },
    success: { bg: G.success, color: "#000", hov: "#16a34a" },
    outline: { bg: "transparent", color: G.accent, hov: G.accentGlow, border: G.accent },
  };
  const v = variants[variant] || variants.primary;
  const sizes = { sm: { px: 10, py: 5, fs: 12 }, md: { px: 16, py: 9, fs: 13 }, lg: { px: 22, py: 12, fs: 15 } };
  const s = sizes[size] || sizes.md;
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: hov && !disabled ? v.hov : v.bg, color: v.color, padding: `${s.py}px ${s.px}px`, borderRadius: 6, fontSize: s.fs, fontWeight: 700, border: v.border ? `1px solid ${v.border}` : "none", opacity: disabled ? 0.4 : 1, transition: "all .15s", letterSpacing: "0.02em", ...sx }}>
      {icon && <span style={{ fontSize: s.fs + 2 }}>{icon}</span>}
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, prefix, suffix, error, autoFocus, onKeyDown, readOnly, style: sx }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
      <div style={{ display: "flex", alignItems: "center", background: G.card, border: `1px solid ${error ? G.danger : G.border}`, borderRadius: 6, overflow: "hidden" }}>
        {prefix && <span style={{ padding: "0 10px", color: G.textMuted, fontSize: 13, borderRight: `1px solid ${G.border}`, whiteSpace: "nowrap" }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          readOnly={readOnly}
          style={{ flex: 1, background: "transparent", border: "none", color: G.text, padding: "9px 12px", fontSize: 13, ...sx }}
        />
        {suffix && <span style={{ padding: "0 10px", color: G.textMuted, fontSize: 13, borderLeft: `1px solid ${G.border}`, whiteSpace: "nowrap" }}>{suffix}</span>}
      </div>
      {error && <span style={{ fontSize: 11, color: G.danger }}>{error}</span>}
    </div>
  );
}

function Modal({ open, title, onClose, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fade-in" style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 10, width, maxWidth: "95vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${G.border}` }}>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.02em" }}>{title}</span>
          <button onClick={onClose} style={{ background: G.card, border: `1px solid ${G.border}`, color: G.textMuted, borderRadius: 4, width: 28, height: 28, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = G.accent, trend }) {
  return (
    <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: 16, top: 16, fontSize: 28, opacity: 0.12 }}>{icon}</div>
      <span style={{ fontSize: 11, fontWeight: 700, color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <span className="mono" style={{ fontSize: 26, fontWeight: 700, color }}>{value}</span>
      {trend !== undefined && (
        <span style={{ fontSize: 11, color: trend >= 0 ? G.success : G.danger }}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs ayer
        </span>
      )}
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function Login({ usuarios, onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);

  const handle = () => {
    const u = usuarios.find((x) => x.usuario === user && x.password === pass && x.activo);
    if (u) onLogin(u);
    else { setErr(true); setTimeout(() => setErr(false), 600); }
  };

  return (
    <div style={{ height: "100vh", background: G.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 32 }}>
      <style>{css}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏪</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: G.accent, letterSpacing: "-0.02em" }}>TiendaPOS</h1>
        <p style={{ color: G.textMuted, fontSize: 13, marginTop: 4 }}>Sistema de punto de venta</p>
      </div>
      <div className={err ? "" : "fade-in"} style={{ background: G.surface, border: `1px solid ${err ? G.danger : G.border}`, borderRadius: 10, padding: 28, width: 340, animation: err ? "shake .3s ease" : undefined, display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Usuario" value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin" autoFocus prefix="👤" />
        <Input label="Contraseña" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••" prefix="🔑" onKeyDown={(e) => e.key === "Enter" && handle()} />
        {err && <p style={{ color: G.danger, fontSize: 12, textAlign: "center" }}>❌ Credenciales incorrectas</p>}
        <Btn onClick={handle} size="lg" style={{ width: "100%", justifyContent: "center" }}>Ingresar →</Btn>
        <div style={{ background: G.card, borderRadius: 6, padding: "10px 14px", fontSize: 11, color: G.textMuted }}>
          <b style={{ color: G.textDim }}>Demo:</b> admin/admin123 · cajero1/caj123
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "pos", icon: "🛒", label: "Caja", rol: ["admin", "cajero"] },
  { id: "inventario", icon: "📦", label: "Inventario", rol: ["admin"] },
  { id: "reportes", icon: "📊", label: "Reportes", rol: ["admin"] },
  { id: "usuarios", icon: "👥", label: "Usuarios", rol: ["admin"] },
];

function Sidebar({ view, setView, user, onLogout }) {
  const items = NAV.filter((n) => n.rol.includes(user.rol));
  return (
    <div style={{ width: 64, background: G.surface, borderRight: `1px solid ${G.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 4, flexShrink: 0 }}>
      <div style={{ fontSize: 22, marginBottom: 12, padding: 8 }}>🏪</div>
      {items.map((item) => {
        const active = view === item.id;
        return (
          <button key={item.id} onClick={() => setView(item.id)} title={item.label}
            style={{ width: 48, height: 48, borderRadius: 8, border: "none", background: active ? G.accentGlow : "transparent", color: active ? G.accent : G.textMuted, fontSize: 20, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "all .15s", borderLeft: active ? `2px solid ${G.accent}` : "2px solid transparent" }}>
            <span>{item.icon}</span>
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: G.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: G.accent, fontWeight: 800 }}>
          {user.nombre[0]}
        </div>
        <button onClick={onLogout} title="Salir" style={{ background: "transparent", border: "none", color: G.textMuted, fontSize: 18, cursor: "pointer" }}>⏏</button>
      </div>
    </div>
  );
}

// ─── VISTA POS ────────────────────────────────────────────────────────────────
function PosCategorias({ productos, categoriaActiva, setCategoriaActiva }) {
  const cats = ["Todas", ...new Set(productos.map((p) => p.categoria))];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
      {cats.map((c) => (
        <button key={c} onClick={() => setCategoriaActiva(c)}
          style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${categoriaActiva === c ? G.accent : G.border}`, background: categoriaActiva === c ? G.accentGlow : "transparent", color: categoriaActiva === c ? G.accent : G.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .15s" }}>
          {c}
        </button>
      ))}
    </div>
  );
}

function ViewPOS({ productos, setProductos, ventas, setVentas, user }) {
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [pago, setPago] = useState("");
  const [modalTicket, setModalTicket] = useState(null);
  const [modalPago, setModalPago] = useState(false);

  const productosFiltrados = productos.filter((p) => {
    const matchCat = categoria === "Todas" || p.categoria === categoria;
    const matchBus = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBus && p.stock > 0;
  });

  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const cambio = parseFloat(pago || 0) - total;

  const agregarAlCarrito = (prod) => {
    setCarrito((prev) => {
      const ex = prev.find((i) => i.id === prod.id);
      if (ex) {
        if (ex.cantidad >= prod.stock) return prev;
        return prev.map((i) => i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...prod, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) => prev.map((i) => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i));
  };

  const eliminarItem = (id) => setCarrito((prev) => prev.filter((i) => i.id !== id));

  const procesarVenta = () => {
    if (carrito.length === 0 || cambio < 0) return;
    const venta = {
      id: Date.now(),
      items: carrito.map((i) => ({ id: i.id, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad })),
      total,
      pago: parseFloat(pago),
      cambio,
      fecha: new Date().toISOString(),
      cajero: user.usuario,
    };
    setVentas((prev) => [...prev, venta]);
    setProductos((prev) => prev.map((p) => {
      const item = carrito.find((i) => i.id === p.id);
      return item ? { ...p, stock: p.stock - item.cantidad } : p;
    }));
    setModalTicket(venta);
    setCarrito([]);
    setPago("");
    setModalPago(false);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Panel productos */}
      <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto o código..." prefix="🔍" style={{ flex: 1 }} />
        </div>
        <PosCategorias productos={productos} categoriaActiva={categoria} setCategoriaActiva={setCategoria} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8 }}>
          {productosFiltrados.map((p) => (
            <button key={p.id} onClick={() => agregarAlCarrito(p)}
              style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "12px 10px", cursor: "pointer", textAlign: "left", transition: "all .15s", display: "flex", flexDirection: "column", gap: 4 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.background = G.accentGlow; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.background = G.card; }}>
              <span style={{ fontSize: 10, color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.categoria}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: G.text, lineHeight: 1.3 }}>{p.nombre}</span>
              <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: G.accent, marginTop: 4 }}>{fmt(p.precio)}</span>
              <span style={{ fontSize: 10, color: p.stock < 5 ? G.danger : G.textMuted }}>Stock: {p.stock}</span>
            </button>
          ))}
          {productosFiltrados.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: G.textMuted, padding: 40, fontSize: 13 }}>
              🔍 Sin resultados para "{busqueda}"
            </div>
          )}
        </div>
      </div>

      {/* Panel carrito */}
      <div style={{ width: 300, background: G.surface, borderLeft: `1px solid ${G.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>🛒 Carrito</span>
          {carrito.length > 0 && <Btn size="sm" variant="ghost" onClick={() => setCarrito([])}>Limpiar</Btn>}
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
          {carrito.length === 0 ? (
            <div style={{ textAlign: "center", color: G.textMuted, padding: "40px 20px", fontSize: 13 }}>
              Selecciona productos del catálogo
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="slide-in" style={{ padding: "8px 14px", borderBottom: `1px solid ${G.border}`, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, flex: 1, paddingRight: 8 }}>{item.nombre}</span>
                  <button onClick={() => eliminarItem(item.id)} style={{ background: "none", border: "none", color: G.danger, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => cambiarCantidad(item.id, -1)} style={{ background: G.card, border: `1px solid ${G.border}`, color: G.text, width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.id, 1)} style={{ background: G.card, border: `1px solid ${G.border}`, color: G.text, width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: G.accent }}>{fmt(item.precio * item.cantidad)}</span>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Total y pago */}
        <div style={{ padding: 14, borderTop: `1px solid ${G.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: G.textMuted, fontSize: 12 }}>{carrito.reduce((s, i) => s + i.cantidad, 0)} productos</span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 800, color: G.accent }}>{fmt(total)}</span>
          </div>
          <Btn onClick={() => setModalPago(true)} disabled={carrito.length === 0} size="lg" style={{ width: "100%", justifyContent: "center" }} icon="💳">Cobrar</Btn>
        </div>
      </div>

      {/* Modal pago */}
      <Modal open={modalPago} title="💳 Procesar Pago" onClose={() => setModalPago(false)} width={360}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: G.card, borderRadius: 8, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: G.textMuted, marginBottom: 4 }}>TOTAL A COBRAR</div>
            <div className="mono" style={{ fontSize: 36, fontWeight: 800, color: G.accent }}>{fmt(total)}</div>
            <div style={{ fontSize: 12, color: G.textMuted, marginTop: 4 }}>{carrito.reduce((s, i) => s + i.cantidad, 0)} artículos</div>
          </div>
          <Input label="Pago del cliente" type="number" value={pago} onChange={(e) => setPago(e.target.value)} prefix="$" placeholder="0.00" autoFocus onKeyDown={(e) => e.key === "Enter" && cambio >= 0 && procesarVenta()} />
          {pago && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: cambio >= 0 ? G.success + "22" : G.danger + "22", borderRadius: 6, border: `1px solid ${cambio >= 0 ? G.success + "44" : G.danger + "44"}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: cambio >= 0 ? G.success : G.danger }}>CAMBIO</span>
              <span className="mono" style={{ fontSize: 20, fontWeight: 800, color: cambio >= 0 ? G.success : G.danger }}>{fmt(Math.max(0, cambio))}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setModalPago(false)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            <Btn onClick={procesarVenta} disabled={!pago || cambio < 0} style={{ flex: 1, justifyContent: "center" }} icon="✅">Confirmar</Btn>
          </div>
        </div>
      </Modal>

      {/* Modal ticket */}
      <Modal open={!!modalTicket} title="🧾 Ticket de Venta" onClose={() => setModalTicket(null)} width={340}>
        {modalTicket && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, background: G.card, borderRadius: 6, padding: 16, lineHeight: 1.8 }}>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>🏪 TIENDAPOS</div>
                <div style={{ color: G.textMuted, fontSize: 11 }}>{fmtDate(modalTicket.fecha)} {fmtTime(modalTicket.fecha)}</div>
                <div style={{ color: G.textMuted, fontSize: 11 }}>Ticket #{modalTicket.id}</div>
              </div>
              <div style={{ borderTop: `1px dashed ${G.border}`, borderBottom: `1px dashed ${G.border}`, padding: "8px 0", margin: "8px 0" }}>
                {modalTicket.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: G.textMuted }}>{item.nombre}</span>
                    <span style={{ color: G.textMuted }}>{item.cantidad}x</span>
                    <span>{fmt(item.precio * item.cantidad)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 14 }}>
                <span>TOTAL</span><span style={{ color: G.accent }}>{fmt(modalTicket.total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>PAGO</span><span>{fmt(modalTicket.pago)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>CAMBIO</span><span style={{ color: G.success }}>{fmt(modalTicket.cambio)}</span>
              </div>
              <div style={{ textAlign: "center", marginTop: 8, color: G.textMuted, fontSize: 11 }}>¡Gracias por su compra!</div>
            </div>
            <Btn onClick={() => setModalTicket(null)} style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>Cerrar</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── VISTA INVENTARIO ─────────────────────────────────────────────────────────
function ViewInventario({ productos, setProductos }) {
  const [busqueda, setBusqueda] = useState("");
  const [modalForm, setModalForm] = useState(null);
  const [modalStock, setModalStock] = useState(null);
  const [form, setForm] = useState({});
  const [stockDelta, setStockDelta] = useState("");
  const [stockTipo, setStockTipo] = useState("entrada");

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirNuevo = () => {
    setForm({ nombre: "", categoria: "", precio: "", costo: "", stock: "", codigo: "" });
    setModalForm("nuevo");
  };

  const abrirEditar = (p) => {
    setForm({ ...p });
    setModalForm("editar");
  };

  const guardar = () => {
    if (!form.nombre || !form.precio || !form.codigo) return;
    if (modalForm === "nuevo") {
      setProductos((prev) => [...prev, { ...form, id: Date.now(), precio: +form.precio, costo: +form.costo, stock: +form.stock }]);
    } else {
      setProductos((prev) => prev.map((p) => p.id === form.id ? { ...form, precio: +form.precio, costo: +form.costo, stock: +form.stock } : p));
    }
    setModalForm(null);
  };

  const eliminar = (id) => {
    if (confirm("¿Eliminar este producto?")) setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const ajustarStock = () => {
    const delta = parseInt(stockDelta);
    if (!delta) return;
    setProductos((prev) => prev.map((p) => p.id === modalStock.id ? { ...p, stock: Math.max(0, p.stock + (stockTipo === "entrada" ? delta : -delta)) } : p));
    setModalStock(null);
    setStockDelta("");
  };

  const stockTotal = productos.reduce((s, p) => s + p.stock, 0);
  const valorTotal = productos.reduce((s, p) => s + p.stock * p.costo, 0);
  const bajoStock = productos.filter((p) => p.stock < 5).length;

  return (
    <div style={{ padding: 20, overflow: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
        <StatCard label="Productos" value={productos.length} icon="📦" />
        <StatCard label="Unidades totales" value={stockTotal} icon="🔢" color={G.info} />
        <StatCard label="Valor inventario" value={fmt(valorTotal)} icon="💰" color={G.success} />
        <StatCard label="Bajo stock" value={bajoStock} icon="⚠️" color={bajoStock > 0 ? G.danger : G.success} />
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." prefix="🔍" style={{ maxWidth: 280 }} />
        <div style={{ flex: 1 }} />
        <Btn onClick={abrirNuevo} icon="➕">Nuevo Producto</Btn>
      </div>

      {/* Tabla */}
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: G.surface, borderBottom: `1px solid ${G.border}` }}>
              {["Código", "Producto", "Categoría", "Precio", "Costo", "Stock", "Acciones"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p) => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${G.border}` }}
                onMouseEnter={(e) => e.currentTarget.style.background = G.surface}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px" }}><span className="mono" style={{ fontSize: 11, color: G.textMuted }}>{p.codigo}</span></td>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}>{p.nombre}</td>
                <td style={{ padding: "10px 14px" }}><Badge>{p.categoria}</Badge></td>
                <td style={{ padding: "10px 14px" }}><span className="mono" style={{ color: G.accent, fontWeight: 700 }}>{fmt(p.precio)}</span></td>
                <td style={{ padding: "10px 14px" }}><span className="mono" style={{ color: G.textMuted }}>{fmt(p.costo)}</span></td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="mono" style={{ fontWeight: 700, color: p.stock < 5 ? G.danger : p.stock < 10 ? G.accent : G.success }}>{p.stock}</span>
                    {p.stock < 5 && <Badge color={G.danger} small>BAJO</Badge>}
                  </span>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn size="sm" variant="outline" onClick={() => { setModalStock(p); setStockDelta(""); setStockTipo("entrada"); }}>📥 Stock</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => abrirEditar(p)}>✏️</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => eliminar(p.id)} style={{ color: G.danger }}>🗑</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal producto */}
      <Modal open={!!modalForm} title={modalForm === "nuevo" ? "➕ Nuevo Producto" : "✏️ Editar Producto"} onClose={() => setModalForm(null)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="Nombre" value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del producto" autoFocus />
            <Input label="Código" value={form.codigo || ""} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="COD001" />
            <Input label="Precio venta" type="number" value={form.precio || ""} onChange={(e) => setForm({ ...form, precio: e.target.value })} prefix="$" />
            <Input label="Costo" type="number" value={form.costo || ""} onChange={(e) => setForm({ ...form, costo: e.target.value })} prefix="$" />
            <Input label="Stock inicial" type="number" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Categoría</label>
              <select value={form.categoria || ""} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                style={{ background: G.card, border: `1px solid ${G.border}`, color: G.text, borderRadius: 6, padding: "9px 12px", fontSize: 13 }}>
                <option value="">Seleccionar...</option>
                {["Bebidas", "Botanas", "Abarrotes", "Lácteos", "Frescos", "Panadería", "Limpieza"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setModalForm(null)}>Cancelar</Btn>
            <Btn onClick={guardar} icon="💾">Guardar</Btn>
          </div>
        </div>
      </Modal>

      {/* Modal stock */}
      <Modal open={!!modalStock} title="📥 Ajustar Stock" onClose={() => setModalStock(null)} width={320}>
        {modalStock && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: G.card, borderRadius: 6, padding: "10px 14px" }}>
              <div style={{ fontWeight: 700 }}>{modalStock.nombre}</div>
              <div style={{ fontSize: 12, color: G.textMuted }}>Stock actual: <span className="mono" style={{ color: G.accent }}>{modalStock.stock}</span></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["entrada", "salida"].map((t) => (
                <button key={t} onClick={() => setStockTipo(t)}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: `1px solid ${stockTipo === t ? (t === "entrada" ? G.success : G.danger) : G.border}`, background: stockTipo === t ? (t === "entrada" ? G.success + "22" : G.danger + "22") : "transparent", color: stockTipo === t ? (t === "entrada" ? G.success : G.danger) : G.textMuted, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Syne',sans-serif" }}>
                  {t === "entrada" ? "📥 Entrada" : "📤 Salida"}
                </button>
              ))}
            </div>
            <Input label="Cantidad" type="number" value={stockDelta} onChange={(e) => setStockDelta(e.target.value)} placeholder="0" autoFocus onKeyDown={(e) => e.key === "Enter" && ajustarStock()} />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setModalStock(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
              <Btn onClick={ajustarStock} style={{ flex: 1, justifyContent: "center" }} icon="✅">Aplicar</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── VISTA REPORTES ───────────────────────────────────────────────────────────
function ViewReportes({ ventas, productos }) {
  const [rango, setRango] = useState("7d");

  const ahora = new Date();
  const dias = rango === "7d" ? 7 : rango === "30d" ? 30 : 1;
  const desde = new Date(ahora);
  desde.setDate(ahora.getDate() - dias);

  const ventasFiltradas = ventas.filter((v) => new Date(v.fecha) >= desde);

  // Ventas por día
  const ventasPorDia = [];
  for (let d = dias - 1; d >= 0; d--) {
    const fecha = new Date(ahora);
    fecha.setDate(ahora.getDate() - d);
    const label = fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
    const ventasDia = ventas.filter((v) => new Date(v.fecha).toDateString() === fecha.toDateString());
    ventasPorDia.push({ dia: label, ventas: ventasDia.length, total: ventasDia.reduce((s, v) => s + v.total, 0) });
  }

  // Productos más vendidos
  const conteo = {};
  ventasFiltradas.forEach((v) => v.items.forEach((i) => {
    conteo[i.nombre] = (conteo[i.nombre] || 0) + i.cantidad;
  }));
  const topProductos = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([nombre, cant]) => ({ nombre: nombre.split(" ").slice(0, 2).join(" "), cant }));

  // Ventas por categoría
  const porCategoria = {};
  ventasFiltradas.forEach((v) => v.items.forEach((i) => {
    const prod = productos.find((p) => p.id === i.id);
    if (prod) {
      porCategoria[prod.categoria] = (porCategoria[prod.categoria] || 0) + i.precio * i.cantidad;
    }
  }));
  const dataCategoria = Object.entries(porCategoria).map(([name, value]) => ({ name, value }));

  const totalVentas = ventasFiltradas.reduce((s, v) => s + v.total, 0);
  const ticketProm = ventasFiltradas.length ? totalVentas / ventasFiltradas.length : 0;

  const COLORS = [G.accent, G.info, G.success, G.purple, G.danger, "#06b6d4"];

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
        <div style={{ fontWeight: 700 }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.name === "total" ? fmt(p.value) : p.value}</div>)}
      </div>
    );
  };

  return (
    <div style={{ padding: 20, overflow: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>📊 Reportes</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {[["hoy", "Hoy"], ["7d", "7 días"], ["30d", "30 días"]].map(([v, l]) => (
            <button key={v} onClick={() => setRango(v)}
              style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${rango === v ? G.accent : G.border}`, background: rango === v ? G.accentGlow : "transparent", color: rango === v ? G.accent : G.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
        <StatCard label="Ventas totales" value={ventasFiltradas.length} icon="🧾" />
        <StatCard label="Ingresos" value={fmt(totalVentas)} icon="💰" color={G.success} />
        <StatCard label="Ticket promedio" value={fmt(ticketProm)} icon="🎫" color={G.info} />
        <StatCard label="Productos vendidos" value={ventasFiltradas.reduce((s, v) => s + v.items.reduce((ss, i) => ss + i.cantidad, 0), 0)} icon="📦" color={G.purple} />
      </div>

      {/* Gráficas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Ventas por día */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: G.textMuted }}>INGRESOS POR DÍA</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ventasPorDia} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="dia" tick={{ fill: G.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="total" fill={G.accent} radius={[4, 4, 0, 0]} name="total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top productos */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: G.textMuted }}>TOP PRODUCTOS</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topProductos} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="nombre" type="category" tick={{ fill: G.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="cant" fill={G.info} radius={[0, 4, 4, 0]} name="cant" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ventas por categoría */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: G.textMuted }}>VENTAS POR CATEGORÍA</div>
          {dataCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={dataCategoria} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {dataCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 6, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ color: G.textMuted, fontSize: 12, textAlign: "center", padding: 40 }}>Sin datos</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {dataCategoria.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], display: "inline-block" }} />
                <span style={{ color: G.textMuted }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas ventas */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16, overflow: "hidden" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: G.textMuted }}>ÚLTIMAS VENTAS</div>
          <div style={{ overflow: "auto", maxHeight: 200 }}>
            {[...ventasFiltradas].reverse().slice(0, 8).map((v) => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${G.border}`, fontSize: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>#{v.id} · {v.cajero}</div>
                  <div style={{ color: G.textMuted, fontSize: 11 }}>{fmtDate(v.fecha)} {fmtTime(v.fecha)}</div>
                </div>
                <span className="mono" style={{ fontWeight: 700, color: G.accent, alignSelf: "center" }}>{fmt(v.total)}</span>
              </div>
            ))}
            {ventasFiltradas.length === 0 && <div style={{ color: G.textMuted, fontSize: 12, padding: "20px 0", textAlign: "center" }}>Sin ventas en el período</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VISTA USUARIOS ───────────────────────────────────────────────────────────
function ViewUsuarios({ usuarios, setUsuarios }) {
  const [modalForm, setModalForm] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);

  const abrirNuevo = () => { setForm({ nombre: "", usuario: "", password: "", rol: "cajero", activo: true }); setEditId(null); setModalForm(true); };
  const abrirEditar = (u) => { setForm({ ...u }); setEditId(u.id); setModalForm(true); };

  const guardar = () => {
    if (!form.nombre || !form.usuario || !form.password) return;
    if (editId) {
      setUsuarios((prev) => prev.map((u) => u.id === editId ? { ...form, id: editId } : u));
    } else {
      setUsuarios((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    setModalForm(false);
  };

  const toggleActivo = (id) => setUsuarios((prev) => prev.map((u) => u.id === id ? { ...u, activo: !u.activo } : u));

  return (
    <div style={{ padding: 20, overflow: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>👥 Usuarios</h2>
        <Btn onClick={abrirNuevo} icon="➕">Nuevo Usuario</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
        {usuarios.map((u) => (
          <div key={u.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: u.rol === "admin" ? G.accentDim : G.info + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: u.rol === "admin" ? G.accent : G.info }}>
                  {u.nombre[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{u.nombre}</div>
                  <div style={{ fontSize: 11, color: G.textMuted }}>@{u.usuario}</div>
                </div>
              </div>
              <Badge color={u.rol === "admin" ? G.accent : G.info}>{u.rol}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Badge color={u.activo ? G.success : G.danger}>{u.activo ? "Activo" : "Inactivo"}</Badge>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="ghost" onClick={() => toggleActivo(u.id)}>{u.activo ? "🔒" : "🔓"}</Btn>
                <Btn size="sm" variant="ghost" onClick={() => abrirEditar(u)}>✏️</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalForm} title={editId ? "✏️ Editar Usuario" : "➕ Nuevo Usuario"} onClose={() => setModalForm(false)} width={360}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Nombre completo" value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
          <Input label="Usuario" value={form.usuario || ""} onChange={(e) => setForm({ ...form, usuario: e.target.value })} prefix="@" />
          <Input label="Contraseña" type="password" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Rol</label>
            <select value={form.rol || "cajero"} onChange={(e) => setForm({ ...form, rol: e.target.value })}
              style={{ background: G.card, border: `1px solid ${G.border}`, color: G.text, borderRadius: 6, padding: "9px 12px", fontSize: 13, fontFamily: "'Syne',sans-serif" }}>
              <option value="admin">🔑 Admin</option>
              <option value="cajero">🧑‍💼 Cajero</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setModalForm(false)}>Cancelar</Btn>
            <Btn onClick={guardar} icon="💾">Guardar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("pos");
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [ventas, setVentas] = useState(() => generarVentasEjemplo());
  const [usuarios, setUsuarios] = useState(USUARIOS_INICIALES);

  useEffect(() => {
    if (user && user.rol === "cajero") setView("pos");
    else if (user && user.rol === "admin") setView("pos");
  }, [user]);

  if (!user) return <Login usuarios={usuarios} onLogin={setUser} />;

  const views = { pos: ViewPOS, inventario: ViewInventario, reportes: ViewReportes, usuarios: ViewUsuarios };
  const ViewComponent = views[view] || ViewPOS;

  return (
    <div style={{ height: "100vh", display: "flex", overflow: "hidden" }}>
      <style>{css}</style>
      <Sidebar view={view} setView={setView} user={user} onLogout={() => setUser(null)} />
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div style={{ height: 44, background: G.surface, borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 12, flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 13 }}>{NAV.find((n) => n.id === view)?.icon} {NAV.find((n) => n.id === view)?.label}</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge color={user.rol === "admin" ? G.accent : G.info}>{user.rol}</Badge>
            <span style={{ fontSize: 12, color: G.textMuted }}>{user.nombre}</span>
          </div>
          <span className="mono" style={{ fontSize: 11, color: G.textDim }}>
            {new Date().toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <ViewComponent
            productos={productos} setProductos={setProductos}
            ventas={ventas} setVentas={setVentas}
            usuarios={usuarios} setUsuarios={setUsuarios}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}
