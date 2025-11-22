import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    // Get counts and statistics
    const [
      totalProjects,
      publishedProjects,
      featuredProjects,
      totalPublications,
      totalGuidebooks,
      publishedGuidebooks,
      totalTags,
      publicationsByPlatform,
      tagsByCategory,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { published: true } }),
      prisma.project.count({ where: { featured: true } }),
      prisma.publication.count(),
      prisma.guidebook.count(),
      prisma.guidebook.count({ where: { published: true } }),
      prisma.tag.count(),
      prisma.publication.groupBy({
        by: ['platform'],
        _count: true,
      }),
      prisma.tag.groupBy({
        by: ['category'],
        _count: true,
      }),
    ]);

    const stats = {
      projects: {
        total: totalProjects,
        published: publishedProjects,
        drafts: totalProjects - publishedProjects,
        featured: featuredProjects,
      },
      publications: {
        total: totalPublications,
        byPlatform: Object.fromEntries(
          publicationsByPlatform.map((p) => [p.platform, p._count])
        ),
        featured: await prisma.publication.count({ where: { featured: true } }),
      },
      guidebooks: {
        total: totalGuidebooks,
        published: publishedGuidebooks,
        drafts: totalGuidebooks - publishedGuidebooks,
      },
      tags: {
        total: totalTags,
        byCategory: Object.fromEntries(
          tagsByCategory.map((t) => [t.category, t._count])
        ),
      },
    };

    return successResponse(stats);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
