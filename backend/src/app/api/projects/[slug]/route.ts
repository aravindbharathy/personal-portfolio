import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { projectService } from '@/services/project.service';
import { updateProjectSchema } from '@/schemas/project.schema';
import { successResponse, errorResponse, notFoundResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

/**
 * GET /api/projects/[slug] - Get project by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const project = await projectService.getProjectBySlug(params.slug);
    return successResponse(project);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}

/**
 * PUT /api/projects/[slug] - Update project (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    // Get project to find its ID
    const existingProject = await projectService.getProjectBySlug(params.slug);

    const body = await request.json();
    const data = updateProjectSchema.parse(body);

    const project = await projectService.updateProject(existingProject.id, data);

    return successResponse(project);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}

/**
 * DELETE /api/projects/[slug] - Delete project (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    // Get project to find its ID
    const existingProject = await projectService.getProjectBySlug(params.slug);

    await projectService.deleteProject(existingProject.id);

    return successResponse({ message: 'Project deleted successfully' });
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
