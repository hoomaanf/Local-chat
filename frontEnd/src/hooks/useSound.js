import { useRef, useCallback } from "react";
import newMessageSound from "../assets/sounds/new-message.mp3";
import ringtoneSound from "../assets/sounds/ringtone.mp3";

const SOUNDS = {
  newMessage: newMessageSound,
  incomingCall: ringtoneSound,
};

export function useSound() {
  const audioRefs = useRef({});

  const play = useCallback((soundName, loop = false) => {
    const url = SOUNDS[soundName];
    if (!url) return;

    if (audioRefs.current[soundName]) {
      audioRefs.current[soundName].pause();
      audioRefs.current[soundName].currentTime = 0;
    }
    const audio = new Audio(url);
    audio.loop = loop;
    audio.play().catch(() => {});
    audioRefs.current[soundName] = audio;
    return audio;
  }, []);

  const stop = useCallback((soundName) => {
    if (audioRefs.current[soundName]) {
      audioRefs.current[soundName].pause();
      audioRefs.current[soundName].currentTime = 0;
    }
  }, []);

  return { play, stop };
}
