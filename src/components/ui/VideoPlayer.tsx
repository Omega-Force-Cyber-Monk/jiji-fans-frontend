"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  PlayCircleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";
import Image from "@/components/ui/CImage";

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getDuration: () => number;
  setPlaybackQuality: (suggestedQuality: string) => void;
  setPlaybackQualityRange: (suggestedMinQuality: string, suggestedMaxQuality: string) => void;
  getPlaybackQuality: () => string;
  getAvailableQualityLevels: () => string[];
  setPlaybackRate: (suggestedRate: number) => void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data?: number;
}

const VideoPlayer = ({
  content,
}: {
  content?: { url: string; title: string } | null;
}) => {
  const playerRef = useRef<YTPlayer | null>(null);
  const nativeVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [showOverlay, setShowOverlay] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<"main" | "quality" | "speed">("main");
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState("auto");
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoId = content?.url ? getYouTubeVideoId(content.url) : null;
  const isYouTube = !!videoId;

  // Unique player element ID to avoid conflicts
  const playerElementId = React.useMemo(
    () => `yt-player-${videoId ?? "none"}-${Math.random().toString(36).slice(2, 7)}`,
    [videoId],
  );

  // Obfuscate video ID to prevent easy extraction
  const obfuscatedVideoId = React.useMemo(() => {
    if (!videoId) return null;
    return btoa(videoId + Date.now().toString(36)).substring(0, 16);
  }, [videoId]);

  // YouTube API initialization
  useEffect(() => {
    if (!isYouTube) return;

    const initPlayer = () => {
      if (
        videoId &&
        !playerRef.current &&
        window.YT &&
        window.YT.Player &&
        wrapperRef.current
      ) {
        wrapperRef.current.innerHTML = "";
        const playerDiv = document.createElement("div");
        playerDiv.id = playerElementId;
        playerDiv.className = "w-full h-full";
        wrapperRef.current.appendChild(playerDiv);

        playerRef.current = new window.YT.Player(playerDiv, {
          videoId: videoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            rel: 0,
            modestbranding: 1,
            autohide: 1,
            showinfo: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: YTPlayerEvent) => {
              setDuration(event.target.getDuration());
              if (event.target && typeof event.target.setPlaybackQuality === 'function') {
                event.target.setPlaybackQuality('hd1080');
              }
              if (event.target && typeof event.target.getPlaybackQuality === 'function') {
                setCurrentQuality(event.target.getPlaybackQuality() || 'auto');
              }
              if (event.target && typeof event.target.getAvailableQualityLevels === 'function') {
                const levels = event.target.getAvailableQualityLevels();
                if (levels && levels.length > 0) {
                  setAvailableQualities(levels);
                }
              }
            },
            onStateChange: (event: YTPlayerEvent) => {
              if (event.data === 0) {
                setShowEndOverlay(true);
                setIsPlaying(false);
              } else if (event.data === 1) {
                setShowEndOverlay(false);
                setIsPlaying(true);
                setShowOverlay(false);
              } else if (event.data === 2) {
                setIsPlaying(false);
              }
            },
            onPlaybackQualityChange: (event: { target: YTPlayer; data: string }) => {
              setCurrentQuality(event.data);
            },
          },
        });
      }
    };

    let checkInterval: NodeJS.Timeout;

    const checkAndInit = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
        clearInterval(checkInterval);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;

      const apiScriptExists = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!apiScriptExists) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      checkInterval = setInterval(checkAndInit, 100);
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying player:", e);
        }
        playerRef.current = null;
      }
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = "";
      }
    };
  }, [videoId, isYouTube, playerElementId]);

  // Disable context menu and copy/paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F11" ||
        e.key === "F12" ||
        (e.ctrlKey && (e.key === "u" || e.key === "U")) ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "i" || e.key === "I" || e.key === "j" || e.key === "J"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);
    container.addEventListener("contextmenu", handleContextMenu);
    container.addEventListener("selectstart", handleSelectStart);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("contextmenu", handleContextMenu);
      container.removeEventListener("selectstart", handleSelectStart);
    };
  }, []);

  // Update progress for YouTube
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isYouTube && isPlaying && playerRef.current) {
      interval = setInterval(() => {
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isYouTube]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls after 3 seconds of inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handlePlayPause = () => {
    if (isYouTube) {
      if (!playerRef.current) return;
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      if (!nativeVideoRef.current) return;
      if (isPlaying) {
        nativeVideoRef.current.pause();
        setIsPlaying(false);
      } else {
        nativeVideoRef.current.play();
        setIsPlaying(true);
        setShowOverlay(false);
        setShowEndOverlay(false);
      }
    }
  };

  const handleReplay = () => {
    if (isYouTube) {
      if (playerRef.current) {
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
        setShowEndOverlay(false);
        setShowOverlay(false);
        setIsPlaying(true);
      }
    } else {
      if (nativeVideoRef.current) {
        nativeVideoRef.current.currentTime = 0;
        nativeVideoRef.current.play();
        setShowEndOverlay(false);
        setShowOverlay(false);
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    if (isYouTube) {
      if (playerRef.current) {
        playerRef.current.setVolume(vol);
        if (vol > 0) setIsMuted(false);
      }
    } else {
      if (nativeVideoRef.current) {
        nativeVideoRef.current.volume = vol / 100;
        if (vol > 0) setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (isYouTube) {
      if (!playerRef.current) return;
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
        if (volume === 0) setVolume(50);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } else {
      if (!nativeVideoRef.current) return;
      if (isMuted) {
        nativeVideoRef.current.muted = false;
        setIsMuted(false);
        if (volume === 0) setVolume(50);
      } else {
        nativeVideoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Native HTML5 video events
  const handleNativeTimeUpdate = () => {
    if (nativeVideoRef.current) {
      setCurrentTime(nativeVideoRef.current.currentTime);
    }
  };

  const handleNativeLoadedMetadata = () => {
    if (nativeVideoRef.current) {
      setDuration(nativeVideoRef.current.duration);
    }
  };

  const handleNativeEnded = () => {
    setShowEndOverlay(true);
    setIsPlaying(false);
  };

  if (!content || !content.url) {
    return (
      <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden shadow-xl flex items-center justify-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          <p className="text-sm">
            {!content ? "Loading video..." : "No playable video URL found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .ytp-title-link,
          .ytp-youtube-button,
          .ytp-watermark,
          .ytp-chrome-top,
          .ytp-show-cards-title,
          .ytp-ce-element,
          .ytp-cards-teaser,
          .ytp-endscreen-content,
          .ytp-title,
          .ytp-title-text,
          .ytp-pause-overlay,
          .ytp-share-button,
          .ytp-share-button-visible,
          .ytp-chrome-top-buttons,
          .ytp-sharebutton,
          .ytp-overflow-panel,
          .video-container button[aria-label*="Share"],
          .video-container button[aria-label*="share"],
          .video-container button[aria-label*="Copy"],
          .video-container button[aria-label*="copy"],
          .video-container .ytp-menuitem[aria-label*="Copy"],
          .video-container a[href*="youtube.com"],
          .video-container a[href*="youtu.be"] {
            display: none !important;
            pointer-events: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
          }

          .ytp-chrome-top-buttons button,
          .ytp-chrome-top-buttons a,
          .ytp-chrome-top .ytp-button {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }

          .video-container,
          .video-container * {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -webkit-touch-callout: none !important;
          }

          .video-container iframe {
            pointer-events: none !important;
          }

          #youtube-player iframe {
            pointer-events: auto !important;
          }

          video {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            user-select: none !important;
          }

          input[type="range"].volume-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 14px;
            background: transparent;
            outline: none;
            position: relative;
            z-index: 10;
            margin: 0;
            padding: 0;
          }

          input[type="range"].volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
            transition: all 0.2s ease;
            margin-top: -3px;
          }

          input[type="range"].volume-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
          }

          input[type="range"].volume-slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
            transition: all 0.2s ease;
          }

          input[type="range"].volume-slider::-moz-range-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
          }

          input[type="range"].volume-slider::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 2px;
          }

          input[type="range"].volume-slider::-moz-range-track {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 2px;
          }

          input[type="range"].progress-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 14px;
            background: transparent;
            outline: none;
            position: relative;
            z-index: 10;
            margin: 0;
            padding: 0;
          }

          input[type="range"].progress-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 0;
            height: 0;
            cursor: pointer;
            opacity: 0;
          }

          input[type="range"].progress-slider:hover::-webkit-slider-thumb {
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
            opacity: 1;
            margin-top: -3px;
          }

          input[type="range"].progress-slider::-moz-range-thumb {
            width: 0;
            height: 0;
            cursor: pointer;
            opacity: 0; 
            border: none;
          }

          input[type="range"].progress-slider:hover::-moz-range-thumb {
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
            opacity: 1;
          }

          input[type="range"].progress-slider::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 2px;
          }

          input[type="range"].progress-slider::-moz-range-track {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 2px;
          }

          .progress-bar:hover .progress-fill {
            height: 5px;
          }
        `,
        }}
      />

      <div
        ref={containerRef}
        className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden shadow-xl"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onContextMenu={(e) => e.preventDefault()}
        data-video-id={obfuscatedVideoId}
      >
        {/* Watermark Logo */}
        <div className="absolute top-[2.7%] right-[1.3%] size-[8.3%] z-40 overflow-hidden backdrop-blur-xs rounded-full">
          <Image
            src="/static/2Fans-02.svg"
            alt="Logo"
            fill
            style={{ objectFit: "contain" }}
            sizes="100vw"
          />
        </div>

        {/* Player Area */}
        {isYouTube ? (
          /* YouTube Player Wrapper */
          <div
            ref={wrapperRef}
            id="youtube-player"
            className="absolute top-0 left-0 w-full h-full video-container"
            onContextMenu={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        ) : (
          /* Native HTML5 Video Element */
          <video
            ref={nativeVideoRef}
            src={content.url}
            className="absolute top-0 left-0 w-full h-full object-contain bg-black"
            onTimeUpdate={handleNativeTimeUpdate}
            onLoadedMetadata={handleNativeLoadedMetadata}
            onEnded={handleNativeEnded}
            playsInline
            onClick={handlePlayPause}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}

        {/* Transparent overlay to block YouTube UI interactions */}
        {isYouTube && !showOverlay && !showEndOverlay && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={handlePlayPause}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}

        {/* Initial Play Overlay */}
        {showOverlay && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 flex flex-col items-center justify-center z-50 gap-6 backdrop-blur-sm">
            <button
              onClick={handlePlayPause}
              className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 flex items-center justify-center group hover:scale-110 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
              <PlayCircleIcon className="w-16 h-16 text-white ml-1 relative z-10 drop-shadow-lg" />
            </button>
            <h3 className="text-white text-2xl font-bold text-center px-6 drop-shadow-lg max-w-2xl line-clamp-2">
              {content.title}
            </h3>
          </div>
        )}

        {/* End Overlay (Replay) */}
        {showEndOverlay && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full" />
              <PlayCircleIcon className="w-24 h-24 text-white relative z-10 drop-shadow-2xl" />
            </div>
            <h3 className="text-white text-2xl font-bold text-center px-6 max-w-2xl line-clamp-2">
              {content.title}
            </h3>
            <button
              onClick={handleReplay}
              className="group relative px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 group-hover:from-red-700 group-hover:to-red-800 transition-all" />
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
                Replay Video
              </span>
            </button>
          </div>
        )}

        {/* Custom Controls - Always visible at bottom */}
        {!showOverlay && !showEndOverlay && (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-4 px-6 z-20 transition-all duration-300 ${showControls || !isPlaying
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
              }`}
          >
            {/* Progress Bar - Full Width Above Controls */}
            <div className="progress-bar w-full relative mb-4 group">
              {/* Background track */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-full h-1 bg-white/20 rounded-full" />
              </div>
              {/* Filled portion */}
              <div
                className="progress-fill absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full pointer-events-none z-[2] transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Range input slider */}
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={(e) => {
                  const seekTime = parseFloat(e.target.value);
                  setCurrentTime(seekTime);
                  if (isYouTube) {
                    if (playerRef.current) {
                      playerRef.current.seekTo(seekTime, true);
                    }
                  } else {
                    if (nativeVideoRef.current) {
                      nativeVideoRef.current.currentTime = seekTime;
                    }
                  }
                }}
                className="progress-slider w-full cursor-pointer relative z-[10]"
                aria-label="Video progress"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-5">
              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="text-white hover:scale-110 transition-transform flex-shrink-0 w-8 h-8 flex items-center justify-center cursor-pointer bg-transparent border-none"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Time Display */}
              <span className="text-white text-sm font-semibold whitespace-nowrap tabular-nums tracking-wide">
                {formatTime(currentTime)}{" "}
                <span className="text-white/60">/</span> {formatTime(duration)}
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Volume Controls */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={toggleMute}
                  className="text-white hover:scale-110 transition-transform w-6 h-6 flex items-center justify-center cursor-pointer bg-transparent border-none"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <SpeakerXMarkIcon className="w-6 h-6" />
                  ) : (
                    <SpeakerWaveIcon className="w-6 h-6" />
                  )}
                </button>
                <div className="relative w-24 group/volume">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider w-full cursor-pointer"
                    aria-label="Volume"
                  />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-white rounded-full pointer-events-none"
                    style={{ width: `${volume}%` }}
                  />
                </div>
              </div>

              {/* Settings Gear Button & Panel */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setSettingsView("main");
                  }}
                  className="text-white hover:scale-110 transition-transform w-6 h-6 flex items-center justify-center cursor-pointer bg-transparent border-none"
                  aria-label="Settings"
                >
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${showSettings ? "rotate-45" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.61.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                </button>

                {/* Settings Panel */}
                {showSettings && (
                  <div className="absolute bottom-10 right-0 w-48 bg-black/95 border border-white/10 rounded-lg shadow-2xl p-2 z-50 text-white text-xs">
                    {settingsView === "main" && (
                      <div className="space-y-1">
                        {isYouTube && (
                          <button
                            onClick={() => setSettingsView("quality")}
                            className="w-full text-left px-3 py-2 hover:bg-white/10 rounded flex justify-between items-center cursor-pointer bg-transparent border-none text-white"
                          >
                            <span>Quality</span>
                            <span className="text-white/55">
                              {(() => {
                                const labels: Record<string, string> = {
                                  auto: "Auto",
                                  highres: "1080p",
                                  hd1080: "1080p",
                                  hd720: "720p",
                                  large: "480p",
                                  medium: "360p",
                                  small: "240p",
                                  tiny: "144p",
                                };
                                return labels[currentQuality.toLowerCase()] || "Auto";
                              })()} &gt;
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => setSettingsView("speed")}
                          className="w-full text-left px-3 py-2 hover:bg-white/10 rounded flex justify-between items-center cursor-pointer bg-transparent border-none text-white"
                        >
                          <span>Playback Speed</span>
                          <span className="text-white/55">{playbackRate === 1 ? "Normal" : `${playbackRate}x`} &gt;</span>
                        </button>
                      </div>
                    )}

                    {isYouTube && settingsView === "quality" && (
                      <div className="space-y-1">
                        <button
                          onClick={() => setSettingsView("main")}
                          className="w-full text-left px-3 py-1 text-white/55 hover:bg-white/5 rounded border-b border-white/5 mb-1 cursor-pointer bg-transparent border-none"
                        >
                          &lt; Back
                        </button>
                        <div className="max-h-36 overflow-y-auto">
                          {[
                            { value: "auto", label: "Auto" },
                            { value: "hd1080", label: "1080p HD" },
                            { value: "hd720", label: "720p HD" },
                            { value: "large", label: "480p" },
                            { value: "medium", label: "360p" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setCurrentQuality(opt.value);
                                if (playerRef.current) {
                                  if (typeof playerRef.current.setPlaybackQualityRange === "function") {
                                    playerRef.current.setPlaybackQualityRange(opt.value, opt.value);
                                  } else if (typeof playerRef.current.setPlaybackQuality === "function") {
                                    playerRef.current.setPlaybackQuality(opt.value);
                                  }
                                }
                                setShowSettings(false);
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-white/10 rounded flex justify-between items-center cursor-pointer bg-transparent border-none text-white ${currentQuality === opt.value ? "text-red-500 font-bold" : ""}`}
                            >
                              <span>{opt.label}</span>
                              {currentQuality === opt.value && <span>✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {settingsView === "speed" && (
                      <div className="space-y-1">
                        <button
                          onClick={() => setSettingsView("main")}
                          className="w-full text-left px-3 py-1 text-white/55 hover:bg-white/5 rounded border-b border-white/5 mb-1 cursor-pointer bg-transparent border-none"
                        >
                          &lt; Back
                        </button>
                        {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => {
                              setPlaybackRate(rate);
                              if (isYouTube) {
                                if (playerRef.current && typeof playerRef.current.setPlaybackRate === "function") {
                                  playerRef.current.setPlaybackRate(rate);
                                }
                              } else {
                                if (nativeVideoRef.current) {
                                  nativeVideoRef.current.playbackRate = rate;
                                }
                              }
                              setShowSettings(false);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-white/10 rounded flex justify-between items-center cursor-pointer bg-transparent border-none text-white ${playbackRate === rate ? "text-red-500 font-bold" : ""}`}
                          >
                            <span>{rate === 1.0 ? "Normal" : `${rate}x`}</span>
                            {playbackRate === rate && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:scale-110 transition-transform flex-shrink-0 w-6 h-6 flex items-center justify-center cursor-pointer bg-transparent border-none"
                aria-label="Fullscreen"
              >
                {isFullscreen ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VideoPlayer;
