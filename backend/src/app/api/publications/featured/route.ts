import { NextRequest } from 'next/server';
import { publicationService } from '@/services/publication.service';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const publications = await publicationService.getFeaturedPublications();
    return successResponse(publications);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
