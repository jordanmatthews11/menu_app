import { useState, useEffect, useCallback } from 'react';
import type { CustomCategoryCode } from '../../types';
import {
  fetchCustomCodes,
  addCustomCode,
  updateCustomCode,
  deleteCustomCode,
} from '../../services/firestoreService';
import { exportToCsv } from '../../utils/exportCsv';
import { useAuth } from '../../contexts/AuthContext';

const EMPTY_CODE: Omit<CustomCategoryCode, 'id'> = {
  categoryCode: '',
  customer: '',
  category: '',
  submittedBy: '',
  notes: '',
  jobIds: '',
  codeType: 'Custom',
  timestamp: '',
};

export const CustomCodesAdmin = () => {
  const { user } = useAuth();
  const [codes, setCodes] = useState<CustomCategoryCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<CustomCategoryCode, 'id'>>(EMPTY_CODE);
  const [showAdd, setShowAdd] = useState(false);
  const [addData, setAddData] = useState<Omit<CustomCategoryCode, 'id'>>({
    ...EMPTY_CODE,
    submittedBy: user?.displayName || user?.email || '',
    timestamp: new Date().toISOString(),
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await fetchCustomCodes();
      setCodes(docs.sort((a, b) => a.category.localeCompare(b.category)));
    } catch (err) {
      console.error('Error loading custom codes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = codes.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.categoryCode.toLowerCase().includes(q) ||
      c.customer.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.submittedBy.toLowerCase().includes(q) ||
      c.jobIds.toLowerCase().includes(q)
    );
  });

  const startEdit = (code: CustomCategoryCode) => {
    setEditingId(code.id);
    setEditData({
      categoryCode: code.categoryCode,
      customer: code.customer,
      category: code.category,
      submittedBy: code.submittedBy,
      notes: code.notes,
      jobIds: code.jobIds,
      codeType: code.codeType,
      timestamp: code.timestamp,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(EMPTY_CODE);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateCustomCode(editingId, editData);
      await load();
      setEditingId(null);
    } catch (err) {
      alert('Error saving: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Delete custom code "${code}"?`)) return;
    try {
      await deleteCustomCode(id);
      await load();
    } catch (err) {
      alert('Error deleting: ' + (err instanceof Error ? err.message : err));
    }
  };

  const handleAdd = async () => {
    if (!addData.categoryCode.trim()) {
      alert('Category Code is required');
      return;
    }
    setSaving(true);
    try {
      await addCustomCode({
        ...addData,
        categoryCode: addData.categoryCode.trim(),
        customer: addData.customer.trim(),
        category: addData.category.trim(),
        submittedBy: addData.submittedBy.trim(),
        notes: addData.notes.trim(),
        jobIds: addData.jobIds.trim(),
        codeType: addData.codeType.trim() || 'Custom',
        timestamp: addData.timestamp || new Date().toISOString(),
      });
      setAddData({
        ...EMPTY_CODE,
        submittedBy: user?.displayName || user?.email || '',
        timestamp: new Date().toISOString(),
      });
      setShowAdd(false);
      await load();
    } catch (err) {
      alert('Error adding: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-loading">Loading custom category codes...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-bar">
        <input
          className="admin-search"
          placeholder="Search codes, customers, categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="admin-count">{filtered.length} codes</span>
        <button
          className="admin-btn admin-btn--secondary"
          onClick={() => exportToCsv('customcategorycodes-export.csv', filtered.map(({ id: _id, ...rest }) => rest))}
        >
          Export CSV
        </button>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => {
            setShowAdd(!showAdd);
            if (!showAdd) {
              setAddData({
                ...EMPTY_CODE,
                submittedBy: user?.displayName || user?.email || '',
                timestamp: new Date().toISOString(),
              });
            }
          }}
        >
          {showAdd ? 'Cancel' : '+ Add Code'}
        </button>
      </div>

      {showAdd && (
        <div className="admin-form-card">
          <h4>Add Custom Category Code</h4>
          <div className="admin-form-grid">
            <label>
              Category Code *
              <input value={addData.categoryCode} onChange={(e) => setAddData({ ...addData, categoryCode: e.target.value })} />
            </label>
            <label>
              Customer
              <input value={addData.customer} onChange={(e) => setAddData({ ...addData, customer: e.target.value })} />
            </label>
            <label>
              Category
              <input value={addData.category} onChange={(e) => setAddData({ ...addData, category: e.target.value })} />
            </label>
            <label>
              Submitted By
              <input value={addData.submittedBy} onChange={(e) => setAddData({ ...addData, submittedBy: e.target.value })} />
            </label>
            <label>
              Job IDs
              <input value={addData.jobIds} onChange={(e) => setAddData({ ...addData, jobIds: e.target.value })} />
            </label>
            <label>
              Code Type
              <input value={addData.codeType} onChange={(e) => setAddData({ ...addData, codeType: e.target.value })} />
            </label>
            <label className="admin-form-wide">
              Notes
              <textarea rows={2} value={addData.notes} onChange={(e) => setAddData({ ...addData, notes: e.target.value })} />
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
              <th>Category Code</th>
              <th>Customer</th>
              <th>Category</th>
              <th>Submitted By</th>
              <th>Job IDs</th>
              <th>Notes</th>
              <th>Timestamp</th>
              <th className="admin-table-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) =>
              editingId === c.id ? (
                <tr key={c.id} className="admin-row-editing">
                  <td><input value={editData.categoryCode} onChange={(e) => setEditData({ ...editData, categoryCode: e.target.value })} /></td>
                  <td><input value={editData.customer} onChange={(e) => setEditData({ ...editData, customer: e.target.value })} /></td>
                  <td><input value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} /></td>
                  <td><input value={editData.submittedBy} onChange={(e) => setEditData({ ...editData, submittedBy: e.target.value })} /></td>
                  <td><input value={editData.jobIds} onChange={(e) => setEditData({ ...editData, jobIds: e.target.value })} /></td>
                  <td><input value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} /></td>
                  <td><input value={editData.timestamp} onChange={(e) => setEditData({ ...editData, timestamp: e.target.value })} /></td>
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
                <tr key={c.id}>
                  <td className="admin-cell-name">{c.categoryCode}</td>
                  <td>{c.customer}</td>
                  <td>{c.category}</td>
                  <td>{c.submittedBy}</td>
                  <td>{c.jobIds}</td>
                  <td className="admin-cell-notes">{c.notes}</td>
                  <td className="admin-cell-notes">{c.timestamp}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => startEdit(c)}>
                      Edit
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(c.id, c.categoryCode)}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                  No custom category codes yet. Click "+ Add Code" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
