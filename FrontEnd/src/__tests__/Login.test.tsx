import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { Login } from '../app/pages/Login';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const mockLogin = vi.fn();
vi.mock('../app/contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// motion/react animations → render children directly
// Cache component factories so React sees the same reference across re-renders
// and doesn't unmount/remount subtrees (which would reset state).
vi.mock('motion/react', () => {
  const cache: Record<string, React.FC> = {};
  return {
    motion: new Proxy({}, {
      get: (_target, tag: string) => {
        if (!cache[tag]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cache[tag] = ({ children, ...props }: any) => {
            const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props;
            const Tag = tag as keyof JSX.IntrinsicElements;
            return <Tag {...rest}>{children}</Tag>;
          };
        }
        return cache[tag];
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('../app/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button {...props}>{children}</button>
  ),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renderiza los campos email y contraseña', () => {
    render(<Login />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  test('renderiza el botón de iniciar sesión', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('redirige a /dashboard en login exitoso', async () => {
    mockLogin.mockResolvedValue({ success: true, requiresOtp: false });
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'admin@taskhub.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Admin123!');
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form')!);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  test('redirige a /otp cuando requiresOtp es true', async () => {
    mockLogin.mockResolvedValue({ success: true, requiresOtp: true, otpToken: 'tok' });
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'user@taskhub.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Pass123!');
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form')!);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/otp'));
  });

  test('muestra error cuando las credenciales son inválidas', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Credenciales inválidas' });
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'x@x.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'wrong');
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form')!);

    await waitFor(() => expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument());
  });

  test('muestra "Error de conexión" cuando login lanza excepción', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'x@x.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass');
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form')!);

    await waitFor(() => expect(screen.getByText('Error de conexión')).toBeInTheDocument());
  });

  test('el botón demo Admin rellena el formulario', async () => {
    render(<Login />);
    await userEvent.click(screen.getByRole('button', { name: /admin/i }));

    expect(screen.getByLabelText<HTMLInputElement>(/correo electrónico/i).value)
      .toBe('admin@taskhub.com');
    expect(screen.getByLabelText<HTMLInputElement>(/contraseña/i).value)
      .toBe('Admin123!');
  });

  test('toggle muestra/oculta la contraseña', () => {
    const { container } = render(<Login />);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // El botón toggle es el hermano siguiente del input#password
    const toggleBtn = container.querySelector('input#password ~ button[type="button"]') as HTMLButtonElement;
    expect(toggleBtn).not.toBeNull();

    act(() => { fireEvent.click(toggleBtn); });
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('type', 'text');

    act(() => { fireEvent.click(toggleBtn); });
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('type', 'password');
  });
});
