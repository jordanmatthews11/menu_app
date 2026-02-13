import { useState } from 'react';
import { CategoriesAdmin } from './CategoriesAdmin';
import { StoreListsAdmin } from './StoreListsAdmin';
import { BoostersAdmin } from './BoostersAdmin';
import { AuthorizedUsersAdmin } from './AuthorizedUsersAdmin';
import { CustomCodesAdmin } from './CustomCodesAdmin';
import { seedFirestoreFromCSVs } from '../../utils/seedFirestore';
import type { SeedResult } from '../../utils/seedFirestore';
import './Admin.css';

type AdminTab = 'categories' | 'storeLists' | 'boosters' | 'customCodes' | 'users';

export const AdminScreen = () => {
  const [tab, setTab] = useState<AdminTab>('categories');
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const handleSeed = async (force: boolean) => {
    if (force && !window.confirm('This will re-import CSV data into Firestore. Existing documents will NOT be deleted — this may create duplicates. Continue?')) {
      return;
    }
    setSeeding(true);
    setSeedError(null);
    setSeedResult(null);
    try {
      const result = await seedFirestoreFromCSVs(force);
      setSeedResult(result);
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="admin">
      <div className="admin-header">
        <div>
          <h2>Admin Panel</h2>
          <p className="admin-subtitle">
            Manage categories, standard store lists, and boosters.
          </p>
        </div>
        <div className="admin-seed">
          <button
            className="admin-btn admin-btn--secondary"
            onClick={() => handleSeed(false)}
            disabled={seeding}
          >
            {seeding ? 'Seeding...' : 'Seed from CSVs'}
          </button>
          <button
            className="admin-btn admin-btn--danger"
            onClick={() => handleSeed(true)}
            disabled={seeding}
          >
            Force Re-seed
          </button>
        </div>
      </div>

      {seedResult && (
        <div className="admin-toast admin-toast--success">
          Seed complete: {seedResult.categories} categories
          {seedResult.skippedCategories ? ' (skipped — already has data)' : ''},{' '}
          {seedResult.storeLists} store lists
          {seedResult.skippedStoreLists ? ' (skipped)' : ''},{' '}
          {seedResult.boosters} boosters
          {seedResult.skippedBoosters ? ' (skipped)' : ''},{' '}
          {seedResult.customCodes} custom codes
          {seedResult.skippedCustomCodes ? ' (skipped)' : ''}.
          <button className="admin-toast-close" onClick={() => setSeedResult(null)}>
            &times;
          </button>
        </div>
      )}

      {seedError && (
        <div className="admin-toast admin-toast--error">
          Seed error: {seedError}
          <button className="admin-toast-close" onClick={() => setSeedError(null)}>
            &times;
          </button>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'categories' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('categories')}
        >
          Categories
        </button>
        <button
          className={`admin-tab${tab === 'storeLists' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('storeLists')}
        >
          Standard Store Lists
        </button>
        <button
          className={`admin-tab${tab === 'boosters' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('boosters')}
        >
          Boosters
        </button>
        <button
          className={`admin-tab${tab === 'customCodes' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('customCodes')}
        >
          Custom Category Codes
        </button>
        <button
          className={`admin-tab${tab === 'users' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('users')}
        >
          Authorized Users
        </button>
      </div>

      <div className="admin-body">
        {tab === 'categories' && <CategoriesAdmin />}
        {tab === 'storeLists' && <StoreListsAdmin />}
        {tab === 'boosters' && <BoostersAdmin />}
        {tab === 'customCodes' && <CustomCodesAdmin />}
        {tab === 'users' && <AuthorizedUsersAdmin />}
      </div>
    </div>
  );
};
