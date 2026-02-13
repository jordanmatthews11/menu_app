import { useState, useEffect, useMemo } from 'react';
import { fetchCategories, fetchCustomCodes } from '../services/firestoreService';
import { exportToCsv } from '../utils/exportCsv';
import './MasterCodeDirectory.css';

interface CodeRow {
  category: string;
  code: string;
  codeType: 'Standard' | 'Custom';
  country: string;
  department: string;
  customer: string;
}

interface DuplicateGroup {
  code: string;
  entries: CodeRow[];
}

export const MasterCodeDirectory = () => {
  const [rows, setRows] = useState<CodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [ignoreUniquePerCountry, setIgnoreUniquePerCountry] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cats, customs] = await Promise.all([
          fetchCategories(),
          fetchCustomCodes(),
        ]);

        const standardRows: CodeRow[] = cats
          .filter((c) => (c.number || '').trim())
          .map((c) => ({
            category: c.name,
            code: c.number,
            codeType: 'Standard' as const,
            country: c.country,
            department: c.department,
            customer: '--',
          }));

        const customRows: CodeRow[] = customs
          .filter((c) => (c.categoryCode || '').trim())
          .map((c) => ({
            category: c.category,
            code: c.categoryCode,
            codeType: 'Custom' as const,
            country: '',
            department: '',
            customer: c.customer || '--',
          }));

        setRows([...standardRows, ...customRows].sort((a, b) => a.category.localeCompare(b.category)));
      } catch (err) {
        console.error('Error loading code directory:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Unique countries for dropdown
  const countries = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.country && r.country.trim()) set.add(r.country.trim());
    });
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (countryFilter && r.country !== countryFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.category.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.codeType.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q)
      );
    });
  }, [rows, search, countryFilter]);

  // Compute duplicate groups
  const duplicateGroups = useMemo((): DuplicateGroup[] => {
    // Group all rows by code
    const map = new Map<string, CodeRow[]>();
    rows.forEach((r) => {
      const key = r.code.trim();
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });

    // Only keep codes with 2+ entries
    let groups: DuplicateGroup[] = [];
    map.forEach((entries, code) => {
      if (entries.length >= 2) {
        groups.push({ code, entries });
      }
    });

    // When checkbox is checked, filter out groups where every entry
    // has a unique country (i.e. the code is only used once per country)
    if (ignoreUniquePerCountry) {
      groups = groups.filter((g) => {
        const countryCounts = new Map<string, number>();
        g.entries.forEach((e) => {
          const c = (e.country || '').trim().toLowerCase();
          countryCounts.set(c, (countryCounts.get(c) || 0) + 1);
        });
        // Keep the group if ANY country appears more than once,
        // OR if different categories share the same code in the same country
        const hasCountryDuplicate = Array.from(countryCounts.values()).some((v) => v > 1);
        return hasCountryDuplicate;
      });
    }

    // Sort by code numerically (fall back to string)
    groups.sort((a, b) => {
      const na = parseInt(a.code, 10);
      const nb = parseInt(b.code, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.code.localeCompare(b.code);
    });

    return groups;
  }, [rows, ignoreUniquePerCountry]);

  if (loading) {
    return (
      <div className="mcd">
        <p className="mcd-loading">Loading code directory...</p>
      </div>
    );
  }

  return (
    <div className="mcd">
      <div className="mcd-header">
        <h2>Master Code Directory</h2>
        <p className="mcd-subtitle">
          A master reference for all standard, custom, and legacy category codes.
        </p>
      </div>

      <div className="mcd-toolbar">
        <span className="mcd-count">Directory ({filtered.length} results)</span>
        <div className="mcd-toolbar-right">
          <input
            type="text"
            className="mcd-search"
            placeholder="Search all fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="mcd-country-select"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            className="mcd-dup-btn"
            onClick={() => setShowDuplicates(true)}
          >
            Identify Duplicate Codes
          </button>
          <button
            className="mcd-export-btn"
            onClick={() => exportToCsv('master-code-directory.csv', filtered as unknown as Record<string, unknown>[])}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mcd-table-wrap">
        <table className="mcd-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Code</th>
              <th>Code Type</th>
              <th>Country</th>
              <th>Department</th>
              <th>Customer</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={`${r.code}-${r.country}-${i}`}>
                <td className="mcd-cell-category">{r.category}</td>
                <td><span className="mcd-code-badge">{r.code}</span></td>
                <td>
                  <span className={`mcd-type-badge mcd-type-badge--${r.codeType.toLowerCase()}`}>
                    {r.codeType}
                  </span>
                </td>
                <td>{r.country}</td>
                <td>{r.department}</td>
                <td>{r.customer}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="mcd-empty">
                  No codes match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Duplicate Code Report Modal */}
      {showDuplicates && (
        <div className="dup-overlay" onClick={() => setShowDuplicates(false)}>
          <div className="dup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dup-modal-header">
              <div>
                <h3 className="dup-title">Duplicate Code Report</h3>
                <p className="dup-desc">
                  The following codes appear more than once in the directory. These should be reviewed for accuracy.
                </p>
              </div>
              <button className="dup-close-x" onClick={() => setShowDuplicates(false)}>
                &times;
              </button>
            </div>

            <label className="dup-checkbox-label">
              <input
                type="checkbox"
                checked={ignoreUniquePerCountry}
                onChange={(e) => setIgnoreUniquePerCountry(e.target.checked)}
              />
              Ignore entries that are unique per country
            </label>

            <div className="dup-body">
              {duplicateGroups.length === 0 ? (
                <p className="dup-none">No duplicate codes found.</p>
              ) : (
                duplicateGroups.map((g) => (
                  <div key={g.code} className="dup-group">
                    <div className="dup-group-header">
                      <span>Duplicate Code: </span>
                      <span className="dup-code-badge">{g.code}</span>
                    </div>
                    <table className="dup-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Code Type</th>
                          <th>Country/Customer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.entries.map((e, i) => (
                          <tr key={i}>
                            <td>{e.category}</td>
                            <td>
                              <span className={`mcd-type-badge mcd-type-badge--${e.codeType.toLowerCase()}`}>
                                {e.codeType}
                              </span>
                            </td>
                            <td>{e.country || e.customer || '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>

            <div className="dup-footer">
              <button className="dup-close-btn" onClick={() => setShowDuplicates(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
