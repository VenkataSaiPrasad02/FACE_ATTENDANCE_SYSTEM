import React from 'react';
import { Camera, StopCircle, Play, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function CameraCapture({
  onCapture,
  videoRef,
  startCamera,
  stopCamera,
  stream,
  cameraError,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
      {cameraError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {!stream ? (
          <Button
            onClick={startCamera}
            variant="primary"
            size="md"
            icon={Play}
          >
            Start Camera
          </Button>
        ) : (
          <>
            <Button
              onClick={onCapture}
              variant="success"
              size="md"
              icon={Camera}
            >
              Capture Frame
            </Button>

            <Button
              onClick={stopCamera}
              variant="secondary"
              size="md"
              icon={StopCircle}
            >
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
