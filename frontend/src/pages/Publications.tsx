import { useState } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePublications } from "@/hooks/usePublications";
import { ExternalLink, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Publications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const { data, isLoading } = usePublications({
    ...(searchQuery && { search: searchQuery }),
    published: 'true'
  });

  const allPublications = data || [];

  // Filter by selected topic client-side
  const publications = selectedTopic
    ? allPublications.filter(p => p.tags?.some(t => t.tag.id === selectedTopic))
    : allPublications;

  // Extract unique topics/tags from ALL publications (not filtered) with counts
  const allTags = allPublications.flatMap(p => p.tags || []);
  const tagCounts = allTags.reduce((acc, { tag }) => {
    acc[tag.id] = (acc[tag.id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueTags = Array.from(
    new Map(allTags.map(t => [t.tag.id, t.tag])).values()
  ).map(tag => ({
    ...tag,
    count: tagCounts[tag.id] || 0
  })).sort((a, b) => b.count - a.count); // Sort by count descending

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTopic("");
  };

  const handleTopicClick = (topicId: string) => {
    setSelectedTopic(prev => prev === topicId ? "" : topicId);
  };

  // Group publications by month/year
  const groupedPublications = publications.reduce((acc, pub) => {
    const date = new Date(pub.publishedAt || pub.createdAt);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(pub);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedMonths = Object.keys(groupedPublications).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4 bg-background overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Title & Subtitle */}
            <div className="pt-12 lg:pt-0">
              <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">Published Work</p>
              <h1 className="text-5xl lg:text-6xl font-light leading-tight text-foreground mb-8">
                Articles and insights
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                My thoughts on user research, design, and product strategy published across multiple platforms.
              </p>
            </div>

            {/* Right: Statistics Panel */}
            <div className="relative lg:relative flex justify-center lg:justify-end">
              <div className="bg-secondary dark:bg-secondary rounded-2xl p-8 md:p-10 max-w-sm w-full">
                <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-8">Overview</p>

                <div className="space-y-8">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">Total Articles</p>
                    <p className="text-sm text-foreground/70 font-medium">
                      {publications.length}
                    </p>
                  </div>

                  <div className="pt-6 border-t-2 border-foreground/20">
                    <p className="text-2xl md:text-3xl font-bold text-foreground mb-4">Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueTags.length > 0 ? (
                        uniqueTags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className={`text-sm font-medium py-1 px-3 transition-colors cursor-pointer ${
                              selectedTopic === tag.id
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-foreground/10 hover:bg-foreground/20'
                            }`}
                            onClick={() => handleTopicClick(tag.id)}
                          >
                            {tag.name} ({tag.count})
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-foreground/70">No topics yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-4 border-b">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background text-foreground"
            >
              <option value="">All Topics</option>
              {uniqueTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name} ({tag.count})
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(searchQuery || selectedTopic) && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : publications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || platform
                  ? "No articles found matching your filters."
                  : "No articles available yet."}
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border"></div>

              {/* Timeline items */}
              <div className="space-y-12">
                {sortedMonths.map((monthYear) => (
                  <div key={monthYear}>
                    {/* Month header with dot */}
                    <div className="relative mb-8 flex items-center">
                      <div className="absolute left-[-1px] w-6 h-6 bg-background border-2 border-border rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-8">
                        {monthYear}
                      </p>
                    </div>

                    {/* Articles in this month */}
                    <div className="space-y-6 ml-8">
                      {groupedPublications[monthYear].map((pub, pubIdx) => {
                        const isLast = pubIdx === groupedPublications[monthYear].length - 1;
                        return (
                          <a
                            key={pub.id}
                            href={pub.externalUrl || pub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                          >
                            <div className={`relative ${!isLast ? 'pb-8 border-b border-border' : ''}`}>
                              {/* Small dot for article */}
                              <div className="absolute -left-[27px] top-2 w-3 h-3 bg-secondary rounded-full border-2 border-background"></div>

                              {/* Content Card */}
                              <div className="group">
                                {/* Meta info: Date and Platform */}
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(pub.publishedAt || pub.createdAt).toLocaleDateString('default', {
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  {pub.platform && (
                                    <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                                      {pub.platform}
                                    </Badge>
                                  )}
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 flex items-start gap-2">
                                  {pub.title}
                                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5" />
                                </h3>

                                {/* Excerpt */}
                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                  {pub.excerpt || pub.description}
                                </p>

                                {/* Read time */}
                                {pub.readTime && (
                                  <span className="text-xs text-muted-foreground">
                                    {pub.readTime} min read
                                  </span>
                                )}
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Publications;
