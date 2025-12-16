'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface AudioTrack {
  path: string;
  name: string;
  lang: string;
}

interface UseAudioPlayerReturn {
  currentAudio: string | null;
  isPlaying: boolean;
  playAudio: (audioPath: string) => void;
  pauseAudio: () => void;
  togglePlayPause: (audioPath: string) => void;
  isCurrentlyPlaying: (audioPath: string) => boolean;
  isCurrentTrack: (audioPath: string) => boolean;
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const playAudio = useCallback((audioPath: string) => {
    // Stop current audio if playing different track
    if (currentAudio !== audioPath) {
      stopCurrentAudio();
    }

    // Create new audio instance if needed
    if (!audioRef.current || currentAudio !== audioPath) {
      const newAudio = new Audio(audioPath);
      audioRef.current = newAudio;
      setCurrentAudio(audioPath);

      // Handle audio events
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      });

      newAudio.addEventListener('error', () => {
        console.error('Audio error occurred');
        setIsPlaying(false);
        setCurrentAudio(null);
      });
    }

    // Play the audio
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
        setCurrentAudio(null);
      });
      setIsPlaying(true);
    }
  }, [currentAudio, stopCurrentAudio]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback((audioPath: string) => {
    // If clicking on the currently playing audio, toggle pause/play
    if (currentAudio === audioPath && audioRef.current) {
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio(audioPath);
      }
      return;
    }

    // Otherwise, play the new audio
    playAudio(audioPath);
  }, [currentAudio, isPlaying, playAudio, pauseAudio]);

  const isCurrentlyPlaying = useCallback((audioPath: string) => {
    return currentAudio === audioPath && isPlaying;
  }, [currentAudio, isPlaying]);

  const isCurrentTrack = useCallback((audioPath: string) => {
    return currentAudio === audioPath;
  }, [currentAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    currentAudio,
    isPlaying,
    playAudio,
    pauseAudio,
    togglePlayPause,
    isCurrentlyPlaying,
    isCurrentTrack,
  };
};
