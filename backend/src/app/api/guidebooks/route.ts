import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { guidebookService } from '@/services/guidebook.service';
import { createGuidebookSchema, guidebookQuerySchema } from '@/schemas/guidebook.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = guidebookQuerySchema.parse(searchParams);

    const { guidebooks, pagination } = await guidebookService.getGuidebooks(query);

    return successResponse(guidebooks, pagination);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    const body = await request.json();
    const data = createGuidebookSchema.parse(body);

    const guidebook = await guidebookService.createGuidebook(data, user.userId);

    return successResponse(guidebook);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
