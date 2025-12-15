import { prisma } from '@/lib/prisma';
import { slugify, generateUniqueSlug } from '@/lib/slugify';
import { NotFoundError } from '@/utils/error-handler';
import { calculatePagination, generatePaginationMeta } from '@/utils/pagination';
import type {
  CreateGuidebookInput,
  UpdateGuidebookInput,
  GuidebookQueryInput,
  AddArticleToGuidebookInput,
} from '@/schemas/guidebook.schema';
import type { Prisma } from '@prisma/client';

export class GuidebookService {
  /**
   * Get all guidebooks with pagination
   */
  async getGuidebooks(query: GuidebookQueryInput) {
    const {
      page = 1,
      limit = 20,
      featured,
      published,
      sort = 'lastUpdated',
      order = 'desc',
    } = query;
    const { skip, take } = calculatePagination({ page, limit });

    const where: Prisma.GuidebookWhereInput = {
      ...(published !== undefined && { published }),
      ...(featured !== undefined && { featured }),
    };

    const [rawGuidebooks, total] = await Promise.all([
      prisma.guidebook.findMany({
        where,
        include: {
          articles: {
            include: {
              publication: true,
            },
            orderBy: { order: 'asc' },
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
      prisma.guidebook.count({ where }),
    ]);

    // Transform articles to include publication data at the top level
    const guidebooks = rawGuidebooks.map((guidebook) => ({
      ...guidebook,
      articles: guidebook.articles.map((article) => ({
        id: article.publication.id,
        title: article.customTitle || article.publication.title,
        slug: article.publication.slug,
        excerpt: article.customExcerpt || article.publication.excerpt,
        readTime: article.publication.readTime,
        order: article.order,
      })),
    }));

    const pagination = generatePaginationMeta(page, limit, total);

    return { guidebooks, pagination };
  }

  /**
   * Get featured guidebooks
   */
  async getFeaturedGuidebooks() {
    return prisma.guidebook.findMany({
      where: {
        published: true,
        featured: true,
      },
      include: {
        articles: {
          orderBy: { order: 'asc' },
          take: 3, // Preview only
        },
      },
      orderBy: { lastUpdated: 'desc' },
      take: 4,
    });
  }

  /**
   * Get a single guidebook by slug with all articles
   */
  async getGuidebookBySlug(slug: string) {
    const rawGuidebook = await prisma.guidebook.findUnique({
      where: { slug },
      include: {
        articles: {
          include: {
            publication: {
              include: {
                tags: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!rawGuidebook) {
      throw new NotFoundError('Guidebook');
    }

    // Transform articles to include publication data at the top level
    const guidebook = {
      ...rawGuidebook,
      articles: rawGuidebook.articles.map((article) => ({
        id: article.publication.id,
        title: article.customTitle || article.publication.title,
        slug: article.publication.slug,
        excerpt: article.customExcerpt || article.publication.excerpt,
        readTime: article.publication.readTime,
        externalUrl: article.publication.externalUrl,
        order: article.order,
      })),
    };

    return guidebook;
  }

  /**
   * Create a new guidebook
   */
  async createGuidebook(data: CreateGuidebookInput, authorId: string) {
    // Generate unique slug
    const baseSlug = slugify(data.title);
    const existingGuidebooks = await prisma.guidebook.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: { slug: true },
    });
    const slug = generateUniqueSlug(
      baseSlug,
      existingGuidebooks.map((g) => g.slug)
    );

    const guidebook = await prisma.guidebook.create({
      data: {
        ...data,
        slug,
        authorId,
      },
    });

    return this.getGuidebookBySlug(guidebook.slug);
  }

  /**
   * Update a guidebook
   */
  async updateGuidebook(id: string, data: UpdateGuidebookInput) {
    let slug: string | undefined;
    if (data.title) {
      const baseSlug = slugify(data.title);
      const existingGuidebooks = await prisma.guidebook.findMany({
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
        existingGuidebooks.map((g) => g.slug)
      );
    }

    const guidebook = await prisma.guidebook.update({
      where: { id },
      data: {
        ...data,
        ...(slug && { slug }),
        lastUpdated: new Date(),
      },
    });

    return this.getGuidebookBySlug(guidebook.slug);
  }

  /**
   * Delete a guidebook
   */
  async deleteGuidebook(id: string) {
    await prisma.guidebook.delete({
      where: { id },
    });
  }

  /**
   * Add an article to a guidebook
   */
  async addArticleToGuidebook(
    guidebookId: string,
    data: AddArticleToGuidebookInput
  ) {
    const article = await prisma.guidebookArticle.create({
      data: {
        guidebookId,
        ...data,
      },
      include: {
        publication: true,
      },
    });

    // Update guidebook's last updated time and total read time
    const guidebook = await prisma.guidebook.findUnique({
      where: { id: guidebookId },
      include: {
        articles: {
          include: {
            publication: true,
          },
        },
      },
    });

    if (guidebook) {
      const totalReadTime = guidebook.articles.reduce(
        (total, article) => total + (article.publication.readTime || 0),
        0
      );

      await prisma.guidebook.update({
        where: { id: guidebookId },
        data: {
          totalReadTime,
          lastUpdated: new Date(),
        },
      });
    }

    return article;
  }

  /**
   * Remove an article from a guidebook
   */
  async removeArticleFromGuidebook(articleId: string) {
    const article = await prisma.guidebookArticle.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundError('Guidebook article');
    }

    await prisma.guidebookArticle.delete({
      where: { id: articleId },
    });

    // Update guidebook's total read time
    const guidebook = await prisma.guidebook.findUnique({
      where: { id: article.guidebookId },
      include: {
        articles: {
          include: {
            publication: true,
          },
        },
      },
    });

    if (guidebook) {
      const totalReadTime = guidebook.articles.reduce(
        (total, art) => total + (art.publication.readTime || 0),
        0
      );

      await prisma.guidebook.update({
        where: { id: article.guidebookId },
        data: {
          totalReadTime,
          lastUpdated: new Date(),
        },
      });
    }
  }
}

export const guidebookService = new GuidebookService();
