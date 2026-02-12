import { useState, useEffect } from 'react';
import type { StoreList } from '../types';
import { loadStoreLists } from '../data/storeLists';
import './StoreListsBrowser.css';

export const StoreListsBrowser = () => {
  const [storeLists, setStoreLists] = useState<StoreList[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadStoreLists().then((lists) => {
      setStoreLists(lists);
      setLoading(false);
    });
  }, []);

  const filtered = storeLists.filter((list) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      list.name.toLowerCase().includes(q) ||
      list.country.toLowerCase().includes(q) ||
      list.retailers.some((r) => r.retailer.toLowerCase().includes(q))
    );
  });

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
        {search && (
          <span className="slb-search-count">
            {filtered.length} list{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="slb-empty">No store lists match your search.</p>
      ) : (
        <div className="slb-scroll">
          {filtered.map((list) => {
            const totalWeekly = list.retailers.reduce((s, r) => s + r.weeklyQuota, 0);
            const totalMonthly = list.retailers.reduce((s, r) => s + r.monthlyQuota, 0);

            return (
              <div className="slb-card" key={`${list.name}::${list.country}`}>
                <div className="slb-card-header">
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
                        <th>Weekly</th>
                        <th>Monthly</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.retailers.map((r) => (
                        <tr key={r.id}>
                          <td>{r.retailer}</td>
                          <td className="num">{r.weeklyQuota}</td>
                          <td className="num">{r.monthlyQuota}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total</td>
                        <td className="num">{totalWeekly}</td>
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
