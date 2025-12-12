import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProject, type ProjectPictureGrid } from "@/hooks/useProjects";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PictureGrid } from "@/components/PictureGrid";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(slug!);

  // Helper function to get picture grids for a specific position
  const getGridsForPosition = (position: ProjectPictureGrid['position']) => {
    if (!project?.pictureGrids) return [];
    return project.pictureGrids
      .filter((grid) => grid.position === position)
      .sort((a, b) => a.order - b.order);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-4xl px-4 py-32 text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with Floating Panel */}
      <section className="relative pt-24 pb-32 px-4 bg-background overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>

          {/* Two Column Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Title & Description */}
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="default" className="text-xs">
                  {project.researchType.replace(/_/g, ' ')}
                </Badge>
                {project.industry && (
                  <Badge variant="outline" className="text-xs">
                    {project.industry}
                  </Badge>
                )}
                {project.featured && (
                  <Badge className="text-xs">Featured</Badge>
                )}
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-8">
                {project.title}
              </h1>

              <div className="text-3xl lg:text-3xl prose prose-lg prose-slate dark:prose-invert max-w-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.overview}</ReactMarkdown>
              </div>
            </div>

            {/* Right: Floating Panel with Stats */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="bg-secondary dark:bg-secondary rounded-2xl p-8 md:p-10 max-w-sm w-full">
                <div className="space-y-8">
                  

                  {project.role && (
                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Role</p>
                      <p className="text-3xl font-bold text-foreground">
                        {project.role}
                      </p>
                    </div>
                  )}

                  {project.duration && (
                    <div className={project.role ? "pt-6 border-t-2 border-foreground/20" : ""}>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Duration</p>
                      <p className="text-3xl md:text-4xl font-bold text-foreground">
                        {project.duration}
                      </p>
                    </div>
                  )}

                  {project.teamSize && (
                    <div className={project.duration || project.role ? "pt-6 border-t-2 border-foreground/20" : ""}>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Team Size</p>
                      <p className="text-3xl font-bold text-foreground">
                        {project.teamSize}
                      </p>
                    </div>
                  )}

                  {project.participants && (
                    <div className={project.duration || project.role || project.teamSize ? "pt-6 border-t-2 border-foreground/20" : ""}>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-2">Participants</p>
                      <p className="text-3xl font-bold text-foreground">
                        {project.participants}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Objectives Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Picture grids before objectives */}
          {getGridsForPosition('before_objectives').map((grid, index) => (
            <PictureGrid key={`before-obj-${index}`} grid={grid} />
          ))}

          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            {project.objectivesHeading || 'Research Objectives'}
          </h2>
          <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.objectives}</ReactMarkdown>
          </div>

          {/* Picture grids after objectives */}
          {getGridsForPosition('after_objectives').map((grid, index) => (
            <PictureGrid key={`after-obj-${index}`} grid={grid} />
          ))}
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl">
          {/* Picture grids before methodology */}
          {getGridsForPosition('before_methodology').map((grid, index) => (
            <PictureGrid key={`before-meth-${index}`} grid={grid} />
          ))}

          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            {project.methodologyHeading || 'Methodology & Approach'}
          </h2>

          <div className="space-y-12">
            <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.methodology}</ReactMarkdown>
            </div>

            {/* Methods Grid */}
            {project.methodsUsed && Array.isArray(project.methodsUsed) && project.methodsUsed.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold mb-6">Methods Used</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.methodsUsed.map((method: string, idx: number) => (
                    <div key={idx} className="p-4 bg-background rounded-lg border border-border">
                      <p className="text-foreground font-medium">{method}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Picture grids after methodology */}
          {getGridsForPosition('after_methodology').map((grid, index) => (
            <PictureGrid key={`after-meth-${index}`} grid={grid} />
          ))}
        </div>
      </section>

      {/* Key Findings Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Picture grids before findings */}
          {getGridsForPosition('before_findings').map((grid, index) => (
            <PictureGrid key={`before-find-${index}`} grid={grid} />
          ))}

          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            {project.findingsHeading || 'Key Findings & Insights'}
          </h2>
          <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.findings}</ReactMarkdown>
          </div>

          {/* Picture grids after findings */}
          {getGridsForPosition('after_findings').map((grid, index) => (
            <PictureGrid key={`after-find-${index}`} grid={grid} />
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl">
          {/* Picture grids before impact */}
          {getGridsForPosition('before_impact').map((grid, index) => (
            <PictureGrid key={`before-impact-${index}`} grid={grid} />
          ))}

          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            {project.impactHeading || 'Impact & Outcomes'}
          </h2>
          <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.impact}</ReactMarkdown>
          </div>

          {/* Picture grids after impact */}
          {getGridsForPosition('after_impact').map((grid, index) => (
            <PictureGrid key={`after-impact-${index}`} grid={grid} />
          ))}
        </div>
      </section>

      {/* Tags Section */}
      {project.tags && project.tags.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h3 className="text-xl font-semibold mb-6">Tags</h3>
            <div className="flex flex-wrap gap-3">
              {project.tags.map((tagRel) => (
                <Badge key={tagRel.tag.id} variant="outline" className="text-sm py-2 px-3">
                  {tagRel.tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Links Section */}
      {project.links && Array.isArray(project.links) && project.links.length > 0 && (
        <section className="py-20 px-4 bg-muted">
          <div className="container mx-auto max-w-4xl">
            <h3 className="text-2xl font-semibold mb-8">Related Links</h3>
            <div className="space-y-4">
              {project.links.map((link: { url: string; title: string }, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-md transition-all group"
                >
                  <span className="flex-1 font-medium text-foreground group-hover:text-primary transition-colors">
                    {link.title || link.url}
                  </span>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Images Section */}
      {project.images && project.images.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h3 className="text-2xl font-semibold mb-12">Visual Artifacts</h3>
            <div className="space-y-8">
              {project.images.map((image, idx) => (
                <div key={image.id} className="space-y-4">
                  <img
                    src={image.url}
                    alt={image.alt || project.title}
                    className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  />
                  {image.caption && (
                    <p className="text-sm text-muted-foreground italic">{image.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Want to discuss this project?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            I'm always interested in hearing about new research opportunities and collaborations.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate('/projects')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              View Other Projects
            </Button>
            <Button variant="outline">Get in Touch</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
