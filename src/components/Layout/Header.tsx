import { StepIndicator } from './StepIndicator';
import './Header.css';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  showSteps?: boolean;
}

export const Header = ({ currentStep, totalSteps, showSteps = true }: HeaderProps) => {
  return (
    <header className="app-header">
      <h1>Order Submission</h1>
      {showSteps && (
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      )}
    </header>
  );
};
