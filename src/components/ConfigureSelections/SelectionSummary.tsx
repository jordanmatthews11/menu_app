import { useState, useRef, useEffect } from 'react';
import type { CategoryConfig, StoreList, Booster } from '../../types';

interface SummaryRow {
  retailer: string;
  type: 'Standard' | 'Booster';
  monthlyQuota: number;
}

interface SelectionSummaryProps {
  configs: CategoryConfig[];
  storeLists: StoreList[];
  boosters: Booster[];
  activeCategoryKey: string | null; // "categoryId::country"
}

export const SelectionSummary = ({
  configs,
  storeLists,
  boosters,
  activeCategoryKey,
}: SelectionSummaryProps) => {
  // Show summary for the active category, or all if none active
  const relevantConfigs = activeCategoryKey
    ? configs.filter(
        (c) => `${c.categoryId}::${c.country}` === activeCategoryKey
      )
    : configs;

  // Build raw rows then merge duplicates by retailer+type
  const rawRows: SummaryRow[] = [];

  relevantConfigs.forEach((config) => {
    // Add standard store list retailers
    config.selectedStoreLists.forEach((listName) => {
      const list = storeLists.find(
        (sl) => sl.name === listName && sl.country === config.country
      );
      if (list) {
        list.retailers.forEach((r) => {
          rawRows.push({
            retailer: r.retailer,
            type: 'Standard',
            monthlyQuota: r.monthlyQuota,
          });
        });
      }
    });

    // Add boosters with monthly quota
    config.selectedBoosters.forEach((sel) => {
      const booster = boosters.find((b) => b.id === sel.boosterId);
      if (booster) {
        rawRows.push({
          retailer: booster.name,
          type: 'Booster',
          monthlyQuota: sel.monthlyQuota,
        });
      }
    });
  });

  // Merge rows that share the same retailer name and type
  const mergedMap = new Map<string, SummaryRow>();
  rawRows.forEach((row) => {
    const key = `${row.retailer}::${row.type}`;
    const existing = mergedMap.get(key);
    if (existing) {
      existing.monthlyQuota += row.monthlyQuota;
    } else {
      mergedMap.set(key, { ...row });
    }
  });
  const summaryRows = Array.from(mergedMap.values());

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const check = () => setCanScroll(el.scrollHeight > el.clientHeight + 4);
    check();
    // Recheck when rows change
    const obs = new ResizeObserver(check);
    obs.observe(el);
    return () => obs.disconnect();
  }, [summaryRows.length]);

  const standardRows = summaryRows.filter((r) => r.type === 'Standard');
  const boosterRows = summaryRows.filter((r) => r.type === 'Booster');
  const totalStdMonthly = standardRows.reduce(
    (s, r) => s + r.monthlyQuota,
    0
  );
  const totalBoosterMonthly = boosterRows.reduce(
    (s, r) => s + r.monthlyQuota,
    0
  );
  const totalMonthly = totalStdMonthly + totalBoosterMonthly;

  return (
    <div className="selection-summary">
      <h3>Selection Summary</h3>

      {summaryRows.length === 0 ? (
        <p className="no-data">No selections made yet.</p>
      ) : (
        <>
          <div className="summary-table-wrapper" ref={wrapperRef}>
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Retailer</th>
                  <th>Type</th>
                  <th>Monthly</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row, i) => (
                  <tr key={`${row.retailer}-${row.type}-${i}`}>
                    <td>{row.retailer}</td>
                    <td>
                      <span
                        className={`type-badge ${row.type.toLowerCase()}`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td>{row.monthlyQuota || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {canScroll && (
            <div className="summary-scroll-hint">
              ↓ Scroll to see all {summaryRows.length} retailers
            </div>
          )}

          <div className="summary-totals">
            <h4>Total Request</h4>
            <div className="totals-grid">
              <div className="total-item">
                <span className="total-label">Standard Monthly Quota:</span>
                <span className="total-value">{totalStdMonthly} stores</span>
              </div>
              {boosterRows.length > 0 && (
                <>
                  <div className="total-item">
                    <span className="total-label">Boosters:</span>
                    <span className="total-value">{boosterRows.length} retailer{boosterRows.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Booster Monthly Quota:</span>
                    <span className="total-value">{totalBoosterMonthly} stores</span>
                  </div>
                </>
              )}
              <div className="total-item total-highlight">
                <span className="total-label">Total Monthly Stores:</span>
                <span className="total-value">{totalMonthly} stores</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
