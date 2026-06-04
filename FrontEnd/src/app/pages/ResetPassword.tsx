import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#E31837] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Enlace inválido</h2>
          <p className="text-[#8E8E93] mb-6">Este enlace de recuperación no es válido.</p>
          <button onClick={() => navigate('/login')} className="text-[#E31837] text-sm hover:underline">
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  const validate = (pwd: string) => {
    setValidations({
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    validate(value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!Object.values(validations).every(Boolean)) {
      setError('La contraseña no cumple con todos los requisitos');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error al restablecer contraseña');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const allValid = Object.values(validations).every(Boolean) && newPassword === confirmPassword && confirmPassword.length > 0;

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E31837]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0A0638]/20 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-white mb-3">¡Contraseña actualizada!</h2>
          <p className="text-[#8E8E93] mb-8">Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.</p>
          <Button variant="primary" onClick={() => navigate('/login')} className="w-full">
            <ArrowLeft className="w-5 h-5" />
            <span>Ir al inicio de sesión</span>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E31837]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0A0638]/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E31837] to-[#FF3B30] rounded-xl flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Nueva contraseña</h2>
          <p className="text-[#8E8E93] text-sm">Elige una contraseña segura para tu cuenta</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nueva contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-[#0F0F0F] border border-white/10 rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all"
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white transition-colors">
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-[#0F0F0F] border border-white/10 rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white transition-colors">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-[#8E8E93]">Requisitos:</p>
              <div className="space-y-1.5">
                {[
                  { key: 'minLength', label: 'Mínimo 8 caracteres', valid: validations.minLength },
                  { key: 'hasUppercase', label: 'Al menos 1 letra mayúscula', valid: validations.hasUppercase },
                  { key: 'hasNumber', label: 'Al menos 1 número', valid: validations.hasNumber },
                  { key: 'hasSymbol', label: 'Al menos 1 símbolo', valid: validations.hasSymbol },
                ].map(({ key, label, valid }) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${valid ? 'bg-green-500/20' : 'bg-[#0F0F0F]'}`}>
                      {valid && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    </div>
                    <span className={`text-xs ${valid ? 'text-green-500' : 'text-[#8E8E93]'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 bg-[#E31837]/10 border border-[#E31837]/20 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-[#E31837] flex-shrink-0" />
                  <p className="text-sm text-[#E31837]">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/login')} className="flex-1">
                <ArrowLeft className="w-5 h-5" />
                <span>Cancelar</span>
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading || !allValid} className="flex-1">
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>Guardando...</span></>
                ) : (
                  <span>Guardar contraseña</span>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
