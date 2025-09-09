-- Create knowledge_base table to store website content
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[],
  source_type TEXT DEFAULT 'website',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policy for reading knowledge base (public access for research)
CREATE POLICY "Knowledge base is publicly readable" 
ON public.knowledge_base 
FOR SELECT 
USING (is_active = true);

-- Create policy for admin users to manage knowledge base
CREATE POLICY "Admins can manage knowledge base" 
ON public.knowledge_base 
FOR ALL 
USING (public.is_admin());

-- Create index for better search performance
CREATE INDEX idx_knowledge_base_content ON public.knowledge_base USING gin(to_tsvector('english', content));
CREATE INDEX idx_knowledge_base_tags ON public.knowledge_base USING gin(tags);
CREATE INDEX idx_knowledge_base_url ON public.knowledge_base (url);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();