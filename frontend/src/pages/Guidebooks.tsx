import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGuidebooks } from "@/hooks/useGuidebooks";
import { ChevronRight, ChevronDown, BookOpen, FileText, ExternalLink } from 'lucide-react';

const Guidebooks = () => {
  const { data, isLoading } = useGuidebooks({ published: 'true' });
  const allGuidebooks = data || [];

  // State for selected audience filter
  const [selectedAudience, setSelectedAudience] = useState<string>("");

  // Filter guidebooks by selected audience
  const guidebooks = selectedAudience
    ? allGuidebooks.filter(g => {
        if (!g.targetAudience) return false;
        // Split comma-separated audiences and check if any match
        const audiences = g.targetAudience.split(',').map(a => a.trim());
        return audiences.includes(selectedAudience);
      })
    : allGuidebooks;

  // Extract unique target audiences with counts from ALL guidebooks
  // Handle comma-separated audiences
  const audienceCounts = allGuidebooks.reduce((acc, guidebook) => {
    if (guidebook.targetAudience) {
      const audiences = guidebook.targetAudience.split(',').map(a => a.trim()).filter(Boolean);
      audiences.forEach(audience => {
        acc[audience] = (acc[audience] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const uniqueAudiences = Object.entries(audienceCounts)
    .map(([audience, count]) => ({ audience, count }))
    .sort((a, b) => b.count - a.count);

  // Group guidebooks by area
  const groupedByArea = guidebooks.reduce((acc, guidebook) => {
    const area = guidebook.area || 'Other';
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(guidebook);
    return acc;
  }, {} as Record<string, typeof guidebooks>);

  const areas = Object.keys(groupedByArea).sort();

  // State for tracking open sections and guidebooks
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openGuidebooks, setOpenGuidebooks] = useState<Record<string, boolean>>({});

  // Ensure all sections are expanded by default when areas load
  useEffect(() => {
    if (areas.length > 0) {
      setOpenSections(prev => {
        const updated = { ...prev };
        areas.forEach(area => {
          // Only set to true if not already defined (preserves user's manual toggles)
          if (updated[area] === undefined) {
            updated[area] = true;
          }
        });
        return updated;
      });
    }
  }, [areas.join(',')]); // Using join to avoid array reference issues

  const toggleSection = (area: string) => {
    setOpenSections(prev => ({ ...prev, [area]: !prev[area] }));
  };

  const toggleGuidebook = (id: string) => {
    setOpenGuidebooks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAudienceClick = (audience: string) => {
    setSelectedAudience(prev => prev === audience ? "" : audience);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4 bg-background overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Title & Subtitle */}
            <div className="pt-12 lg:pt-0">
              <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">Learning Resources</p>
              <h1 className="text-5xl lg:text-6xl font-light leading-tight text-foreground mb-8">
                Curated guidebooks
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Thematic collections of my articles and resources organized to provide comprehensive learning paths on key research and product development topics.
              </p>
            </div>

            {/* Right: Statistics Panel */}
            <div className="relative lg:relative flex justify-center lg:justify-end">
              <div className="bg-secondary dark:bg-secondary rounded-2xl p-8 md:p-10 max-w-sm w-full">
                <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-8">Overview</p>

                <div className="space-y-8">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">Guidebooks</p>
                    <p className="text-sm text-foreground/70 font-medium">
                      {guidebooks.length}
                    </p>
                  </div>

                  <div className="pt-6 border-t-2 border-foreground/20">
                    <p className="text-2xl md:text-3xl font-bold text-foreground mb-4">Target Audience</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueAudiences.length > 0 ? (
                        uniqueAudiences.map(({ audience, count }) => (
                          <Badge
                            key={audience}
                            variant="secondary"
                            className={`text-sm font-medium py-1 px-3 transition-colors cursor-pointer ${
                              selectedAudience === audience
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-foreground/10 hover:bg-foreground/20'
                            }`}
                            onClick={() => handleAudienceClick(audience)}
                          >
                            {audience} ({count})
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-foreground/70">No target audience defined</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guidebooks by Area */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : guidebooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedAudience
                  ? `No guidebooks found for "${selectedAudience}".`
                  : "No guidebooks available yet. Check back soon!"}
              </p>
              {selectedAudience && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedAudience("")}
                  className="mt-4"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-16">
              {areas.map((area) => (
                <Collapsible
                  key={area}
                  open={openSections[area]}
                  onOpenChange={() => toggleSection(area)}
                >
                  {/* Area Header - Clickable */}
                  <CollapsibleTrigger className="w-full">
                    <div className="border-b pb-4 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors group">
                      <div className="text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {area}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2">
                          {groupedByArea[area].length} {groupedByArea[area].length === 1 ? 'guidebook' : 'guidebooks'}
                        </p>
                      </div>
                      {openSections[area] ? (
                        <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </CollapsibleTrigger>

                  {/* Guidebooks in this area */}
                  <CollapsibleContent>
                    <div className="space-y-8 pt-8">
                      {groupedByArea[area].map((guidebook) => (
                        <Collapsible
                          key={guidebook.id}
                          open={openGuidebooks[guidebook.id]}
                          onOpenChange={() => toggleGuidebook(guidebook.id)}
                        >
                          <div className="border rounded-2xl p-8 md:p-10 hover:border-primary/50 hover:shadow-lg transition-all bg-card">
                            <CollapsibleTrigger className="w-full">
                              {/* Guidebook Header - Always visible */}
                              <div className="flex items-start gap-4 mb-6 cursor-pointer group/trigger">
                                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                                  <BookOpen className="w-6 h-6 text-foreground" />
                                </div>
                                <div className="flex-1 text-left">
                                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover/trigger:text-primary transition-colors">
                                    {guidebook.title}
                                  </h3>
                                  <p className="text-muted-foreground mb-4">
                                    {guidebook.description}
                                  </p>
                                  {guidebook.targetAudience && (
                                    <p className="text-sm text-muted-foreground mb-3">
                                      <strong>For:</strong> {guidebook.targetAudience}
                                    </p>
                                  )}
                                  {/* Stats - Always visible in collapsed view */}
                                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                                    {guidebook.articles && (
                                      <span>
                                        {guidebook.articles.length} {guidebook.articles.length === 1 ? 'chapter' : 'chapters'}
                                      </span>
                                    )}
                                    {guidebook.totalReadTime && guidebook.totalReadTime > 0 && (
                                      <span>
                                        ~{guidebook.totalReadTime} min total
                                      </span>
                                    )}
                                  </div>
                                  {/* View Details Link */}
                                  <Link
                                    to={`/guidebooks/${guidebook.slug}`}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View Full Guidebook
                                    <ExternalLink className="w-4 h-4" />
                                  </Link>
                                </div>
                                {openGuidebooks[guidebook.id] ? (
                                  <ChevronDown className="w-6 h-6 text-muted-foreground group-hover/trigger:text-primary transition-colors flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover/trigger:text-primary transition-colors flex-shrink-0" />
                                )}
                              </div>
                            </CollapsibleTrigger>

                            {/* Chapters (Articles) List - Only visible when expanded */}
                            <CollapsibleContent>
                              {guidebook.articles && guidebook.articles.length > 0 && (
                                <div className="space-y-3 pl-4 md:pl-16 pt-4 border-t border-border">
                                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                                    Chapters
                                  </h4>
                                  {guidebook.articles
                                    .sort((a, b) => a.order - b.order)
                                    .map((article, idx) => (
                                      <a
                                        key={article.id}
                                        href={`/publications#${article.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/20 transition-colors group/article border border-transparent hover:border-primary/20"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-start gap-3 flex-1">
                                          <span className="text-sm font-semibold text-primary/60 w-8 flex-shrink-0 mt-1">
                                            Ch {idx + 1}
                                          </span>
                                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-foreground font-medium group-hover/article:text-primary transition-colors mb-1">
                                              {article.title}
                                            </p>
                                            {article.excerpt && (
                                              <p className="text-sm text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                                                {article.excerpt}
                                              </p>
                                            )}
                                            {article.readTime && (
                                              <p className="text-xs text-muted-foreground">
                                                {article.readTime} min read
                                              </p>
                                            )}
                                          </div>
                                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover/article:text-primary flex-shrink-0 opacity-0 group-hover/article:opacity-100 transition-opacity mt-1" />
                                        </div>
                                      </a>
                                    ))}
                                </div>
                              )}
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Guidebooks;
