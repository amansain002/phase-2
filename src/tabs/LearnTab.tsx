import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Play,
  FileText,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Globe,
  Award,
  Zap,
  ChevronDown,
  Filter,
  Youtube,
  GraduationCap,
} from 'lucide-react';
import {
  LearningResource,
  LearningResourceType,
  QuickNotes,
} from '../types/learning';
import {
  CURATED_LEARNING_RESOURCES,
  QUICK_NOTES_MAP,
  LEARNING_XP_CONFIG,
  buildSearchURL,
} from '../data/learningConfig';
import {
  getLearningStats,
  canClaimLearningXP,
  recordLearningXPClaim,
  toggleBookmark,
  getBookmarkedResourceIds,
  getCompletedResourceIds,
  getRecentTopics,
  addRecentTopic,
  fetchTopicVideos,
  VideoResult,
} from '../lib/learningService';
import { useTheme } from '../context/ThemeProvider';
import { useApp } from '../context/AppContext';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { CharacterAvatar } from '../components/CharacterAvatar';

const RESOURCE_TYPE_FILTERS: { id: LearningResourceType | 'all' | 'saved'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Videos' },
  { id: 'article', label: 'Articles' },
  { id: 'notes', label: 'Notes' },
  { id: 'course', label: 'Free Courses' },
  { id: 'cheatsheet', label: 'Cheat Sheets' },
  { id: 'saved', label: 'Saved' },
];

interface LearnTabProps {
  initialTopic?: string;
}

