import './StepIndicator.css';

const STEP_LABELS = ['Select Categories', 'Configure Retailers', 'Review & Submit'];

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="step-container">
            <div
              className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              {isCompleted ? '✓' : stepNumber}
            </div>
            <span className={`step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              {STEP_LABELS[index] || `Step ${stepNumber}`}
            </span>
            {index < totalSteps - 1 && (
              <div className={`step-line ${isCompleted ? 'completed' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};
