import { useState } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGuidebooks } from "@/hooks/useGuidebooks";
import { ChevronRight, BookOpen, FileText, ExternalLink } from 'lucide-react';

const Guidebooks = () => {
  const { data, isLoading } = useGuidebooks({ published: 'true' });
  const guidebooks = data || [];

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
                Thematic collections of articles and resources organized to provide comprehensive learning paths on key research topics.
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
                    <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">Total Articles</p>
                    <p className="text-sm text-foreground/70 font-medium">
                      {guidebooks.reduce((sum, g) => sum + (g.articles?.length || 0), 0)}
                    </p>
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
                No guidebooks available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {areas.map((area) => (
                <div key={area} className="space-y-8">
                  {/* Area Header */}
                  <div className="border-b pb-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                      {area}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      {groupedByArea[area].length} {groupedByArea[area].length === 1 ? 'guidebook' : 'guidebooks'}
                    </p>
                  </div>

                  {/* Guidebooks in this area */}
                  <div className="space-y-8">
                    {groupedByArea[area].map((guidebook) => (
                      <div
                        key={guidebook.id}
                        className="group border rounded-2xl p-8 md:p-10 hover:border-primary/50 hover:shadow-lg transition-all bg-card"
                      >
                        {/* Guidebook Header */}
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-6 h-6 text-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {guidebook.title}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {guidebook.description}
                            </p>
                            {guidebook.targetAudience && (
                              <p className="text-sm text-muted-foreground">
                                <strong>For:</strong> {guidebook.targetAudience}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Chapters (Articles) List */}
                        {guidebook.articles && guidebook.articles.length > 0 && (
                          <div className="space-y-3 mb-6 pl-4 md:pl-16">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                              Chapters
                            </h4>
                            {guidebook.articles
                              .sort((a, b) => a.order - b.order)
                              .map((article, idx) => (
                                <a
                                  key={article.id}
                                  href={`/publications#${article.slug}`}
                                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/20 transition-colors group/article border border-transparent hover:border-primary/20"
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

                        {/* Stats Footer */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-6 border-t border-border">
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
                      </div>
                    ))}
                  </div>
                </div>
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
