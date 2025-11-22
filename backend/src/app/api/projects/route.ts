import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { projectService } from '@/services/project.service';
import { createProjectSchema, projectQuerySchema } from '@/schemas/project.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

/**
 * GET /api/projects - List all projects
 */
export async function GET(request: NextRequest) {
  try {
    // Try to authenticate (optional for GET)
    let userId: string | undefined;
    try {
      const user = await authenticate(request);
      userId = user.userId;
    } catch {
      // Not authenticated, will only show published projects
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = projectQuerySchema.parse(searchParams);

    const { projects, pagination } = await projectService.getProjects(query, userId);

    return successResponse(projects, pagination);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}

/**
 * POST /api/projects - Create a new project (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const project = await projectService.createProject(data, user.userId);

    return successResponse(project, undefined);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
