import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, File, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onFileSelect: (urls: string[]) => void;
  disabled?: boolean;
}

export const FileUpload = ({ onFileSelect, disabled = false }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const urls = parseCSV(text);
        onFileSelect(urls);
      };
      reader.readAsText(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled,
  });

  const parseCSV = (text: string): string[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const urls: string[] = [];

    lines.forEach((line) => {
      // Skip header if exists
      if (line.toLowerCase().includes('url') || line.toLowerCase().includes('link')) {
        return;
      }

      // Handle CSV format (could be comma-separated with other columns)
      const parts = line.split(',').map(p => p.trim().replace(/['"]/g, ''));

      // Find the URL in the line (first column that looks like a URL)
      const url = parts.find(part =>
        part.startsWith('http://') || part.startsWith('https://')
      ) || parts[0];

      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        urls.push(url);
      }
    });

    return urls;
  };

  return (
    <Card className="glass border-2 border-dashed">
      <div
        {...getRootProps()}
        className={cn(
          'p-12 cursor-pointer transition-all',
          isDragActive && 'bg-primary/5 border-primary',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Icon */}
          <motion.div
            animate={isDragActive ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.3 }}
            className={cn(
              'w-20 h-20 rounded-2xl flex items-center justify-center',
              isDragActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Upload className="w-10 h-10" />
          </motion.div>

          {/* Text */}
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground mb-2">
              {isDragActive ? 'Drop file here' : 'Drag & drop CSV file'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <File className="w-4 h-4" />
              <span>Supports .csv and .txt files (Max 100 URLs)</span>
            </div>
          </div>

          {/* Browse Button */}
          {!isDragActive && !acceptedFiles.length && (
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              disabled={disabled}
            >
              Browse Files
            </Button>
          )}
        </motion.div>
      </div>

      {/* Selected File Info */}
      {acceptedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 border-t border-border"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {acceptedFiles[0].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(acceptedFiles[0].size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Format Help */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Expected CSV Format:</p>
            <code className="block bg-background p-2 rounded text-xs font-mono">
              url<br />
              http://example1.com<br />
              http://example2.com<br />
              http://example3.com
            </code>
            <p className="mt-2">URLs should be in the first column or clearly marked.</p>
          </div>
        </div>
      </div>
    </Card>
  );
};