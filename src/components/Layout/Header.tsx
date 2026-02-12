import { StepIndicator } from './StepIndicator';
import './Header.css';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
}

export const Header = ({ currentStep, totalSteps }: HeaderProps) => {
  return (
    <header className="app-header">
      <h1>Order Submission</h1>
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
    </header>
  );
};
