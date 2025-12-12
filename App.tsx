import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, AnalysisResult } from './types';
import { analyzeMedicalImage, analyzeMedicalText } from './services/geminiService';
import { NavBar } from './components/NavBar';
import { ScanButton } from './components/ScanButton';
import { MarkdownView } from './components/MarkdownView';
import { ArrowLeft, Clock, Trash2, ChevronRight, AlertCircle, FileText, Sparkles, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'medilens_history';
const APP_VERSION = '1.0.2'; // Increment this to visually verify updates

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage (likely quota exceeded):", e);
      // Fallback: Try saving without images to preserve the text analysis
      try {
        const historyNoImages = history.map(({ imageUrl, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(historyNoImages));
      } catch (retryError) {
        console.error("Failed to save history fallback:", retryError);
      }
    }
  }, [history]);

  const handleScan = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        try {
          // 2. Send to Gemini
          const analysisText = await analyzeMedicalImage(base64Image);

          // 3. Create Result Object
          const newResult: AnalysisResult = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            imageUrl: base64Image,
            rawText: analysisText,
          };

          // 4. Update State
          // Note: If the image is very large, it might fail to save to localStorage later, 
          // but we still want to show it in the current session.
          setHistory(prev => [newResult, ...prev]);
          setActiveResult(newResult);
          setView('result');
        } catch (err: any) {
          setError(err.message || "Failed to analyze image");
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        setError("Failed to read file");
        setIsProcessing(false);
      };

    } catch (err) {
      setError("An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  const handleTextAnalyze = async () => {
    if (!textInput.trim()) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const analysisText = await analyzeMedicalText(textInput);

      const newResult: AnalysisResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        // No imageUrl for text input
        rawText: analysisText,
      };

      setHistory(prev => [newResult, ...prev]);
      setActiveResult(newResult);
      setTextInput(""); // Clear input
      setView('result');
    } catch (err: any) {
      setError(err.message || "Failed to analyze text");
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleBackToHome = () => {
    setView('home');
    setActiveResult(null);
  };

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col items-center pt-8 px-6 pb-32 animate-fade-in">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">MediLens</h1>
          <p className="text-slate-500">Your AI Medical Companion</p>
        </header>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">
            Scan a Document
          </h2>
          <p className="text-slate-400 text-xs mb-4">
            Take a photo of a lab report or prescription.
          </p>
          
          <ScanButton onImageSelected={handleScan} isProcessing={isProcessing} />
          
          {/* Divider */}
          <div className="w-full relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Or</span>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-slate-700 mb-3 self-start pl-1">
            Type or Paste Text
          </h2>
          <div className="w-full relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste lab results, doctor's notes, or type a question here..."
              className="w-full h-24 p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none placeholder:text-slate-400"
              disabled={isProcessing}
            />
            <button
              onClick={handleTextAnalyze}
              disabled={isProcessing || !textInput.trim()}
              className={`
                mt-3 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                ${isProcessing || !textInput.trim() 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-[0.98]'}
              `}
            >
              {isProcessing && textInput.trim() ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Analyze Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-slide-up">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-8 text-center">
            <p className="text-xs text-slate-300">v{APP_VERSION}</p>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="pt-8 px-4 pb-24 w-full max-w-md mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 pl-2">History</h1>
      
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Clock size={48} className="mb-4 opacity-20" />
          <p>No scans yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => { setActiveResult(item); setView('result'); }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 active:scale-[0.98] transition-transform cursor-pointer group"
            >
              {item.imageUrl ? (
                <div 
                  className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 bg-cover bg-center border border-slate-100"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-teal-50 shrink-0 flex items-center justify-center text-teal-500 border border-teal-100">
                  <FileText size={28} />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-teal-600 mb-1 block">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={(e) => deleteHistoryItem(e, item.id)}
                    className="text-slate-300 hover:text-red-400 p-1 -mr-2 -mt-2 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {item.rawText.replace(/[#*]/g, '')}
                </p>
              </div>
              <div className="flex items-center text-slate-300 group-hover:text-teal-400 transition-colors">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderResult = () => {
    if (!activeResult) return null;

    return (
      <div className="bg-white min-h-screen pb-24 animate-slide-up">
        {/* Header Area */}
        {activeResult.imageUrl ? (
          <div className="relative w-full h-64 bg-slate-900">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{ backgroundImage: `url(${activeResult.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <button 
              onClick={handleBackToHome}
              className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        ) : (
          <div className="relative w-full h-48 bg-gradient-to-br from-teal-500 to-emerald-600">
            <div className="absolute bottom-4 left-6 flex items-center gap-3 text-white/90">
              <FileText size={32} />
              <span className="text-2xl font-bold tracking-tight">Text Analysis</span>
            </div>
             <button 
              onClick={handleBackToHome}
              className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className={`relative bg-white rounded-t-3xl px-6 py-8 min-h-[50vh] ${activeResult.imageUrl ? '-mt-10' : '-mt-6'}`}>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
          
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-6 text-teal-600">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              </span>
              <span className="text-sm font-semibold tracking-wide uppercase">AI Explanation</span>
            </div>

            <MarkdownView content={activeResult.rawText} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100">
      
      {view === 'home' && renderHome()}
      {view === 'history' && renderHistory()}
      {view === 'result' && renderResult()}

      {/* Navigation - hidden on Result view to maximize reading space */}
      {view !== 'result' && (
        <NavBar currentView={view} onChangeView={setView} />
      )}
    </div>
  );
}