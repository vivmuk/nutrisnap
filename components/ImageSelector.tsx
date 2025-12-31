import React, { useRef, useState } from 'react';

interface ImageSelectorProps {
  onStartAnalysis: (file: File, foodName?: string, modelId?: string, userCues?: string, useMultiModel?: boolean) => void;
  onManualAdd: () => void;
  onSwitchToDashboard: () => void;
}

const CameraIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
);

const UploadIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
);

const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
);

const ImageSelector: React.FC<ImageSelectorProps> = ({ onStartAnalysis, onManualAdd, onSwitchToDashboard }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [foodName, setFoodName] = useState<string>('');
  const [userCues, setUserCues] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onStartAnalysis(
        file,
        foodName.trim() || undefined,
        undefined,
        userCues.trim() || undefined,
        true
      );
      setFoodName('');
      setUserCues('');
    }
  };

  return (
    <div className="w-full p-4 md:p-8 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center space-y-6 animate-slide-in-up">
        <div className="text-center text-gray-400">
           <UploadIcon className="mx-auto h-16 w-16 text-gray-500" />
          <h3 className="mt-2 text-xl font-medium text-gray-200">Analyze a New Meal</h3>
          <p>Upload a photo or use your camera for AI-powered nutrition analysis.</p>
        </div>

      {/* Optional food name input */}
      <div className="w-full max-w-md">
        <label htmlFor="foodName" className="block text-sm font-medium text-gray-300 mb-2">
          Food Name (Optional)
        </label>
        <input
          type="text"
          id="foodName"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          placeholder="e.g., Biryani, Pad Thai, Tacos al Pastor..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">Help the AI identify regional or cultural dishes</p>
      </div>

      {/* Advanced Options Toggle */}
      <div className="w-full max-w-md">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-2"
        >
          <svg
            className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Options
        </button>
      </div>

      {/* Advanced Options Panel */}
      {showAdvanced && (
        <div className="w-full max-w-md space-y-4 animate-slide-in-up">
          {/* User Measurement Cues */}
          <div>
            <label htmlFor="userCues" className="block text-sm font-medium text-gray-300 mb-2">
              Measurement Cues (Optional)
            </label>
            <textarea
              id="userCues"
              value={userCues}
              onChange={(e) => setUserCues(e.target.value)}
              placeholder="e.g., 'Large dinner plate (10 inches)', 'Portion size of my fist', 'Standard coffee mug'..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Provide size references to improve portion accuracy
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
            <UploadIcon className="h-5 w-5"/>
            Upload Image
        </button>

        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
            <CameraIcon className="h-5 w-5"/>
            Take Photo
        </button>
      </div>

       <div className="w-full max-w-md border-t border-gray-700 my-2"></div>

       <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
         <button
          onClick={onManualAdd}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5"/>
          Add Manually
        </button>
        <button
          onClick={onSwitchToDashboard}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ChartBarIcon className="h-5 w-5"/>
          View Dashboard
        </button>
       </div>
    </div>
  );
};

export default ImageSelector;
