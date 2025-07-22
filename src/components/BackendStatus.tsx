import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw, Server, Brain } from 'lucide-react';
import { localVideoService } from '@/services/localVideoService';

const BackendStatus = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const health = await localVideoService.checkBackendHealth();
      setStatus(health);
    } catch (error) {
      setStatus({ status: 'error', ollama_connected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (loading) return 'secondary';
    if (status?.status === 'healthy' && status?.ollama_connected) return 'default';
    if (status?.status === 'healthy') return 'secondary';
    return 'destructive';
  };

  const getStatusText = () => {
    if (loading) return 'Checking...';
    if (status?.status === 'healthy' && status?.ollama_connected) return 'Ready';
    if (status?.status === 'healthy') return 'Backend OK, Ollama Disconnected';
    return 'Backend Offline';
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Server className="w-4 h-4" />
          <span>Local Backend Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : status?.status === 'healthy' && status?.ollama_connected ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
          </div>
          <Button size="sm" variant="outline" onClick={checkStatus} disabled={loading}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>

        {status && (
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Backend Service:</span>
              <Badge variant={status.status === 'healthy' ? 'default' : 'destructive'} className="text-xs">
                {status.status === 'healthy' ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Brain className="w-3 h-3" />
                <span>Ollama AI:</span>
              </span>
              <Badge variant={status.ollama_connected ? 'default' : 'secondary'} className="text-xs">
                {status.ollama_connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        )}

        {status?.status !== 'healthy' && (
          <div className="p-2 bg-red-50 rounded-md text-xs text-red-700">
            Backend offline. Make sure the Python service is running on localhost:8001
          </div>
        )}

        {status?.status === 'healthy' && !status?.ollama_connected && (
          <div className="p-2 bg-yellow-50 rounded-md text-xs text-yellow-700">
            Ollama not connected. Run: <code className="bg-yellow-100 px-1 rounded">ollama serve</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendStatus;
