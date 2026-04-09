import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
export function ChangePassword() {
  const navigate = useNavigate();
  const {
    changePassword,
    logout
  } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false
  });
  const validatePassword = (password: string) => {
    setValidations({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };
  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    validatePassword(value);
    setError('');
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!Object.values(validations).every(v => v)) {
      setError('La contraseña no cumple con todos los requisitos');
      return;
    }
    setIsLoading(true);
    try {
      const result = await changePassword(newPassword);
      if (result.success) {
        localStorage.removeItem("setupPasswordToken");
        localStorage.removeItem("otpToken");
        alert("Contraseña actualizada correctamente. Inicia sesión.");
        navigate('/login');
      } else {
        setError(result.error || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancel = () => {
    logout();
    navigate('/login');
  };
  const allValid = Object.values(validations).every(v => v) && newPassword === confirmPassword && confirmPassword.length > 0;
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
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Cambia tu contraseña</h2>
        <p className="text-[#8E8E93] text-sm">
  Crea una nueva contraseña para activar tu cuenta
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
              <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <input id="newPassword" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => handlePasswordChange(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 bg-[#0F0F0F] border border-white/10 rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all" required />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white transition-colors">
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 bg-[#0F0F0F] border border-white/10 rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#8E8E93]">Requisitos de contraseña:</p>
              <div className="space-y-1.5">
                {[{
                key: 'minLength',
                label: 'Mínimo 8 caracteres',
                valid: validations.minLength
              }, {
                key: 'hasUppercase',
                label: 'Al menos 1 letra mayúscula',
                valid: validations.hasUppercase
              }, {
                key: 'hasNumber',
                label: 'Al menos 1 número',
                valid: validations.hasNumber
              }, {
                key: 'hasSymbol',
                label: 'Al menos 1 símbolo',
                valid: validations.hasSymbol
              }].map(({
                key,
                label,
                valid
              }) => <div key={key} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${valid ? 'bg-green-500/20' : 'bg-[#0F0F0F]'}`}>
                      {valid && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    </div>
                    <span className={`text-xs ${valid ? 'text-green-500' : 'text-[#8E8E93]'}`}>
                      {label}
                    </span>
                  </div>)}
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
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
                <ArrowLeft className="w-5 h-5" />
                <span>Cancelar</span>
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading || !allValid} className="flex-1">
                {isLoading ? <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Cambiando...</span>
                  </> : <span>Cambiar contraseña</span>}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>;
}