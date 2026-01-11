import { Trophy, ChevronRight, Heart, Eye, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Post } from "../types";

interface TopPostsModuleProps {
  posts: Post[];
  onExpand: () => void;
  onSelectPost: (post: Post) => void;
}

export const TopPostsModule = ({ 
  posts, 
  onExpand,
  onSelectPost 
}: TopPostsModuleProps) => {
  const topPosts = posts.slice(0, 3);

  const getRankStyle = (index: number) => {
    const styles = [
      'from-yellow-400 to-amber-500 shadow-yellow-500/30', // Gold
      'from-slate-300 to-slate-400 shadow-slate-400/30',   // Silver
      'from-amber-600 to-orange-700 shadow-amber-600/30',  // Bronze
    ];
    return styles[index] || styles[0];
  };

  const getRankEmoji = (index: number) => {
    const emojis = ['🥇', '🥈', '🥉'];
    return emojis[index] || '🏅';
  };

  return (
    <div 
      className="bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer group hover:border-yellow-500/50 transition-all"
      onClick={onExpand}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">საუკეთესო კონტენტი</h3>
            <p className="text-xs text-white/60">Top performers</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {topPosts.length > 0 ? (
          topPosts.map((post, index) => (
            <div 
              key={post.id}
              className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 hover:border-yellow-500/50 transition-all flex items-center gap-3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPost(post);
              }}
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRankStyle(index)} flex items-center justify-center text-sm shadow-lg flex-shrink-0`}>
                {getRankEmoji(index)}
              </div>

              {/* Thumbnail */}
              {post.media_url ? (
                <img 
                  src={post.media_url} 
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-4 w-4 text-white/60" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-600 text-white/80">
                    {post.media_type || 'Post'}
                  </Badge>
                  <span className="text-[10px] text-white/60">{post.post_date}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-pink-400 font-bold">
                    <Heart className="h-3 w-3" />
                    {(post.likes || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Eye className="h-3 w-3" />
                    {((post.reach || 0) >= 1000) ? `${((post.reach || 0)/1000).toFixed(1)}K` : post.reach || 0}
                  </span>
                  <span className="flex items-center gap-1 text-green-400">
                    <MessageCircle className="h-3 w-3" />
                    {post.comments || 0}
                  </span>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-white/40 flex-shrink-0" />
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-white/60">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">პოსტები არ არის</p>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-white/60 flex items-center gap-1 group-hover:text-yellow-400 transition-colors">
            <span>ყველა პოსტი ({posts.length})</span>
            <ChevronRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    </div>
  );
};
