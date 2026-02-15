import { useState, useEffect } from 'react';
import type { Category } from '../types';
import { loadCategories } from '../data/categories';
import './CategorySelection.css';

export interface CategoryCountrySelection {
  categoryId: string;
  countries: string[];
}

interface CategorySelectionProps {
  selectedCategories: CategoryCountrySelection[];
  onNext: (selections: CategoryCountrySelection[]) => void;
}

export const CategorySelection = ({ selectedCategories, onNext }: CategorySelectionProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CategoryCountrySelection[]>(selectedCategories);
  const [searchQuery, setSearchQuery] = useState('');

  // Country picker popup state
  const [countryPickerCat, setCountryPickerCat] = useState<Category | null>(null);
  const [pickerCountries, setPickerCountries] = useState<string[]>([]);

  useEffect(() => {
    loadCategories().then((loadedCategories) => {
      setCategories(loadedCategories);
      setLoading(false);
    });
  }, []);

  const isSelected = (categoryId: string) =>
    selected.some((s) => s.categoryId === categoryId);

  const toggleCategory = (category: Category) => {
    if (isSelected(category.id)) {
      // Deselect
      setSelected((prev) => prev.filter((s) => s.categoryId !== category.id));
    } else {
      // If multiple countries, show picker
      if (category.countries.length > 1) {
        setCountryPickerCat(category);
        setPickerCountries([...category.countries]); // default all checked
      } else {
        // Single country, select immediately
        setSelected((prev) => [
          ...prev,
          { categoryId: category.id, countries: [...category.countries] },
        ]);
      }
    }
  };

  const handlePickerConfirm = () => {
    if (!countryPickerCat || pickerCountries.length === 0) return;
    setSelected((prev) => [
      ...prev,
      { categoryId: countryPickerCat.id, countries: [...pickerCountries] },
    ]);
    setCountryPickerCat(null);
    setPickerCountries([]);
  };

  const handlePickerCancel = () => {
    setCountryPickerCat(null);
    setPickerCountries([]);
  };

  const togglePickerCountry = (country: string) => {
    setPickerCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const handleNext = () => {
    if (selected.length > 0) {
      onNext(selected);
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    // Also compare with punctuation/hyphens stripped (e.g. "HEB" matches "H-E-B")
    const queryNorm = query.replace(/[^a-z0-9]/g, '');
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    const fields = [
      category.name,
      category.department,
      category.description,
      category.exampleBrands,
    ];

    return (
      fields.some((f) => f.toLowerCase().includes(query) || normalize(f).includes(queryNorm)) ||
      category.countries.some((c) => c.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="category-selection">
        <h2>Step 1: Select Categories</h2>
        <p className="subtitle">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="category-selection">
      <h2>Step 1: Select Categories</h2>
      <p className="subtitle">Choose one or more retail categories for data syndication</p>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search categories by name, department, brands, or countries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <span className="search-results">
            {filteredCategories.length} result{filteredCategories.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Selection bar + Next button at top */}
      <div className="selection-action-bar">
        <p className="selection-action-bar-count">
          {selected.length > 0 ? (
            <>
              <strong>{selected.length}</strong> categor{selected.length === 1 ? 'y' : 'ies'} selected
            </>
          ) : (
            'No categories selected'
          )}
        </p>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={selected.length === 0}
        >
          Next: Configure Retailers
        </button>
      </div>

      <div className="table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th className="col-select"></th>
              <th className="col-name">Name</th>
              <th className="col-department">Department</th>
              <th className="col-brands">Example Brands</th>
              <th className="col-description">Description</th>
              <th className="col-notes">Collection Notes</th>
              <th className="col-countries">Countries</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-row">
                  {searchQuery ? 'No categories found matching your search.' : 'No categories available.'}
                </td>
              </tr>
            ) : (
              filteredCategories.map((category, index) => {
                const sel = isSelected(category.id);
                const selEntry = selected.find((s) => s.categoryId === category.id);
                return (
                  <tr
                    key={category.id}
                    className={`category-row ${sel ? 'selected' : ''} ${index % 2 === 0 ? 'even' : 'odd'}`}
                    onClick={() => toggleCategory(category)}
                  >
                    <td className="col-select">
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => toggleCategory(category)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </td>
                    <td className="col-name">
                      {category.name}
                      {category.premium && <span className="premium-star" title="Premium Category">&#9733;</span>}
                    </td>
                    <td className="col-department">{category.department}</td>
                    <td className="col-brands">{category.exampleBrands || '-'}</td>
                    <td className="col-description" title={category.description}>
                      {category.description || '-'}
                    </td>
                    <td className="col-notes">{category.notes || '-'}</td>
                    <td className="col-countries">
                      {sel && selEntry && selEntry.countries.length < category.countries.length
                        ? selEntry.countries.join(', ')
                        : category.countries.join(', ')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Country Picker Modal */}
      {countryPickerCat && (
        <div className="country-picker-overlay" onClick={handlePickerCancel}>
          <div className="country-picker-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Select Countries</h3>
            <p className="country-picker-desc">
              <strong>{countryPickerCat.name}</strong> is available in multiple countries. Which would you like to subscribe to?
            </p>
            <div className="country-picker-list">
              {countryPickerCat.countries.map((country) => (
                <label key={country} className="country-picker-item">
                  <input
                    type="checkbox"
                    checked={pickerCountries.includes(country)}
                    onChange={() => togglePickerCountry(country)}
                  />
                  <span>{country}</span>
                </label>
              ))}
            </div>
            <div className="country-picker-actions">
              <button className="btn btn-secondary-sm" onClick={handlePickerCancel}>
                Cancel
              </button>
              <button
                className="btn btn-primary-sm"
                onClick={handlePickerConfirm}
                disabled={pickerCountries.length === 0}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
