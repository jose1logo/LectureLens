import React, { useState, useEffect } from 'react';
import { Copy, Check, FileCode, BookOpen, Download, Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { LectureData } from '../types';

interface ResultViewerProps {
  data: LectureData | null;
  loading: boolean;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ data, loading }) => {
  const [activeTab, setActiveTab] = useState<'reader' | 'json'>('reader');
  const [copied, setCopied] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing document structure...");

  useEffect(() => {
    if (!loading) return;
    
    const messages = [
        "Analyzing document structure...",
        "Identifying headers and sections...",
        "Transcribing handwriting...",
        "Formatting markdown...",
        "Finalizing notes..."
    ];
    let i = 0;
    const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingText(messages[i]);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [loading]);

  const handleCopy = () => {
    if (!data) return;
    let textToCopy = "";
    
    if (activeTab === 'reader') {
        textToCopy = `# ${data.title}\nDate: ${data.date}\n\n`;
        if (data.summary) textToCopy += `**Summary:** ${data.summary}\n\n---\n\n`;
        textToCopy += data.content;
    } else {
        textToCopy = JSON.stringify(data, null, 2);
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lecture_notes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-20 p-8 text-center">
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-white p-4 rounded-full shadow-lg border border-indigo-100">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Digitizing Notes</h3>
        <p className="text-slate-500 max-w-xs mx-auto text-sm transition-all duration-500 ease-in-out">
            {loadingText}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4 border border-slate-100">
           <BookOpen className="w-10 h-10 text-indigo-200" />
        </div>
        <p className="text-sm font-medium opacity-60">Your organized notes will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 pt-4 flex gap-6 shrink-0 shadow-sm z-10">
            <button
                onClick={() => setActiveTab('reader')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'reader' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
                <BookOpen className="w-4 h-4" />
                Read Notes
            </button>
            <button
                onClick={() => setActiveTab('json')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'json' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
                <FileCode className="w-4 h-4" />
                Raw Data
            </button>
            <div className="flex-1"></div>
            <div className="flex gap-2 pb-2">
                <button 
                    onClick={handleCopy}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
                    title="Copy to Clipboard"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                    onClick={handleDownload}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
                    title="Save JSON"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
            {activeTab === 'reader' && (
                <div className="h-full overflow-y-auto p-6 md:p-10 fade-in bg-slate-50">
                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-10 max-w-4xl mx-auto min-h-full">
                         {/* Document Header */}
                         <div className="border-b border-slate-100 pb-6 mb-6" dir="auto">
                            <div className="flex justify-between items-start gap-4">
                                <h1 className="text-3xl font-bold text-slate-900 font-serif leading-tight">
                                    {data.title || "Untitled Lecture"}
                                </h1>
                                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap mt-1">
                                    {data.date || "Undated"}
                                </span>
                            </div>
                            
                            {data.summary && (
                                <div className="mt-6 bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-400">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Summary</h4>
                                    <p className="text-slate-700 italic text-base leading-relaxed font-serif">
                                        {data.summary}
                                    </p>
                                </div>
                            )}
                         </div>

                         {/* Markdown Content */}
                         <div className="prose prose-slate max-w-none text-slate-700 font-serif pb-8" dir="auto">
                            <Markdown>{data.content}</Markdown>
                         </div>
                     </div>
                </div>
            )}

            {activeTab === 'json' && (
                <div className="h-full overflow-hidden bg-slate-900 text-slate-200 fade-in">
                    <pre className="h-full overflow-auto p-4 text-sm font-mono">
                        <code>{JSON.stringify(data, null, 2)}</code>
                    </pre>
                </div>
            )}
        </div>
    </div>
  );
};