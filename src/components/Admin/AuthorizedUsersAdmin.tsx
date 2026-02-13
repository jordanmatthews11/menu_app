import { useState, useEffect, useCallback } from 'react';
import type { AuthorizedUser } from '../../types';
import {
  fetchAuthorizedUsers,
  addAuthorizedUser,
  updateAuthorizedUser,
  deleteAuthorizedUser,
} from '../../services/firestoreService';
import { exportToCsv } from '../../utils/exportCsv';

export const AuthorizedUsersAdmin = () => {
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [addData, setAddData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await fetchAuthorizedUsers();
      setUsers(docs.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error loading authorized users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const startEdit = (u: AuthorizedUser) => {
    setEditingId(u.id);
    setEditData({ name: u.name, email: u.email });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', email: '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateAuthorizedUser(editingId, editData);
      await load();
      setEditingId(null);
    } catch (err) {
      alert('Error saving: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from authorized users?`)) return;
    try {
      await deleteAuthorizedUser(id);
      await load();
    } catch (err) {
      alert('Error deleting: ' + (err instanceof Error ? err.message : err));
    }
  };

  const handleAdd = async () => {
    if (!addData.name.trim() || !addData.email.trim()) {
      alert('Name and Email are required');
      return;
    }
    setSaving(true);
    try {
      await addAuthorizedUser({ name: addData.name.trim(), email: addData.email.trim() });
      setAddData({ name: '', email: '' });
      setShowAdd(false);
      await load();
    } catch (err) {
      alert('Error adding: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-loading">Loading authorized users...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-bar">
        <input
          className="admin-search"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="admin-count">{filtered.length} users</span>
        <button
          className="admin-btn admin-btn--secondary"
          onClick={() => exportToCsv('authorized-users-export.csv', filtered.map(({ id: _id, ...rest }) => rest))}
        >
          Export CSV
        </button>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showAdd && (
        <div className="admin-form-card">
          <h4>Add Authorized User</h4>
          <div className="admin-form-grid">
            <label>
              Name *
              <input value={addData.name} onChange={(e) => setAddData({ ...addData, name: e.target.value })} />
            </label>
            <label>
              Email *
              <input type="email" value={addData.email} onChange={(e) => setAddData({ ...addData, email: e.target.value })} />
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
              <th>Name</th>
              <th>Email</th>
              <th className="admin-table-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) =>
              editingId === u.id ? (
                <tr key={u.id} className="admin-row-editing">
                  <td>
                    <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                  </td>
                  <td>
                    <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
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
                <tr key={u.id}>
                  <td className="admin-cell-name">{u.name}</td>
                  <td>{u.email}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => startEdit(u)}>
                      Edit
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(u.id, u.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                  No authorized users yet. Click "+ Add User" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
