import { useState, useEffect, useCallback } from 'react';
import type { StoreListDoc, StoreListRetailer } from '../../types';
import { exportToCsv } from '../../utils/exportCsv';
import {
  fetchStoreLists,
  addStoreList,
  updateStoreList,
  deleteStoreList,
} from '../../services/firestoreService';
import { invalidateStoreListsCache } from '../../data/storeLists';

const EMPTY_RETAILER: Omit<StoreListRetailer, 'id'> = {
  retailer: '',
  weeklyQuota: 0,
  monthlyQuota: 0,
};

export const StoreListsAdmin = () => {
  const [lists, setLists] = useState<StoreListDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add new list state
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCountry, setNewCountry] = useState('');

  // Inline retailer editing
  const [editingRetailer, setEditingRetailer] = useState<{ listId: string; retailerIdx: number } | null>(null);
  const [editRetData, setEditRetData] = useState<Omit<StoreListRetailer, 'id'>>(EMPTY_RETAILER);
  const [addingRetailerToList, setAddingRetailerToList] = useState<string | null>(null);
  const [newRetData, setNewRetData] = useState<Omit<StoreListRetailer, 'id'>>(EMPTY_RETAILER);

  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await fetchStoreLists();
      setLists(docs.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error loading store lists:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = lists.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.country.toLowerCase().includes(q) ||
      l.retailers.some((r) => r.retailer.toLowerCase().includes(q))
    );
  });

  // --- List-level CRUD ---
  const handleAddList = async () => {
    if (!newName.trim() || !newCountry.trim()) {
      alert('Name and Country are required');
      return;
    }
    setSaving(true);
    try {
      await addStoreList({ name: newName.trim(), country: newCountry.trim(), retailers: [] });
      invalidateStoreListsCache();
      setNewName('');
      setNewCountry('');
      setShowAdd(false);
      await load();
    } catch (err) {
      alert('Error adding list: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteList = async (id: string, name: string) => {
    if (!window.confirm(`Delete store list "${name}" and all its retailers?`)) return;
    try {
      await deleteStoreList(id);
      invalidateStoreListsCache();
      await load();
    } catch (err) {
      alert('Error deleting: ' + (err instanceof Error ? err.message : err));
    }
  };

  // --- Retailer-level CRUD ---
  const startEditRetailer = (listId: string, idx: number, r: StoreListRetailer) => {
    setEditingRetailer({ listId, retailerIdx: idx });
    setEditRetData({ retailer: r.retailer, weeklyQuota: r.weeklyQuota, monthlyQuota: r.monthlyQuota });
  };

  const saveEditRetailer = async () => {
    if (!editingRetailer) return;
    const list = lists.find((l) => l.id === editingRetailer.listId);
    if (!list) return;
    setSaving(true);
    try {
      const updated = [...list.retailers];
      updated[editingRetailer.retailerIdx] = {
        ...updated[editingRetailer.retailerIdx],
        retailer: editRetData.retailer,
        weeklyQuota: Number(editRetData.weeklyQuota) || 0,
        monthlyQuota: Number(editRetData.monthlyQuota) || 0,
      };
      await updateStoreList(list.id, { retailers: updated });
      invalidateStoreListsCache();
      setEditingRetailer(null);
      await load();
    } catch (err) {
      alert('Error saving: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  const deleteRetailer = async (listId: string, idx: number) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    const retailerName = list.retailers[idx]?.retailer;
    if (!window.confirm(`Remove "${retailerName}" from this list?`)) return;
    try {
      const updated = list.retailers.filter((_, i) => i !== idx);
      await updateStoreList(listId, { retailers: updated });
      invalidateStoreListsCache();
      await load();
    } catch (err) {
      alert('Error deleting retailer: ' + (err instanceof Error ? err.message : err));
    }
  };

  const handleAddRetailer = async (listId: string) => {
    if (!newRetData.retailer.trim()) {
      alert('Retailer name is required');
      return;
    }
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    setSaving(true);
    try {
      const newR: StoreListRetailer = {
        id: `ret-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        retailer: newRetData.retailer.trim(),
        weeklyQuota: Number(newRetData.weeklyQuota) || 0,
        monthlyQuota: Number(newRetData.monthlyQuota) || 0,
      };
      await updateStoreList(listId, { retailers: [...list.retailers, newR] });
      invalidateStoreListsCache();
      setNewRetData(EMPTY_RETAILER);
      setAddingRetailerToList(null);
      await load();
    } catch (err) {
      alert('Error adding retailer: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-loading">Loading store lists...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-bar">
        <input
          className="admin-search"
          placeholder="Search store lists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="admin-count">{filtered.length} lists</span>
        <button
          className="admin-btn admin-btn--secondary"
          onClick={() => {
            const rows = filtered.flatMap((l) =>
              l.retailers.map((r) => ({
                name: l.name,
                country: l.country,
                retailer: r.retailer,
                weeklyQuota: r.weeklyQuota,
                monthlyQuota: r.monthlyQuota,
              }))
            );
            exportToCsv('storelists-export.csv', rows);
          }}
        >
          Export CSV
        </button>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? 'Cancel' : '+ Add Store List'}
        </button>
      </div>

      {showAdd && (
        <div className="admin-form-card">
          <h4>Add New Store List</h4>
          <div className="admin-form-grid">
            <label>
              List Name *
              <input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </label>
            <label>
              Country *
              <input value={newCountry} onChange={(e) => setNewCountry(e.target.value)} />
            </label>
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn admin-btn--primary" onClick={handleAddList} disabled={saving}>
              {saving ? 'Saving...' : 'Create List'}
            </button>
            <button className="admin-btn admin-btn--secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Accordion list */}
      <div className="admin-accordion">
        {filtered.map((list) => {
          const isExpanded = expandedId === list.id;
          const totalMonthly = list.retailers.reduce((s, r) => s + r.monthlyQuota, 0);

          return (
            <div key={list.id} className={`admin-acc-item${isExpanded ? ' admin-acc-item--open' : ''}`}>
              <div className="admin-acc-header" onClick={() => setExpandedId(isExpanded ? null : list.id)}>
                <span className="admin-acc-arrow">{isExpanded ? '▼' : '▶'}</span>
                <span className="admin-acc-name">{list.name}</span>
                <span className="admin-badge">{list.country}</span>
                <span className="admin-acc-count">{list.retailers.length} retailers</span>
                <span className="admin-acc-totals">M: {totalMonthly}</span>
                <button
                  className="admin-btn admin-btn--sm admin-btn--danger"
                  onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id, list.name); }}
                >
                  Delete List
                </button>
              </div>

              {isExpanded && (
                <div className="admin-acc-body">
                  <table className="admin-table admin-table--compact">
                    <thead>
                      <tr>
                        <th>Retailer</th>
                        <th>Monthly</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.retailers.map((r, idx) =>
                        editingRetailer?.listId === list.id && editingRetailer.retailerIdx === idx ? (
                          <tr key={r.id} className="admin-row-editing">
                            <td>
                              <input value={editRetData.retailer} onChange={(e) => setEditRetData({ ...editRetData, retailer: e.target.value })} />
                            </td>
                            <td>
                              <input type="number" value={editRetData.monthlyQuota} onChange={(e) => setEditRetData({ ...editRetData, monthlyQuota: Number(e.target.value) })} />
                            </td>
                            <td className="admin-table-actions">
                              <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={saveEditRetailer} disabled={saving}>
                                Save
                              </button>
                              <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => setEditingRetailer(null)}>
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ) : (
                          <tr key={r.id}>
                            <td>{r.retailer}</td>
                            <td className="num">{r.monthlyQuota}</td>
                            <td className="admin-table-actions">
                              <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => startEditRetailer(list.id, idx, r)}>
                                Edit
                              </button>
                              <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => deleteRetailer(list.id, idx)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      )}

                      {/* Add retailer row */}
                      {addingRetailerToList === list.id && (
                        <tr className="admin-row-editing">
                          <td>
                            <input placeholder="Retailer name" value={newRetData.retailer} onChange={(e) => setNewRetData({ ...newRetData, retailer: e.target.value })} />
                          </td>
                          <td>
                            <input type="number" placeholder="0" value={newRetData.monthlyQuota || ''} onChange={(e) => setNewRetData({ ...newRetData, monthlyQuota: Number(e.target.value) })} />
                          </td>
                          <td className="admin-table-actions">
                            <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => handleAddRetailer(list.id)} disabled={saving}>
                              Add
                            </button>
                            <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => { setAddingRetailerToList(null); setNewRetData(EMPTY_RETAILER); }}>
                              Cancel
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total</td>
                        <td className="num">{totalMonthly}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>

                  {addingRetailerToList !== list.id && (
                    <button
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                      style={{ marginTop: '0.5rem' }}
                      onClick={() => { setAddingRetailerToList(list.id); setNewRetData(EMPTY_RETAILER); }}
                    >
                      + Add Retailer
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
