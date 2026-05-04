import React, { useRef, useEffect, useState } from "react";
import { useVideoCall } from "../context/VideoCallContext";

const VideoCallModal = () => {
  const {
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    acceptCall,
    rejectCall,
    endCall,
    toggleCamera,
    toggleMicrophone,
    isCameraOn,
    isMicrophoneOn,
  } = useVideoCall();

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleToggleCamera = () => {
    const newState = toggleCamera();
    setCameraEnabled(newState);
  };

  const handleToggleMic = () => {
    const newState = toggleMicrophone();
    setMicEnabled(newState);
  };

  if (!incomingCall && !activeCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-4 w-full max-w-4xl">
        {/* Video containers */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {/* ویدیوی طرف مقابل */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* ویدیوی خودت (کوچک) */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-32 h-24 rounded-lg object-cover border-2 border-gray-600 shadow-lg"
          />

          {/* اگر دوربین خاموشه، یه آیکون نشون بده */}
          {!cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <span className="text-white text-lg">🎥 Camera Off</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-6">
          {incomingCall && (
            <>
              <button
                onClick={() => acceptCall(true)}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-full font-bold text-lg transition"
              >
                📞 Accept
              </button>
              <button
                onClick={rejectCall}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold text-lg transition"
              >
                ❌ Reject
              </button>
            </>
          )}

          {activeCall && (
            <div className="flex gap-4">
              {/* دکمه خاموش/روشن کردن دوربین */}
              <button
                onClick={handleToggleCamera}
                className={`px-6 py-3 rounded-full font-bold text-lg transition ${
                  cameraEnabled
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {cameraEnabled ? "📹 Camera On" : "🎥 Camera Off"}
              </button>

              {/* دکمه خاموش/روشن کردن میکروفون */}
              <button
                onClick={handleToggleMic}
                className={`px-6 py-3 rounded-full font-bold text-lg transition ${
                  micEnabled
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {micEnabled ? "🎤 Mic On" : "🔇 Mic Off"}
              </button>

              {/* دکمه قطع تماس */}
              <button
                onClick={endCall}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold text-lg transition"
              >
                📞 End Call
              </button>
            </div>
          )}
        </div>

        {/* Call info */}
        {activeCall && (
          <p className="text-center text-gray-300 mt-4">
            Talking with {activeCall.target}
          </p>
        )}
        {incomingCall && (
          <p className="text-center text-yellow-400 mt-4 animate-pulse">
            📞 Incoming call from {incomingCall.from}...
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoCallModal;
