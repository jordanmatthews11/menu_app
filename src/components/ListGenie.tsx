import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import type { Booster, StoreList } from '../types';
import { loadBoosters } from '../data/boosters';
import './ListGenie.css';

interface GenieRecommendation {
  list: StoreList;
  overlapPercent: number;
  weightedPercent: number;
  matchedRetailerNames: Set<string>;
  suggestedBoosters: string[];
}

function normalizeName(s: string): string {
  return s.toLowerCase().trim();
}

function computeRecommendations(
  pickedRetailers: Booster[],
  storeLists: StoreList[],
  country: string
): GenieRecommendation[] {
  const listsForCountry = storeLists.filter((l) => l.country === country);
  const n = pickedRetailers.length;
  const maxWeight = n > 0 ? (n * (n + 1)) / 2 : 0; // 1+2+...+n

  return listsForCountry.map((list) => {
    const listRetailerNames = new Set(
      list.retailers.map((r) => normalizeName(r.retailer))
    );
    const matched: string[] = [];
    let weightedSum = 0;
    pickedRetailers.forEach((b, index) => {
      const rank = index + 1;
      const points = n - rank + 1; // rank 1 = n points, rank n = 1 point
      const nameNorm = normalizeName(b.name);
      if (listRetailerNames.has(nameNorm)) {
        matched.push(b.name);
        weightedSum += points;
      }
    });
    const overlapPercent =
      n === 0 ? 0 : Math.round((matched.length / n) * 100);
    const weightedPercent =
      maxWeight === 0 ? 0 : Math.round((weightedSum / maxWeight) * 100);
    const suggestedBoosters = pickedRetailers
      .map((b) => b.name)
      .filter((name) => !listRetailerNames.has(normalizeName(name)));

    return {
      list,
      overlapPercent,
      weightedPercent,
      matchedRetailerNames: new Set(matched.map(normalizeName)),
      suggestedBoosters,
    };
  });
}

interface ListGenieProps {
  storeLists: StoreList[];
}

