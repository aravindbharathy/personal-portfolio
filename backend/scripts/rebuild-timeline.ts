import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function rebuildTimeline() {
  console.log('Rebuilding timeline...');

  await prisma.$transaction(async (tx) => {
    // Clear existing timeline
    await tx.contentTimeline.deleteMany({});
    console.log('Cleared existing timeline');

    // Add published projects
    const projects = await tx.project.findMany({
      where: { published: true },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    for (const project of projects) {
      await tx.contentTimeline.create({
        data: {
          contentType: 'PROJECT',
          contentId: project.id,
          title: project.title,
          excerpt: project.overview,
          date: project.createdAt,
          url: `/projects/${project.slug}`,
          tags: project.tags.map((t) => t.tag.name),
        },
      });
    }
    console.log(`Added ${projects.length} projects`);

    // Add publications
    const publications = await tx.publication.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    for (const publication of publications) {
      await tx.contentTimeline.create({
        data: {
          contentType: 'PUBLICATION',
          contentId: publication.id,
          title: publication.title,
          excerpt: publication.excerpt,
          date: publication.publishedAt,
          url: publication.externalUrl, // Use external URL for direct article link
          tags: publication.tags.map((t) => t.tag.name),
          readTime: publication.readTime,
          platform: publication.platform,
        },
      });
    }
    console.log(`Added ${publications.length} publications`);

    // Add published guidebooks
    const guidebooks = await tx.guidebook.findMany({
      where: { published: true },
    });

    for (const guidebook of guidebooks) {
      await tx.contentTimeline.create({
        data: {
          contentType: 'GUIDEBOOK',
          contentId: guidebook.id,
          title: guidebook.title,
          excerpt: guidebook.description,
          date: guidebook.lastUpdated,
          url: `/guidebooks/${guidebook.slug}`,
          tags: [],
          readTime: guidebook.totalReadTime,
        },
      });
    }
    console.log(`Added ${guidebooks.length} guidebooks`);
  });

  console.log('Timeline rebuilt successfully!');
}

rebuildTimeline()
  .catch((error) => {
    console.error('Error rebuilding timeline:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
