import React, { useRef, useState } from 'react';
import { Camera, X, Upload, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CINVerificationStatus } from '@/types/contract';

interface CINUploadProps {
  photo: string | null;
  status: CINVerificationStatus;
  error: string | null;
  onPhotoChange: (photo: string | null) => void;
  onVerify: (photo: string) => void;
  disabled?: boolean;
  label: string;
}

const statusConfig: Record<CINVerificationStatus, { color: string; icon: React.ReactNode; text: string }> = {
  idle: { color: 'text-muted-foreground', icon: null, text: '' },
  verifying: { color: 'text-info', icon: <Loader2 size={14} className="animate-spin" />, text: 'Vérification en cours...' },
  valid: { color: 'text-success', icon: <CheckCircle2 size={14} />, text: 'CIN vérifiée ✓' },
  invalid: { color: 'text-destructive', icon: <AlertCircle size={14} />, text: 'CIN non valide' },
};

const CINUpload: React.FC<CINUploadProps> = ({ photo, status, error, onPhotoChange, onVerify, disabled, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [useCamera, setUseCamera] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("La photo ne doit pas dépasser 5 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onPhotoChange(base64);
      onVerify(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onPhotoChange(null);
  };

  const config = statusConfig[status];

  const borderClass = status === 'valid'
    ? 'border-success/50'
    : status === 'invalid'
      ? 'border-destructive/50'
      : status === 'verifying'
        ? 'border-info/50'
        : 'border-border';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {photo ? (
        <div className="space-y-2">
          <div className={`relative w-40 h-28 rounded-lg overflow-hidden border-2 ${borderClass} shadow-contract transition-colors`}>
            <img src={photo} alt={label} className="w-full h-full object-cover" />
            {status === 'verifying' && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-info" />
              </div>
            )}
            {!disabled && status !== 'verifying' && (
              <button
                onClick={handleRemove}
                className="absolute top-1 right-1 bg-destructive rounded-full p-1 text-destructive-foreground hover:opacity-80 transition-opacity"
              >
                <X size={12} />
              </button>
            )}
            {status === 'valid' && (
              <div className="absolute bottom-1 left-1 bg-success rounded-full p-0.5">
                <CheckCircle2 size={14} className="text-success-foreground" />
              </div>
            )}
          </div>
          {/* Status indicator */}
          {status !== 'idle' && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${config.color}`}>
              {config.icon}
              <span>{config.text}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/5 p-2 rounded-md">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <div>
                <p>{error}</p>
                {!disabled && (
                  <button
                    onClick={handleRemove}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium underline hover:no-underline"
                  >
                    <RefreshCw size={12} /> Reprendre la photo
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              setUseCamera(false);
              inputRef.current?.click();
            }}
            className="h-28 w-20 flex flex-col items-center justify-center gap-1.5 border-dashed border-2 hover:border-accent hover:bg-accent/5 transition-colors"
          >
            <Upload size={20} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Fichier</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              setUseCamera(true);
              inputRef.current?.click();
            }}
            className="h-28 w-20 flex flex-col items-center justify-center gap-1.5 border-dashed border-2 hover:border-accent hover:bg-accent/5 transition-colors"
          >
            <Camera size={20} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Caméra</span>
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={useCamera ? "environment" : undefined}
        className="hidden"
        onChange={handleFile}
        disabled={disabled}
      />
    </div>
  );
};

export default CINUpload;
