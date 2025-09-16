import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, LogOut } from 'lucide-react';
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
  return <div className="glass border-b px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
            <Wallet className="w-3 h-3 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'Connected'}
            </p>
          </div>
        </div>
        <Button 
          onClick={logout} 
          variant="outline" 
          size="sm"
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-7 text-xs"
        >
          <LogOut className="w-3 h-3 mr-1" />
          Disconnect
        </Button>
      </div>
    </div>;
};