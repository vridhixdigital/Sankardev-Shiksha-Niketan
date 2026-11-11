import React, { useState, useMemo } from 'react';
import {
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  CheckCircle2,
  Image as ImageIcon,
  Trophy,
  Filter,
  Sparkles,
} from 'lucide-react';
import { WallOfFameDoc } from '../../types/erp';

interface WallOfFameDirectoryManagerProps {
  wallOfFame: WallOfFameDoc[];
  onAddWallOfFame?: (award: Partial<WallOfFameDoc>) => Promise<void>;
  onUpdateWallOfFame?: (id: string, updates: Partial<WallOfFameDoc>) => Promise<void>;
  onDeleteWallOfFame?: (id: string) => Promise<void>;
}

const CATEGORIES: WallOfFameDoc['category'][] = [
  'ASSEB Board Exam State Ranker',
  'Star Distinction & 95%+ Club',
  'APSC / Civil Services Scholar',
  'National / State Sports Champion',
  'Sankariya Cultural & Vedic Arts',
  'STEM & Olympiad Laureate',
];

export const WallOfFameDirectoryManager: React.FC<WallOfFameDirectoryManagerProps> = ({
  wallOfFame,
  onAddWallOfFame,
  onUpdateWallOfFame,
  onDeleteWallOfFame,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WallOfFameDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [scholarName, setScholarName] = useState('');
  const [batchSession, setBatchSession] = useState('2025–26');
  const [category, setCategory] = useState<WallOfFameDoc['category']>('ASSEB Board Exam State Ranker');
  const [achievementTitle, setAchievementTitle] = useState('');
  const [rankOrScore, setRankOrScore] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [studentIdOrRoll, setStudentIdOrRoll] = useState('');
  const [currentPursuit, setCurrentPursuit] = useState('');
  const [citationStory, setCitationStory] = useState('');
  const [featured, setFeatured] = useState(true);
  const [orderIndex, setOrderIndex] = useState(1);

  const filteredRecords = useMemo(() => {
    return wallOfFame.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.scholarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.achievementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.currentPursuit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.studentIdOrRoll && item.studentIdOrRoll.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [wallOfFame, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    const total = wallOfFame.length;
    const stateRankers = wallOfFame.filter((i) => i.category === 'ASSEB Board Exam State Ranker').length;
    const sports = wallOfFame.filter((i) => i.category === 'National / State Sports Champion').length;
    const featuredCount = wallOfFame.filter((i) => i.featured).length;
    return { total, stateRankers, sports, featuredCount };
  }, [wallOfFame]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setScholarName('');
    setBatchSession('2025–26');
    setCategory('ASSEB Board Exam State Ranker');
    setAchievementTitle('');
    setRankOrScore('');
    setPhotoUrl('');
    setStudentIdOrRoll('');
    setCurrentPursuit('');
    setCitationStory('');
    setFeatured(true);
    setOrderIndex(wallOfFame.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: WallOfFameDoc) => {
    setEditingRecord(rec);
    setScholarName(rec.scholarName);
    setBatchSession(rec.batchSession);
    setCategory(rec.category);
    setAchievementTitle(rec.achievementTitle);
    setRankOrScore(rec.rankOrScore);
    setPhotoUrl(rec.photoUrl || '');
    setStudentIdOrRoll(rec.studentIdOrRoll || '');
    setCurrentPursuit(rec.currentPursuit);
    setCitationStory(rec.citationStory);
    setFeatured(rec.featured);
    setOrderIndex(rec.orderIndex);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarName.trim() || !achievementTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const payload: Partial<WallOfFameDoc> = {
        scholarName: scholarName.trim(),
        batchSession: batchSession.trim(),
        category,
        achievementTitle: achievementTitle.trim(),
        rankOrScore: rankOrScore.trim(),
        photoUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        studentIdOrRoll: studentIdOrRoll.trim(),
        currentPursuit: currentPursuit.trim(),
        citationStory: citationStory.trim(),
        featured,
        orderIndex: Number(orderIndex) || 1,
      };

      if (editingRecord && onUpdateWallOfFame) {
        await onUpdateWallOfFame(editingRecord.id, payload);
      } else if (!editingRecord && onAddWallOfFame) {
        await onAddWallOfFame(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save Wall of Fame record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this achiever from the Wall of Fame?')) {
      if (onDeleteWallOfFame) {
        await onDeleteWallOfFame(id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/30 border border-amber-400/40 rounded-full w-fit text-xs font-semibold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              Honor Roll & Legacy Management
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Wall of Fame & Hall of Achievers</h2>
            <p className="text-amber-100 text-sm mt-1 max-w-2xl">
              Manage state rankers, board exam toppers, APSC civil service qualifiers, sports champions, and cultural laureates representing Shankardev Shiksha Niketan.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Achiever
          </button>
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-amber-600/40">
          <div className="bg-amber-900/40 backdrop-blur-xs rounded-xl p-3 border border-amber-700/50">
            <p className="text-xs text-amber-200 font-medium">Total Honorees</p>
            <p className="text-2xl font-extrabold mt-1">{stats.total}</p>
          </div>
          <div className="bg-amber-900/40 backdrop-blur-xs rounded-xl p-3 border border-amber-700/50">
            <p className="text-xs text-amber-200 font-medium">ASSEB State Rankers</p>
            <p className="text-2xl font-extrabold mt-1 text-amber-300">{stats.stateRankers}</p>
          </div>
          <div className="bg-amber-900/40 backdrop-blur-xs rounded-xl p-3 border border-amber-700/50">
            <p className="text-xs text-amber-200 font-medium">Sports Champions</p>
            <p className="text-2xl font-extrabold mt-1 text-amber-300">{stats.sports}</p>
          </div>
          <div className="bg-amber-900/40 backdrop-blur-xs rounded-xl p-3 border border-amber-700/50">
            <p className="text-xs text-amber-200 font-medium">Featured on Homepage</p>
            <p className="text-2xl font-extrabold mt-1 text-emerald-300">{stats.featuredCount}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholar, award, or pursuit..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.split(' ')[0]} ...
            </button>
          ))}
        </div>
      </div>

      {/* Achievers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden relative"
          >
            {item.featured && (
              <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-amber-500 text-amber-950 font-bold text-[10px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </div>
            )}

            <div className="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={item.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt={item.scholarName}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <div>
                  <span className="px-2 py-0.5 bg-amber-500/90 text-amber-950 text-[10px] font-bold rounded-md">
                    {item.batchSession}
                  </span>
                  <h3 className="text-white font-bold text-lg mt-1">{item.scholarName}</h3>
                  {item.studentIdOrRoll && (
                    <p className="text-slate-300 text-xs font-mono">{item.studentIdOrRoll}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Award className="w-3.5 h-3.5" />
                  {item.category}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                  {item.achievementTitle}
                </h4>
                <div className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  {item.rankOrScore}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed italic">
                  "{item.citationStory}"
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Current:</span> {item.currentPursuit}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">Display Order: #{item.orderIndex}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Achiever"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete Achiever"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredRecords.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Achievers Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new record.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {editingRecord ? 'Edit Honor Roll Achiever' : 'Add New Honor Roll Achiever'}
                  </h3>
                  <p className="text-xs text-slate-500">Recognize outstanding academic, sports, and cultural excellence</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scholar Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={scholarName}
                    onChange={(e) => setScholarName(e.target.value)}
                    placeholder="e.g. Ananya Borah"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Batch / Session *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchSession}
                    onChange={(e) => setBatchSession(e.target.value)}
                    placeholder="e.g. 2025–26"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Award Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WallOfFameDoc['category'])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Roll No / ID
                  </label>
                  <input
                    type="text"
                    value={studentIdOrRoll}
                    onChange={(e) => setStudentIdOrRoll(e.target.value)}
                    placeholder="e.g. SSN-XII-SCI-014"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Achievement Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={achievementTitle}
                    onChange={(e) => setAchievementTitle(e.target.value)}
                    placeholder="e.g. ASSEB Higher Secondary State 3rd Rank"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rank / Score Achieved *
                  </label>
                  <input
                    type="text"
                    required
                    value={rankOrScore}
                    onChange={(e) => setRankOrScore(e.target.value)}
                    placeholder="e.g. 98.6% (State Top 3)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Achiever Photo (Upload from Local Computer)
                </label>
                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    <div className="w-16 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                      <img src={photoUrl} alt="Passport Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-20 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50 shrink-0 text-[10px]">
                      No Photo
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (uploadEvent) => {
                          const base64Str = uploadEvent.target?.result as string;
                          if (base64Str) {
                            setPhotoUrl(base64Str);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Pursuit / Higher Education / Career *
                </label>
                <input
                  type="text"
                  required
                  value={currentPursuit}
                  onChange={(e) => setCurrentPursuit(e.target.value)}
                  placeholder="e.g. MBBS Scholar at GMCH (NEET 680/720)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Citation / Honor Story *
                </label>
                <textarea
                  required
                  rows={3}
                  value={citationStory}
                  onChange={(e) => setCitationStory(e.target.value)}
                  placeholder="Secured Star Distinction across Physics and Chemistry..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="featuredCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Featured on Public Homepage Banner
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingRecord ? 'Update Achiever' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
