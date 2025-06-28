
import React, { useState } from 'react';
import { Download, Copy, Search, Clock, Eye, FileText, Database } from 'lucide-react';
import { AnalysisResults } from '@/pages/Index';

interface ResultsDisplayProps {
  results: AnalysisResults;
  fileName: string;
}

type TabType = 'summary' | 'visual' | 'transcript' | 'metadata' | 'raw';

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, fileName }) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Eye },
    { id: 'visual', label: 'Visual Analysis', icon: Eye },
    { id: 'transcript', label: 'Transcript', icon: FileText },
    { id: 'metadata', label: 'Technical Details', icon: Database },
    { id: 'raw', label: 'Raw Data', icon: FileText }
  ];

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMarkdownReport = () => {
    const markdown = `# Video Analysis Report: ${fileName}

## Summary
**Duration:** ${results.summary.duration}

### Key Insights
${results.summary.keyInsights.map(insight => `- ${insight}`).join('\n')}

### Main Topics
${results.summary.mainTopics.map(topic => `- ${topic}`).join('\n')}

## Visual Analysis
${results.visualAnalysis.map(frame => `**${frame.timestamp}:** ${frame.description}`).join('\n\n')}

## Transcript
${results.transcript.fullText}

## Technical Details
- **Resolution:** ${results.metadata.resolution}
- **Codec:** ${results.metadata.codec}
- **File Size:** ${results.metadata.fileSize}
- **Duration:** ${results.metadata.duration}
`;
    
    handleDownload(markdown, `${fileName}-analysis.md`, 'text/markdown');
  };

  const filteredTranscript = results.transcript.segments.filter(segment =>
    segment.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Analysis Results</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopyToClipboard(JSON.stringify(results, null, 2))}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
            >
              <Copy className="w-4 h-4" />
              <span>Copy JSON</span>
            </button>
            <button
              onClick={generateMarkdownReport}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Duration</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{results.summary.duration}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Key Insights</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{results.summary.keyInsights.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-800">Main Topics</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{results.summary.mainTopics.length}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Key Insights</h3>
                <ul className="space-y-2">
                  {results.summary.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Main Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {results.summary.mainTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Frame-by-Frame Analysis</h3>
            {results.visualAnalysis.map((frame, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                    {frame.timestamp}
                  </span>
                </div>
                <p className="text-slate-700">{frame.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              {(searchTerm ? filteredTranscript : results.transcript.segments).map((segment, index) => (
                <div key={index} className="flex space-x-4 p-3 hover:bg-slate-50 rounded-lg">
                  <span className="font-mono text-sm text-slate-500 flex-shrink-0">
                    {segment.timestamp}
                  </span>
                  <p className="text-slate-700 flex-grow">{segment.text}</p>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {Math.round(segment.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Technical Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-700 mb-2">Video Properties</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Resolution:</dt>
                      <dd className="font-medium">{results.metadata.resolution}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Codec:</dt>
                      <dd className="font-medium">{results.metadata.codec}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600">File Size:</dt>
                      <dd className="font-medium">{results.metadata.fileSize}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Duration:</dt>
                      <dd className="font-medium">{results.metadata.duration}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-700 mb-2">Processing Stats</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Processing Time:</dt>
                      <dd className="font-medium">{results.rawData.processingTime}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Frames Extracted:</dt>
                      <dd className="font-medium">{results.rawData.framesExtracted}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Vision API Calls:</dt>
                      <dd className="font-medium">{results.rawData.apiCalls.vision}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Audio API Calls:</dt>
                      <dd className="font-medium">{results.rawData.apiCalls.audio}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Raw JSON Data</h3>
              <button
                onClick={() => handleDownload(JSON.stringify(results, null, 2), `${fileName}-raw.json`, 'application/json')}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
