import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Rebuilding content timeline...');

  await prisma.$transaction(async (tx) => {
    // Clear existing timeline
    console.log('Clearing existing timeline entries...');
    await tx.contentTimeline.deleteMany({});
    console.log('✓ Timeline cleared');

    // Add published projects
    console.log('\nAdding projects to timeline...');
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
    console.log(`✓ Added ${projects.length} project(s)`);

    // Add publications
    console.log('\nAdding publications to timeline...');
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
          url: `/publications/${publication.slug}`,
          tags: publication.tags.map((t) => t.tag.name),
          readTime: publication.readTime,
          platform: publication.platform,
        },
      });
    }
    console.log(`✓ Added ${publications.length} publication(s)`);

    // Add published guidebooks
    console.log('\nAdding guidebooks to timeline...');
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
    console.log(`✓ Added ${guidebooks.length} guidebook(s)`);
  });

  const total = await prisma.contentTimeline.count();

  console.log('\n✅ Timeline rebuilt successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total entries: ${total}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nRefresh your homepage to see the updated timeline.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
