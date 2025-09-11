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
              Connect your wallet to access AI-powered Web3 research tools
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
  return <div className="flex items-center justify-between py-1 px-4 glass border-b">
      <div className="flex items-center space-x-3">
        <img src="/lovable-uploads/33de17b2-37de-44c9-994a-e297e6beede9.png" alt="Logo" className="w-24 h-24 object-contain" />
        <div>
          <p className="text-sm font-medium">
            {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'Connected'}
          </p>
        </div>
      </div>
      <Button onClick={logout} variant="outline" size="sm">
        <LogOut className="w-4 h-4 mr-1" />
        Disconnect
      </Button>
    </div>;
};