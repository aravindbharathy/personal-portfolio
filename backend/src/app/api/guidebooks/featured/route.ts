import { NextRequest } from 'next/server';
import { guidebookService } from '@/services/guidebook.service';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const guidebooks = await guidebookService.getFeaturedGuidebooks();
    return successResponse(guidebooks);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
