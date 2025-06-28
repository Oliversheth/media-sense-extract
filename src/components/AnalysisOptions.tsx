
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { AnalysisSettings } from '@/pages/Index';

interface AnalysisOptionsProps {
  settings: AnalysisSettings;
  onSettingsChange: (settings: AnalysisSettings) => void;
}

export const AnalysisOptions: React.FC<AnalysisOptionsProps> = ({ settings, onSettingsChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSettingChange = (key: keyof AnalysisSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-5 h-5 text-slate-600" />
        <h2 className="text-xl font-semibold text-slate-800">Analysis Options</h2>
      </div>
      
      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Frame Count
            </label>
            <select
              value={settings.frameCount}
              onChange={(e) => handleSettingChange('frameCount', parseInt(e.target.value))}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5 frames</option>
              <option value={8}>8 frames</option>
              <option value={10}>10 frames</option>
              <option value={12}>12 frames</option>
              <option value={15}>15 frames</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Number of frames to extract for analysis</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Frame Quality
            </label>
            <select
              value={settings.frameQuality}
              onChange={(e) => handleSettingChange('frameQuality', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low (faster processing)</option>
              <option value="medium">Medium (balanced)</option>
              <option value="high">High (best quality)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Quality of extracted frames</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Output Format
            </label>
            <select
              value={settings.outputFormat}
              onChange={(e) => handleSettingChange('outputFormat', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="markdown">Markdown Report</option>
              <option value="json">JSON Data</option>
              <option value="detailed">Detailed Analysis</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Primary output format</p>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>Advanced Options</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-6 pt-4 border-t">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Frame Sampling Strategy
                </label>
                <select
                  value={settings.samplingStrategy}
                  onChange={(e) => handleSettingChange('samplingStrategy', e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="even">Even Intervals</option>
                  <option value="smart">Smart Sampling</option>
                  <option value="custom">Custom Timestamps</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">How to select frames from the video</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Audio Quality
                </label>
                <select
                  value={settings.audioQuality}
                  onChange={(e) => handleSettingChange('audioQuality', e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard Quality</option>
                  <option value="high">High Quality</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Audio processing quality level</p>
              </div>
            </div>

            {settings.samplingStrategy === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Custom Timestamps (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="0:30, 1:15, 2:45, 3:20"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Specify exact timestamps for frame extraction</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
