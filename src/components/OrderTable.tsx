import { useState } from 'react';
import { format } from 'date-fns';
import type { OrderEntry } from '../types';
import './OrderTable.css';

interface OrderTableProps {
  entries: OrderEntry[];
  onClearAll: () => void;
  onSubmitOrder?: () => Promise<void>;
  onAddMore?: () => void;
}

export const OrderTable = ({ entries, onClearAll, onSubmitOrder, onAddMore }: OrderTableProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!onSubmitOrder) return;
    if (!window.confirm('Submit this order? Once submitted, the entries will be saved and cleared from this view.')) return;
    setSubmitting(true);
    try {
      await onSubmitOrder();
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Error submitting order:', err);
      alert('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="order-table-container">
        <div className="empty-state">
          {submitSuccess ? (
            <>
              <p className="submit-success-msg">Order submitted successfully!</p>
              <p className="empty-state-subtitle">Your order has been saved. View it on the "Review Submitted Orders" tab.</p>
            </>
          ) : (
            <>
              <p>No orders submitted yet.</p>
              <p className="empty-state-subtitle">Complete the steps above to add orders to the table.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="order-table-container">
      <div className="table-header">
        <h2>Review & Submit</h2>
        <div className="table-header-actions">
          {onAddMore && (
            <button className="btn btn-secondary" onClick={onAddMore}>
              + Add More Categories
            </button>
          )}
          {onSubmitOrder && (
            <button
              className="btn btn-submit-order"
              onClick={handleSubmit}
              disabled={submitting || entries.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Order'}
            </button>
          )}
          <button className="btn btn-danger" onClick={onClearAll}>
            Clear All
          </button>
        </div>
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
              <th>Monthly</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Notes</th>
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
                <td>{entry.monthlyQuota ?? '-'}</td>
                <td>{format(new Date(entry.startDate), 'MMM dd, yyyy')}</td>
                <td>{format(new Date(entry.endDate), 'MMM dd, yyyy')}</td>
                <td className="notes-cell" title={entry.collectionNotes || ''}>
                  {entry.collectionNotes || '-'}
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
