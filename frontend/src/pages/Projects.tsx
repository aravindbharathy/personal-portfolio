import { useState } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
import { Link } from "react-router-dom";
import { Search, Filter, Calendar, Tag } from "lucide-react";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [researchType, setResearchType] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");

  const { data, isLoading } = useProjects({
    ...(searchQuery && { search: searchQuery }),
    ...(researchType && { researchType }),
    ...(industry && { industry }),
    published: 'true'
  });

  const projects = data || [];

  // Extract unique industries and research types for filters
  const industries = [...new Set(projects.map(p => p.industry).filter(Boolean))];
  const researchTypes = [...new Set(projects.map(p => p.researchType))];

  const handleClearFilters = () => {
    setSearchQuery("");
    setResearchType("");
    setIndustry("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with Floating Panel */}
      <section className="relative pt-24 pb-32 px-4 bg-background overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Title & Subtitle */}
            <div className="pt-12 lg:pt-0">
              <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">Research Work</p>
              <h1 className="text-5xl lg:text-6xl font-light leading-tight text-foreground mb-8">
                User research that drives transformation
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Case studies showcasing methodologies, insights, and measurable impact across industries. Each project represents discovery-driven approaches that inform better decisions and user experiences.
              </p>
            </div>

            {/* Right: Floating Expertise Panel */}
            <div className="relative lg:relative flex justify-center lg:justify-end">
              <div className="bg-secondary dark:bg-secondary rounded-2xl p-8 md:p-10 max-w-sm w-full">
                <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-8">Expertise</p>

                <div className="space-y-8">
                  {/* Expertise Item 1: Industries Covered */}
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">Industries</p>
                    <p className="text-sm text-foreground/70 font-medium">
                      {industries.length || '—'}
                    </p>
                  </div>

                  {/* Expertise Item 2: Research Types */}
                  <div className="pt-6 border-t-2 border-foreground/20">
                    <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">Research Types</p>
                    <p className="text-sm text-foreground/70 font-medium">
                      {researchTypes.length || '—'}
                    </p>
                  </div>

                  {/* Expertise Item 3: Total Projects */}
                  <div className="pt-6 border-t-2 border-foreground/20">
                    <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">Projects</p>
                    <p className="text-sm text-foreground/70 font-medium">
                      {projects.length || '—'}
                    </p>
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
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Research Type Filter */}
            <Select value={researchType} onValueChange={setResearchType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Research Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {researchTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Industry Filter */}
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind!}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || researchType || industry) && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || researchType || industry) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary">
                  Search: {searchQuery}
                </Badge>
              )}
              {researchType && (
                <Badge variant="secondary">
                  {researchType.replace('_', ' ')}
                </Badge>
              )}
              {industry && (
                <Badge variant="secondary">
                  {industry}
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery || researchType || industry
                    ? "No projects found matching your filters. Try adjusting your search criteria."
                    : "No projects available yet. Check back soon!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8">
              {projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow group">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                            {project.title}
                          </CardTitle>
                          <p className="text-muted-foreground line-clamp-2">
                            {project.overview}
                          </p>
                        </div>
                        {project.featured && (
                          <Badge variant="default">Featured</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Metadata */}
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            <span>{project.researchType.replace('_', ' ')}</span>
                          </div>
                          {project.industry && (
                            <div className="flex items-center gap-1">
                              <span>•</span>
                              <span>{project.industry}</span>
                            </div>
                          )}
                          {project.duration && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{project.duration}</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tags.slice(0, 5).map((tagRel) => (
                              <Badge key={tagRel.tag.id} variant="outline" className="text-xs">
                                {tagRel.tag.name}
                              </Badge>
                            ))}
                            {project.tags.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.tags.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Key Highlights */}
                        {project.methodsUsed && Array.isArray(project.methodsUsed) && project.methodsUsed.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium mb-2">Methods Used:</p>
                            <div className="flex flex-wrap gap-2">
                              {project.methodsUsed.slice(0, 4).map((method: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {method}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && projects.length > 0 && (
            <div className="text-center mt-8 text-sm text-muted-foreground">
              Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
