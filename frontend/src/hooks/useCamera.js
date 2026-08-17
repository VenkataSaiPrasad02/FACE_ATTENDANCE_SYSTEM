import { useRef, useState } from 'react';

export function useCamera() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      setError(null);
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setStream(s);
    } catch (err) {
      setError('Camera access denied or unavailable: ' + err.message);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    // Return base64 without the data URI prefix
    return canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  return { videoRef, startCamera, captureFrame, stopCamera, stream, error };
}
