import React from 'react';
import {
  X,
  Play,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Youtube,
  Clock,
} from 'lucide-react';
import { VideoResult, canClaimLearningXP, recordLearningXPClaim, markVideoWatched } from '../lib/learningService';
import { LEARNING_XP_CONFIG } from '../data/learningConfig';
import { useTheme } from '../context/ThemeProvider';
import { useApp } from '../context/AppContext';

interface VideoPlayerModalProps {
  video: VideoResult;
  onClose: () => void;
  onWatched: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onWatched,
}) => {
  const { character } = useTheme();
  const { addXp } = useApp();

  const claimStatus = canClaimLearningXP(video.id);

  const handleMarkWatched = () => {
    if (claimStatus.canClaim) {
      const awarded = recordLearningXPClaim(
        video.id,
        LEARNING_XP_CONFIG.videoWatched
      );
      markVideoWatched(video.id);
      addXp(awarded, `Watched: ${video.title}`);
    } else {
      markVideoWatched(video.id);
    }
    onWatched();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-surface border border-edge rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-colors duration-500"
        style={{ borderColor: `${character.theme.primary}40` }}
      >
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-edge flex items-center justify-between bg-surface2/60">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Youtube size={20} className="text-red-500 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-coffee truncate">
              {video.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-surface hover:bg-sand/30 text-coffee-muted hover:text-coffee transition shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {video.videoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="p-6 text-center space-y-3">
              <Youtube size={48} className="mx-auto text-red-500" />
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Watch on YouTube
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click below to open this verified search playlist directly on YouTube.
                </p>
              </div>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md transition"
              >
                <span>Open YouTube Search</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}
        </div>

        {/* Details & Action Bar */}
        <div className="p-4 bg-surface space-y-3 border-t border-edge">
          <div className="flex items-center justify-between text-xs text-coffee-muted">
            <span className="font-semibold text-coffee">{video.channel}</span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {video.duration}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-edge">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-coffee-muted hover:text-coffee underline"
            >
              <span>Watch on external site</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={handleMarkWatched}
              disabled={!claimStatus.canClaim}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                claimStatus.canClaim
                  ? 'text-white'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
              style={
                claimStatus.canClaim
                  ? { backgroundColor: character.theme.primary }
                  : undefined
              }
            >
              <CheckCircle2 size={15} />
              <span>
                {claimStatus.canClaim
                  ? `Mark as Watched (+${LEARNING_XP_CONFIG.videoWatched} XP)`
                  : 'Watched Today'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
