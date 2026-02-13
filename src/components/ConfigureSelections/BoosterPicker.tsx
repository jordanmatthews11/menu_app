import { useState } from 'react';
import type { Booster, BoosterSelection } from '../../types';

interface BoosterPickerProps {
  boosters: Booster[];
  selectedBoosters: BoosterSelection[];
  onToggleBooster: (boosterId: string) => void;
  onUpdateBoosterQuota: (boosterId: string, monthlyQuota: number) => void;
}

export const BoosterPicker = ({
  boosters,
  selectedBoosters,
  onToggleBooster,
  onUpdateBoosterQuota,
}: BoosterPickerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredBoosters = boosters.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedIds = selectedBoosters.map((s) => s.boosterId);
  const selectedCount = selectedBoosters.length;

  return (
    <div className="booster-picker">
      <div className="section-header">
        <h4>B. Add Optional Boosters</h4>
        <span className="booster-count">{selectedCount} booster{selectedCount !== 1 ? 's' : ''} selected</span>
      </div>

      <div className="booster-actions">
        <button className="btn-add-edit" onClick={() => setIsModalOpen(true)}>
          + Add/Edit
        </button>
      </div>

      {selectedCount > 0 && (
        <div className="selected-boosters">
          {selectedBoosters.map((sel) => {
            const booster = boosters.find((b) => b.id === sel.boosterId);
            if (!booster) return null;
            return (
              <div key={sel.boosterId} className="selected-booster-row">
                <div className="selected-booster-tag">
                  <span>{booster.name}</span>
                  <button
                    className="btn-remove-tag"
                    onClick={() => onToggleBooster(sel.boosterId)}
                    title="Remove"
                  >
                    x
                  </button>
                </div>
                <div className="booster-quota-input">
                  <label>Monthly stores:</label>
                  <input
                    type="number"
                    min={1}
                    value={sel.monthlyQuota || ''}
                    placeholder="0"
                    onChange={(e) =>
                      onUpdateBoosterQuota(sel.boosterId, parseInt(e.target.value, 10) || 0)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Boosters</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                X
              </button>
            </div>

            <div className="modal-search">
              <input
                type="text"
                placeholder="Search retailers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-list">
              {filteredBoosters.length === 0 ? (
                <p className="no-data">No boosters found.</p>
              ) : (
                filteredBoosters.map((booster) => {
                  const isSelected = selectedIds.includes(booster.id);
                  return (
                    <label key={booster.id} className={`booster-item ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleBooster(booster.id)}
                      />
                      <span className="booster-name">{booster.name}</span>
                      <span className="booster-country">{booster.country}</span>
                    </label>
                  );
                })
              )}
            </div>

            <div className="modal-footer">
              <span>{selectedCount} selected</span>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
