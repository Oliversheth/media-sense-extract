
import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
}

const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/mov',
  'video/quicktime',
  'video/avi',
  'video/x-msvideo',
  'video/mkv',
  'video/x-matroska',
  'video/webm'
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, uploadedFile }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a video file (.mp4, .mov, .avi, .mkv, .webm)",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 500MB",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileProcess = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    
    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsUploading(false);
    onFileUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileProcess(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = () => {
    onFileUpload(null as any);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Upload Video File</h2>
      
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 hover:border-slate-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center space-y-4">
            <Upload className={`w-12 h-12 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`} />
            
            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-pulse text-blue-600 font-medium">Uploading...</div>
                <div className="w-48 h-2 bg-slate-200 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-slate-700">
                    Drop your video file here, or{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept={ACCEPTED_VIDEO_TYPES.join(',')}
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-slate-500">
                    Supports: MP4, MOV, AVI, MKV, WebM (max 500MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-slate-800">{uploadedFile.name}</p>
              <p className="text-sm text-slate-600">{formatFileSize(uploadedFile.size)}</p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
};
