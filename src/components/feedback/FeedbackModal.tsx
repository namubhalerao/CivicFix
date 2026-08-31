import React, { useState } from 'react';
import { CheckCircle2, MessageSquare, Star, X } from 'lucide-react';
import { issueService } from '../../services/issueService';
import { Issue } from '../../types';

interface Props {
  issue: Issue;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const FeedbackModal: React.FC<Props> = ({ issue, isOpen, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await issueService.submitFeedback({
        issueId: issue.id,
        rating,
        comment,
      });
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-400">
              Your review helps improve municipal service delivery.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Issue Resolved
              </div>
              <h3 className="text-lg font-extrabold text-white">
                How was the resolution quality?
              </h3>
              <p className="text-xs text-slate-400">
                Ticket: <strong className="text-slate-300 font-mono">{issue.report_id}</strong>
              </p>
            </div>

            {/* 5-Star Rating Selector */}
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-amber-400 font-mono">
                {rating === 5 && '⭐⭐⭐⭐⭐ Exceptional & Fast'}
                {rating === 4 && '⭐⭐⭐⭐ Well Done'}
                {rating === 3 && '⭐⭐⭐ Satisfactory'}
                {rating <= 2 && 'Needs Improvement'}
              </span>
            </div>

            {/* Comment field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                Citizen Review & Observations
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Was the issue fixed completely? Any feedback on response time?"
                rows={3}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-xs text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
