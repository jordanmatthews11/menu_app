import { useState, useEffect, useCallback } from 'react';
import type { CategoryDoc } from '../../types';
import { exportToCsv } from '../../utils/exportCsv';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../../services/firestoreService';
import { invalidateCategoriesCache } from '../../data/categories';

const EMPTY_CAT: Omit<CategoryDoc, 'id'> = {
  name: '',
  country: '',
  department: '',
  subDepartment: '',
  description: '',
  exampleBrands: '',
  notes: '',
  number: '',
  premium: false,
};

export const CategoriesAdmin = () => {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<CategoryDoc, 'id'>>(EMPTY_CAT);
  const [showAdd, setShowAdd] = useState(false);
  const [addData, setAddData] = useState<Omit<CategoryDoc, 'id'>>(EMPTY_CAT);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await fetchCategories();
      setCategories(docs.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = categories.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.exampleBrands.toLowerCase().includes(q)
    );
  });

  const startEdit = (cat: CategoryDoc) => {
    setEditingId(cat.id);
    setEditData({
      name: cat.name,
      country: cat.country,
      department: cat.department,
      subDepartment: cat.subDepartment,
      description: cat.description,
      exampleBrands: cat.exampleBrands,
      notes: cat.notes,
      number: cat.number,
      premium: cat.premium,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(EMPTY_CAT);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateCategory(editingId, editData);
      invalidateCategoriesCache();
      await load();
      setEditingId(null);
    } catch (err) {
      alert('Error saving: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    try {
      await deleteCategory(id);
      invalidateCategoriesCache();
      await load();
    } catch (err) {
      alert('Error deleting: ' + (err instanceof Error ? err.message : err));
    }
  };

  const handleAdd = async () => {
    if (!addData.name.trim()) {
      alert('Name is required');
      return;
    }
    setSaving(true);
    try {
      await addCategory(addData);
      invalidateCategoriesCache();
      setAddData(EMPTY_CAT);
      setShowAdd(false);
      await load();
    } catch (err) {
      alert('Error adding: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-loading">Loading categories...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-bar">
        <input
          className="admin-search"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="admin-count">{filtered.length} categories</span>
        <button
          className="admin-btn admin-btn--secondary"
          onClick={() => exportToCsv('categories-export.csv', filtered.map(({ id: _id, ...rest }) => rest))}
        >
          Export CSV
        </button>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="admin-form-card">
          <h4>Add New Category</h4>
          <div className="admin-form-grid">
            <label>
              Name *
              <input value={addData.name} onChange={(e) => setAddData({ ...addData, name: e.target.value })} />
            </label>
            <label>
              Country
              <input value={addData.country} onChange={(e) => setAddData({ ...addData, country: e.target.value })} />
            </label>
            <label>
              Department
              <input value={addData.department} onChange={(e) => setAddData({ ...addData, department: e.target.value })} />
            </label>
            <label>
              Sub-Department
              <input value={addData.subDepartment} onChange={(e) => setAddData({ ...addData, subDepartment: e.target.value })} />
            </label>
            <label>
              Number
              <input value={addData.number} onChange={(e) => setAddData({ ...addData, number: e.target.value })} />
            </label>
            <label className="admin-form-checkbox">
              <input type="checkbox" checked={addData.premium} onChange={(e) => setAddData({ ...addData, premium: e.target.checked })} />
              Premium
            </label>
            <label className="admin-form-wide">
              Example Brands
              <input value={addData.exampleBrands} onChange={(e) => setAddData({ ...addData, exampleBrands: e.target.value })} />
            </label>
            <label className="admin-form-wide">
              Description
              <textarea rows={2} value={addData.description} onChange={(e) => setAddData({ ...addData, description: e.target.value })} />
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

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Country</th>
              <th>Department</th>
              <th>Sub-Dept</th>
              <th>Number</th>
              <th>Premium</th>
              <th>Example Brands</th>
              <th>Description</th>
              <th>Notes</th>
              <th className="admin-table-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cat) =>
              editingId === cat.id ? (
                <tr key={cat.id} className="admin-row-editing">
                  <td><input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /></td>
                  <td><input value={editData.country} onChange={(e) => setEditData({ ...editData, country: e.target.value })} /></td>
                  <td><input value={editData.department} onChange={(e) => setEditData({ ...editData, department: e.target.value })} /></td>
                  <td><input value={editData.subDepartment} onChange={(e) => setEditData({ ...editData, subDepartment: e.target.value })} /></td>
                  <td><input value={editData.number} onChange={(e) => setEditData({ ...editData, number: e.target.value })} /></td>
                  <td><input type="checkbox" checked={editData.premium} onChange={(e) => setEditData({ ...editData, premium: e.target.checked })} /></td>
                  <td><input value={editData.exampleBrands} onChange={(e) => setEditData({ ...editData, exampleBrands: e.target.value })} /></td>
                  <td><input value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} /></td>
                  <td><input value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} /></td>
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
                <tr key={cat.id}>
                  <td className="admin-cell-name">{cat.name}</td>
                  <td><span className="admin-badge">{cat.country}</span></td>
                  <td>{cat.department}</td>
                  <td>{cat.subDepartment}</td>
                  <td>{cat.number}</td>
                  <td>{cat.premium ? 'Yes' : ''}</td>
                  <td className="admin-cell-brands">{cat.exampleBrands}</td>
                  <td className="admin-cell-desc">{cat.description}</td>
                  <td className="admin-cell-notes">{cat.notes}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => startEdit(cat)}>
                      Edit
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(cat.id, cat.name)}>
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
