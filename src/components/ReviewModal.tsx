import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HandoverRecord } from '../types';
import { Star, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  handover: HandoverRecord;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ handover, onClose, onSuccess }) => {
  const { addReview, currentUser } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [commRating, setCommRating] = useState<number>(5);
  const [condRating, setCondRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setFeedback({ type: 'error', message: 'Please share a brief note about the coordination experience.' });
      return;
    }

    const res = addReview({
      equipmentId: handover.equipmentId,
      transactionId: handover.id,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerRole: currentUser.role,
      rating,
      communicationRating: commRating,
      conditionRating: condRating,
      comment: comment.trim(),
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-display font-semibold text-slate-900 text-base">
              Feedback & Handover Experience
            </h3>
            <p className="text-xs text-slate-500">{handover.equipmentName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Overall Experience Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Communication
              </label>
              <select
                value={commRating}
                onChange={(e) => setCommRating(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Unresponsive</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Equipment Condition
              </label>
              <select
                value={condRating}
                onChange={(e) => setCondRating(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
              >
                <option value={5}>5 - As described & clean</option>
                <option value={4}>4 - Minor wear</option>
                <option value={3}>3 - Needed extra cleaning</option>
                <option value={2}>2 - Loose parts</option>
                <option value={1}>1 - Defective</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Feedback (No private medical details)
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Prompt handover, wheelchair was thoroughly sanitized..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
