import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { ResultViewer } from './components/ResultViewer';
import { digitizeNotes } from './services/geminiService';
import { AppStatus, LectureData } from './types';
import { Wand2, AlertCircle } from 'lucide-react';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [includeSummary, setIncludeSummary] = useState(false);
  const [result, setResult] = useState<LectureData | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleParse = async () => {
    if (!file) return;

    setStatus(AppStatus.PROCESSING);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await digitizeNotes(file, includeSummary);
      setResult(data);
      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to digitize notes.");
      setStatus(AppStatus.ERROR);
    }
  };

  const isProcessing = status === AppStatus.PROCESSING;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Input & Controls */}
        <div className="w-1/3 min-w-[320px] max-w-[450px] bg-white border-r border-slate-200 flex flex-col p-6 overflow-y-auto z-10 shadow-sm">
          <div className="flex-1 flex flex-col gap-6">
            
            <FileUploader 
              selectedFile={file} 
              onFileSelect={(f) => { setFile(f); setResult(null); }} 
              disabled={isProcessing}
            />

            <div className="flex-1"></div>

            <div className="space-y-4">
              {/* Controls */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                 <label className="flex items-center cursor-pointer justify-between w-full">
                    <span className="text-sm text-slate-600 font-medium select-none">Generate Summary</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={includeSummary} 
                          onChange={(e) => setIncludeSummary(e.target.checked)} 
                          className="sr-only peer" 
                          disabled={isProcessing}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{errorMsg}</p>
                </div>
              )}

              <button
                onClick={handleParse}
                disabled={!file || isProcessing}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform
                  ${!file || isProcessing 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-500/30 active:scale-[0.98]'
                  }`}
              >
                {isProcessing ? (
                   <span className="text-sm">Digitizing...</span>
                ) : (
                   <>
                     <span>Digitize Notes</span>
                     <Wand2 className="w-4 h-4" />
                   </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Output */}
        <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col">
            <ResultViewer data={result} loading={isProcessing} />
        </div>
      </main>
    </div>
  );
}

export default App;