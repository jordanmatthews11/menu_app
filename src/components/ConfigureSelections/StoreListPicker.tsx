import { useState } from 'react';
import type { StoreList } from '../../types';

interface StoreListPickerProps {
  storeLists: StoreList[];
  selectedListNames: string[];
  proceedWithoutList: boolean;
  onToggleList: (listName: string) => void;
  onToggleProceedWithout: () => void;
}

export const StoreListPicker = ({
  storeLists,
  selectedListNames,
  proceedWithoutList,
  onToggleList,
  onToggleProceedWithout,
}: StoreListPickerProps) => {
  const [expandedLists, setExpandedLists] = useState<string[]>([]);

  const toggleExpand = (listName: string) => {
    setExpandedLists((prev) =>
      prev.includes(listName)
        ? prev.filter((n) => n !== listName)
        : [...prev, listName]
    );
  };

  return (
    <div className="store-list-picker">
      <div className="section-header">
        <h4>A. Select Standard Store Lists (Required)</h4>
        <button className="btn-link" onClick={() => setExpandedLists([])}>
          Hide
        </button>
      </div>

      {storeLists.length === 0 ? (
        <p className="no-data">No standard store lists available for this country.</p>
      ) : (
        <div className="list-items">
          {storeLists.map((list) => {
            const isSelected = selectedListNames.includes(list.name);
            const isExpanded = expandedLists.includes(list.name);
            const totalMonthly = list.retailers.reduce((sum, r) => sum + r.monthlyQuota, 0);

            return (
              <div key={list.name} className="list-item">
                <div className="list-item-header">
                  <label className="list-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleList(list.name)}
                      disabled={proceedWithoutList}
                    />
                    <span className="list-name">{list.name}</span>
                  </label>
                  <div className="list-meta">
                    <span className="quota-badge">{totalMonthly} per month</span>
                    <button
                      className="btn-expand"
                      onClick={() => toggleExpand(list.name)}
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="list-retailers">
                    {list.retailers.map((retailer) => (
                      <div key={retailer.id} className="retailer-row">
                        <span className="retailer-name">{retailer.retailer}</span>
                        <span className="retailer-quota">
                          {retailer.monthlyQuota} per month
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <label className="proceed-without">
        <input
          type="checkbox"
          checked={proceedWithoutList}
          onChange={onToggleProceedWithout}
        />
        <span>Proceed without standard list</span>
      </label>
    </div>
  );
};
