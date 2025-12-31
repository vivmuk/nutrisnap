import React, { useState, useCallback } from 'react';
import { NutritionalReport } from './types';
import { analyzeImageMultiModel } from './services/imageService';
import ImageSelector from './components/ImageSelector';
import NutritionReportDisplay from './components/NutritionReportDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Dashboard from './components/Dashboard';
import ManualAddForm from './components/ManualAddForm';
import useFoodLog from './hooks/useFoodLog';

type Tab = 'ANALYZER' | 'DASHBOARD';
type AnalysisView = 'SELECT' | 'ANALYZING' | 'REPORT' | 'ERROR' | 'MANUAL_ADD';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ANALYZER');
  const [analysisView, setAnalysisView] = useState<AnalysisView>('SELECT');

  const [report, setReport] = useState<NutritionalReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const foodLog = useFoodLog();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleStartAnalysis = useCallback(async (
    file: File,
    foodName?: string,
    _modelId?: string,
    userCues?: string,
    _useMultiModel: boolean = true
  ) => {
    if (!file) {
      setError('Please select an image first.');
      setAnalysisView('ERROR');
      return;
    }

    setError(null);
    setReport(null);

    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type;

      // Store the image for display
      const imageDataUrl = `data:${mimeType};base64,${base64Data}`;
      setCurrentImage(imageDataUrl);

      setAnalysisView('ANALYZING');

      // Use the multi-model API (now configured for single model: Gemini 3 Flash)
      const result = await analyzeImageMultiModel(
        { data: base64Data, mimeType },
        foodName,
        userCues
      );

      // Get the first (and only) successful result
      const successfulResult = result.results.find(r => r.status === 'success');
      if (successfulResult) {
        // Add image to the report for display
        const reportWithImage = { ...successfulResult.nutritionReport, image: imageDataUrl };
        setReport(reportWithImage);
        setAnalysisView('REPORT');
      } else {
        throw new Error('Analysis failed. Please try again with a different image.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze the image. Please try a different image.');
      setAnalysisView('ERROR');
      setCurrentImage(null);
    }
  }, []);
  
  const handleAddToLog = async (reportToAdd: NutritionalReport) => {
    try {
      await foodLog.addFoodLog(reportToAdd);
      handleResetAnalysis();
    } catch (error) {
      console.error('Failed to add food log:', error);
      setError('Failed to save food log. Please try again.');
      setAnalysisView('ERROR');
    }
  };

  const handleAddManualLog = async (reportToAdd: NutritionalReport) => {
    try {
      await foodLog.addFoodLog(reportToAdd);
      setAnalysisView('SELECT');
    } catch (error) {
      console.error('Failed to add food log:', error);
      setError('Failed to save food log. Please try again.');
      setAnalysisView('ERROR');
    }
  };

  const handleResetAnalysis = () => {
    setReport(null);
    setError(null);
    setCurrentImage(null);
    setAnalysisView('SELECT');
  };
  
  const renderAnalyzerContent = () => {
    switch(analysisView) {
      case 'SELECT':
        return <ImageSelector
                  onStartAnalysis={handleStartAnalysis}
                  onManualAdd={() => setAnalysisView('MANUAL_ADD')}
                  onSwitchToDashboard={() => setActiveTab('DASHBOARD')}
                />;
      case 'MANUAL_ADD':
        return <ManualAddForm onAdd={handleAddManualLog} onCancel={() => setAnalysisView('SELECT')} />;
      case 'ANALYZING':
        return (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-400 mt-4 text-lg">Analyzing your meal...</p>
            <p className="text-gray-500 text-sm mt-2">Our AI nutritionist is evaluating your food</p>
          </div>
        );
      case 'REPORT':
        if (report) {
          return <NutritionReportDisplay report={report} onAddToLog={handleAddToLog} onCancel={handleResetAnalysis} />;
        }
        return null;
      case 'ERROR':
         return (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative text-center animate-fade-in" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={handleResetAnalysis}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  }

  const renderContent = () => {
    if (activeTab === 'DASHBOARD') {
        return <Dashboard foodLog={foodLog} onSwitchToAnalyzer={() => setActiveTab('ANALYZER')} />;
    }
    return renderAnalyzerContent();
  };
  
  const NavButton: React.FC<{tab: Tab, children: React.ReactNode}> = ({ tab, children }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-2 rounded-md text-lg font-medium transition-colors duration-300 ${
        activeTab === tab 
          ? 'bg-brand-primary text-white shadow-md' 
          : 'text-gray-400 hover:bg-gray-700/50'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 selection:bg-brand-primary selection:text-white">
      <header className="w-full max-w-4xl text-center my-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-green-300">
          NutriSnap AI
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Your AI-Powered Nutritionist</p>
         <nav className="mt-6 flex justify-center gap-4 border-b border-gray-700 pb-2">
            <NavButton tab="ANALYZER">Analyzer</NavButton>
            <NavButton tab="DASHBOARD">Dashboard</NavButton>
        </nav>
      </header>

      <main className="w-full max-w-4xl flex-grow mt-4">
        {renderContent()}
      </main>
      
      <footer className="w-full max-w-4xl text-center py-6 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} NutriSnap AI. All rights reserved.</p>
        <p className="mt-1">Nutritional information is an estimate and should not be used for medical purposes.</p>
      </footer>
    </div>
  );
};

export default App;
