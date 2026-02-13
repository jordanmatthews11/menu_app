import { useState, useEffect } from 'react';
import type { OrderEntry, Category } from './types';
import { loadCategories } from './data/categories';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Layout/Header';
import { LoginScreen } from './components/LoginScreen';
import { CategorySelection } from './components/CategorySelection';
import { ConfigureSelections } from './components/ConfigureSelections/ConfigureSelections';
import { OrderTable } from './components/OrderTable';
import { StoreListsBrowser } from './components/StoreListsBrowser';
import { AdminScreen } from './components/Admin/AdminScreen';
import './App.css';

const STORAGE_KEY = 'orderEntries';

type ActiveTab = 'order' | 'storeLists' | 'admin';

function AppContent() {
  const { user, isAuthorized, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('order');
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

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="app app-loading">
        <p>Loading...</p>
      </div>
    );
  }

  // Not signed in -- show login screen
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="app">
      <Header currentStep={step} totalSteps={TOTAL_STEPS} showSteps={activeTab === 'order'} />

      <nav className="tab-bar">
        <button
          className={`tab-btn${activeTab === 'order' ? ' tab-btn--active' : ''}`}
          onClick={() => setActiveTab('order')}
        >
          Order Submission
        </button>
        <button
          className={`tab-btn${activeTab === 'storeLists' ? ' tab-btn--active' : ''}`}
          onClick={() => setActiveTab('storeLists')}
        >
          Standard Store Lists
        </button>
        <button
          className={`tab-btn${activeTab === 'admin' ? ' tab-btn--active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          Admin
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'order' && (
          <>
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
          </>
        )}

        {activeTab === 'storeLists' && <StoreListsBrowser />}

        {activeTab === 'admin' && (
          isAuthorized ? (
            <AdminScreen />
          ) : (
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>
                You do not have permission to access the Admin panel.
                Contact an administrator to be added to the authorized users list.
              </p>
              <p className="access-denied-email">
                Signed in as: {user.email}
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
