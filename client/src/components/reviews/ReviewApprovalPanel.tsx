/**
 * Review Approval Panel
 *
 * Shows reviews with AI-generated responses pending approval.
 * Allows editing, approving, or rejecting responses.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Check, X, Edit2, RefreshCw, MessageSquare,
  ThumbsUp, ThumbsDown, Sparkles, Clock, User
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Review {
  id: string;
  review_id: string;
  author_name: string;
  rating: number;
  review_text: string;
  review_time: string;
  relative_time: string;
  ai_response: string | null;
  response_status: string;
  profile_photo_url?: string;
}

const translations = {
  en: {
    title: 'Review Responses',
    subtitle: 'AI-generated responses pending your approval',
    syncReviews: 'Sync Reviews',
    generateAll: 'Generate All Responses',
    approve: 'Approve',
    reject: 'Reject',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    noReviews: 'No reviews pending approval',
    approved: 'Approved',
    rejected: 'Rejected',
    pending: 'Pending',
    aiResponse: 'AI Response',
    generating: 'Generating...',
    syncing: 'Syncing...',
  },
  ka: {
    title: 'რევიუების პასუხები',
    subtitle: 'AI-ს მიერ გენერირებული პასუხები დამტკიცების მოლოდინში',
    syncReviews: 'სინქრონიზაცია',
    generateAll: 'ყველას გენერირება',
    approve: 'დამტკიცება',
    reject: 'უარყოფა',
    edit: 'რედაქტირება',
    save: 'შენახვა',
    cancel: 'გაუქმება',
    noReviews: 'დასამტკიცებელი რევიუები არ არის',
    approved: 'დამტკიცებული',
    rejected: 'უარყოფილი',
    pending: 'მოლოდინში',
    aiResponse: 'AI პასუხი',
    generating: 'გენერირდება...',
    syncing: 'სინქრონიზდება...',
  }
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  onApprove,
  onReject,
  t,
}: {
  review: Review;
  onApprove: (id: string, editedResponse?: string) => void;
  onReject: (id: string) => void;
  t: typeof translations.en;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState(review.ai_response || '');

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    posted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
    >
      {/* Review Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              {review.profile_photo_url ? (
                <img
                  src={review.profile_photo_url}
                  alt={review.author_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-white">{review.author_name}</h4>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {review.relative_time}
                </span>
              </div>
            </div>
          </div>
          <Badge className={statusColors[review.response_status as keyof typeof statusColors]}>
            {t[review.response_status as keyof typeof t] || review.response_status}
          </Badge>
        </div>

        {/* Review Text */}
        <p className="mt-3 text-gray-300 text-sm leading-relaxed">
          "{review.review_text}"
        </p>
      </div>

      {/* AI Response Section */}
      {review.ai_response && (
        <div className="p-4 bg-slate-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">{t.aiResponse}</span>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onApprove(review.review_id, editedResponse);
                    setIsEditing(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {t.save}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditedResponse(review.ai_response || '');
                    setIsEditing(false);
                  }}
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                {review.ai_response}
              </p>

              {review.response_status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => onApprove(review.review_id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {t.approve}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    {t.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onReject(review.review_id)}
                    className="text-red-400 hover:bg-red-500/20"
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    {t.reject}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function ReviewApprovalPanel() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  // Queries
  const {
    data: reviews,
    isLoading,
    refetch,
  } = trpc.googleReviews.getPendingApproval.useQuery();

  const { data: stats } = trpc.googleReviews.getStats.useQuery();

  // Mutations
  const syncMutation = trpc.googleReviews.sync.useMutation({
    onSuccess: (data) => {
      toast.success(`Synced ${data.reviewsCount} reviews`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  const generateAllMutation = trpc.googleReviews.generateAllResponses.useMutation({
    onSuccess: (data) => {
      toast.success(`Generated ${data.generated} responses`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  const approveMutation = trpc.googleReviews.approveResponse.useMutation({
    onSuccess: () => {
      toast.success('Response approved!');
      refetch();
    },
  });

  const handleApprove = (reviewId: string, editedResponse?: string) => {
    approveMutation.mutate({
      reviewId,
      approved: true,
      editedResponse,
    });
  };

  const handleReject = (reviewId: string) => {
    approveMutation.mutate({
      reviewId,
      approved: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            {t.title}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{t.subtitle}</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            variant="outline"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? t.syncing : t.syncReviews}
          </Button>

          <Button
            onClick={() => generateAllMutation.mutate({})}
            disabled={generateAllMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className={`w-4 h-4 mr-2 ${generateAllMutation.isPending ? 'animate-pulse' : ''}`} />
            {generateAllMutation.isPending ? t.generating : t.generateAll}
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-white">{stats.totalReviews}</div>
            <div className="text-sm text-gray-400">Total Reviews</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
              {stats.averageRating}
              <Star className="w-5 h-5 fill-yellow-400" />
            </div>
            <div className="text-sm text-gray-400">Average Rating</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-orange-400">{stats.pendingResponses}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-green-400">{stats.approvedResponses}</div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              Loading reviews...
            </div>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review: Review) => (
              <ReviewCard
                key={review.review_id}
                review={review}
                onApprove={handleApprove}
                onReject={handleReject}
                t={t}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t.noReviews}</p>
              <Button
                onClick={() => syncMutation.mutate()}
                variant="link"
                className="text-cyan-400 mt-2"
              >
                {t.syncReviews}
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ReviewApprovalPanel;
