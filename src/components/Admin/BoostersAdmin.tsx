import { useState, useEffect, useCallback } from 'react';
import type { Booster } from '../../types';
import { exportToCsv } from '../../utils/exportCsv';
import {
  fetchBoosters,
  addBooster,
  updateBooster,
  deleteBooster,
} from '../../services/firestoreService';
import { invalidateBoostersCache } from '../../data/boosters';

export const BoostersAdmin = () => {
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', country: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [addData, setAddData] = useState({ name: '', country: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await fetchBoosters();
      setBoosters(docs.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error loading boosters:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = boosters.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.country.toLowerCase().includes(q);
  });

  const startEdit = (b: Booster) => {
    setEditingId(b.id);
    setEditData({ name: b.name, country: b.country });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', country: '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateBooster(editingId, editData);
      invalidateBoostersCache();
      await load();
      setEditingId(null);
    } catch (err) {
      alert('Error saving: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete booster "${name}"?`)) return;
    try {
      await deleteBooster(id);
      invalidateBoostersCache();
      await load();
    } catch (err) {
      alert('Error deleting: ' + (err instanceof Error ? err.message : err));
    }
  };

  const handleAdd = async () => {
    if (!addData.name.trim() || !addData.country.trim()) {
      alert('Name and Country are required');
      return;
    }
    setSaving(true);
    try {
      await addBooster({ name: addData.name.trim(), country: addData.country.trim() });
      invalidateBoostersCache();
      setAddData({ name: '', country: '' });
      setShowAdd(false);
      await load();
    } catch (err) {
      alert('Error adding: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-loading">Loading boosters...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-bar">
        <input
          className="admin-search"
          placeholder="Search boosters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="admin-count">{filtered.length} boosters</span>
        <button
          className="admin-btn admin-btn--secondary"
          onClick={() => exportToCsv('boosters-export.csv', filtered.map(({ id: _id, ...rest }) => rest))}
        >
          Export CSV
        </button>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? 'Cancel' : '+ Add Booster'}
        </button>
      </div>

      {showAdd && (
        <div className="admin-form-card">
          <h4>Add New Booster</h4>
          <div className="admin-form-grid">
            <label>
              Retailer Name *
              <input value={addData.name} onChange={(e) => setAddData({ ...addData, name: e.target.value })} />
            </label>
            <label>
              Country *
              <input value={addData.country} onChange={(e) => setAddData({ ...addData, country: e.target.value })} />
            </label>
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn admin-btn--primary" onClick={handleAdd} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="admin-btn admin-btn--secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Retailer Name</th>
              <th>Country</th>
              <th className="admin-table-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) =>
              editingId === b.id ? (
                <tr key={b.id} className="admin-row-editing">
                  <td>
                    <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                  </td>
                  <td>
                    <input value={editData.country} onChange={(e) => setEditData({ ...editData, country: e.target.value })} />
                  </td>
                  <td className="admin-table-actions">
                    <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={saveEdit} disabled={saving}>
                      {saving ? '...' : 'Save'}
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td><span className="admin-badge">{b.country}</span></td>
                  <td className="admin-table-actions">
                    <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => startEdit(b)}>
                      Edit
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(b.id, b.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
