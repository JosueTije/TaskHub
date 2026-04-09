import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, AlertCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

export function OTP() {
  const navigate = useNavigate();
  const { user, verifyOTP, pendingOTPVerification } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Si no hay verificación pendiente, redirigir al login
    if (!pendingOTPVerification) {
      navigate('/login');
      return;
    }
    
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, [pendingOTPVerification, navigate]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    
    // Focus last filled input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Por favor ingresa el código completo');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await verifyOTP(otpCode);
      
      if (result.success) {
        // OTP verificado, ir al dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'Código incorrecto. Intenta de nuevo.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    
    try {
      // Simular reenvío de código
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Aquí tu backend reenviaría el código por email
      
      // Mostrar mensaje de éxito temporal
      const successDiv = document.getElementById('resend-success');
      if (successDiv) {
        successDiv.classList.remove('hidden');
        setTimeout(() => {
          successDiv.classList.add('hidden');
        }, 3000);
      }
    } catch (err) {
      setError('Error al reenviar código. Intenta de nuevo.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E31837]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0A0638]/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm">Volver al login</span>
        </motion.button>

        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#E31837] to-[#FF3B30] rounded-2xl mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Verificación de seguridad</h2>
          <p className="text-[#8E8E93] text-sm">
            Ingresa el código de 6 dígitos que enviamos a
          </p>
          <p className="text-white text-sm font-medium mt-1">
            {user?.email || 'tu correo electrónico'}
          </p>
        </motion.div>

        {/* OTP Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-4 text-center">
                Código de verificación
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-semibold bg-[#0F0F0F] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 bg-[#E31837]/10 border border-[#E31837]/20 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-[#E31837] flex-shrink-0" />
                  <p className="text-sm text-[#E31837]">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message (hidden by default) */}
            <div
              id="resend-success"
              className="hidden flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl"
            >
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-green-400">Código reenviado correctamente</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Verificar código</span>
                </>
              )}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#8E8E93] mb-2">¿No recibiste el código?</p>
            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm text-[#E31837] hover:text-[#FF3B30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reenviando...</span>
                </>
              ) : (
                <span>Reenviar código</span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Helper Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-[#8E8E93]">
            <strong>Demo:</strong> Ingresa cualquier código de 6 dígitos para continuar
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
