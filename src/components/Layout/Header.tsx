import { StepIndicator } from './StepIndicator';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  showSteps?: boolean;
  onAdminClick?: () => void;
  isAdminActive?: boolean;
  onHelpClick?: () => void;
  isHelpActive?: boolean;
}

export const Header = ({ currentStep, totalSteps, showSteps = true, onAdminClick, isAdminActive, onHelpClick, isHelpActive }: HeaderProps) => {
  const { user, logOut } = useAuth();

  return (
    <header className="app-header">
      <div className="header-row">
        <div className="header-brand">
          <img className="header-logo" src="/storesight-logo.png" alt="Storesight" />
          <h1>Storesight Menu</h1>
        </div>
        {user && (
          <div className="header-user">
            {user.photoURL && (
              <img className="header-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            )}
            <span className="header-name">{user.displayName || user.email}</span>
            {onHelpClick && (
              <button
                className={`header-help-btn${isHelpActive ? ' header-help-btn--active' : ''}`}
                onClick={onHelpClick}
              >
                {isHelpActive ? '\u2190 Back to App' : 'How to Use'}
              </button>
            )}
            {onAdminClick && (
              <button
                className={`header-admin-btn${isAdminActive ? ' header-admin-btn--active' : ''}`}
                onClick={onAdminClick}
              >
                {isAdminActive ? '\u2190 Back to App' : 'Admin'}
              </button>
            )}
            <button className="header-signout" onClick={logOut}>
              Sign Out
            </button>
          </div>
        )}
      </div>
      {showSteps && (
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      )}
    </header>
  );
};
