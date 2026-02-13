import type { CategoryConfig, StoreList, Booster } from '../../types';
import { StoreListPicker } from './StoreListPicker';
import { BoosterPicker } from './BoosterPicker';

interface CategoryConfigPanelProps {
  config: CategoryConfig;
  storeLists: StoreList[];
  boosters: Booster[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (updated: CategoryConfig) => void;
  onApplyToAll: () => void;
  onClearSelections: () => void;
}

export const CategoryConfigPanel = ({
  config,
  storeLists,
  boosters,
  isExpanded,
  onToggleExpand,
  onChange,
  onApplyToAll,
  onClearSelections,
}: CategoryConfigPanelProps) => {
  const countryStoreLists = storeLists.filter(
    (sl) => sl.country === config.country
  );
  const countryBoosters = boosters.filter(
    (b) => b.country === config.country
  );

  const hasLists = config.selectedStoreLists.length > 0;
  const needsDate = !config.startDate || !config.endDate;

  const handleToggleList = (listName: string) => {
    const updated = { ...config };
    if (updated.selectedStoreLists.includes(listName)) {
      updated.selectedStoreLists = updated.selectedStoreLists.filter(
        (n) => n !== listName
      );
    } else {
      updated.selectedStoreLists = [...updated.selectedStoreLists, listName];
    }
    onChange(updated);
  };

  const handleToggleProceedWithout = () => {
    const updated = { ...config };
    updated.proceedWithoutList = !updated.proceedWithoutList;
    if (updated.proceedWithoutList) {
      updated.selectedStoreLists = [];
    }
    onChange(updated);
  };

  const handleToggleBooster = (boosterId: string) => {
    const updated = { ...config };
    const exists = updated.selectedBoosters.find((s) => s.boosterId === boosterId);
    if (exists) {
      updated.selectedBoosters = updated.selectedBoosters.filter(
        (s) => s.boosterId !== boosterId
      );
    } else {
      updated.selectedBoosters = [...updated.selectedBoosters, { boosterId, monthlyQuota: 0 }];
    }
    onChange(updated);
  };

  const handleUpdateBoosterQuota = (boosterId: string, monthlyQuota: number) => {
    const updated = { ...config };
    updated.selectedBoosters = updated.selectedBoosters.map((s) =>
      s.boosterId === boosterId ? { ...s, monthlyQuota } : s
    );
    onChange(updated);
  };

  return (
    <div className="category-config-panel">
      <div className="config-header" onClick={onToggleExpand}>
        <div className="config-title">
          <span className="config-name">{config.categoryName}</span>
          <span className="config-country">{config.country}</span>
        </div>
        <div className="config-badges">
          {hasLists && (
            <span className="badge badge-list">
              {config.selectedStoreLists.length} list{config.selectedStoreLists.length !== 1 ? 's' : ''}
            </span>
          )}
          {needsDate && <span className="badge badge-warn">Date required</span>}
        </div>
        <button className="btn-collapse">
          {isExpanded ? 'Collapse' : 'Expand'} <span>{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="config-body">
          <div className="config-actions">
            <button className="btn-action" onClick={onApplyToAll}>
              Apply this setup to All
            </button>
            <button className="btn-action btn-action-danger" onClick={onClearSelections}>
              Clear Selections
            </button>
          </div>

          <StoreListPicker
            storeLists={countryStoreLists}
            selectedListNames={config.selectedStoreLists}
            proceedWithoutList={config.proceedWithoutList}
            onToggleList={handleToggleList}
            onToggleProceedWithout={handleToggleProceedWithout}
          />

          <BoosterPicker
            boosters={countryBoosters}
            selectedBoosters={config.selectedBoosters}
            onToggleBooster={handleToggleBooster}
            onUpdateBoosterQuota={handleUpdateBoosterQuota}
          />

          <div className="date-section">
            <div className="section-header">
              <h4>C. Collection Period (Required)</h4>
            </div>
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor={`start-${config.categoryId}-${config.country}`}>Start Date</label>
                <input
                  id={`start-${config.categoryId}-${config.country}`}
                  type="date"
                  value={config.startDate}
                  onChange={(e) =>
                    onChange({ ...config, startDate: e.target.value })
                  }
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label htmlFor={`end-${config.categoryId}-${config.country}`}>End Date</label>
                <input
                  id={`end-${config.categoryId}-${config.country}`}
                  type="date"
                  value={config.endDate}
                  onChange={(e) =>
                    onChange({ ...config, endDate: e.target.value })
                  }
                  min={config.startDate || undefined}
                  className="date-input"
                />
              </div>
            </div>
          </div>

          <div className="notes-section">
            <div className="section-header">
              <h4>D. Collection Notes</h4>
            </div>
            <textarea
              placeholder="Add any specific instructions or comments for this category..."
              value={config.collectionNotes}
              onChange={(e) =>
                onChange({ ...config, collectionNotes: e.target.value })
              }
              className="notes-textarea"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
};
