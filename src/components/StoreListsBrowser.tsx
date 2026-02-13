import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import type { StoreList } from '../types';
import { loadStoreLists } from '../data/storeLists';
import './StoreListsBrowser.css';

export const StoreListsBrowser = () => {
  const [storeLists, setStoreLists] = useState<StoreList[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStoreLists().then((lists) => {
      setStoreLists(lists);
      setLoading(false);
    });
  }, []);

  const countries = useMemo(() => {
    const set = new Set(storeLists.map((l) => l.country));
    return Array.from(set).sort();
  }, [storeLists]);

  const filtered = storeLists.filter((list) => {
    if (countryFilter !== 'All' && list.country !== countryFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      list.name.toLowerCase().includes(q) ||
      list.country.toLowerCase().includes(q) ||
      list.retailers.some((r) => r.retailer.toLowerCase().includes(q))
    );
  });

  const listKey = (list: StoreList) => `${list.name}::${list.country}`;

  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    const allKeys = filtered.map(listKey);
    const allSelected = allKeys.every((k) => selectedKeys.has(k));
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(allKeys));
    }
  };

  const exportToExcel = () => {
    const selected = storeLists.filter((l) => selectedKeys.has(listKey(l)));
    if (selected.length === 0) {
      alert('Please select at least one store list to export.');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Create one sheet per selected list
    selected.forEach((list) => {
      const rows = list.retailers.map((r) => ({
        Retailer: r.retailer,
        'Monthly Quota': r.monthlyQuota,
      }));
      // Add a totals row
      const totalMonthly = list.retailers.reduce((s, r) => s + r.monthlyQuota, 0);
      rows.push({ Retailer: 'Total', 'Monthly Quota': totalMonthly });

      const ws = XLSX.utils.json_to_sheet(rows);
      // Sheet name max 31 chars
      const sheetName = `${list.name} (${list.country})`.slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, 'store-lists-export.xlsx');
  };

  if (loading) {
    return (
      <div className="slb">
        <p className="slb-loading">Loading standard store lists...</p>
      </div>
    );
  }

  return (
    <div className="slb">
      <div className="slb-header">
        <div>
          <h2>Standard Store Lists</h2>
          <p className="slb-subtitle">
            Browse the standard list for your customer. Select a list below to see what retailers, store count, and PDF versions are available.
          </p>
        </div>
      </div>

      <div className="slb-toolbar">
        <input
          type="text"
          className="slb-search"
          placeholder="Search store lists or retailers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="slb-country-filter"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
        >
          <option value="All">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(search || countryFilter !== 'All') && (
          <span className="slb-search-count">
            {filtered.length} list{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="slb-actions-bar">
        <label className="slb-select-all">
          <input
            type="checkbox"
            checked={filtered.length > 0 && filtered.every((l) => selectedKeys.has(listKey(l)))}
            onChange={selectAll}
          />
          <span>Select All</span>
        </label>
        {selectedKeys.size > 0 && (
          <span className="slb-selected-count">{selectedKeys.size} selected</span>
        )}
        <button
          className="slb-export-btn"
          onClick={exportToExcel}
          disabled={selectedKeys.size === 0}
        >
          Export to Excel
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="slb-empty">No store lists match your search.</p>
      ) : (
        <div className="slb-scroll">
          {filtered.map((list) => {
            const totalMonthly = list.retailers.reduce((s, r) => s + r.monthlyQuota, 0);

            return (
              <div className={`slb-card${selectedKeys.has(listKey(list)) ? ' slb-card--selected' : ''}`} key={listKey(list)}>
                <div className="slb-card-header">
                  <label className="slb-card-check" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedKeys.has(listKey(list))}
                      onChange={() => toggleSelect(listKey(list))}
                    />
                  </label>
                  <h3 className="slb-card-title">{list.name}</h3>
                  <div className="slb-card-meta">
                    <span className="slb-country">{list.country}</span>
                    <span className="slb-count">{list.retailers.length} Retailers</span>
                  </div>
                </div>

                <div className="slb-card-table-wrap">
                  <table className="slb-card-table">
                    <thead>
                      <tr>
                        <th>Retailer</th>
                        <th>Monthly</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.retailers.map((r) => (
                        <tr key={r.id}>
                          <td>{r.retailer}</td>
                          <td className="num">{r.monthlyQuota}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total</td>
                        <td className="num">{totalMonthly}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
