import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
export function OTP() {
  const navigate = useNavigate();
  const {
    verifyOTP,
    pendingEmail,
    isAuthenticated
  } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    const otpToken = localStorage.getItem("taskhub_otp_token");
    const savedPendingEmail = localStorage.getItem("taskhub_pending_email");
    if (!otpToken || !savedPendingEmail) {
      navigate('/login', {
        replace: true
      });
    }
  }, [navigate]);
  useEffect(() => {
    if (verificationSuccess && isAuthenticated) {
      navigate('/dashboard', {
        replace: true
      });
    }
  }, [verificationSuccess, isAuthenticated, navigate]);
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);
  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
    setError('');
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };
  const handleSubmit = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    console.log("OTP TOKEN USADO:", localStorage.getItem("taskhub_otp_token"));
    if (code.length !== 6) {
      setError('Por favor ingresa los 6 dígitos del código');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
const result = await verifyOTP(code);

if (result.success) {
  // 🔥 GUARDAR TOKEN
  localStorage.setItem("setupPasswordToken", result.setupPasswordToken);

  navigate('/change-password');
} else {
  setError(result.error || 'Código incorrecto. Intenta de nuevo.');
  setOtp(['', '', '', '', '', '']);
  inputRefs.current[0]?.focus();
}
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };
  const maskEmail = (email: string) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + '***' + username.substring(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };
  return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E31837]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0A0638]/20 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }} className="w-full max-w-md relative z-10">
        {}
        <motion.button onClick={() => navigate('/login')} className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors mb-6" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.1
      }}>
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Volver al inicio</span>
        </motion.button>

        {}
        <motion.div className="text-center mb-8" initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: 0.2
      }}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E31837] to-[#FF3B30] rounded-xl flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">TaskHub</h1>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Verificación de seguridad</h2>
          <p className="text-[#8E8E93] text-sm">
            Ingresa el código de 6 dígitos enviado a<br />
            <span className="text-white font-medium">{maskEmail(pendingEmail || '')}</span>
          </p>
        </motion.div>

        {}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          {}
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => <input key={index} ref={el => inputRefs.current[index] = el} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleChange(index, e.target.value)} onKeyDown={e => handleKeyDown(index, e)} onPaste={index === 0 ? handlePaste : undefined} disabled={isLoading} className="w-12 h-14 bg-[#0F0F0F] border border-white/10 rounded-xl text-white text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all disabled:opacity-50" />)}
          </div>

          {}
          <AnimatePresence>
            {error && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} className="flex items-center gap-2 p-3 bg-[#E31837]/10 border border-[#E31837]/20 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 text-[#E31837] flex-shrink-0" />
                <p className="text-sm text-[#E31837]">{error}</p>
              </motion.div>}
          </AnimatePresence>

          {}
          <Button onClick={() => handleSubmit()} variant="primary" disabled={isLoading || otp.some(digit => digit === '')} className="w-full mb-4">
            {isLoading ? <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verificando...</span>
              </> : <span>Verificar código</span>}
          </Button>

          {}
          <div className="text-center">
            <button disabled={resendTimer > 0 || isResending} className="text-sm text-[#8E8E93] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isResending ? 'Reenviando código...' : resendTimer > 0 ? `Reenviar código en ${resendTimer}s` : '¿No recibiste el código? Reenviar'}
            </button>
          </div>
        </motion.div>

        {}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.5
      }} className="mt-6 text-center">
          <p className="text-xs text-[#8E8E93]">
            Este código es válido por 10 minutos
          </p>
        </motion.div>
      </motion.div>
    </div>;
}