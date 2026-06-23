"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PlayCircleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";
import { useGetContentByIdQuery } from "@/redux/features/content/content.api";
import { useGetChannelByIdQuery } from "@/redux/features/channel/channel.api";
import { useGetContentDetailsQuery } from "@/redux/features/dashboard/dashboard.api";
import { useAppSelector } from "@/redux/hook";
import {
  HandThumbUpIcon as HandThumbUpOutline,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import TipsModal from "@/components/payment/TipsModal";
import { HandThumbUpIcon as HandThumbUpSolid } from "@heroicons/react/24/solid";
import { GrForwardTen, GrBackTen } from "react-icons/gr";
import { Button, Form, FormProps, Input, Popover, Skeleton } from "antd";
import Image from "@/components/ui/CImage";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import GlobalModal from "@/components/GlobalModal";
import { useAppContext } from "@/lib/providers/ContextProvider";
import TextArea from "antd/es/input/TextArea";
import { TUniObject } from "@/types";
import { useSubmitReportMutation } from "@/redux/features/reports/reports.api";
import { errorAlert, TResError } from "@/lib/alerts";

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url?.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
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
  setPlaybackRate: (suggestedRate: number) => void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data?: number;
}

interface YT {
  Player: new (
    elementId: string,
    config: {
      videoId: string;
      host?: string;
      playerVars: {
        autoplay?: number;
        controls?: number;
        modestbranding?: number;
        rel?: number;
        showinfo?: number;
        autohide?: number;
        disablekb?: number;
        fs?: number;
        iv_load_policy?: number;
        cc_load_policy?: number;
        playsinline?: number;
        enablejsapi?: number;
        origin?: string;
      };
      events: {
        onReady: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const VideoComponent = () => {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const slug = params?.slug as string;
  console.log(slug)
  const { messageApi } = useAppContext();
  const [openModal, setOpenModal] = useState(false);
  const [openTipsModal, setOpenTipsModal] = useState(false);

  const isMyChannelPath = typeof window !== "undefined" && window.location.pathname.startsWith("/mychannel");

  const { data: viewerContentData, isLoading: isViewerLoading } = useGetContentByIdQuery(slug, {
    skip: isMyChannelPath,
  });
  console.log(viewerContentData, "Viewer Content Data")
  const { data: creatorContentData, isLoading: isCreatorLoading } = useGetContentDetailsQuery(slug, {
    skip: !isMyChannelPath,
  });
  console.log(creatorContentData, "Creator Content Data")
  const contentData = isMyChannelPath ? creatorContentData : viewerContentData;
  const isLoading = isMyChannelPath ? isCreatorLoading : isViewerLoading;
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [submitReport, { isLoading: isSubmittingReport }] =
    useSubmitReportMutation();

  const { user } = useAppSelector((state) => state.auth);

  // Channel Query
  const { data: channelData, isLoading: isChannelLoading } = useGetChannelByIdQuery(
    { channelId: contentData?.data?.channel! },
    { skip: !contentData?.data?.channel }
  );
  const channel = channelData?.data;

  // Like state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(124);

  // Description expand state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Comment Text State
  const [commentText, setCommentText] = useState("");

  // Comment Reply States
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Initial Interactive Comments State
  const [commentsList, setCommentsList] = useState([
    {
      id: "1",
      name: "Alex Rivera",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
      content: "This React pattern is an absolute game-changer. The explanation of state sharing between parent and children is extremely clear!",
      timestamp: "3 hours ago",
      likes: 14,
      likedByUser: false,
      replies: [
        {
          id: "r1",
          name: "Marcus Vance",
          avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus",
          content: "Agree! Compound components provide unmatched flexibility.",
          timestamp: "2 hours ago"
        }
      ]
    },
    {
      id: "2",
      name: "Sofia Chen",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sofia",
      content: "I've been struggling with compound components for weeks, but this video made it click instantly. Thank you so much!",
      timestamp: "5 hours ago",
      likes: 8,
      likedByUser: false,
      replies: []
    },
  ]);

  const handleLikeToggle = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const handleCommentLikeToggle = (commentId: string) => {
    setCommentsList((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const liked = !c.likedByUser;
          return {
            ...c,
            likedByUser: liked,
            likes: liked ? c.likes + 1 : c.likes - 1,
          };
        }
        return c;
      })
    );
  };

  const handleReplySubmit = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now().toString(),
      name: user?.username || "Anonymous User",
      avatar: user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'user'}`,
      content: replyText.trim(),
      timestamp: "Just now",
    };

    setCommentsList((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      })
    );

    setReplyText("");
    setActiveReplyId(null);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      name: user?.username || "Anonymous User",
      avatar: user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'user'}`,
      content: commentText.trim(),
      timestamp: "Just now",
      likes: 0,
      likedByUser: false,
      replies: []
    };

