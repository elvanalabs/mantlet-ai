import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ExternalLink, Key, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PrivySetupProps {
  onAppIdSet: (appId: string) => void;
  onDemoMode: () => void;
}

export const PrivySetup = ({ onAppIdSet, onDemoMode }: PrivySetupProps) => {
  const [appId, setAppId] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.trim()) {
      toast({
        title: "Invalid App ID",
        description: "Please enter a valid Privy app ID",
        variant: "destructive",
      });
      return;
    }
    
    if (!appId.startsWith('clp') || appId.length < 20) {
      toast({
        title: "Invalid Format",
        description: "Privy app IDs typically start with 'clp' and are longer",
        variant: "destructive",
      });
      return;
    }

    onAppIdSet(appId.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="glass p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <Key className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Setup Required</h1>
          <p className="text-muted-foreground">
            Configure your Privy app ID to enable wallet authentication
          </p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need a Privy app ID to enable wallet authentication. Get one for free at{' '}
            <a 
              href="https://dashboard.privy.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center"
            >
              dashboard.privy.io
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="appId" className="block text-sm font-medium mb-2">
              Privy App ID
            </label>
            <Input
              id="appId"
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="clp_xxxxxxxxxxxxxxxxxxxxxx"
              className="font-mono text-sm"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90 glow-primary"
          >
            Initialize Wallet Authentication
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Or try the demo without wallet authentication
          </p>
          <Button 
            onClick={onDemoMode}
            variant="outline" 
            className="w-full"
          >
            Continue in Demo Mode
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold mb-2 text-sm">How to get a Privy App ID:</h3>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>1. Visit dashboard.privy.io and sign up</li>
            <li>2. Create a new app</li>
            <li>3. Copy your App ID from the settings</li>
            <li>4. Paste it above to enable wallet features</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};