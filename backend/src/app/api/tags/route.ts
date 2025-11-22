import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { tagService } from '@/services/tag.service';
import { createTagSchema, tagQuerySchema } from '@/schemas/tag.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = tagQuerySchema.parse(searchParams);

    const tags = await tagService.getTags(query);

    return successResponse(tags);
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
    const data = createTagSchema.parse(body);

    const tag = await tagService.createTag(data);

    return successResponse(tag);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
