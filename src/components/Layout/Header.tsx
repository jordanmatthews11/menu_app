import { StepIndicator } from './StepIndicator';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  showSteps?: boolean;
}

export const Header = ({ currentStep, totalSteps, showSteps = true }: HeaderProps) => {
  const { user, logOut } = useAuth();

  return (
    <header className="app-header">
      <div className="header-row">
        <h1>Order Submission</h1>
        {user && (
          <div className="header-user">
            {user.photoURL && (
              <img className="header-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            )}
            <span className="header-name">{user.displayName || user.email}</span>
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
