import { useEffect } from 'react';

// Declare the custom element type
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gecko-coin-price-marquee-widget': {
        locale?: string;
        'dark-mode'?: string;
        outlined?: string;
        'coin-ids'?: string;
        'initial-currency'?: string;
      };
    }
  }
}

export const CoinGeckoWidget = () => {
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="gecko-coin-price-marquee-widget"]')) {
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js';
    script.async = true;
    
    // Append script to document head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Only remove if we added it
      const existingScript = document.querySelector('script[src*="gecko-coin-price-marquee-widget"]');
      if (existingScript && existingScript === script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <gecko-coin-price-marquee-widget
        locale="en"
        dark-mode="true"
        outlined="true"
        coin-ids="tether,usd-coin,dai,tether-gold,pax-gold,paypal-usd,blackrock-usd-institutional-digital-liquidity-fund,usd1-wlfi,true-usd,paxos-standard,cnh-tether,tether-eurt,mexican-peso-tether,binance-peg-busd,gemini-dollar,ripple-usd,cap-usd,brz,xsgd,straitsx-indonesia-rupiah,zarp-stablecoin,novatti-australian-digital-dollar"
        initial-currency="usd"
      />
    </div>
  );
};