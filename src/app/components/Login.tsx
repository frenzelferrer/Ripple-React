import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = onLogin(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] animate-[fadeIn_0.6s_ease-out]">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="inline-block relative">
            <h1 className="text-6xl mb-3 relative z-10" style={{ fontWeight: 800, fontVariationSettings: '"opsz" 144' }}>
              Pulse
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-3 bg-primary -z-10" />
          </div>
          <p className="text-muted-foreground mt-4">Connect, share, and discover</p>
        </div>

        <div className="bg-card border-4 border-border p-8 shadow-[8px_8px_0px_0px_rgba(43,37,32,1)] animate-[slideUp_0.5s_ease-out]">
          <h2 className="text-2xl mb-6" style={{ fontWeight: 600 }}>Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="border-2 border-border focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="border-2 border-border focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border-2 border-destructive px-4 py-3 text-destructive text-sm animate-[shake_0.3s_ease-in-out]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-border shadow-[4px_4px_0px_0px_rgba(43,37,32,1)] hover:shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-border">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-primary hover:underline font-medium"
              >
                Create one
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-accent/50 border-2 border-border">
            <p className="text-xs text-muted-foreground mb-2">Demo credentials:</p>
            <p className="text-xs font-mono">Username: <span className="font-semibold">demo</span></p>
            <p className="text-xs font-mono">Password: <span className="font-semibold">demo</span></p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
