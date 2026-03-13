import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, MapPin, Trash2, Edit3, Check,
  Clock, X, Save, ExternalLink, Search,
} from "lucide-react";
import { api } from "../../../index";
import AdminSidebar from "../script/AdminSidebar";
import Swal from "sweetalert2";
import "../style/AdminDashboard.css";
import "../style/AdminBusinessVisits.css";

const STATUS_LABELS = {
  visited: { label: "Vizituar", icon: <Check size={12} /> },
  waiting: { label: "Në Pritje", icon: <Clock size={12} /> },
};

const EMPTY_FORM = {
  business_name: "",
  address: "",
  maps_url: "",
  status: "waiting",
  notes: "",
};

const AdminBusinessVisits = () => {
  const navigate = useNavigate();
  const [visits, setVisits]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");

  const fetchVisits = () => {
    setLoading(true);
    api.get("/admin/visits")
      .then((res) => setVisits(Array.isArray(res.data) ? res.data : []))
      .catch(() => Swal.fire("Gabim", "Nuk u ngarkuan vizitat.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVisits(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (visit) => {
    setEditId(visit.id);
    setForm({
      business_name: visit.business_name || "",
      address:       visit.address       || "",
      maps_url:      visit.maps_url      || "",
      status:        visit.status        || "waiting",
      notes:         visit.notes         || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put("/admin/visits/" + editId, form);
      } else {
        await api.post("/admin/visits/create", form);
      }
      closeModal();
      fetchVisits();
    } catch (err) {
      Swal.fire("Gabim", err.response?.data?.message || "Ndodhi një gabim.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Fshi vizitën?",
      text: "Ky veprim nuk mund të kthehet.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Po, fshi!",
      cancelButtonText: "Anulo",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete("/admin/visits/" + id);
      fetchVisits();
    } catch {
      Swal.fire("Gabim", "Nuk u fshi.", "error");
    }
  };

  const handleStatusToggle = async (visit) => {
    const newStatus = visit.status === "visited" ? "waiting" : "visited";
    try {
      await api.put("/admin/visits/" + visit.id, { status: newStatus });
      fetchVisits();
    } catch {
      Swal.fire("Gabim", "Nuk u ndryshua statusi.", "error");
    }
  };

  const openGoogleMaps = () => window.open("https://www.google.com/maps", "_blank");

  const filtered = visits.filter((v) => {
    const matchesFilter = filter === "all" || v.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (v.business_name || "").toLowerCase().includes(q) ||
      (v.address       || "").toLowerCase().includes(q) ||
      (v.notes         || "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="owner-layout">
      <AdminSidebar />

      <main className="owner-main-content">
        <div className="schedule-container-wide">

          {/* Header */}
          <header className="schedule-header-big">
            <button
              onClick={() => navigate("/admin/businesses")}
              className="header-top-tag"
              style={{ cursor: "pointer", border: "none" }}
            >
              <ArrowLeft size={14} />
              <span>Kthehu</span>
            </button>
            <h1>Vizitat e Bizneseve</h1>
            <p>Gjurmo bizneset që ke vizituar ose ke planifikuar.</p>
          </header>

          {/* Toolbar */}
          <div className="visits-toolbar">
            <div className="visits-filter-pills">
              {["all", "visited", "waiting"].map((f) => (
                <button
                  key={f}
                  className={"visits-pill" + (filter === f ? " active" : "")}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "Të gjitha" : STATUS_LABELS[f].label}
                </button>
              ))}
            </div>
            <div className="visits-toolbar-actions">
              <div className="visits-search-bar">
                <Search size={15} className="visits-search-icon" />
                <input
                  type="text"
                  placeholder="Kërko biznes, adresë..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="visits-search-clear" onClick={() => setSearch("")}>
                    <X size={13} />
                  </button>
                )}
              </div>
              <button className="visits-maps-open-btn" onClick={openGoogleMaps}>
                <MapPin size={16} />
                <span className="btn-label">Hap Google Maps</span>
                <ExternalLink size={14} />
              </button>
              <button className="visits-add-btn" onClick={openAdd}>
                <Plus size={16} />
                <span className="btn-label">Shto Vizitë</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="visits-stats-row">
            <div className="visits-stat-card">
              <span className="visits-stat-num">{visits.length}</span>
              <span className="visits-stat-label">Gjithsej</span>
            </div>
            <div className="visits-stat-card">
              <span className="visits-stat-num visited">
                {visits.filter((v) => v.status === "visited").length}
              </span>
              <span className="visits-stat-label">Vizituar</span>
            </div>
            <div className="visits-stat-card">
              <span className="visits-stat-num waiting">
                {visits.filter((v) => v.status === "waiting").length}
              </span>
              <span className="visits-stat-label">Në Pritje</span>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="visits-loader-wrap">
              <div className="planora-loader-small" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="visits-empty">
              <div className="visits-empty-icon">📍</div>
              <h3>Nuk ka vizita</h3>
              <p>
                {search
                  ? `Nuk u gjet asnjë rezultat për "${search}".`
                  : "Shto biznesin e parë për të gjurmuar vizitat."}
              </p>
              {!search && (
                <button className="visits-add-btn" onClick={openAdd}>
                  <Plus size={15} />
                  <span>Shto Vizitë</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ── DESKTOP TABLE ── */}
              <div className="visits-table-wrap">
                <table className="visits-table">
                  <thead>
                    <tr>
                      <th>Biznesi</th>
                      <th>Adresa</th>
                      <th>Lokacioni</th>
                      <th>Shënime</th>
                      <th>Statusi</th>
                      <th>Veprimet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((visit) => (
                      <tr key={visit.id}>
                        <td><span className="visits-name">{visit.business_name}</span></td>
                        <td>
                          {visit.address ? (
                            <span className="visits-address">
                              <MapPin size={12} /> {visit.address}
                            </span>
                          ) : <span className="visits-no-notes">—</span>}
                        </td>
                        <td>
                          {visit.maps_url ? (
                            <button
                              className="visits-coords-btn"
                              onClick={() => window.open(visit.maps_url, "_blank")}
                            >
                              <MapPin size={12} />
                              <span>Shiko Lokacionin</span>
                              <ExternalLink size={11} />
                            </button>
                          ) : <span className="visits-no-notes">—</span>}
                        </td>
                        <td>
                          <span className="visits-notes">
                            {visit.notes || <span className="visits-no-notes">—</span>}
                          </span>
                        </td>
                        <td>
                          <button
                            className={"visits-status-badge " + visit.status}
                            onClick={() => handleStatusToggle(visit)}
                            title="Kliko për të ndryshuar statusin"
                          >
                            {STATUS_LABELS[visit.status].icon}
                            {STATUS_LABELS[visit.status].label}
                          </button>
                        </td>
                        <td>
                          <div className="visits-actions">
                            <button className="visits-action-btn edit" onClick={() => openEdit(visit)} title="Edito">
                              <Edit3 size={14} />
                            </button>
                            <button className="visits-action-btn delete" onClick={() => handleDelete(visit.id)} title="Fshi">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── MOBILE CARDS ── */}
              <div className="visits-cards">
                {filtered.map((visit) => (
                  <div key={visit.id} className="visits-card">
                    <div className="visits-card-top">
                      <span className="visits-name">{visit.business_name}</span>
                      <button
                        className={"visits-status-badge " + visit.status}
                        onClick={() => handleStatusToggle(visit)}
                      >
                        {STATUS_LABELS[visit.status].icon}
                        {STATUS_LABELS[visit.status].label}
                      </button>
                    </div>

                    {visit.address && (
                      <span className="visits-address">
                        <MapPin size={12} /> {visit.address}
                      </span>
                    )}

                    {visit.notes && (
                      <p className="visits-card-notes">{visit.notes}</p>
                    )}

                    <div className="visits-card-footer">
                      {visit.maps_url ? (
                        <button
                          className="visits-coords-btn"
                          onClick={() => window.open(visit.maps_url, "_blank")}
                        >
                          <MapPin size={12} />
                          <span>Shiko Lokacionin</span>
                          <ExternalLink size={11} />
                        </button>
                      ) : <span />}

                      <div className="visits-actions">
                        <button className="visits-action-btn edit" onClick={() => openEdit(visit)} title="Edito">
                          <Edit3 size={14} />
                        </button>
                        <button className="visits-action-btn delete" onClick={() => handleDelete(visit.id)} title="Fshi">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="visits-modal-overlay" onClick={closeModal}>
          <div className="visits-modal" onClick={(e) => e.stopPropagation()}>
            <div className="visits-modal-header">
              <h2>{editId ? "Edito Vizitën" : "Shto Vizitë të Re"}</h2>
              <button className="visits-modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="visits-modal-form">
              <div className="visits-form-group">
                <label>Emri i Biznesit *</label>
                <input
                  type="text" name="business_name"
                  value={form.business_name} onChange={handleChange}
                  placeholder="p.sh. Royal Cuts" required
                />
              </div>
              <div className="visits-form-group">
                <label>Adresa</label>
                <input
                  type="text" name="address"
                  value={form.address} onChange={handleChange}
                  placeholder="p.sh. Rr. Fehmi Agani, Prishtinë"
                />
              </div>
              <div className="visits-form-group">
                <label>Google Maps Link</label>
                <input
                  type="text" name="maps_url"
                  value={form.maps_url} onChange={handleChange}
                  placeholder="Ngjit linkun e Google Maps këtu..."
                />
              </div>
              <button type="button" className="visits-maps-helper" onClick={openGoogleMaps}>
                <MapPin size={13} />
                Hap Google Maps dhe kopjo linkun
                <ExternalLink size={12} />
              </button>
              <div className="visits-form-group">
                <label>Statusi</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="waiting">Në Pritje</option>
                  <option value="visited">Vizituar</option>
                </select>
              </div>
              <div className="visits-form-group">
                <label>Shënime</label>
                <textarea
                  name="notes" value={form.notes} onChange={handleChange}
                  placeholder="Çdo shënim i dobishëm..." rows={3}
                />
              </div>
              <div className="visits-modal-footer">
                <button type="button" className="visits-cancel-btn" onClick={closeModal}>Anulo</button>
                <button type="submit" className="visits-save-btn" disabled={saving}>
                  {saving ? (
                    <div className="planora-loader-small" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  ) : (
                    <><Save size={15} /> {editId ? "Ruaj" : "Shto"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBusinessVisits;