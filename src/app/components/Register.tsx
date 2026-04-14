import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import type { User } from '../types';

interface RegisterProps {
  onRegister: (userData: Omit<User, 'id' | 'created_at'>) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    bio: '',
    profile_image: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password || !formData.full_name) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    onRegister({
      username: formData.username,
      password: formData.password,
      full_name: formData.full_name,
      bio: formData.bio,
      profile_image: formData.profile_image || undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] animate-[fadeIn_0.6s_ease-out]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-block relative">
            <h1 className="text-5xl mb-3 relative z-10" style={{ fontWeight: 800, fontVariationSettings: '"opsz" 144' }}>
              Join Pulse
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-3 bg-secondary -z-10" />
          </div>
        </div>

        <div className="bg-card border-4 border-border p-8 shadow-[8px_8px_0px_0px_rgba(43,37,32,1)] animate-[slideUp_0.5s_ease-out]">
          <h2 className="text-2xl mb-6" style={{ fontWeight: 600 }}>Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">Full Name *</label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
                className="border-2 border-border focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Username *</label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Choose a username"
                className="border-2 border-border focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Password *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 4 characters"
                className="border-2 border-border focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Confirm Password *</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                className="border-2 border-border focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                rows={3}
                className="border-2 border-border focus:border-primary focus:ring-0 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Profile Image URL</label>
              <Input
                type="text"
                value={formData.profile_image}
                onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                placeholder="https://example.com/image.jpg"
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
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground border-2 border-border shadow-[4px_4px_0px_0px_rgba(43,37,32,1)] hover:shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-border">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
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
