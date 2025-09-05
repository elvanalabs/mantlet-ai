import { usePrivy } from '@privy-io/react-auth';
import { WalletAuth } from '@/components/WalletAuth';
import { ResearchInterface } from '@/components/ResearchInterface';

const Index = () => {
  const { authenticated } = usePrivy();

  if (!authenticated) {
    return <WalletAuth />;
  }

  return (
    <div className="h-screen flex flex-col">
      <WalletAuth />
      <main className="flex-1 flex flex-col">
        <ResearchInterface />
      </main>
    </div>
  );
};

export default Index;
