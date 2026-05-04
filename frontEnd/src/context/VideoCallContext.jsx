// src/context/VideoCallContext.jsx (نسخه بدون هیچ کتابخانه‌ای)
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useWebSocket } from "./WebSocketContext";
import { useAuth } from "./AuthContext";

const VideoCallContext = createContext();

export const useVideoCall = () => useContext(VideoCallContext);

export const VideoCallProvider = ({ children }) => {
  const { username } = useAuth();
  const { wsRef } = useWebSocket();
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // تنظیم WebRTC PeerConnection
  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current?.send(
          JSON.stringify({
            type: "ice_candidate",
            candidate: event.candidate,
            from: username,
            target: activeCall?.target || incomingCall?.from,
          }),
        );
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  };

  // هندلر پیام‌های WebSocket برای تماس
  useEffect(() => {
    const handleMessage = (message) => {
      switch (message.type) {
        case "call_offer":
          handleOffer(message);
          break;
        case "call_answer":
          handleAnswer(message);
          break;
        case "ice_candidate":
          handleIceCandidate(message);
          break;
        case "end_call":
          endCall();
          break;
      }
    };

    // این باید توی WebSocketContext اضافه بشه
    if (wsRef.current) {
      // فعلاً دستی هندل می‌کنیم
    }
  }, [localStream]);

  const handleOffer = async (message) => {
    setIncomingCall({ from: message.from });
    pcRef.current = setupPeerConnection();
    await pcRef.current.setRemoteDescription(
      new RTCSessionDescription(message.offer),
    );

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    wsRef.current?.send(
      JSON.stringify({
        type: "call_answer",
        answer: answer,
        from: username,
        target: message.from,
      }),
    );
  };

  const handleAnswer = async (message) => {
    if (pcRef.current) {
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(message.answer),
      );
    }
  };

  const handleIceCandidate = async (message) => {
    if (pcRef.current) {
      await pcRef.current.addIceCandidate(
        new RTCIceCandidate(message.candidate),
      );
    }
  };

  const startCall = async (targetUsername) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setActiveCall({ target: targetUsername });

      pcRef.current = setupPeerConnection();
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      wsRef.current?.send(
        JSON.stringify({
          type: "call_offer",
          offer: offer,
          from: username,
          target: targetUsername,
        }),
      );
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setActiveCall({ target: incomingCall.from });
      setIncomingCall(null);

      // بقیه کارها توی handleOffer انجام میشه
    } catch (err) {
      console.error("Error accepting call:", err);
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
    wsRef.current?.send(
      JSON.stringify({
        type: "end_call",
        from: username,
        target: incomingCall?.from,
      }),
    );
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
  };

  // خاموش/روشن کردن دوربین در حین مکالمه
  const toggleCamera = () => {
    if (!localStream) return;

    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) return;

    const enabled = videoTracks[0].enabled;
    videoTracks[0].enabled = !enabled;

    return !enabled; // وضعیت جدید رو برگردون (true=روشن, false=خاموش)
  };

  // خاموش/روشن کردن میکروفون
  const toggleMicrophone = () => {
    if (!localStream) return;

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const enabled = audioTracks[0].enabled;
    audioTracks[0].enabled = !enabled;

    return !enabled;
  };

  // برگردوندن وضعیت فعلی دوربین
  const isCameraOn = () => {
    if (!localStream) return false;
    const videoTracks = localStream.getVideoTracks();
    return videoTracks.length > 0 && videoTracks[0].enabled;
  };

  // برگردوندن وضعیت فعلی میکروفون
  const isMicrophoneOn = () => {
    if (!localStream) return false;
    const audioTracks = localStream.getAudioTracks();
    return audioTracks.length > 0 && audioTracks[0].enabled;
  };

  return (
    <VideoCallContext.Provider
      value={{
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        incomingCall,
        activeCall,
        localStream,
        remoteStream,
        toggleCamera,
        toggleMicrophone,
        isCameraOn,
        isMicrophoneOn,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};
