import React from 'react';

export default function CameraCapture({ onCapture, videoRef, startCamera, stopCamera, stream, cameraError }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {cameraError && <p style={{ color: '#e74c3c', marginBottom: 8 }}>{cameraError}</p>}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%', maxWidth: 480, height: 320, background: '#000',
          borderRadius: 8, objectFit: 'cover', display: 'block', margin: '0 auto 12px'
        }}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!stream ? (
          <button onClick={startCamera} style={{
            padding: '8px 18px', background: '#3498db', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600
          }}>▶ Start Camera</button>
        ) : (
          <>
            <button onClick={onCapture} style={{
              padding: '8px 18px', background: '#2ecc71', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600
            }}>📸 Capture</button>
            <button onClick={stopCamera} style={{
              padding: '8px 18px', background: '#e74c3c', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer'
            }}>■ Stop</button>
          </>
        )}
      </div>
    </div>
  );
}
