import { useState, useEffect } from 'react';
import type { Category } from '../types';
import { loadCategories } from '../data/categories';
import './CategorySelection.css';

interface CategorySelectionProps {
  selectedCategories: string[];
  onNext: (selectedCategories: string[]) => void;
}

export const CategorySelection = ({ selectedCategories, onNext }: CategorySelectionProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>(selectedCategories);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCategories().then((loadedCategories) => {
      setCategories(loadedCategories);
      setLoading(false);
    });
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelected((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
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
    return (
      category.name.toLowerCase().includes(query) ||
      category.department.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query) ||
      category.exampleBrands.toLowerCase().includes(query) ||
      category.countries.some(c => c.toLowerCase().includes(query))
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
                const isSelected = selected.includes(category.id);
                return (
                  <tr
                    key={category.id}
                    className={`category-row ${isSelected ? 'selected' : ''} ${index % 2 === 0 ? 'even' : 'odd'}`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <td className="col-select">
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCategory(category.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </td>
                    <td className="col-name">{category.name}</td>
                    <td className="col-department">{category.department}</td>
                    <td className="col-brands">{category.exampleBrands || '-'}</td>
                    <td className="col-description" title={category.description}>
                      {category.description || '-'}
                    </td>
                    <td className="col-notes">{category.notes || '-'}</td>
                    <td className="col-countries">{category.countries.join(', ')}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="selection-summary">
        <p>
          {selected.length > 0 ? (
            <>
              <strong>{selected.length}</strong> categor{selected.length === 1 ? 'y' : 'ies'} selected
            </>
          ) : (
            'No categories selected'
          )}
        </p>
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={selected.length === 0}
        >
          Next: Select Retailers
        </button>
      </div>

      {selected.length === 0 && (
        <p className="error-message">Please select at least one category</p>
      )}
    </div>
  );
};
