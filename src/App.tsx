import { useState, useEffect } from 'react';
import type { OrderEntry, Category } from './types';
import { loadCategories } from './data/categories';
import { submitOrder } from './services/firestoreService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Layout/Header';
import { LoginScreen } from './components/LoginScreen';
import { CategorySelection } from './components/CategorySelection';
import type { CategoryCountrySelection } from './components/CategorySelection';
import { ConfigureSelections } from './components/ConfigureSelections/ConfigureSelections';
import { OrderTable } from './components/OrderTable';
import { StoreListsBrowser } from './components/StoreListsBrowser';
import { MasterCodeDirectory } from './components/MasterCodeDirectory';
import { SubmittedOrdersReview } from './components/SubmittedOrdersReview';
import { AdminScreen } from './components/Admin/AdminScreen';
import { HelpGuide } from './components/HelpGuide';
import './App.css';

const STORAGE_KEY = 'orderEntries';

type ActiveTab = 'order' | 'storeLists' | 'codeDirectory' | 'reviewOrders';

function AppContent() {
  const { user, isAuthorized, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('order');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<CategoryCountrySelection[]>([]);
  const [entries, setEntries] = useState<OrderEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const TOTAL_STEPS = 3;

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
        if (entriesWithDates.length > 0) {
          setEntries(entriesWithDates);
          setStep(3);
        }
      } catch (error) {
        console.error('Error loading entries from localStorage:', error);
      }
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleCategoryNext = (selections: CategoryCountrySelection[]) => {
    setSelectedCategories(selections);
    setStep(2);
  };

  const handleConfigBack = () => {
    setStep(1);
  };

  const handleConfigSubmit = (newEntries: OrderEntry[]) => {
    if (newEntries.length > 0) {
      setEntries((prev) => [...prev, ...newEntries]);
      setSelectedCategories([]);
      setStep(3);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all entries?')) {
      setEntries([]);
    }
  };

  const handleSubmitOrder = async () => {
    if (!user || entries.length === 0) return;
    await submitOrder({
      submittedBy: user.displayName || user.email || 'Unknown',
      submittedByEmail: user.email || '',
      submittedAt: new Date().toISOString(),
      entries,
      status: 'submitted',
    });
    // Clear local entries after successful submit
    setEntries([]);
  };

  const handleAdminClick = () => {
    setShowAdmin((prev) => !prev);
    if (!showAdmin) setShowHelp(false);
  };

  const handleHelpClick = () => {
    setShowHelp((prev) => !prev);
    if (!showHelp) setShowAdmin(false);
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
      <Header
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        showSteps={!showAdmin && !showHelp && activeTab === 'order'}
        onAdminClick={handleAdminClick}
        isAdminActive={showAdmin}
        onHelpClick={handleHelpClick}
        isHelpActive={showHelp}
      />

      {showHelp ? (
        <main className="main-content">
          <HelpGuide />
        </main>
      ) : showAdmin ? (
        <main className="main-content">
          {isAuthorized ? (
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
          )}
        </main>
      ) : (
        <>
          <nav className="tab-bar">
            <button
              className={`tab-btn${activeTab === 'order' ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab('order')}
            >
              Order Submission
            </button>
            <button
              className={`tab-btn${activeTab === 'reviewOrders' ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab('reviewOrders')}
            >
              Review Submitted Orders
            </button>
            <button
              className={`tab-btn${activeTab === 'storeLists' ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab('storeLists')}
            >
              Standard Store Lists
            </button>
            <button
              className={`tab-btn${activeTab === 'codeDirectory' ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab('codeDirectory')}
            >
              Master Code Directory
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
                    selectedCategoryIds={selectedCategories.map((s) => s.categoryId)}
                    selectedCountryMap={selectedCategories}
                    onBack={handleConfigBack}
                    onSubmit={handleConfigSubmit}
                  />
                )}

                {step === 3 && (
                  <OrderTable
                    entries={entries}
                    onClearAll={handleClearAll}
                    onSubmitOrder={handleSubmitOrder}
                    onAddMore={() => setStep(1)}
                  />
                )}
              </>
            )}

            {activeTab === 'reviewOrders' && <SubmittedOrdersReview />}

            {activeTab === 'storeLists' && <StoreListsBrowser />}

            {activeTab === 'codeDirectory' && <MasterCodeDirectory />}
          </main>
        </>
      )}
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