export const LearnTab: React.FC<LearnTabProps> = ({ initialTopic }) => {
  const { character } = useTheme();
  const { addXp, topics } = useApp();

  // All combined available topics
  const combinedTopics = Array.from(
    new Set([
      'Operating Systems',
      'DBMS',
      'Data Structures',
      'Artificial Intelligence',
      'Computer Networks',
      'Finance',
      'Fitness',
      ...topics,
    ])
  );

  const [selectedTopic, setSelectedTopic] = useState<string>(
    initialTopic || combinedTopics[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<LearningResourceType | 'all' | 'saved'>('all');

  // Video Filters
  const [videoLanguage, setVideoLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>('English');
  const [videoDuration, setVideoDuration] = useState<'short' | 'medium' | 'long'>('medium');
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [activePlayingVideo, setActivePlayingVideo] = useState<VideoResult | null>(null);

  // Storage states
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarkedResourceIds);
  const [completedIds, setCompletedIds] = useState<string[]>(getCompletedResourceIds);
  const [learningStats, setLearningStats] = useState(getLearningStats);
  const [recentTopics, setRecentTopics] = useState<string[]>(getRecentTopics);

  // Sync initialTopic if updated from outside (e.g. clicking "Learn this" on a task)
  useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic);
      addRecentTopic(initialTopic);
      setRecentTopics(getRecentTopics());
    }
  }, [initialTopic]);

  // Load videos when topic or video filters change
  useEffect(() => {
    let isMounted = true;
    fetchTopicVideos(selectedTopic, videoLanguage, videoDuration).then((res) => {
      if (isMounted) setVideos(res);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedTopic, videoLanguage, videoDuration]);

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    addRecentTopic(topic);
    setRecentTopics(getRecentTopics());
  };

  const handleToggleBookmark = (id: string) => {
    toggleBookmark(id);
    setBookmarkedIds(getBookmarkedResourceIds());
  };

  const handleCompleteResource = (resource: LearningResource) => {
    const claim = canClaimLearningXP(resource.id);
    if (claim.canClaim) {
      const awarded = recordLearningXPClaim(resource.id, resource.xpReward);
      addXp(awarded, `Learned: ${resource.title}`);
    } else {
      recordLearningXPClaim(resource.id, 0);
    }
    setCompletedIds(getCompletedResourceIds());
    setLearningStats(getLearningStats());
  };

  // Filter curated resources by topic, type, search
  const topicResources = CURATED_LEARNING_RESOURCES.filter((r) => {
    const matchesTopic =
      r.topic.toLowerCase().includes(selectedTopic.toLowerCase()) ||
      selectedTopic.toLowerCase().includes(r.topic.toLowerCase());

    const matchesSearch =
      !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      activeTypeFilter === 'all'
        ? true
        : activeTypeFilter === 'saved'
        ? bookmarkedIds.includes(r.id)
        : r.type === activeTypeFilter;

    return matchesTopic && matchesSearch && matchesType;
  });

  // Calculate skill progress %
  const totalTopicItems = CURATED_LEARNING_RESOURCES.filter(
    (r) => r.topic.toLowerCase() === selectedTopic.toLowerCase()
  ).length;
  const completedTopicItems = CURATED_LEARNING_RESOURCES.filter(
    (r) =>
      r.topic.toLowerCase() === selectedTopic.toLowerCase() &&
      completedIds.includes(r.id)
  ).length;
  const skillProgressPct =
    totalTopicItems > 0
      ? Math.round((completedTopicItems / totalTopicItems) * 100)
      : 0;

  // Active quick notes
  const activeNotes: QuickNotes | undefined =
    QUICK_NOTES_MAP[selectedTopic] ||
    QUICK_NOTES_MAP[
      Object.keys(QUICK_NOTES_MAP).find((k) =>
        selectedTopic.toLowerCase().includes(k.toLowerCase())
      ) || ''
    ];

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* 1. TOP HEADER: Topic Selector & Search Bar */}
      <div
        className="p-4 rounded-3xl border bg-surface shadow-xs space-y-3 transition-colors duration-500"
        style={{ borderColor: `${character.theme.primary}30` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span
              className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block mb-1"
              style={{
                backgroundColor: `${character.theme.primary}15`,
                borderColor: `${character.theme.primary}35`,
                color: character.theme.primary,
              }}
            >
              Curated Curriculum
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-coffee">Learning for:</h2>
              <div className="relative">
                <select
                  value={selectedTopic}
                  onChange={(e) => handleSelectTopic(e.target.value)}
                  className="appearance-none bg-surface2 border border-edge text-coffee font-extrabold text-xs py-1.5 pl-3 pr-7 rounded-xl outline-none cursor-pointer hover:border-coffee-muted/40 transition"
                >
                  {combinedTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-coffee-muted pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Daily Learning XP Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-surface2 border border-edge text-xs">
            <Sparkles size={14} style={{ color: character.theme.primary }} />
            <span className="font-extrabold text-coffee font-mono">
              {learningStats.dailyXpEarned} / {LEARNING_XP_CONFIG.dailyLearningXpCap} XP
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${selectedTopic} notes, videos, or tutorials...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-edge bg-surface2 text-xs text-coffee outline-none placeholder:text-coffee-muted/60"
          />
        </div>

        {/* Skill Progress Bar */}
        <div className="space-y-1 pt-1 border-t border-edge">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-coffee-muted">Topic Completion</span>
            <span style={{ color: character.theme.primary }}>
              {skillProgressPct}% ({completedTopicItems}/{Math.max(1, totalTopicItems)} items)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-sand/30 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${skillProgressPct}%`,
                backgroundColor: character.theme.primary,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. CONTINUE LEARNING / RECENT TOPICS ROW */}
      {recentTopics.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-coffee-muted uppercase tracking-wider px-1">
            Recent Topics
          </span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {recentTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleSelectTopic(topic)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedTopic.toLowerCase() === topic.toLowerCase()
                    ? 'text-white border-transparent shadow-xs'
                    : 'bg-surface border-edge text-coffee-muted hover:text-coffee'
                }`}
                style={
                  selectedTopic.toLowerCase() === topic.toLowerCase()
                    ? { backgroundColor: character.theme.primary }
                    : undefined
                }
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. TYPE FILTER CHIPS */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {RESOURCE_TYPE_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveTypeFilter(f.id)}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              activeTypeFilter === f.id
                ? 'text-white border-transparent shadow-xs'
                : 'bg-surface border-edge text-coffee-muted hover:text-coffee'
            }`}
            style={
              activeTypeFilter === f.id
                ? { backgroundColor: character.theme.primary }
                : undefined
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 4. RECOMMENDED VIDEOS SECTION */}
      {(activeTypeFilter === 'all' || activeTypeFilter === 'video') && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <h3 className="text-xs font-bold text-coffee uppercase tracking-wider flex items-center gap-1.5">
              <Youtube size={15} className="text-red-500" />
              Recommended Video Lessons
            </h3>

            {/* Language & Duration Dropdowns */}
            <div className="flex items-center gap-1.5">
              <select
                value={videoLanguage}
                onChange={(e) => setVideoLanguage(e.target.value as any)}
                className="py-1 px-2 rounded-lg bg-surface border border-edge text-[10px] font-bold text-coffee outline-none"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>

              <select
                value={videoDuration}
                onChange={(e) => setVideoDuration(e.target.value as any)}
                className="py-1 px-2 rounded-lg bg-surface border border-edge text-[10px] font-bold text-coffee outline-none"
              >
                <option value="short">&lt; 10m (Short)</option>
                <option value="medium">10-30m (Medium)</option>
                <option value="long">&gt; 30m (Full Course)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="p-3 rounded-2xl border border-edge bg-surface2/60 hover:bg-surface2 transition space-y-2 flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2">
                  <div
                    onClick={() => setActivePlayingVideo(vid)}
                    className="relative w-full aspect-video rounded-xl overflow-hidden bg-black cursor-pointer group/thumb"
                  >
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover/thumb:opacity-100 transition">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition">
                        <Play size={16} className="ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-white">
                      {vid.duration}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-coffee line-clamp-2 leading-snug">
                      {vid.title}
                    </h4>
                    <p className="text-[10px] text-coffee-muted mt-0.5">
                      {vid.channel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-edge">
                  <button
                    onClick={() => setActivePlayingVideo(vid)}
                    className="py-1.5 px-3 rounded-xl text-white text-[11px] font-bold shadow-xs transition active:scale-95 flex items-center gap-1"
                    style={{ backgroundColor: character.theme.primary }}
                  >
                    <Play size={12} /> Watch
                  </button>

                  <a
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-coffee-muted hover:text-coffee flex items-center gap-0.5"
                  >
                    <span>External</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. AI QUICK NOTES CARD */}
      {(activeTypeFilter === 'all' || activeTypeFilter === 'notes') && activeNotes && (
        <div
          className="p-4 rounded-3xl border bg-surface2/80 space-y-3 relative overflow-hidden"
          style={{ borderColor: `${character.theme.primary}35` }}
        >
          <div className="flex items-center gap-2">
            <CharacterAvatar character={character} size="xs" />
            <div>
              <span
                className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border"
                style={{
                  backgroundColor: `${character.theme.primary}15`,
                  borderColor: `${character.theme.primary}30`,
                  color: character.theme.primary,
                }}
              >
                AI Quick Notes
              </span>
              <h3 className="text-xs font-bold text-coffee">{activeNotes.title}</h3>
            </div>
          </div>

          <p className="text-xs text-coffee font-medium leading-relaxed">
            {activeNotes.summary}
          </p>

          <div className="space-y-1.5 bg-surface p-3 rounded-2xl border border-edge">
            <span className="text-[10px] font-bold text-coffee-muted uppercase tracking-wider block">
              Core Takeaways
            </span>
            <ul className="space-y-1">
              {activeNotes.keyPoints.map((pt, i) => (
                <li key={i} className="text-[11px] text-coffee leading-snug flex items-start gap-1.5">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {activeNotes.codeOrFormula && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-sky-300 overflow-x-auto">
              <code>{activeNotes.codeOrFormula}</code>
            </div>
          )}
        </div>
      )}

      {/* 6. STUDY MATERIAL & ARTICLES */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-coffee uppercase tracking-wider">
            Verified Study Material & References
          </h3>
          <span className="text-[10px] text-coffee-muted">Opens external site</span>
        </div>

        {topicResources.length === 0 ? (
          <div className="p-6 rounded-2xl border border-edge bg-surface text-center space-y-2">
            <BookOpen size={24} className="mx-auto text-coffee-muted/50" />
            <p className="text-xs font-semibold text-coffee">
              No curated articles stored for "{selectedTopic}".
            </p>
            <a
              href={buildSearchURL('geeksforgeeks', selectedTopic)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition"
              style={{ backgroundColor: character.theme.primary }}
            >
              <span>Search GeeksforGeeks for {selectedTopic}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {topicResources.map((res) => {
              const isCompleted = completedIds.includes(res.id);
              const isBookmarked = bookmarkedIds.includes(res.id);

              return (
                <div
                  key={res.id}
                  className="p-3.5 rounded-2xl border border-edge bg-surface2/60 hover:bg-surface2 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border"
                          style={{
                            backgroundColor: `${character.theme.primary}15`,
                            borderColor: `${character.theme.primary}30`,
                            color: character.theme.primary,
                          }}
                        >
                          {res.siteName}
                        </span>
                        <span className="text-[9px] font-semibold text-coffee-muted capitalize">
                          {res.type}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-coffee leading-snug">
                        {res.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(res.id)}
                      className="p-1 text-coffee-muted hover:text-coffee transition"
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck
                          size={16}
                          style={{ color: character.theme.primary }}
                        />
                      ) : (
                        <Bookmark size={16} />
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-coffee-muted leading-relaxed">
                    {res.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-edge text-xs">
                    <span className="text-[10px] text-coffee-muted flex items-center gap-1">
                      <Clock size={11} /> ~{res.estimatedMinutes} mins read
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1 px-2.5 rounded-lg border border-edge bg-surface text-[11px] font-semibold text-coffee hover:text-saddle transition flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ExternalLink size={11} />
                      </a>

                      <button
                        onClick={() => handleCompleteResource(res)}
                        className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-white'
                        }`}
                        style={
                          !isCompleted
                            ? { backgroundColor: character.theme.primary }
                            : undefined
                        }
                      >
                        <CheckCircle2 size={12} />
                        <span>{isCompleted ? 'Done' : '+15 XP'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Embedded Video Modal */}
      {activePlayingVideo && (
        <VideoPlayerModal
          video={activePlayingVideo}
          onClose={() => setActivePlayingVideo(null)}
          onWatched={() => {
            setActivePlayingVideo(null);
            setLearningStats(getLearningStats());
          }}
        />
      )}
    </div>
  );
};
