import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get or create a user
  let user = await prisma.user.findFirst();

  if (!user) {
    console.log('Creating admin user...');
    user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: '$2a$10$YourHashedPasswordHere', // This is just a placeholder
        role: 'ADMIN',
      },
    });
  }

  // Get some tags
  const tags = await prisma.tag.findMany({
    take: 3,
  });

  console.log('Creating sample project with picture grids...');

  const project = await prisma.project.create({
    data: {
      title: 'E-Commerce User Experience Research',
      slug: 'ecommerce-ux-research',
      overview: 'A comprehensive study examining user behavior and pain points in the online shopping experience, focusing on checkout flows and product discovery.',
      objectives: 'To identify key friction points in the e-commerce user journey and develop data-driven recommendations for improving conversion rates and customer satisfaction.',
      methodology: 'We conducted a mixed-methods research approach combining usability testing with 20 participants, in-depth interviews, and analytics analysis of user behavior patterns.',
      findings: 'Our research revealed that 65% of cart abandonment occurs during the payment information stage, primarily due to concerns about security and unclear shipping costs.',
      impact: 'Implementation of our recommendations led to a 23% increase in checkout completion rates and a 15% improvement in overall customer satisfaction scores.',

      objectivesHeading: 'Research Goals',
      methodologyHeading: 'Our Approach',
      findingsHeading: 'What We Discovered',
      impactHeading: 'Results & Impact',

      duration: '3 months',
      role: 'Lead UX Researcher',
      teamSize: '4',
      participants: '20',
      researchType: 'EVALUATIVE',
      industry: 'E-commerce',
      methodsUsed: ['Usability Testing', 'User Interviews', 'Analytics Analysis', 'A/B Testing'],
      featured: true,
      published: true,
      authorId: user.id,

      // Create picture grids
      pictureGrids: {
        create: [
          {
            position: 'after_objectives',
            columns: 2,
            order: 0,
            pictures: {
              create: [
                {
                  url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                  alt: 'User research planning session with sticky notes',
                  caption: 'Initial research planning and hypothesis formation',
                  order: 0,
                },
                {
                  url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
                  alt: 'Analytics dashboard showing user behavior data',
                  caption: 'Analyzing user behavior patterns through analytics',
                  order: 1,
                },
              ],
            },
          },
          {
            position: 'after_findings',
            columns: 3,
            order: 0,
            pictures: {
              create: [
                {
                  url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
                  alt: 'Shopping cart interface mockup',
                  caption: 'Redesigned checkout flow with improved clarity',
                  order: 0,
                },
                {
                  url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800',
                  alt: 'Mobile payment interface design',
                  caption: 'Mobile-optimized payment screen',
                  order: 1,
                },
                {
                  url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
                  alt: 'User testing session in progress',
                  caption: 'Validation testing with real users',
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      pictureGrids: {
        include: {
          pictures: true,
        },
      },
    },
  });

  // Add tags
  if (tags.length > 0) {
    await prisma.projectTag.createMany({
      data: tags.map((tag) => ({
        projectId: project.id,
        tagId: tag.id,
      })),
    });
  }

  console.log('✅ Sample project created successfully!');
  console.log(`   Title: ${project.title}`);
  console.log(`   Slug: ${project.slug}`);
  console.log(`   Picture Grids: ${project.pictureGrids.length}`);
  console.log(`   - Grid 1: ${project.pictureGrids[0].pictures.length} pictures (${project.pictureGrids[0].columns} columns) at ${project.pictureGrids[0].position}`);
  console.log(`   - Grid 2: ${project.pictureGrids[1].pictures.length} pictures (${project.pictureGrids[1].columns} columns) at ${project.pictureGrids[1].position}`);
  console.log(`\n   View at: http://localhost:8081/projects/${project.slug}`);
}

main()
  .catch((e) => {
    console.error('Error creating sample project:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
