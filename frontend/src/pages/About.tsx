import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAbout } from "@/hooks/useAbout";
import { Mail, Phone, MapPin, Linkedin, Github, Twitter, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const About = () => {
  const { data: about, isLoading } = useAbout();

  const getSocialIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('linkedin')) return <Linkedin className="h-5 w-5" />;
    if (lowerPlatform.includes('github')) return <Github className="h-5 w-5" />;
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) return <Twitter className="h-5 w-5" />;
    return <ExternalLink className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-6xl px-4 pt-24 pb-16">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!about) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-6xl px-4 pt-24 pb-16">
          <div className="text-center">About information not available</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-24 pb-16 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section with Bio and Profile Picture */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-16">
            {/* Left Column - Bio */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {about.name}
                </h1>
                <p className="text-xl text-muted-foreground">{about.title}</p>
              </div>

              <div className="prose prose-lg max-w-none text-muted-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{about.bio}</ReactMarkdown>
              </div>
            </div>

            {/* Right Column - Profile Picture */}
            {about.profilePic && (
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={about.profilePic}
                    alt={about.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          {about.socialLinks && about.socialLinks.length > 0 && (
            <Card className="p-8 mb-8">
              <h2 className="text-2xl mb-6">You can also find me here</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {about.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    {getSocialIcon(link.platform)}
                    <span className="font-medium">{link.platform}</span>
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Contact Information */}
          {(about.email || about.phone || about.location) && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                {about.email && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                    <a href={`mailto:${about.email}`} className="hover:text-foreground transition-colors">
                      {about.email}
                    </a>
                  </div>
                )}
                {about.phone && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-5 w-5" />
                    <a href={`tel:${about.phone}`} className="hover:text-foreground transition-colors">
                      {about.phone}
                    </a>
                  </div>
                )}
                {about.location && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>{about.location}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
