import React from 'react';

const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Register' },
    { number: 2, label: 'Record' },
    { number: 3, label: 'Result' },
    { number: 4, label: 'Leaderboard' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 ${
                  step.number <= currentStep
                    ? 'bg-accent-teal text-white shadow-lg'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.number}
              </div>
              <div
                className={`mt-2 text-xs md:text-sm font-semibold ${
                  step.number <= currentStep ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {step.label}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                  step.number < currentStep ? 'bg-accent-teal' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
