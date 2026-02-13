import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import type { SubmittedOrder, OrderEntry } from '../types';
import { fetchSubmittedOrders, deleteSubmittedOrder } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import './SubmittedOrdersReview.css';

function getCategoryRollup(entries: OrderEntry[]) {
  const map = new Map<string, { standard: number; booster: number; monthlyTotal: number }>();
  entries.forEach((e) => {
    const key = `${e.category} (${e.country})`;
    if (!map.has(key)) map.set(key, { standard: 0, booster: 0, monthlyTotal: 0 });
    const data = map.get(key)!;
    if (e.type === 'standard') data.standard++;
    else data.booster++;
    data.monthlyTotal += e.monthlyQuota ?? 0;
  });
  return Array.from(map.entries()).map(([label, data]) => ({
    label,
    standard: data.standard,
    booster: data.booster,
    monthlyTotal: data.monthlyTotal,
  }));
}

export const SubmittedOrdersReview = () => {
  const { isAuthorized } = useAuth();
  const [orders, setOrders] = useState<SubmittedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchSubmittedOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error loading submitted orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submitted order?')) return;
    try {
      await deleteSubmittedOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) => {
      if (o.submittedBy.toLowerCase().includes(q)) return true;
      if (o.submittedByEmail.toLowerCase().includes(q)) return true;
      return o.entries.some(
        (e) =>
          e.category.toLowerCase().includes(q) ||
          e.retailer.toLowerCase().includes(q) ||
          e.country.toLowerCase().includes(q)
      );
    });
  }, [orders, search]);

  if (loading) {
    return (
      <div className="sor">
        <p className="sor-loading">Loading submitted orders...</p>
      </div>
    );
  }

  return (
    <div className="sor">
      <div className="sor-header">
        <h2>Review Submitted Orders</h2>
        <p className="sor-subtitle">
          All finalized orders submitted by your team.
        </p>
      </div>

      <div className="sor-toolbar">
        <span className="sor-count">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
        <input
          type="text"
          className="sor-search"
          placeholder="Search by name, category, retailer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="sor-empty">
          {orders.length === 0
            ? 'No orders have been submitted yet.'
            : 'No orders match your search.'}
        </div>
      ) : (
        <div className="sor-list">
          {filtered.map((order, idx) => (
            <div key={order.id} className={`sor-card${expandedId === order.id ? ' sor-card--expanded' : ''}`}>
              <div className="sor-card-summary" onClick={() => toggleExpand(order.id)}>
                <div className="sor-card-top-row">
                  <div className="sor-card-left">
                    <span className="sor-order-num">#{filtered.length - idx}</span>
                    <div className="sor-card-info">
                      <span className="sor-submitted-by">{order.submittedBy}</span>
                      <span className="sor-submitted-date">
                        {format(new Date(order.submittedAt), 'MMM dd, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                  <div className="sor-card-right">
                    <span className="sor-status-badge">Submitted</span>
                    {isAuthorized && (
                      <button
                        className="sor-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order.id);
                        }}
                        title="Delete order"
                      >
                        X
                      </button>
                    )}
                    <span className="sor-expand-icon">{expandedId === order.id ? '\u25B2' : '\u25BC'}</span>
                  </div>
                </div>
                <div className="sor-category-rollup">
                  {getCategoryRollup(order.entries).map((item) => (
                    <span key={item.label} className="sor-rollup-item">
                      <strong>{item.label}</strong>
                      {' \u2014 '}
                      {item.standard} standard, {item.booster} booster{item.booster !== 1 ? 's' : ''}
                      {' \u00B7 '}
                      {item.monthlyTotal} per month
                    </span>
                  ))}
                </div>
              </div>

              {expandedId === order.id && (
                <div className="sor-card-detail">
                  <table className="sor-detail-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Country</th>
                        <th>Retailer</th>
                        <th>Type</th>
                        <th>Store List</th>
                        <th>Monthly</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.entries.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.category}</td>
                          <td>
                            <span className="sor-country-badge">{entry.country}</span>
                          </td>
                          <td>{entry.retailer}</td>
                          <td>
                            <span className={`sor-type-badge sor-type-badge--${entry.type}`}>
                              {entry.type === 'standard' ? 'Standard' : 'Booster'}
                            </span>
                          </td>
                          <td>{entry.storeListName || '-'}</td>
                          <td>{entry.monthlyQuota ?? '-'}</td>
                          <td>{format(new Date(entry.startDate), 'MMM dd, yyyy')}</td>
                          <td>{format(new Date(entry.endDate), 'MMM dd, yyyy')}</td>
                          <td className="sor-notes-cell" title={entry.collectionNotes || ''}>
                            {entry.collectionNotes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
