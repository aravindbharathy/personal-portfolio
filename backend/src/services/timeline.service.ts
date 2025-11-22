import { prisma } from '@/lib/prisma';
import type { TimelineQueryInput } from '@/schemas/timeline.schema';
import type { Prisma } from '@prisma/client';

export class TimelineService {
  /**
   * Get content timeline
   */
  async getTimeline(query: TimelineQueryInput) {
    const { limit = 15, offset = 0, contentType, tags } = query;

    const where: Prisma.ContentTimelineWhereInput = {
      ...(contentType && { contentType }),
      ...(tags && {
        tags: {
          hasSome: Array.isArray(tags) ? tags : [tags],
        },
      }),
    };

    const timeline = await prisma.contentTimeline.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: offset,
      take: limit,
    });

    // Check if there are more items
    const total = await prisma.contentTimeline.count({ where });
    const hasMore = offset + limit < total;

    return { timeline, hasMore, total };
  }

  /**
   * Rebuild the entire timeline from projects, publications, and guidebooks
   */
  async rebuildTimeline() {
    await prisma.$transaction(async (tx) => {
      // Clear existing timeline
      await tx.contentTimeline.deleteMany({});

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
            url: `/publications/${publication.slug}`,
            tags: publication.tags.map((t) => t.tag.name),
            readTime: publication.readTime,
            platform: publication.platform,
          },
        });
      }

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
    });

    return { success: true, message: 'Timeline rebuilt successfully' };
  }
}

export const timelineService = new TimelineService();
