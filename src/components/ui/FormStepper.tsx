// components/ui/FormStepper.tsx
export default function FormStepper({ currentStep }: { currentStep: number }) {
    const steps = ['Basic Info', 'Location', 'Details'];
    
    return (
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${currentStep > index ? 'bg-green-500 text-white' : 
                currentStep === index ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {index + 1}
            </div>
            <span className={`mt-2 text-sm ${currentStep >= index ? 'font-medium' : 'text-gray-500'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    );
  }