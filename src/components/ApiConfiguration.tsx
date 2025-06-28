
import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ApiConfig } from '@/pages/Index';

interface ApiConfigurationProps {
  config: ApiConfig;
  onConfigChange: (config: ApiConfig) => void;
}

export const ApiConfiguration: React.FC<ApiConfigurationProps> = ({ config, onConfigChange }) => {
  const [showVisionKey, setShowVisionKey] = useState(false);
  const [showAudioKey, setShowAudioKey] = useState(false);
  const [testingVision, setTestingVision] = useState(false);
  const [testingAudio, setTestingAudio] = useState(false);

  const providers = [
    { value: 'openai', label: 'OpenAI (GPT-4V / Whisper)' },
    { value: 'google', label: 'Google Cloud (Vision / Speech)' },
    { value: 'azure', label: 'Azure (Computer Vision / Speech)' }
  ];

  const handleVisionProviderChange = (provider: 'openai' | 'google' | 'azure') => {
    onConfigChange({
      ...config,
      vision: { ...config.vision, provider, isValid: false }
    });
  };

  const handleAudioProviderChange = (provider: 'openai' | 'google' | 'azure') => {
    onConfigChange({
      ...config,
      audio: { ...config.audio, provider, isValid: false }
    });
  };

  const handleVisionKeyChange = (apiKey: string) => {
    onConfigChange({
      ...config,
      vision: { ...config.vision, apiKey, isValid: false }
    });
  };

  const handleAudioKeyChange = (apiKey: string) => {
    onConfigChange({
      ...config,
      audio: { ...config.audio, apiKey, isValid: false }
    });
  };

  const testVisionConnection = async () => {
    if (!config.vision.apiKey) return;
    
    setTestingVision(true);
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isValid = config.vision.apiKey.length > 10; // Simple validation
    onConfigChange({
      ...config,
      vision: { ...config.vision, isValid }
    });
    setTestingVision(false);
  };

  const testAudioConnection = async () => {
    if (!config.audio.apiKey) return;
    
    setTestingAudio(true);
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isValid = config.audio.apiKey.length > 10; // Simple validation
    onConfigChange({
      ...config,
      audio: { ...config.audio, isValid }
    });
    setTestingAudio(false);
  };

  const getStatusIcon = (isValid: boolean, isTesting: boolean) => {
    if (isTesting) return <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />;
    if (isValid) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">API Configuration</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vision Provider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-700">Vision Analysis</h3>
            {getStatusIcon(config.vision.isValid, testingVision)}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Provider</label>
            <select
              value={config.vision.provider}
              onChange={(e) => handleVisionProviderChange(e.target.value as any)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {providers.map(provider => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">API Key</label>
            <div className="relative">
              <input
                type={showVisionKey ? 'text' : 'password'}
                value={config.vision.apiKey}
                onChange={(e) => handleVisionKeyChange(e.target.value)}
                placeholder="Enter your API key"
                className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowVisionKey(!showVisionKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showVisionKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button
            onClick={testVisionConnection}
            disabled={!config.vision.apiKey || testingVision}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors duration-200"
          >
            {testingVision ? 'Testing Connection...' : 'Test Connection'}
          </button>
        </div>

        {/* Audio Provider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-700">Audio Transcription</h3>
            {getStatusIcon(config.audio.isValid, testingAudio)}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Provider</label>
            <select
              value={config.audio.provider}
              onChange={(e) => handleAudioProviderChange(e.target.value as any)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {providers.map(provider => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">API Key</label>
            <div className="relative">
              <input
                type={showAudioKey ? 'text' : 'password'}
                value={config.audio.apiKey}
                onChange={(e) => handleAudioKeyChange(e.target.value)}
                placeholder="Enter your API key"
                className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowAudioKey(!showAudioKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showAudioKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button
            onClick={testAudioConnection}
            disabled={!config.audio.apiKey || testingAudio}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors duration-200"
          >
            {testingAudio ? 'Testing Connection...' : 'Test Connection'}
          </button>
        </div>
      </div>
      
      {/* Status Summary */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Configuration Status:</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Vision:</span>
              {config.vision.isValid ? (
                <span className="text-sm text-green-600 font-medium">Connected</span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Not configured</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Audio:</span>
              {config.audio.isValid ? (
                <span className="text-sm text-green-600 font-medium">Connected</span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Not configured</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
