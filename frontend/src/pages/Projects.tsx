import { useState } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
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
import { Search, Filter, Tag } from "lucide-react";

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

  // Sort projects by order field (ascending), then by createdAt (descending)
  const projects = (data || []).sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
              <h1 className="text-5xl lg:text-5xl font-light leading-tight text-foreground mb-8">
                A collection of my recent favorite projects.
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Research case studies showcasing methodologies, insights, and measurable impact across industries.
              </p>
            </div>

            {/* Right: Floating Expertise Panel */}
            <div className="relative lg:relative flex justify-center lg:justify-end">
              <div className="bg-secondary dark:bg-secondary rounded-2xl p-8 md:p-10 max-w-sm w-full">
                <p className="text-md font-semibold text-foreground uppercase tracking-widest mb-8">My Expertise</p>

                <div className="space-y-6">
                  {/* Expertise Item 1: Industries Covered */}
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-foreground mb-3">Industries</p>
                    <div className="flex flex-wrap gap-2">
                      {['Cloud Technology', 'AI & Machine Learning', 'Enterprise Software', 'Developer Tools'].map((item) => (
                        <Badge key={item} variant="secondary" className="text-sm font-medium py-1 px-3 bg-foreground/10 hover:bg-foreground/20 transition-colors">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Expertise Item 2: Research Types */}
                  <div className="pt-4 border-t-2 border-foreground/20">
                    <p className="text-xl md:text-2xl font-bold text-foreground mb-3">Research Methods</p>
                    <div className="flex flex-wrap gap-2">
                      {['User Interviews', 'Usability/Concept Testing', 'Surveys & Data Analysis', 'Generative AI Evaluations'].map((item) => (
                        <Badge key={item} variant="secondary" className="text-sm font-medium py-1 px-3 bg-foreground/10 hover:bg-foreground/20 transition-colors">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Projects Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {/* Cover Image */}
                    <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                      {project.coverImage ? (
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <div className="text-center p-6">
                            <p className="text-2xl font-light text-muted-foreground">{project.title.charAt(0)}</p>
                          </div>
                        </div>
                      )}
                      {project.featured && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="default" className="shadow-lg">Featured</Badge>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 flex flex-col p-6">
                      {/* Client/Industry */}
                      {project.industry && (
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {project.industry}
                        </p>
                      )}

                      {/* Title */}
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {project.overview}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-t pt-4">
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span>{project.researchType.replace('_', ' ')}</span>
                        </div>
                        {project.duration && (
                          <>
                            <span>•</span>
                            <span>{project.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
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
