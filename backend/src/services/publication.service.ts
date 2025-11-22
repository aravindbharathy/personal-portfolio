import { prisma } from '@/lib/prisma';
import { slugify, generateUniqueSlug } from '@/lib/slugify';
import { NotFoundError } from '@/utils/error-handler';
import { calculatePagination, generatePaginationMeta } from '@/utils/pagination';
import type {
  CreatePublicationInput,
  UpdatePublicationInput,
  PublicationQueryInput,
} from '@/schemas/publication.schema';
import type { Prisma } from '@prisma/client';

export class PublicationService {
  /**
   * Get all publications with filtering and pagination
   */
  async getPublications(query: PublicationQueryInput) {
    const {
      page = 1,
      limit = 20,
      platform,
      tag,
      featured,
      search,
      sort = 'publishedAt',
      order = 'desc',
    } = query;
    const { skip, take } = calculatePagination({ page, limit });

    // Build where clause
    const where: Prisma.PublicationWhereInput = {
      ...(platform && { platform }),
      ...(featured !== undefined && { featured }),
      ...(tag && {
        tags: {
          some: {
            tag: {
              slug: tag,
            },
          },
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { [sort]: order },
        skip,
        take,
      }),
      prisma.publication.count({ where }),
    ]);

    const pagination = generatePaginationMeta(page, limit, total);

    return { publications, pagination };
  }

  /**
   * Get featured publications
   */
  async getFeaturedPublications() {
    return prisma.publication.findMany({
      where: {
        featured: true,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 6,
    });
  }

  /**
   * Get a single publication by slug
   */
  async getPublicationBySlug(slug: string) {
    const publication = await prisma.publication.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!publication) {
      throw new NotFoundError('Publication');
    }

    return publication;
  }

  /**
   * Create a new publication
   */
  async createPublication(data: CreatePublicationInput, authorId: string) {
    const { tagIds, publishedAt, ...publicationData } = data;

    // Generate unique slug
    const baseSlug = slugify(data.title);
    const existingPublications = await prisma.publication.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: { slug: true },
    });
    const slug = generateUniqueSlug(
      baseSlug,
      existingPublications.map((p) => p.slug)
    );

    const publication = await prisma.$transaction(async (tx) => {
      // Create publication
      const newPublication = await tx.publication.create({
        data: {
          ...publicationData,
          slug,
          publishedAt: new Date(publishedAt),
          authorId,
        },
      });

      // Create tags associations
      if (tagIds && tagIds.length > 0) {
        await tx.publicationTag.createMany({
          data: tagIds.map((tagId) => ({
            publicationId: newPublication.id,
            tagId,
          })),
        });
      }

      // Add to timeline
      const tags = await tx.tag.findMany({
        where: {
          publications: {
            some: {
              publicationId: newPublication.id,
            },
          },
        },
      });

      await tx.contentTimeline.create({
        data: {
          contentType: 'PUBLICATION',
          contentId: newPublication.id,
          title: newPublication.title,
          excerpt: newPublication.excerpt,
          date: newPublication.publishedAt,
          url: `/publications/${newPublication.slug}`,
          tags: tags.map((t) => t.name),
          readTime: newPublication.readTime,
          platform: newPublication.platform,
        },
      });

      return newPublication;
    });

    return this.getPublicationBySlug(publication.slug);
  }

  /**
   * Update a publication
   */
  async updatePublication(id: string, data: UpdatePublicationInput) {
    const { tagIds, publishedAt, ...publicationData } = data;

    let slug: string | undefined;
    if (data.title) {
      const baseSlug = slugify(data.title);
      const existingPublications = await prisma.publication.findMany({
        where: {
          slug: {
            startsWith: baseSlug,
          },
          NOT: {
            id,
          },
        },
        select: { slug: true },
      });
      slug = generateUniqueSlug(
        baseSlug,
        existingPublications.map((p) => p.slug)
      );
    }

    const publication = await prisma.$transaction(async (tx) => {
      const updated = await tx.publication.update({
        where: { id },
        data: {
          ...publicationData,
          ...(slug && { slug }),
          ...(publishedAt && { publishedAt: new Date(publishedAt) }),
        },
      });

      // Update tags if provided
      if (tagIds !== undefined) {
        await tx.publicationTag.deleteMany({
          where: { publicationId: id },
        });

        if (tagIds.length > 0) {
          await tx.publicationTag.createMany({
            data: tagIds.map((tagId) => ({
              publicationId: id,
              tagId,
            })),
          });
        }
      }

      // Update timeline
      await tx.contentTimeline.updateMany({
        where: {
          contentType: 'PUBLICATION',
          contentId: id,
        },
        data: {
          title: updated.title,
          excerpt: updated.excerpt,
          url: `/publications/${updated.slug}`,
          readTime: updated.readTime,
          platform: updated.platform,
        },
      });

      return updated;
    });

    return this.getPublicationBySlug(publication.slug);
  }

  /**
   * Delete a publication
   */
  async deletePublication(id: string) {
    await prisma.$transaction(async (tx) => {
      // Delete from timeline
      await tx.contentTimeline.deleteMany({
        where: {
          contentType: 'PUBLICATION',
          contentId: id,
        },
      });

      // Delete publication
      await tx.publication.delete({
        where: { id },
      });
    });
  }
}

export const publicationService = new PublicationService();
