import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGuidebook } from "@/hooks/useGuidebooks";
import { ArrowLeft, BookOpen, FileText, ExternalLink, Clock } from "lucide-react";

const GuidebookDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: guidebook, isLoading, error } = useGuidebook(slug!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !guidebook) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-4xl px-4 py-32 text-center">
          <h2 className="text-2xl font-bold mb-2">Guidebook Not Found</h2>
          <p className="text-muted-foreground mb-6">The guidebook you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/guidebooks')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Guidebooks
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const sortedArticles = [...(guidebook.articles || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 bg-background overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/guidebooks')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Guidebooks
          </button>

          {/* Two Column Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Title & Description */}
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="default" className="text-xs">
                  {guidebook.area}
                </Badge>
                {guidebook.featured && (
                  <Badge className="text-xs">Featured</Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {guidebook.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {guidebook.description}
              </p>
            </div>

            {/* Right: Info Panel */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-secondary dark:bg-secondary rounded-2xl p-8 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Guidebook</p>
                    <p className="text-xl font-bold text-foreground">{guidebook.area}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-foreground/10">
                  {guidebook.targetAudience && (
                    <div>
                      <p className="text-base font-semibold text-foreground mb-3">Who it's for</p>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {guidebook.targetAudience}
                      </p>
                    </div>
                  )}

                  {guidebook.purpose && (
                    <div>
                      <p className="text-base font-semibold text-foreground mb-3">Purpose</p>
                      <p className="text-base text-muted-foreground leading-relaxed">{guidebook.purpose}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-4">
                    {sortedArticles.length > 0 && (
                      <div>
                        <p className="text-2xl font-bold text-foreground">{sortedArticles.length}</p>
                        <p className="text-sm text-muted-foreground">Chapters</p>
                      </div>
                    )}
                    {guidebook.totalReadTime && guidebook.totalReadTime > 0 && (
                      <div>
                        <p className="text-2xl font-bold text-foreground">~{guidebook.totalReadTime}</p>
                        <p className="text-sm text-muted-foreground">Min Total</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Section */}
      {sortedArticles.length > 0 && (
        <section className="py-16 px-4 bg-muted">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-foreground mb-8">Chapters</h2>
            <div className="space-y-4">
              {sortedArticles.map((article, idx) => (
                <a
                  key={article.id}
                  href={article.externalUrl || article.url || `/publications#${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {(article.excerpt || article.description) && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {article.excerpt || article.description}
                          </p>
                        )}
                        {article.readTime && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {article.readTime} min read
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tags Section */}
      {guidebook.tags && guidebook.tags.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h3 className="text-xl font-semibold text-foreground mb-4">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {guidebook.tags.map((tagRelation) => (
                <Badge key={tagRelation.tag.id} variant="secondary">
                  {tagRelation.tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default GuidebookDetail;
