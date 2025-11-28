import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

export default function PropertiesPage({ onLogout }) {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({ id: "", location: "", date: "", price: "" });
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [recommendedSet, setRecommendedSet] = useState(new Set());

  const API = import.meta.env.VITE_API_BASE_URL || "https://api.propiedadesarquisis.me/api";

  // Cargar email desde token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.mail || decoded.email || "");
      } catch {
        setUserEmail("");
      }
    }
  }, []);

  // Cargar recomendaciones
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !userEmail) return;

        const res = await axios.get(`${API}/recommendations`, {
          params: { userId: userEmail },
          headers: { Authorization: `Bearer ${token}` },
        });

        const ids = new Set(res.data?.recommendationIds || []);
        setRecommendedSet(ids);

      } catch (err) {
        console.error("Error cargando recomendaciones:", err);
      }
    };

    if (userEmail) loadRecommendations();
  }, [userEmail, API]);

  // fetch por ID
  const fetchById = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/properties/${filters.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const prop = res.data;
      setProperties([{ ...prop, recommended: recommendedSet.has(prop.id) }]);
      setHasMore(false);

    } catch (err) {
      console.error("Error buscando por ID:", err);
      setProperties([]);
      setHasMore(false);
    }
  }, [API, filters.id, recommendedSet]);

  // fetch normal
  const fetchData = useCallback(async (resetPage = false) => {
    try {
      const token = localStorage.getItem("token");

      let email = null;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          email = decoded.mail || decoded.email || null;
        } catch (e) {
          console.log(e);
        }
      }

      const params = {
        location: filters.location || undefined,
        price: filters.price || undefined,
        date: filters.date || undefined,
        limit,
        page: resetPage ? 1 : page,
        userId: email || undefined,
      };

      const res = await axios.get(`${API}/properties`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data.map((p) => ({
        ...p,
        recommended: recommendedSet.has(p.id),
      }));

      setProperties(list);
      setHasMore(list.length === limit);

      if (resetPage) setPage(1);

    } catch (err) {
      console.error("Error cargando propiedades:", err);
      setProperties([]);
      setHasMore(false);
    }
  }, [API, filters.location, filters.price, filters.date, limit, page, recommendedSet]);

  // cuando cambian page o limit
  useEffect(() => {
    if (filters.id) fetchById();
    else fetchData();
  }, [page, limit, fetchById, fetchData, filters.id]);

  const onSearch = () => {
    if (filters.id) {
      setPage(1);
      fetchById();
    } else {
      fetchData(true);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Propiedades</h2>
        <Link to="/my-visits"><button>Mis visitas</button></Link>
        <button onClick={onLogout}>Cerrar sesión</button>
      </div>

      <p style={{ marginTop: 0 }}>Usuario: <strong>{userEmail}</strong></p>

      <h3>BUSQUEDA</h3>

      {/* Formulario */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(240px, 1fr))", gap: 12, maxWidth: 640 }}>
        <div>
          <label>ID</label>
          <input
            value={filters.id}
            onChange={(e) => setFilters({ ...filters, id: e.target.value })}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>Ubicación</label>
          <input
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>Fecha</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>Precio hasta:</label>
          <input
            type="number"
            value={filters.price}
            onChange={(e) => setFilters({ ...filters, price: e.target.value })}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label>Datos por página</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ width: "100%" }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={onSearch}>Buscar</button>
      </div>

      <div style={{ marginTop: 16 }}>
        {properties.length > 0 ? (
          properties.map((p) => (
            <div key={p.id} style={{ padding: 8, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Link to={`/properties/${p.id}`}><strong>{p.name}</strong></Link> — {p.price} {p.currency} — {p.location}
              </div>

              {p.recommended && (
                <span style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}>
                  ⭐ Recomendado
                </span>
              )}
            </div>
          ))
        ) : (
          <p>No se encontraron propiedades</p>
        )}

        {!filters.id && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>Anterior</button>
            <span>Página {page}</span>
            <button onClick={() => setPage(page + 1)} disabled={!hasMore}>Siguiente</button>
          </div>
        )}
      </div>
    </div>
  );
}
