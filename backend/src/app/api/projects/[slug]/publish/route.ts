import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { projectService } from '@/services/project.service';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

/**
 * PATCH /api/projects/[slug]/publish - Toggle publish status (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    // Get project to find its ID
    const existingProject = await projectService.getProjectBySlug(params.slug);

    const result = await projectService.togglePublish(existingProject.id);

    return successResponse(result);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
