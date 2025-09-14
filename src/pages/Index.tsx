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
    <div className="h-screen flex flex-col">
      <div className="w-full bg-background border-b">
        <iframe 
          src="data:text/html,<!DOCTYPE html><html><head><script src='https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js'></script></head><body style='margin:0;padding:0;background:transparent;'><gecko-coin-price-marquee-widget locale='en' dark-mode='true' outlined='true' coin-ids='tether,usd-coin,dai,tether-gold,pax-gold,paypal-usd,blackrock-usd-institutional-digital-liquidity-fund,usd1-wlfi,true-usd,paxos-standard,cnh-tether,tether-eurt,mexican-peso-tether,binance-peg-busd,gemini-dollar,ripple-usd,cap-usd,brz,xsgd,straitsx-indonesia-rupiah,zarp-stablecoin,novatti-australian-digital-dollar' initial-currency='usd'></gecko-coin-price-marquee-widget></body></html>"
          className="w-full h-16 border-0"
          style={{ background: 'transparent' }}
        />
      </div>
      <WalletAuth />
      <main className="flex-1 flex flex-col">
        <ResearchInterface />
      </main>
    </div>
  );
};

export default Index;
