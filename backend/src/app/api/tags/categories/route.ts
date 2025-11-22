import { NextRequest } from 'next/server';
import { tagService } from '@/services/tag.service';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const tagsByCategory = await tagService.getTagsByCategory();
    return successResponse(tagsByCategory);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
