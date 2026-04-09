import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, Loader2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
export function ForgotPassword() {
  const navigate = useNavigate();
  const {
    resetPassword
  } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Error al enviar el enlace');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  if (success) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
        {}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E31837]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0A0638]/20 rounded-full blur-3xl" />
        </div>

        <motion.div initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.5
      }} className="w-full max-w-md relative z-10 text-center">
          <motion.div initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} transition={{
          delay: 0.2,
          type: 'spring',
          stiffness: 200
        }} className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>

          <h2 className="text-2xl font-semibold text-white mb-3">¡Correo enviado!</h2>
          <p className="text-[#8E8E93] mb-8">
            Hemos enviado un enlace de recuperación a <span className="text-white font-medium">{email}</span>. 
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </p>

          <Button variant="primary" onClick={() => navigate('/login')} className="w-full">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio de sesión</span>
          </Button>
        </motion.div>
      </div>;
  }
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
              <Send className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Recuperar contraseña</h2>
          <p className="text-[#8E8E93] text-sm">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@empresa.com" className="w-full pl-10 pr-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all" required />
              </div>
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
            }} className="flex items-center gap-2 p-3 bg-[#E31837]/10 border border-[#E31837]/20 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-[#E31837] flex-shrink-0" />
                  <p className="text-sm text-[#E31837]">{error}</p>
                </motion.div>}
            </AnimatePresence>

            {}
            <div className="space-y-3">
              <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
                {isLoading ? <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </> : <>
                    <Send className="w-5 h-5" />
                    <span>Enviar enlace de recuperación</span>
                  </>}
              </Button>

              <Button type="button" variant="secondary" onClick={() => navigate('/login')} className="w-full">
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al inicio de sesión</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>;
}