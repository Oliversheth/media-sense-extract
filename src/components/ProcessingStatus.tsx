
import React from 'react';
import { CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { ProcessingState, ProcessingStage } from '@/pages/Index';

interface ProcessingStatusProps {
  state: ProcessingState;
  onCancel: () => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ state, onCancel }) => {
  const stageLabels: Record<ProcessingStage, string> = {
    upload: 'File Upload',
    metadata: 'Metadata Extraction',
    frames: 'Frame Extraction',
    visual: 'Visual Analysis',
    audio: 'Audio Transcription',
    final: 'Final Processing',
    complete: 'Complete'
  };

  const getStageIcon = (stage: ProcessingStage) => {
    const stageData = state.stages[stage];
    
    if (stageData.status === 'complete') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (stageData.status === 'processing') {
      return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    } else if (stageData.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-200';
    }
  };

  const overallProgress = Object.values(state.stages).reduce((acc, stage) => {
    if (stage.status === 'complete') return acc + (100 / 7);
    if (stage.status === 'processing') return acc + (stage.progress / 7);
    return acc;
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Processing Status</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 text-red-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Overall Progress</span>
          <span className="text-sm font-medium text-slate-800">{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stage Progress */}
      <div className="space-y-4 mb-6">
        {(Object.entries(stageLabels) as [ProcessingStage, string][]).map(([stage, label]) => {
          const stageData = state.stages[stage];
          
          return (
            <div key={stage} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getStageIcon(stage)}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <span className="text-xs text-slate-500">{stageData.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getProgressColor(stageData.status)}`}
                    style={{ width: `${stageData.progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{stageData.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Processing Logs */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Processing Logs</h3>
        <div className="bg-slate-50 rounded-lg p-3 max-h-32 overflow-y-auto">
          {state.logs.map((log, index) => (
            <div key={index} className="text-xs text-slate-600 py-1 border-b border-slate-200 last:border-b-0">
              <span className="text-slate-400">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
