import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, FileText, FolderOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useTimeline } from "@/hooks/useTimeline";
import { useFeaturedProjects } from "@/hooks/useProjects";
import { format } from "date-fns";

const Index = () => {
  const { data: timelineData, isLoading: timelineLoading } = useTimeline({ limit: 10 });
  const { data: featuredProjects, isLoading: projectsLoading } = useFeaturedProjects();

  const quickLinks = [
    {
      icon: FolderOpen,
      title: "Projects",
      description: "Research case studies and methodologies",
      path: "/projects",
    },
    {
      icon: FileText,
      title: "Publications",
      description: "Articles from Medium and Substack",
      path: "/publications",
    },
    {
      icon: BookOpen,
      title: "Guidebooks",
      description: "Curated article collections",
      path: "/guidebooks",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Personal About Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-3xl font-bold text-foreground">
              Hi, I'm Aravind, a UX Researcher.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I'm an experienced industry researcher with background in Human-Computer Interaction and Computer Science. </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Right now, I am focused on leveraging research to build with our AI future in mind. I also advise a handful of AI startups. Check out my latest thoughts on <a href="/publications" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Medium</a> and my <a href="/guidebooks" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Guidebooks</a> for building with AI .
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Before this, as the Research Lead, I brought several 0-1 product experiences to market at Google Cloud (
                <a href="https://cloud.google.com/network-intelligence-center?hl=en" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Network Intelligence</a>,&nbsp;
                <a href="https://cloud.google.com/cdn?hl=en#leverage-googles-decade-of-experience-delivering-content" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Content Delivery</a>, and&nbsp; 
                <a href="https://cloud.google.com/solutions/cross-cloud-network?hl=en" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Cross-Cloud Solutions</a>
              ) and YouTube (
                <a href="https://artists.youtube/resources/channel-optimization/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Music Artist Channels</a>,&nbsp; 
                <a href="https://artists.youtube/resources/analytics-for-artists/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">YouTube Artist Analytics</a>
              ).
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              In several areas of my life, I consider myself a deep generalist. My super power is to systematically understand complex new domains and help teams build user-centered products within them. I enjoy sharing and teaching these discoveries through writing and mentorship.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button asChild>
                <Link to="/about">
                  More About Me
                  <ArrowRight className="ml-2" size={16} />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/projects">View My Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.path}>
                <Card className="h-full hover:shadow-medium transition-shadow group">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="inline-flex w-12 h-12 rounded-lg bg-accent items-center justify-center text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors mx-auto">
                      <link.icon size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {link.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Content Timeline */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Latest Activity
          </h2>

          {timelineLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : timelineData && timelineData.items.length > 0 ? (
            <div className="space-y-6">
              {timelineData.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent">
                          {item.contentType === 'PROJECT' && <FolderOpen className="h-5 w-5" />}
                          {item.contentType === 'PUBLICATION' && <FileText className="h-5 w-5" />}
                          {item.contentType === 'GUIDEBOOK' && <BookOpen className="h-5 w-5" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.contentType}
                          </Badge>
                          {item.platform && (
                            <Badge variant="outline" className="text-xs">
                              {item.platform}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(item.date), 'MMM d, yyyy')}
                          </span>
                          {item.readTime && (
                            <span className="text-sm text-muted-foreground">
                              {item.readTime} min read
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.excerpt}
                        </p>
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {item.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No content yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Featured Projects Preview */}
      {!projectsLoading && featuredProjects && featuredProjects.length > 0 && (
        <section className="py-16 px-4 bg-muted">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Featured Projects
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredProjects.slice(0, 4).map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {project.overview}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{project.researchType}</Badge>
                      {project.industry && (
                        <Badge variant="outline">{project.industry}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/projects">
                  View All Projects
                  <ArrowRight className="ml-2" size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Simple CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Let's Connect
          </h2>
          <p className="text-muted-foreground">
            I'm always interested in hearing about new research opportunities and collaborations.
          </p>
          <Button variant="outline">
            Get In Touch
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
