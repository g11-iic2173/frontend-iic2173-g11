import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";


export default function PropertiesPage({ onLogout }) {
    const [properties, setProperties] = useState([]);
    const [filters, setFilters] = useState({ id: "", location: "", date: "", price: "" });
    const [limit, setLimit] = useState(25);
    const [page, setPage] = useState(1);
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserEmail(decoded.mail || decoded.email || "Usuario");
            } catch {
                setUserEmail("Usuario");
            }
        }
    }, []);

    const fetchData = async (resetPage = false) => {
        try {
            const token = localStorage.getItem("token");

            let res;
            if (filters.id) {
                // busquedad por id
                res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/properties/${filters.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProperties([res.data]); 
            } else {
                // otras busquedad
                const params = { ...filters, page: resetPage ? 1 : page, limit };
                res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/properties`, {
                    params,
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProperties(res.data);
            }

            if (resetPage) setPage(1);
        } catch (err) {
            console.error("Error cargando propiedades:", err.response?.data || err.message);
            setProperties([]); 
        }
    };


    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [page, limit]);

    return (
        <div>
            <div>
                <button onClick={onLogout}>
                    Cerrar sesión
                </button>

                <p>Usuario: <strong>{userEmail}</strong></p>

                <h3>BUSQUEDA</h3>

                <div>
                    <label>ID</label>
                    <input
                    value={filters.id}
                    onChange={(e) => setFilters({ ...filters, id: e.target.value })}
                    />
                </div>

                <div>
                    <label>Ubicación</label>
                    <input
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    />
                </div>

                <div>
                    <label>Fecha</label>
                    <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    />
                </div>

                <div>
                    <label>Precio hasta:</label>
                    <input
                    type="number"
                    value={filters.price}
                    onChange={(e) => setFilters({ ...filters, price: e.target.value })}
                    />
                </div>

                <div>
                    <label>Datos por página</label>
                    <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    </select>
                </div>

            <button onClick={fetchData}>
                Buscar
            </button>
        </div>

        <div>
            {Array.isArray(properties) && properties.length > 0 ? (
                properties.map((p) => (
                <div
                    key={p.id}
                >
                    <Link to={`/properties/${p.id}`}><strong>{p.name}</strong></Link> — {p.price} {p.currency} — {p.location}
                </div>
                ))
            ) : (
                <p>No se encontraron propiedades</p>
            )}
            <div>
                <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                Anterior
                </button>
                <span>Página {page}</span>
                <button onClick={() => setPage(page + 1)}>Siguiente</button>
            </div>
        </div>
        </div>
    );
}
