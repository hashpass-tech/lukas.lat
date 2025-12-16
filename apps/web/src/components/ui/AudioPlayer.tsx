'use client';

import React from 'react';
import { Music, Volume2, Play, Pause, FileText } from 'lucide-react';

interface AudioTrack {
  path: string;
  name: string;
  lang: string;
}

interface AudioPlayerProps {
  tracks: AudioTrack[];
  onDownload: (audioPath: string) => void;
  className?: string;
}

interface AudioTrackItemProps {
  track: AudioTrack;
  isCurrentlyPlaying: boolean;
  isCurrentTrack: boolean;
  onTogglePlayPause: (audioPath: string) => void;
  onDownload: (audioPath: string) => void;
}

const AudioTrackItem: React.FC<AudioTrackItemProps> = ({
  track,
  isCurrentlyPlaying,
  isCurrentTrack,
  onTogglePlayPause,
  onDownload,
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border transition-all ${
        isCurrentTrack 
          ? 'border-blue-500/50 bg-blue-500/10' 
          : 'border-border bg-accent/30'
      }`}
    >
      <div className={`p-1.5 sm:p-2 rounded-full transition-colors ${
        isCurrentlyPlaying 
          ? 'bg-blue-500/20 animate-pulse' 
          : 'bg-blue-500/10'
      }`}>
        {isCurrentlyPlaying ? (
          <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
        ) : (
          <Music className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm font-medium truncate ${
          isCurrentTrack ? 'text-blue-600 dark:text-blue-400' : ''
        }`}>
          {track.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {track.lang}
          {isCurrentlyPlaying && (
            <span className="ml-2 inline-flex items-center gap-1">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-blue-600 dark:text-blue-400 hidden sm:inline">Playing</span>
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onTogglePlayPause(track.path)}
          className={`p-1.5 sm:p-2 rounded-lg transition-all ${
            isCurrentTrack 
              ? 'bg-blue-500/20 hover:bg-blue-500/30' 
              : 'hover:bg-accent/60'
          }`}
          title={isCurrentlyPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-3 h-3 sm:w-3 sm:h-3 text-blue-600 dark:text-blue-400" />
          ) : (
            <Play className="w-3 h-3 sm:w-3 sm:h-3 text-muted-foreground hover:text-foreground" />
          )}
        </button>
        <button
          onClick={() => onDownload(track.path)}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-accent/60 transition-colors"
          title="Download audio"
        >
          <FileText className="w-3 h-3 sm:w-3 sm:h-3 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </div>
  );
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  tracks,
  onDownload,
  className = '',
}) => {
  // Import useAudioPlayer hook locally to avoid circular dependencies
  const { useAudioPlayer } = require('@/hooks/useAudioPlayer');
  const {
    togglePlayPause,
    isCurrentlyPlaying,
    isCurrentTrack,
  } = useAudioPlayer();

  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-2">
        {tracks.map((track, index) => (
          <AudioTrackItem
            key={index}
            track={track}
            isCurrentlyPlaying={isCurrentlyPlaying(track.path)}
            isCurrentTrack={isCurrentTrack(track.path)}
            onTogglePlayPause={togglePlayPause}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioPlayer;
