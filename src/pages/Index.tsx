import { usePrivy } from '@privy-io/react-auth';
import { WalletAuth } from '@/components/WalletAuth';
import { ResearchInterface } from '@/components/ResearchInterface';
import { CoinGeckoWidget } from '@/components/CoinGeckoWidget';

const Index = () => {
  const { authenticated } = usePrivy();

  if (!authenticated) {
    return <WalletAuth />;
  }

  return (
    <div className="h-screen flex flex-col max-w-full overflow-hidden">
      <CoinGeckoWidget />
      <WalletAuth />
      <main className="flex-1 flex flex-col min-h-0">
        <ResearchInterface />
      </main>
    </div>
  );
};

export default Index;
