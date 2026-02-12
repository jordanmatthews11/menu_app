import type { CategoryConfig, StoreList, Booster } from '../../types';

interface SummaryRow {
  retailer: string;
  type: 'Standard' | 'Booster';
  weeklyQuota: number;
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

  const summaryRows: SummaryRow[] = [];

  relevantConfigs.forEach((config) => {
    // Add standard store list retailers
    config.selectedStoreLists.forEach((listName) => {
      const list = storeLists.find(
        (sl) => sl.name === listName && sl.country === config.country
      );
      if (list) {
        list.retailers.forEach((r) => {
          summaryRows.push({
            retailer: r.retailer,
            type: 'Standard',
            weeklyQuota: r.weeklyQuota,
            monthlyQuota: r.monthlyQuota,
          });
        });
      }
    });

    // Add boosters (no quota info)
    config.selectedBoosters.forEach((boosterId) => {
      const booster = boosters.find((b) => b.id === boosterId);
      if (booster) {
        summaryRows.push({
          retailer: booster.name,
          type: 'Booster',
          weeklyQuota: 0,
          monthlyQuota: 0,
        });
      }
    });
  });

  const standardRows = summaryRows.filter((r) => r.type === 'Standard');
  const boosterRows = summaryRows.filter((r) => r.type === 'Booster');
  const totalStdWeekly = standardRows.reduce((s, r) => s + r.weeklyQuota, 0);
  const totalStdMonthly = standardRows.reduce(
    (s, r) => s + r.monthlyQuota,
    0
  );
  const totalWeekly = totalStdWeekly;
  const totalMonthly = totalStdMonthly;

  return (
    <div className="selection-summary">
      <h3>Selection Summary</h3>

      {summaryRows.length === 0 ? (
        <p className="no-data">No selections made yet.</p>
      ) : (
        <>
          <div className="summary-table-wrapper">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Retailer</th>
                  <th>Type</th>
                  <th>Weekly</th>
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
                    <td>{row.weeklyQuota || '-'}</td>
                    <td>{row.monthlyQuota || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary-totals">
            <h4>Total Request</h4>
            <div className="totals-grid">
              <div className="total-item">
                <span className="total-label">Standard Weekly Quota:</span>
                <span className="total-value">{totalStdWeekly} stores</span>
              </div>
              <div className="total-item">
                <span className="total-label">Standard Monthly Quota:</span>
                <span className="total-value">{totalStdMonthly} stores</span>
              </div>
              {boosterRows.length > 0 && (
                <div className="total-item">
                  <span className="total-label">Boosters:</span>
                  <span className="total-value">{boosterRows.length} retailer{boosterRows.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="total-item total-highlight">
                <span className="total-label">Total Weekly Stores:</span>
                <span className="total-value">{totalWeekly} stores</span>
              </div>
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
