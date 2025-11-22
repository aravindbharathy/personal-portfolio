import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { ConflictError, NotFoundError } from '@/utils/error-handler';
import type { CreateTagInput, TagQueryInput } from '@/schemas/tag.schema';
import type { TagCategory } from '@prisma/client';

export class TagService {
  /**
   * Get all tags with optional category filter
   */
  async getTags(query: TagQueryInput) {
    const { category } = query;

    const tags = await prisma.tag.findMany({
      where: {
        ...(category && { category }),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Add usage count for each tag
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const [projectCount, publicationCount] = await Promise.all([
          prisma.projectTag.count({ where: { tagId: tag.id } }),
          prisma.publicationTag.count({ where: { tagId: tag.id } }),
        ]);

        return {
          ...tag,
          count: projectCount + publicationCount,
        };
      })
    );

    return tagsWithCount;
  }

  /**
   * Get tags grouped by category
   */
  async getTagsByCategory() {
    const tags = await this.getTags({});

    const grouped: Record<TagCategory, typeof tags> = {
      RESEARCH_METHOD: [],
      INDUSTRY: [],
      TOPIC: [],
      TOOL: [],
      SKILL: [],
    };

    tags.forEach((tag) => {
      grouped[tag.category].push(tag);
    });

    return grouped;
  }

  /**
   * Create a new tag
   */
  async createTag(data: CreateTagInput) {
    const slug = slugify(data.name);

    // Check if slug already exists
    const existing = await prisma.tag.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictError('A tag with this name already exists');
    }

    const tag = await prisma.tag.create({
      data: {
        ...data,
        slug,
      },
    });

    return tag;
  }

  /**
   * Delete a tag
   */
  async deleteTag(id: string) {
    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    // Check if tag is in use
    const [projectCount, publicationCount] = await Promise.all([
      prisma.projectTag.count({ where: { tagId: id } }),
      prisma.publicationTag.count({ where: { tagId: id } }),
    ]);

    if (projectCount > 0 || publicationCount > 0) {
      throw new ConflictError(
        'Cannot delete tag that is currently in use. Remove it from all projects and publications first.'
      );
    }

    await prisma.tag.delete({
      where: { id },
    });
  }
}

export const tagService = new TagService();