    setCommentsList([newComment, ...commentsList]);
    setCommentText("");
  };

  const content = contentData?.data;
  const videoId = content ? getYouTubeVideoId(content.url) : null;

  // Redirect creators to their channel page
  // useEffect(() => {
  //   if (user?.role?.toLowerCase() === "creator") {
  //     router.push("/mychannel");
  //   }
  // }, [user, router]);

  // Obfuscate video ID to prevent easy extraction
  const obfuscatedVideoId = React.useMemo(() => {
    if (!videoId) return null;
    // Create a simple obfuscation (this runs client-side)
    return btoa(videoId + Date.now().toString(36)).substring(0, 16);
  }, [videoId]);

  useEffect(() => {
    // Disable keyboard shortcuts that could expose YouTube
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

    // Disable right-click on the entire video container
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);

    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      if (videoId && !playerRef.current) {
        playerRef.current = new window.YT.Player("youtube-player", {
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
          },
        });
      }
    };

    if (window.YT && window.YT.Player && videoId && !playerRef.current) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // Update progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

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

  const [playbackRate, setPlaybackRate] = useState(1.0);

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
    }
  };

  const handleSeekOffset = (offset: number) => {
    if (playerRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + offset));
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  // Keyboard Shortcuts Effect
  useEffect(() => {
    const handlePlaybackShortcuts = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleSeekOffset(-10);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleSeekOffset(10);
      } else if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute();
      }
    };

    document.addEventListener("keydown", handlePlaybackShortcuts);
    return () => {
      document.removeEventListener("keydown", handlePlaybackShortcuts);
    };
  }, [currentTime, duration, isPlaying, isMuted, volume]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
      setShowEndOverlay(false);
      setShowOverlay(false);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    if (playerRef.current) {
      playerRef.current.setVolume(vol);
      if (vol > 0) setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
      if (volume === 0) setVolume(50);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
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

  const showModal = () => {
    setOpenModal(true);
  };

  const onClose = () => {
    setOpenModal(false);
    form.resetFields();
  };

  const onFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
    try {
      // console.log(values.report);
      await submitReport({
        channel: content?.channel!,
        title: values.title,
        description: values.report,
      }).unwrap();
      messageApi.open({
        key: "report",
        type: "success",
        content: "Report submitted successfully!",
        duration: 3,
      });
      form.resetFields();
      setOpenModal(false);
    } catch (error) {
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="relative w-full pb-[56.25%] bg-secondary-bg rounded-lg overflow-hidden shadow">
          <Skeleton.Input
            active
            className="absolute top-0 left-0 w-full! h-full!"
          />
        </div>
        <div className="space-y-3 mt-4">
          <Skeleton.Input active className="w-3/4!" />
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      </>
    );
  }

  if (!content || !videoId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-secondary-text">Video not found</p>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
          button[aria-label*="Share"],
          button[aria-label*="share"],
          button[aria-label*="Copy"],
          button[aria-label*="copy"],
          .ytp-menuitem[aria-label*="Copy"],
          a[href*="youtube.com"],
          a[href*="youtu.be"] {
            display: none !important;
            pointer-events: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
          }

          /* Hide all YouTube buttons in top right corner */
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

          /* Prevent iframe inspection */
          iframe {
            pointer-events: none !important;
          }

          #youtube-player {
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }

          #youtube-player iframe {
            width: 100% !important;
            height: 116% !important;
            top: -8% !important;
            position: absolute !important;
            pointer-events: auto !important;
          }

          /* Hide video source in dev tools */
          video {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            user-select: none !important;
          }

          /* Custom volume slider styling */
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

          /* Progress bar styling */
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
        className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden shadow-xl z-0"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onContextMenu={(e) => e.preventDefault()}
        data-video-id={obfuscatedVideoId}
      >
        {/* YouTube Player */}
        <div className="absolute top-[2.5%] right-[1%] size-10 z-40 overflow-hidden backdrop-blur-xs rounded-full">
          <Image
            src="/static/2Fans-02.svg"
            alt="Logo"
            fill
            style={{ objectFit: "contain" }}
            sizes="100vw"
          />
        </div>
        <div
          id="youtube-player"
          className="absolute top-0 left-0 w-full h-full video-container"
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* Transparent click overlay to play/pause video on click */}
        {!showOverlay && !showEndOverlay && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={handlePlayPause}
          />
        )}

        {/* Initial Play Overlay (Covers native poster frame, titles, logo and red play button) */}
        {showOverlay && videoId && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6">
            <Image
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={content.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
            {/* Dark contrast screen overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            <button
              onClick={handlePlayPause}
              className="w-20 h-20 rounded-full bg-brand-primary text-black hover:scale-105 hover:opacity-95 transition-all duration-300 flex items-center justify-center group shadow-2xl relative z-10 border-none cursor-pointer"
            >
              <PlayCircleIcon className="w-14 h-14 text-black" />
            </button>
            <h3 className="text-white text-lg md:text-xl font-semibold text-center px-6 drop-shadow-md max-w-2xl line-clamp-2 relative z-10">
              {content.title}
            </h3>
          </div>
        )}

        {/* End Overlay (Replay) */}
        {showEndOverlay && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-30 gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-lg" />
              <PlayCircleIcon className="w-24 h-24 text-white relative z-10 drop-shadow-2xl" />
            </div>
            <h3 className="text-white text-2xl font-semibold text-center px-6 max-w-2xl line-clamp-2">
              {content.title}
            </h3>
            <button
              onClick={handleReplay}
              className="group relative px-10 py-4 bg-brand-primary text-black font-semibold rounded-md transition-all duration-300 hover:scale-105 shadow-2xl overflow-hidden"
            >
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
                <div className="w-full h-1 bg-white/20 rounded-sm" />
              </div>
              {/* Filled portion */}
              <div
                className="progress-fill absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-primary rounded-sm pointer-events-none z-[2] transition-all duration-100"
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
                  if (playerRef.current) {
                    playerRef.current.seekTo(seekTime, true);
                    setCurrentTime(seekTime);
                  }
                }}
                className="progress-slider w-full cursor-pointer relative z-[10]"
                aria-label="Video progress"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-5">
              {/* Seek Backward Button */}
              <button
                onClick={() => handleSeekOffset(-10)}
                className="text-white hover:scale-110 transition-transform flex-shrink-0 w-8 h-8 flex items-center justify-center cursor-pointer bg-transparent border-none"
                aria-label="Seek backward 10 seconds"
              >
                <GrBackTen className="w-5 h-5 text-white" />
              </button>

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

              {/* Seek Forward Button */}
              <button
                onClick={() => handleSeekOffset(10)}
                className="text-white hover:scale-110 transition-transform flex-shrink-0 w-8 h-8 flex items-center justify-center cursor-pointer bg-transparent border-none"
                aria-label="Seek forward 10 seconds"
              >
                <GrForwardTen className="w-5 h-5 text-white" />
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
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-white rounded-sm pointer-events-none"
                    style={{ width: `${volume}%` }}
                  />
                </div>
              </div>

              {/* Playback Speed Controller Popover */}
              <Popover
                trigger={"click"}
                placement="topRight"
                content={
                  <div className="flex flex-col gap-1 bg-primary-bg p-1 rounded-md min-w-[100px] border border-border-primary/20">
                    {[0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleSpeedChange(rate)}
                        className={`text-left px-3 py-1.5 rounded-sm text-sm font-semibold cursor-pointer transition-all border-none ${playbackRate === rate
                          ? "bg-brand-primary text-black"
                          : "bg-transparent text-primary-text hover:bg-secondary-bg"
                          }`}
                      >
                        {rate === 1.0 ? "Normal" : `${rate}x`}
                      </button>
                    ))}
                  </div>
                }
              >
                <button className="text-white hover:scale-110 transition-transform text-sm font-semibold px-2 py-1 rounded-sm border border-white/20 bg-black/40 cursor-pointer whitespace-nowrap">
                  {playbackRate === 1.0 ? "1.0x" : `${playbackRate}x`}
                </button>
              </Popover>

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

      {/* Video Info */}
      <div className="space-y-4 mt-6">
        <h1 className=" text-2xl font-semibold text-primary-text leading-tight tracking-tight">
          {content.title}
        </h1>

        {/* Brand New Premium Channel Information, Like, Comments Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-secondary-bg/50 backdrop-blur-md rounded-lg border border-border-primary/50">
          {/* Left: Channel Info */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0 border border-brand-primary/20 bg-primary-bg">
              <Image
                src={channel?.avatar || "/static/avatar-placeholder.png"}
                alt={channel?.name || "Channel"}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div>
              <h3 className="font-semibold text-primary-text text-base leading-tight">
                {channel?.name || "Loading Channel..."}
              </h3>
              <p className="text-sm text-secondary-text mt-0.5">
                Creator • 12.8K subscribers
              </p>
            </div>
          </div>

          {/* Right: Actions (Like, Share, Report) */}
          <div className="flex items-center gap-3">
            {/* Like Option */}
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all border border-border-primary/50 cursor-pointer ${isLiked
                ? "bg-brand-primary text-black border-transparent"
                : "bg-secondary-bg/80 text-primary-text hover:bg-secondary-bg"
                }`}
            >
              {isLiked ? (
                <HandThumbUpSolid className="w-5 h-5" />
              ) : (
                <HandThumbUpOutline className="w-5 h-5" />
              )}
              <span>{likeCount}</span>
            </button>

            {/* Tip Option */}
            <button
              onClick={() => setOpenTipsModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all border border-border-primary/50 cursor-pointer bg-brand-primary text-black border-transparent hover:scale-105`}
            >
              <SparklesIcon className="w-5 h-5 text-black" />
              <span>Tip Creator</span>
            </button>


            {/* Report Option (Popover) */}
            <Popover
              trigger={"click"}
              content={
                <div className="bg-primary-bg">
                  <Button
                    onClick={showModal}
                    className="px-8!"
                    type="primary"
                    color="danger"
                    variant="filled"
                  >
                    Report
                  </Button>
                </div>
              }
              placement="bottomRight"
            >
              <Button
                className="flex items-center justify-center p-2 rounded-md border border-border-primary/50 bg-secondary-bg/80 hover:bg-secondary-bg text-secondary-text cursor-pointer"
                type="text"
                size="large"
              >
                <InformationCircleIcon className="w-5 h-5" />
              </Button>
            </Popover>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-secondary-bg/85 backdrop-blur-md rounded-lg p-6 lg:p-8 shadow-md border border-border-primary/80 relative">
          <h2 className="text-sm font-semibold text-secondary-text uppercase tracking-wide mb-3">
            Description
          </h2>
          <div
            className={`text-sm lg:text-base text-primary-text leading-relaxed whitespace-normal rich-description transition-all duration-300 ${!isDescriptionExpanded ? "max-h-20 overflow-hidden line-clamp-3" : ""
              }`}
            dangerouslySetInnerHTML={{ __html: content.description || "" }}
          />
          {content.description && content.description.replace(/<[^>]*>/g, '').length > 150 && (
            <div className="mt-3 flex justify-start">
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-brand-primary hover:underline text-sm font-semibold cursor-pointer border-none bg-transparent p-0"
              >
                {isDescriptionExpanded ? "Show Less" : "Show More"}
              </button>
            </div>
          )}
        </div>

        {/* Interactive Premium Comments Section */}
        <div className="bg-secondary-bg/85 backdrop-blur-md rounded-lg p-6 lg:p-8 shadow-md border border-border-primary/80 space-y-6">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-brand-primary" />
            <h2 className="text-lg font-semibold text-primary-text">
              Comments ({commentsList.length})
            </h2>
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-4">
            <div className="relative h-10 w-10 rounded-md overflow-hidden shrink-0 border border-border-primary/30 bg-primary-bg">
              <Image
                src={user?.avatar || "/static/avatar-placeholder.png"}
                alt="Your avatar"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts about this video..."
                rows={3}
                className="w-full bg-primary-bg border border-border-primary/60 rounded-md p-3 text-sm text-primary-text focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder:text-muted-text resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="bg-brand-primary text-black font-semibold rounded-md px-5 py-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm cursor-pointer border-none"
                >
                  Comment
                </button>
              </div>
            </div>
          </form>
          {/* Comments List */}
          <div className="space-y-4 pt-2">
            {commentsList.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4 rounded-md bg-primary-bg/40 border border-border-primary/20 hover:border-border-primary/40 transition-all flex-col">
                <div className="flex gap-4">
                  <div className="relative h-9 w-9 rounded-md overflow-hidden shrink-0 border border-border-primary/20 bg-primary-bg">
                    <Image
                      src={comment.avatar}
                      alt={comment.name}
                      fill
                      className="object-cover animate-fade-in"
                      sizes="36px"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary-text text-sm">{comment.name}</span>
                      <span className="text-sm text-muted-text">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-secondary-text leading-relaxed whitespace-pre-line">{comment.content}</p>

                    {/* Micro-engagement comment like & reply buttons */}
                    <div className="flex items-center gap-4 pt-1">
                      <button
                        onClick={() => handleCommentLikeToggle(comment.id)}
                        className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer border-none bg-transparent ${comment.likedByUser
                          ? "text-brand-primary font-semibold animate-bounce-subtle"
                          : "text-muted-text hover:text-primary-text"
                          }`}
                      >
                        {comment.likedByUser ? (
                          <HandThumbUpSolid className="w-4 h-4 text-brand-primary" />
                        ) : (
                          <HandThumbUpOutline className="w-4 h-4" />
                        )}
                        <span>{comment.likes}</span>
                      </button>

                      <button
                        onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                        className="text-sm text-muted-text hover:text-primary-text transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {activeReplyId === comment.id && (
                  <form
                    onSubmit={(e) => handleReplySubmit(e, comment.id)}
                    className="mt-2 flex gap-3 pl-12 w-full animate-fade-in"
                  >
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 bg-primary-bg border border-border-primary/60 rounded-md px-3 py-1.5 text-sm text-primary-text focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder:text-muted-text"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="bg-brand-primary text-black font-semibold rounded-md px-4 py-1.5 hover:opacity-90 disabled:opacity-50 transition-all text-sm cursor-pointer border-none"
                    >
                      Reply
                    </button>
                  </form>
                )}

                {/* Nested Replies Thread */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-12 border-l border-border-primary/30 space-y-3 mt-2 animate-fade-in">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3 p-3 rounded-md bg-primary-bg/20 border border-border-primary/10">
                        <div className="relative h-7 w-7 rounded-md overflow-hidden shrink-0 border border-border-primary/20 bg-primary-bg">
                          <Image
                            src={reply.avatar}
                            alt={reply.name}
                            fill
                            className="object-cover animate-fade-in"
                            sizes="28px"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-primary-text text-sm">{reply.name}</span>
                            <span className="text-sm text-muted-text">{reply.timestamp}</span>
                          </div>
                          <p className="text-sm text-secondary-text leading-relaxed whitespace-pre-line">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <GlobalModal
        isModalOpen={openModal}
        setIsModalOpen={setOpenModal}
        onClose={onClose}
        maxWidth="444px"
      >
        <div className="w-full">
          <div className="mb-4">
            <h1 className="text-xl xl:text-2xl font-semibold capitalize mb-2 text-center">
              Write your report
            </h1>
          </div>
          <Form
            form={form}
            name="normal_login"
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              name="title"
              rules={[
                {
                  required: true,
                  message: "Please enter your report title!",
                },
              ]}
            >
              <Input
                placeholder="Report Title"
                className="placeholder:text-black!"
              />
            </Form.Item>
            <Form.Item
              name="report"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter valid content to include in the report!",
                },
              ]}
            >
              <TextArea
                showCount
                rows={6}
                maxLength={100}
                placeholder="Write here...."
              />
            </Form.Item>
            <div className="flex justify-center items-center gap-3 mt-4">
              <Button
                onClick={onClose}
                type="text"
                color="danger"
                variant="filled"
                className="px-7!"
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                type="primary"
                className="px-7!"
                loading={isSubmittingReport}
              >
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </GlobalModal>

      {/* Tips Modal */}
      {content?._id && (
        <TipsModal
          isOpen={openTipsModal}
          setIsOpen={setOpenTipsModal}
          contentId={content._id}
        />
      )}
    </>
  );
};

export default VideoComponent;
