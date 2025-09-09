import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Database, Loader2, RefreshCw } from 'lucide-react';
import { ResearchService } from '@/services/ResearchService';

export const KnowledgeBaseManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePopulateKnowledgeBase = async () => {
    setIsLoading(true);
    try {
      await ResearchService.populateKnowledgeBase();
      toast({
        title: "Success",
        description: "Knowledge base populated successfully with stablecoin resources!",
      });
    } catch (error) {
      console.error('Error populating knowledge base:', error);
      toast({
        title: "Error",
        description: "Failed to populate knowledge base. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 glass">
      <div className="flex items-center space-x-3 mb-4">
        <Database className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Knowledge Base</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Populate Mantlet's knowledge base with the latest stablecoin research, news, and resources to enhance AI responses.
      </p>
      
      <Button 
        onClick={handlePopulateKnowledgeBase}
        disabled={isLoading}
        className="w-full"
        variant="outline"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Populating Knowledge Base...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Update Knowledge Base
          </>
        )}
      </Button>
      
      <div className="mt-3 text-xs text-muted-foreground">
        Sources include: Financial Times, CoinDesk, Cointelegraph, Ripple, academic papers, and government resources.
      </div>
    </Card>
  );
};