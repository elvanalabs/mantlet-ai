import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wallet, LogOut, User } from 'lucide-react';
export const WalletAuth = () => {
  const {
    login
  } = useLogin();
  const {
    logout
  } = useLogout();
  const {
    ready,
    authenticated,
    user
  } = usePrivy();
  if (!ready) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary rounded-full"></div>
        </div>
      </div>;
  }
  if (!authenticated) {
    return <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="glass p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <img src="/lovable-uploads/b8ec2af1-41ea-4718-ad31-c8f47484c004.png" alt="Web3 Research Agent" className="w-20 h-20 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-bold mb-2">Mantlet Research</h1>
            <p className="text-muted-foreground">
              Connect your Web3 wallet or signup using Mail ID
            </p>
          </div>
          <Button onClick={login} className="w-full bg-gradient-primary transition-all duration-300 glow-primary mb-3" size="lg">
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>
          <Button onClick={() => window.location.href = '/?demo=true'} variant="outline" className="w-full" size="lg">
            Try Demo Mode
          </Button>
        </Card>
      </div>;
  }
  return <div className="flex items-center justify-between px-2 sm:px-4 glass border-b h-16 overflow-visible">
      <div className="flex items-center space-x-3">
        <img src="/lovable-uploads/33de17b2-37de-44c9-994a-e297e6beede9.png" alt="Logo" className="w-24 h-24 object-contain" />
      </div>
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Wallet Address</p>
                <p className="text-sm text-muted-foreground break-all">
                  {user?.wallet?.address || 'Connected'}
                </p>
              </div>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm"
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>;
};