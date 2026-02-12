import { useState, useEffect } from 'react';
import type { OrderEntry, Category } from './types';
import { loadCategories } from './data/categories';
import { Header } from './components/Layout/Header';
import { CategorySelection } from './components/CategorySelection';
import { ConfigureSelections } from './components/ConfigureSelections/ConfigureSelections';
import { OrderTable } from './components/OrderTable';
import './App.css';

const STORAGE_KEY = 'orderEntries';

function App() {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [entries, setEntries] = useState<OrderEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const TOTAL_STEPS = 2;

  // Load categories on mount
  useEffect(() => {
    loadCategories().then((loadedCategories) => {
      setCategories(loadedCategories);
    });
  }, []);

  // Load entries from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const entriesWithDates = parsed.map((entry: OrderEntry) => ({
          ...entry,
          startDate: new Date(entry.startDate),
          endDate: new Date(entry.endDate),
        }));
        setEntries(entriesWithDates);
      } catch (error) {
        console.error('Error loading entries from localStorage:', error);
      }
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleCategoryNext = (categoryIds: string[]) => {
    setSelectedCategories(categoryIds);
    setStep(2);
  };

  const handleConfigBack = () => {
    setStep(1);
  };

  const handleConfigSubmit = (newEntries: OrderEntry[]) => {
    if (newEntries.length > 0) {
      setEntries((prev) => [...prev, ...newEntries]);
      setSelectedCategories([]);
      setStep(1);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all entries?')) {
      setEntries([]);
    }
  };

  return (
    <div className="app">
      <Header currentStep={step} totalSteps={TOTAL_STEPS} />

      <main className="main-content">
        {step === 1 && (
          <CategorySelection
            selectedCategories={selectedCategories}
            onNext={handleCategoryNext}
          />
        )}

        {step === 2 && (
          <ConfigureSelections
            categories={categories}
            selectedCategoryIds={selectedCategories}
            onBack={handleConfigBack}
            onSubmit={handleConfigSubmit}
          />
        )}

        <OrderTable
          entries={entries}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
        />
      </main>
    </div>
  );
}

export default App;