export const ListGenie = ({ storeLists }: ListGenieProps) => {
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const [loadingBoosters, setLoadingBoosters] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [pickedRetailers, setPickedRetailers] = useState<Booster[]>([]);
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadBoosters().then((b) => {
      setBoosters(b);
      setLoadingBoosters(false);
    });
  }, []);

  const countries = useMemo(() => {
    const fromLists = new Set(storeLists.map((l) => l.country));
    const fromBoosters = new Set(boosters.map((b) => b.country));
    return Array.from(new Set([...fromLists, ...fromBoosters])).sort();
  }, [storeLists, boosters]);

  useEffect(() => {
    if (selectedCountry === '' && countries.length > 0) {
      setSelectedCountry(countries[0]);
    }
  }, [countries, selectedCountry]);

  const availableBoosters = useMemo(() => {
    return boosters.filter(
      (b) =>
        b.country === selectedCountry &&
        !pickedRetailers.some(
          (p) => p.id === b.id || normalizeName(p.name) === normalizeName(b.name)
        )
    );
  }, [boosters, selectedCountry, pickedRetailers]);

  const filteredAvailable = useMemo(() => {
    if (!search.trim()) return availableBoosters;
    const q = search.toLowerCase();
    return availableBoosters.filter((b) => b.name.toLowerCase().includes(q));
  }, [availableBoosters, search]);

  const recommendations = useMemo(() => {
    if (pickedRetailers.length === 0 || !selectedCountry) return [];
    const recs = computeRecommendations(
      pickedRetailers,
      storeLists,
      selectedCountry
    );
    return recs.sort((a, b) => b.weightedPercent - a.weightedPercent);
  }, [pickedRetailers, storeLists, selectedCountry]);

  const addRetailer = (booster: Booster) => {
    setPickedRetailers((prev) => [...prev, booster]);
  };

  const removePicked = (index: number) => {
    setPickedRetailers((prev) => prev.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setPickedRetailers((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index >= pickedRetailers.length - 1) return;
    setPickedRetailers((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const askGenie = () => {
    setShowResults(true);
  };

  const exportListXLSX = (list: StoreList) => {
    const rows = list.retailers.map((r) => ({
      Retailer: r.retailer,
      Monthly: r.monthlyQuota,
    }));
    const total = list.retailers.reduce((s, r) => s + r.monthlyQuota, 0);
    rows.push({ Retailer: 'Total', Monthly: total });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    const name = `${list.name} (${list.country})`.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, name);
    XLSX.writeFile(wb, `${list.name}-${list.country}.xlsx`);
  };

  const matchBadgeClass = (pct: number) => {
    if (pct >= 60) return 'genie-match-high';
    if (pct >= 30) return 'genie-match-mid';
    return 'genie-match-low';
  };

  if (loadingBoosters) {
    return (
      <div className="list-genie">
        <p className="genie-loading">Loading retailers...</p>
      </div>
    );
  }

  return (
    <div className="list-genie">
      <h3 className="genie-title">List Genie</h3>
      <p className="genie-subtitle">
        Pick retailers you want, rank them by importance, and get the best-matching standard lists.
      </p>

      <div className="genie-panels">
        <div className="genie-panel genie-panel-pick">
          <h4>Available Retailers for {selectedCountry || '…'}</h4>
          <select
            className="genie-country-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            className="genie-search"
            placeholder="Search retailers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="genie-retailer-list">
            {filteredAvailable.length === 0 ? (
              <p className="genie-no-items">
                {availableBoosters.length === 0
                  ? 'No retailers left to add.'
                  : 'No matches for your search.'}
              </p>
            ) : (
              filteredAvailable.map((b) => (
                <div key={b.id} className="genie-retailer-row">
                  <span className="genie-retailer-name">{b.name}</span>
                  <button
                    type="button"
                    className="genie-btn-add"
                    onClick={() => addRetailer(b)}
                    title="Add to ranked list"
                  >
                    +
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="genie-panel genie-panel-rank">
          <h4>Your Ranked List ({pickedRetailers.length})</h4>
          <p className="genie-rank-hint">Drag order: use up/down to reorder (1 = most important).</p>
          <div className="genie-ranked-list">
            {pickedRetailers.length === 0 ? (
              <p className="genie-no-items">Add retailers from the left.</p>
            ) : (
              pickedRetailers.map((b, index) => (
                <div key={`${b.id}-${index}`} className="genie-ranked-row">
                  <span className="genie-rank-num">{index + 1}</span>
                  <span className="genie-ranked-name">{b.name}</span>
                  <div className="genie-ranked-actions">
                    <button
                      type="button"
                      className="genie-btn-move"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="genie-btn-move"
                      onClick={() => moveDown(index)}
                      disabled={index === pickedRetailers.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="genie-btn-remove"
                      onClick={() => removePicked(index)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            type="button"
            className="genie-btn-ask"
            onClick={askGenie}
            disabled={pickedRetailers.length === 0}
          >
            Ask the Genie
          </button>
        </div>
      </div>

      {showResults && (
        <div className="genie-results">
          <h4>Step 2: Review Genie&apos;s Recommendations</h4>
          <p className="genie-results-intro">
            The best standard lists based on your choices. Pick one and use it on the Categories page.
          </p>
          {recommendations.length === 0 ? (
            <p className="genie-no-items">
              No standard lists for {selectedCountry}. Add retailers and run the Genie.
            </p>
          ) : (
            <div className="genie-cards">
              {recommendations.map((rec) => (
                <div className="genie-card" key={`${rec.list.name}::${rec.list.country}`}>
                  <div className="genie-card-header">
                    <h5 className="genie-card-title">{rec.list.name}</h5>
                    <span className="genie-card-country">{rec.list.country}</span>
                    <span
                      className={`genie-match-badge ${matchBadgeClass(rec.weightedPercent)}`}
                    >
                      {rec.weightedPercent}% Match
                    </span>
                  </div>
                  <div className="genie-card-body">
                    <p className="genie-card-section-label">Retailers from Standard List</p>
                    <div className="genie-card-table-wrap">
                      <table className="genie-card-table">
                        <thead>
                          <tr>
                            <th>Retailer</th>
                            <th>Mthly</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rec.list.retailers.map((r) => {
                            const isMatched = rec.matchedRetailerNames.has(
                              normalizeName(r.retailer)
                            );
                            return (
                              <tr key={r.id}>
                                <td>
                                  {isMatched && (
                                    <span className="genie-check" title="In your list">✓</span>
                                  )}
                                  {r.retailer}
                                </td>
                                <td className="num">{r.monthlyQuota}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td>Total</td>
                            <td className="num">
                              {rec.list.retailers.reduce(
                                (s, r) => s + r.monthlyQuota,
                                0
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    {rec.suggestedBoosters.length > 0 && (
                      <>
                        <p className="genie-card-section-label">
                          Suggested Boosters to Add
                          <span className="genie-info-icon" title="Retailers you want that are not on this standard list">ⓘ</span>
                        </p>
                        <ul className="genie-suggested-boosters">
                          {rec.suggestedBoosters.map((name) => (
                            <li key={name}>{name}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  <div className="genie-card-actions">
                    <button
                      type="button"
                      className="genie-export-btn"
                      onClick={() => exportListXLSX(rec.list)}
                    >
                      XLSX
                    </button>
                    <button
                      type="button"
                      className="genie-export-btn"
                      onClick={() => window.print()}
                    >
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
