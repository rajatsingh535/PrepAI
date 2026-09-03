import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const emailValue = watch('email');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    // Simulate API call - in real production this would send reset email
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success('Password reset link sent!');
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        
        <h2 className="text-2xl font-display font-bold text-white mb-3">
          Check your email
        </h2>
        
        <p className="text-slate-400 mb-2">
          We've sent a password reset link to:
        </p>
        
        <p className="text-white font-medium mb-8">
          {emailValue}
        </p>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-300">
            Didn't receive the email? Check your spam folder or{' '}
            <button 
              onClick={() => setIsSubmitted(false)}
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              try again
            </button>
          </p>
        </div>
        
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link 
        to="/login"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      <h2 className="text-3xl font-display font-bold text-white mb-2">
        Forgot password?
      </h2>
      
      <p className="text-slate-400 mb-8">
        No worries! Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="form-label">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              placeholder="you@example.com"
              className="form-input pl-10"
              {...register('email', {
                required: 'Email is required',
                pattern: { 
                  value: /^\S+@\S+\.\S+$/, 
                  message: 'Please enter a valid email address' 
                }
              })}
            />
          </div>
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <p className="text-xs text-slate-400 mb-2">
          <strong className="text-slate-300">Demo Mode:</strong> In production, this would send an email with a secure reset link.
        </p>
        <p className="text-xs text-slate-500">
          For demo purposes, use: <span className="text-white font-mono">demo@prepai.com</span>
        </p>
      </div>
    </div>
  );
}
