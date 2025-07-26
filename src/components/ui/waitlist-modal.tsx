import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

export default function WaitlistModal({ isOpen, onClose, planName }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ 
          email: email.trim(),
          plan: planName 
        }]);

      if (error) {
        if (error.code === '23505') {
          setError('This email is already on the waitlist!');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setIsSubmitted(true);
        setEmail('');
        setTimeout(() => {
          onClose();
          setIsSubmitted(false);
        }, 2000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setEmail('');
    setError('');
    setIsSubmitted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="text-center">
          {!isSubmitted ? (
            <>
              {/* Icon */}
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={24} className="text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Join the Waitlist
              </h2>
              <p className="text-gray-600 mb-2">
                Get early access to the <span className="font-semibold">{planName}</span> plan
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Be the first to turn your side project into revenue
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none text-center transition-colors"
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Join Waitlist</span>
                      <Sparkles size={16} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4">
                We'll notify you when {planName} is available
              </p>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're In! 🎉
              </h2>
              <p className="text-gray-600">
                We'll email you when the <span className="font-semibold">{planName}</span> plan is ready
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}