import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface AuthDialogProps {
  isOpen: boolean;
  openSignUp: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthDialog({ isOpen, openSignUp, onClose, onSuccess }: AuthDialogProps) {

  const [isSignUp, setIsSignUp] = React.useState(openSignUp);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [verificationSent, setVerificationSent] = React.useState(false);
  const { signUp, signIn } = useAuth();

  React.useEffect(() => {
    setIsSignUp(openSignUp);
  }, [openSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
        setVerificationSent(true);
      } else {
        await signIn(email, password);
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (verificationSent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
            <DialogDescription>
              We've sent a verification email to {email}. Please check your inbox and click the verification link.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSignUp ? 'Create an account' : 'Sign in'}</DialogTitle>
          <DialogDescription>
            {isSignUp 
              ? 'Create an account to save your business model canvas'
              : ''}
          </DialogDescription>
        </DialogHeader>
        {isSignUp ?
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4" 
          method="post"
          autoComplete="on"
          name="signup"
        >
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            id="email"
            name="email"
            autoComplete="username"
          />

          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              aria-label="Create password"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex flex-col gap-2">
            <Button type="submit">
              {isSignUp ? 'Sign up' : 'Sign in'}
            </Button>
            <Button 
              type="button" 
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {"Already have an account? Sign in"}
            </Button>
          </div>
        </form>
        :
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4" 
          method="post"
          autoComplete="on"
          name={isSignUp ? "signup" : "login"}
        >
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            id="email"
            name="email"
            autoComplete="username"
          />

          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="password"
              name="password"
              autoComplete="current-password"
              aria-label="Enter password"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex flex-col gap-2">
            <Button type="submit">
              {"Sign in"}
            </Button>
            <Button 
              type="button" 
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {"Don't have an account? Sign up"}
            </Button>
          </div>
        </form>
        }
      </DialogContent>
    </Dialog>
  );
} 