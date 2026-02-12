import { format } from 'date-fns';
import type { OrderEntry } from '../types';
import './OrderTable.css';

interface OrderTableProps {
  entries: OrderEntry[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const OrderTable = ({ entries, onDelete, onClearAll }: OrderTableProps) => {
  if (entries.length === 0) {
    return (
      <div className="order-table-container">
        <div className="empty-state">
          <p>No orders submitted yet.</p>
          <p className="empty-state-subtitle">Complete the steps above to add orders to the table.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-table-container">
      <div className="table-header">
        <h2>Order Submissions</h2>
        <button className="btn btn-danger" onClick={onClearAll}>
          Clear All
        </button>
      </div>

      <div className="table-wrapper">
        <table className="order-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Country</th>
              <th>Retailer</th>
              <th>Type</th>
              <th>Store List</th>
              <th>Weekly</th>
              <th>Monthly</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.category}</td>
                <td>
                  <span className="country-badge">{entry.country}</span>
                </td>
                <td>{entry.retailer}</td>
                <td>
                  <span className={`type-badge ${entry.type}`}>
                    {entry.type === 'standard' ? 'Standard' : 'Booster'}
                  </span>
                </td>
                <td>{entry.storeListName || '-'}</td>
                <td>{entry.weeklyQuota ?? '-'}</td>
                <td>{entry.monthlyQuota ?? '-'}</td>
                <td>{format(new Date(entry.startDate), 'MMM dd, yyyy')}</td>
                <td>{format(new Date(entry.endDate), 'MMM dd, yyyy')}</td>
                <td className="notes-cell" title={entry.collectionNotes || ''}>
                  {entry.collectionNotes || '-'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => onDelete(entry.id)}
                      title="Delete"
                    >
                      X
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>Total entries: <strong>{entries.length}</strong></p>
      </div>
    </div>
  );
};
