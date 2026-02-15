import { useState, useRef, useEffect } from 'react';
import type { CategoryConfig, StoreList, Booster } from '../../types';

interface MergedRow {
  retailer: string;
  standardQuota: number;
  boosterQuota: number;
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

  // Build merged rows by retailer name, combining standard + booster quotas
  const mergedMap = new Map<string, MergedRow>();

  relevantConfigs.forEach((config) => {
    // Add standard store list retailers
    config.selectedStoreLists.forEach((listName) => {
      const list = storeLists.find(
        (sl) => sl.name === listName && sl.country === config.country
      );
      if (list) {
        list.retailers.forEach((r) => {
          const existing = mergedMap.get(r.retailer);
          if (existing) {
            existing.standardQuota += r.monthlyQuota;
          } else {
            mergedMap.set(r.retailer, {
              retailer: r.retailer,
              standardQuota: r.monthlyQuota,
              boosterQuota: 0,
            });
          }
        });
      }
    });

    // Add boosters with monthly quota
    config.selectedBoosters.forEach((sel) => {
      const booster = boosters.find((b) => b.id === sel.boosterId);
      if (booster) {
        const existing = mergedMap.get(booster.name);
        if (existing) {
          existing.boosterQuota += sel.monthlyQuota;
        } else {
          mergedMap.set(booster.name, {
            retailer: booster.name,
            standardQuota: 0,
            boosterQuota: sel.monthlyQuota,
          });
        }
      }
    });
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

  const totalStdMonthly = summaryRows.reduce((s, r) => s + r.standardQuota, 0);
  const totalBoosterMonthly = summaryRows.reduce((s, r) => s + r.boosterQuota, 0);
  const boosterCount = summaryRows.filter((r) => r.boosterQuota > 0).length;
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
                {summaryRows.map((row) => {
                  const total = row.standardQuota + row.boosterQuota;
                  const hasStandard = row.standardQuota > 0;
                  const hasBooster = row.boosterQuota > 0;
                  return (
                    <tr key={row.retailer}>
                      <td>{row.retailer}</td>
                      <td>
                        {hasStandard && (
                          <span className="type-badge standard">Standard</span>
                        )}
                        {hasStandard && hasBooster && ' '}
                        {hasBooster && (
                          <span className="type-badge booster">Booster</span>
                        )}
                      </td>
                      <td>
                        {total}
                        {hasStandard && hasBooster && (
                          <span className="quota-breakdown">
                            ({row.standardQuota} + {row.boosterQuota} boost)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
              {boosterCount > 0 && (
                <>
                  <div className="total-item">
                    <span className="total-label">Boosters:</span>
                    <span className="total-value">{boosterCount} retailer{boosterCount !== 1 ? 's' : ''}</span>
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
