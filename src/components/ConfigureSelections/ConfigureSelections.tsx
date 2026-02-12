import { useState, useEffect } from 'react';
import type { Category, CategoryConfig, StoreList, Booster, OrderEntry } from '../../types';
import { loadStoreLists } from '../../data/storeLists';
import { loadBoosters } from '../../data/boosters';
import { CategoryConfigPanel } from './CategoryConfigPanel';
import { SelectionSummary } from './SelectionSummary';
import './ConfigureSelections.css';

interface ConfigureSelectionsProps {
  categories: Category[];
  selectedCategoryIds: string[];
  onBack: () => void;
  onSubmit: (entries: OrderEntry[]) => void;
}

export const ConfigureSelections = ({
  categories,
  selectedCategoryIds,
  onBack,
  onSubmit,
}: ConfigureSelectionsProps) => {
  const [storeLists, setStoreLists] = useState<StoreList[]>([]);
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const [configs, setConfigs] = useState<CategoryConfig[]>([]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Build initial configs for each category+country combo
  useEffect(() => {
    const selectedCats = categories.filter((c) =>
      selectedCategoryIds.includes(c.id)
    );

    const initialConfigs: CategoryConfig[] = [];
    selectedCats.forEach((cat) => {
      cat.countries.forEach((country) => {
        initialConfigs.push({
          categoryId: cat.id,
          categoryName: cat.name,
          country,
          selectedStoreLists: [],
          selectedBoosters: [],
          startDate: '',
          endDate: '',
          collectionNotes: '',
          proceedWithoutList: false,
        });
      });
    });

    setConfigs(initialConfigs);
    if (initialConfigs.length > 0) {
      setExpandedKey(
        `${initialConfigs[0].categoryId}::${initialConfigs[0].country}`
      );
    }
  }, [categories, selectedCategoryIds]);

  // Load store lists and boosters
  useEffect(() => {
    Promise.all([loadStoreLists(), loadBoosters()]).then(
      ([loadedLists, loadedBoosters]) => {
        setStoreLists(loadedLists);
        setBoosters(loadedBoosters);
        setLoading(false);
      }
    );
  }, []);

  const getKey = (config: CategoryConfig) =>
    `${config.categoryId}::${config.country}`;

  const handleConfigChange = (index: number, updated: CategoryConfig) => {
    setConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs[index] = updated;
      return newConfigs;
    });
  };

  const handleApplyToAll = (sourceIndex: number) => {
    const source = configs[sourceIndex];
    setConfigs((prev) =>
      prev.map((config) => ({
        ...config,
        selectedStoreLists: [...source.selectedStoreLists],
        selectedBoosters: [...source.selectedBoosters],
        startDate: source.startDate,
        endDate: source.endDate,
        collectionNotes: source.collectionNotes,
        proceedWithoutList: source.proceedWithoutList,
      }))
    );
  };

  const handleClearSelections = (index: number) => {
    setConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs[index] = {
        ...newConfigs[index],
        selectedStoreLists: [],
        selectedBoosters: [],
        startDate: '',
        endDate: '',
        collectionNotes: '',
        proceedWithoutList: false,
      };
      return newConfigs;
    });
  };

  const getValidationWarnings = (): string[] => {
    const warnings: string[] = [];
    configs.forEach((config) => {
      if (
        config.selectedStoreLists.length === 0 &&
        !config.proceedWithoutList &&
        config.selectedBoosters.length === 0
      ) {
        warnings.push(
          `${config.categoryName} (${config.country}) needs a store list or booster selection.`
        );
      }
      if (!config.startDate || !config.endDate) {
        warnings.push(
          `${config.categoryName} (${config.country}) needs a collection period.`
        );
      }
      if (
        config.startDate &&
        config.endDate &&
        config.startDate > config.endDate
      ) {
        warnings.push(
          `${config.categoryName} (${config.country}): start date must be before end date.`
        );
      }
    });
    return warnings;
  };

  const handleSubmitOrder = () => {
    const warnings = getValidationWarnings();
    if (warnings.length > 0) {
      return; // Don't submit if there are warnings
    }

    const entries: OrderEntry[] = [];

    configs.forEach((config) => {
      // Add standard store list entries
      config.selectedStoreLists.forEach((listName) => {
        const list = storeLists.find(
          (sl) => sl.name === listName && sl.country === config.country
        );
        if (list) {
          list.retailers.forEach((r) => {
            entries.push({
              id: `${Date.now()}-${Math.random()}`,
              category: config.categoryName,
              country: config.country,
              retailer: r.retailer,
              type: 'standard',
              storeListName: listName,
              weeklyQuota: r.weeklyQuota,
              monthlyQuota: r.monthlyQuota,
              startDate: new Date(config.startDate),
              endDate: new Date(config.endDate),
              collectionNotes: config.collectionNotes,
            });
          });
        }
      });

      // Add booster entries
      config.selectedBoosters.forEach((boosterId) => {
        const booster = boosters.find((b) => b.id === boosterId);
        if (booster) {
          entries.push({
            id: `${Date.now()}-${Math.random()}`,
            category: config.categoryName,
            country: config.country,
            retailer: booster.name,
            type: 'booster',
            startDate: new Date(config.startDate),
            endDate: new Date(config.endDate),
            collectionNotes: config.collectionNotes,
          });
        }
      });
    });

    onSubmit(entries);
  };

  const warnings = getValidationWarnings();
  const categoriesNeedingAttention = configs.filter(
    (c) =>
      (c.selectedStoreLists.length === 0 &&
        !c.proceedWithoutList &&
        c.selectedBoosters.length === 0) ||
      !c.startDate ||
      !c.endDate
  ).length;

  if (loading) {
    return (
      <div className="configure-selections">
        <p className="loading-text">Loading store lists and boosters...</p>
      </div>
    );
  }

  return (
    <div className="configure-selections">
      <div className="configure-header">
        <h2>Configure Selections ({configs.length} categor{configs.length === 1 ? 'y' : 'ies'})</h2>
      </div>

      <div className="configure-layout">
        <div className="configure-left">
          <h3>Selected Categories</h3>
          <div className="configs-list">
            {configs.map((config, index) => {
              const key = getKey(config);
              return (
                <CategoryConfigPanel
                  key={key}
                  config={config}
                  storeLists={storeLists}
                  boosters={boosters}
                  isExpanded={expandedKey === key}
                  onToggleExpand={() =>
                    setExpandedKey((prev) => (prev === key ? null : key))
                  }
                  onChange={(updated) => handleConfigChange(index, updated)}
                  onApplyToAll={() => handleApplyToAll(index)}
                  onClearSelections={() => handleClearSelections(index)}
                />
              );
            })}
          </div>
        </div>

        <div className="configure-right">
          <SelectionSummary
            configs={configs}
            storeLists={storeLists}
            boosters={boosters}
            activeCategoryKey={expandedKey}
          />
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="validation-bar">
          <span className="warn-icon">!</span>
          <span>
            You have {categoriesNeedingAttention} categor{categoriesNeedingAttention === 1 ? 'y' : 'ies'} that require a list selection and/or a collection period.
          </span>
        </div>
      )}

      <div className="configure-footer">
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Categories
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmitOrder}
          disabled={warnings.length > 0}
        >
          Submit Order
        </button>
      </div>
    </div>
  );
};
