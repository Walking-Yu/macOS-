import React, { useState, useEffect, useCallback, useRef } from 'react';
import MenuBar from './components/MenuBar';
import VirtualKeyboard from './components/VirtualKeyboard';
import TypingStats from './components/TypingStats';
import { analyzeTextWithGemini } from './services/geminiService';
import { AnalysisResult } from './types';
import { BarChart2, Zap, Brain, Loader2, Keyboard } from 'lucide-react';

// Icons using lucide-react (simulated with standard SVG if needed, but here assuming imports work or would be replaced)
// Since I cannot install lucide-react, I will use text/emoji or basic SVGs in components if imports fail.
// Actually, standard practice for these responses is assuming libraries can be added or using inline SVGs.
// I'll stick to icons from lucide-react assuming the user can install it, or I'll provide a fallback in my mind.
// For this output, I will assume `lucide-react` is available.

const App: React.FC = () => {
  // State
  const [text, setText] = useState<string>("");
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [keyCounts, setKeyCounts] = useState<Record<string, number>>({});
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [wpmHistory, setWpmHistory] = useState<{ time: string; wpm: number }[]>([]);
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for calculations
  const textRef = useRef(text);
  const keyCountRef = useRef(keyCounts);

  // Sync refs
  useEffect(() => {
    textRef.current = text;
    keyCountRef.current = keyCounts;
  }, [text, keyCounts]);

  // Key Down Handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key;
    const lowerKey = key.toLowerCase();
    
    setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.add(lowerKey);
        return newSet;
    });

    setTotalKeystrokes(prev => prev + 1);
    
    setKeyCounts(prev => {
      const newCounts = { ...prev };
      newCounts[lowerKey] = (newCounts[lowerKey] || 0) + 1;
      return newCounts;
    });

    if (!startTime) {
      setStartTime(Date.now());
    }
  }, [startTime]);

  // Key Up Handler
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const lowerKey = e.key.toLowerCase();
    setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(lowerKey);
        return newSet;
    });
  }, []);

  // Global Listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // WPM Calculator Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (!startTime) return;
      
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      if (elapsedMinutes <= 0) return;

      // Standard WPM calculation: (all characters / 5) / minutes
      const words = textRef.current.length / 5;
      const currentWpm = Math.round(words / elapsedMinutes);
      
      setWpm(currentWpm);
      setWpmHistory(prev => {
        const newHistory = [...prev, { time: new Date().toISOString(), wpm: currentWpm }];
        // Keep last 60 data points
        if (newHistory.length > 60) return newHistory.slice(newHistory.length - 60);
        return newHistory;
      });

    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleAnalyze = async () => {
    if (text.length < 10) {
      setError("Please type a bit more before analyzing (at least 10 chars).");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeTextWithGemini(text);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze text.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetStats = () => {
    setTotalKeystrokes(0);
    setKeyCounts({});
    setStartTime(null);
    setWpm(0);
    setWpmHistory([]);
    setText("");
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-macos-gray pt-12 pb-8 font-sans text-gray-900 flex flex-col items-center">
      
      {/* Sticky Menu Bar */}
      <MenuBar totalKeystrokes={totalKeystrokes} />

      <main className="w-full max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Column: Typing Area & Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-macos-border overflow-hidden flex flex-col h-[500px]">
             <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-macos-red"></div>
                  <div className="w-3 h-3 rounded-full bg-macos-yellow"></div>
                  <div className="w-3 h-3 rounded-full bg-macos-green"></div>
                </div>
                <h2 className="text-sm font-medium text-gray-500">Editor</h2>
                <button 
                  onClick={resetStats}
                  className="text-xs font-medium text-macos-accent hover:underline"
                >
                  Clear & Reset
                </button>
             </div>
             <textarea
                className="flex-1 w-full p-6 text-lg text-gray-800 focus:outline-none resize-none font-mono leading-relaxed"
                placeholder="Start typing here to track your stats..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
             />
             <div className="bg-white border-t border-gray-100 p-4 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {text.length} characters • {text.split(/\s+/).filter(w => w.length > 0).length} words
                </span>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || text.length === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isAnalyzing || text.length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-macos-accent text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                  <span>Analyze with Gemini</span>
                </button>
             </div>
          </div>

          {/* Analysis Result Card */}
          {(analysis || error) && (
            <div className={`rounded-2xl shadow-sm border p-6 animate-fade-in ${error ? 'bg-red-50 border-red-200' : 'bg-white border-macos-border'}`}>
                {error ? (
                  <p className="text-red-600">{error}</p>
                ) : analysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">Gemini Analysis</h3>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                        Tone: {analysis.tone}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed border-l-4 border-macos-accent pl-4 italic">
                      "{analysis.summary}"
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-blue-50 p-4 rounded-xl">
                         <h4 className="text-blue-800 font-semibold text-sm mb-2">Suggestions</h4>
                         <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                           {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                         </ul>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl flex flex-col justify-center items-center text-center">
                         <h4 className="text-purple-800 font-semibold text-sm mb-1">Complexity Score</h4>
                         <span className="text-3xl font-bold text-purple-600">{analysis.wpmEstimate}</span>
                         <span className="text-xs text-purple-400">Relative Scale (0-100)</span>
                      </div>
                    </div>
                  </div>
                ) : null}
            </div>
          )}

        </div>

        {/* Right Column: Visualizations (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-macos-border flex flex-col items-center justify-center py-6">
                <Keyboard className="w-6 h-6 text-macos-accent mb-2" />
                <span className="text-2xl font-bold text-gray-800">{totalKeystrokes.toLocaleString()}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Total Presses</span>
             </div>
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-macos-border flex flex-col items-center justify-center py-6">
                <BarChart2 className="w-6 h-6 text-macos-green mb-2" />
                <span className="text-2xl font-bold text-gray-800">{Object.keys(keyCounts).length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Unique Keys</span>
             </div>
          </div>

          {/* Chart */}
          <TypingStats wpmHistory={wpmHistory} />

          {/* Virtual Keyboard */}
          <div className="bg-white rounded-2xl shadow-sm border border-macos-border p-2 overflow-hidden flex justify-center">
             <div className="scale-[0.8] sm:scale-90 origin-top">
                <VirtualKeyboard keyCounts={keyCounts} activeKeys={activeKeys} />
             </div>
          </div>

          {/* Info Card */}
          <div className="bg-gray-100 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
            <p className="font-semibold mb-1">Privacy Note:</p>
            KeyFlow Analytics runs entirely in your browser. Keystrokes are counted locally. Only the text you explicitly submit for analysis is sent to Gemini.
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;