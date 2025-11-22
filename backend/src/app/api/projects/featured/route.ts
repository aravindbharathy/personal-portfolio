import { NextRequest } from 'next/server';
import { projectService } from '@/services/project.service';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

/**
 * GET /api/projects/featured - Get featured projects
 */
export async function GET(request: NextRequest) {
  try {
    const projects = await projectService.getFeaturedProjects();
    return successResponse(projects);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
