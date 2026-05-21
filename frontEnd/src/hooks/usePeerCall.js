import { useState, useEffect, useRef, useCallback } from "react";
import Peer from "peerjs";
import { useWebSocket } from "../context/WebSocketContext";

export function usePeerCall(username, serverIp) {
  const { sendWebSocketMessage, isConnected } = useWebSocket();
  const [peerId, setPeerId] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callPartner, setCallPartner] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioEnabledRef = useRef(true);
  const sentPeerIdRef = useRef(false);

  useEffect(() => {
    if (!isConnected) return;

    const p = new Peer(undefined, {
      host: serverIp,
      port: 9000,
      path: "/myapp",
      secure: true,
    });

    p.on("open", (id) => {
      setPeerId(id);
      if (!sentPeerIdRef.current) {
        sentPeerIdRef.current = true;
        sendWebSocketMessage("peer_id", { username, peerId: id });
      }
    });

    p.on("call", (call) => setIncomingCall(call));
    p.on("error", (err) => console.error("Peer error:", err));

    peerRef.current = p;
    return () => {
      p.destroy();
      sentPeerIdRef.current = false;
    };
  }, [serverIp, isConnected]);

  const getStream = useCallback(async () => {
    return await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
  }, []);

  const startCall = useCallback(
    async (targetPeerId) => {
      try {
        const stream = await getStream();
        localStreamRef.current = stream;

        const call = peerRef.current.call(targetPeerId, stream);
        currentCallRef.current = call;

        call.on("stream", setRemoteStream);

        call.on("close", () => {
          setInCall(false);
          setRemoteStream(null);
        });

        setInCall(true);
        setCallPartner(targetPeerId);
      } catch (e) {
        console.error("Failed to start call:", e);
        alert("نتونستیم تماس رو شروع کنیم");
      }
    },
    [getStream],
  );

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      const stream = await getStream();
      localStreamRef.current = stream;

      incomingCall.answer(stream);
      currentCallRef.current = incomingCall;

      incomingCall.on("stream", setRemoteStream);
      incomingCall.on("close", () => {
        setInCall(false);
        setRemoteStream(null);
      });

      setInCall(true);
      setCallPartner(incomingCall.peer);
      setIncomingCall(null);
    } catch (e) {
      console.error("Failed to accept call:", e);
    }
  }, [incomingCall, getStream]);

  const rejectCall = useCallback(() => {
    if (incomingCall) {
      const emptyStream = new MediaStream();
      incomingCall.answer(emptyStream);

      setTimeout(() => {
        incomingCall.close();
        setIncomingCall(null);
      }, 300);
    }
  }, [incomingCall]);

  const hangup = useCallback(() => {
    currentCallRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    currentCallRef.current = null;
    localStreamRef.current = null;
    setInCall(false);
    setRemoteStream(null);
    setCallPartner(null);
  }, []);

  const toggleAudio = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      audioEnabledRef.current = track.enabled;
    }
  }, []);

  return {
    peerId,
    incomingCall,
    inCall,
    callPartner,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    hangup,
    toggleAudio,
  };
}
