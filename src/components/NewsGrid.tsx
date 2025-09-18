import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Globe } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
  thumbnail?: string;
  position: number;
}

interface NewsGridProps {
  newsResults: NewsItem[];
}

const NewsGrid: React.FC<NewsGridProps> = ({ newsResults }) => {
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).split(' ').slice(0, -1).join(' ') + '...';
  };

  return (
    <div className="w-full mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Latest Stablecoin News</h3>
        <Badge variant="secondary" className="text-xs">
          {newsResults.length} articles
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newsResults.map((news, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/20 glass"
          >
            {news.thumbnail ? (
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={news.thumbnail} 
                  alt={news.title}
                  className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
            ) : null}
            
            <div 
              className="relative overflow-hidden rounded-t-lg h-40 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center"
              style={{ display: news.thumbnail ? 'none' : 'flex' }}
            >
              <div className="text-center p-4">
                <Globe className="w-8 h-8 mx-auto mb-2 text-primary/60" />
                <p className="text-sm font-medium text-foreground/80">{news.source}</p>
                <p className="text-xs text-muted-foreground">News Article</p>
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(news.date)}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {news.source}
                </Badge>
              </div>
              <CardTitle className="text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {truncateText(news.title, 80)}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                {truncateText(news.snippet, 120)}
              </p>
              
              <a
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Read more
                <ExternalLink className="w-3 h-3" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {newsResults.length === 0 && (
        <Card className="glass border-dashed">
          <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent news found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewsGrid;