import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        if (result.needsOTP) {
          // Ir a página OTP
          navigate('/otp');
        } else if (result.needsPasswordReset) {
          navigate('/change-password');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
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
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E31837] to-[#FF3B30] rounded-xl flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">TaskHub</h1>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Iniciar sesión</h2>
          <p className="text-[#8E8E93] text-sm">Accede a tu espacio de trabajo</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@empresa.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#0F0F0F] border border-white/10 rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-[#0F0F0F] border border-white/10 rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-[#0F0F0F] text-[#E31837] focus:ring-2 focus:ring-[#E31837] cursor-pointer"
                />
                <span className="text-sm text-[#8E8E93]">Recordarme</span>
              </label>
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

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Demo Accounts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-[#8E8E93] mb-3">Cuentas Demo</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => fillDemoAccount('admin@taskhub.com', 'Admin123!')}
              className="px-3 py-1.5 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-white hover:border-[#E31837] hover:bg-[#E31837]/10 transition-all"
            >
              👨‍💼 Admin
            </button>
            <button
              onClick={() => fillDemoAccount('pm@taskhub.com', 'PM123!')}
              className="px-3 py-1.5 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-white hover:border-[#E31837] hover:bg-[#E31837]/10 transition-all"
            >
              👔 PM
            </button>
            <button
              onClick={() => fillDemoAccount('dev@taskhub.com', 'Dev123!')}
              className="px-3 py-1.5 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-white hover:border-[#E31837] hover:bg-[#E31837]/10 transition-all"
            >
              👩‍💻 Developer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
