import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { publicationService } from '@/services/publication.service';
import { createPublicationSchema, publicationQuerySchema } from '@/schemas/publication.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = publicationQuerySchema.parse(searchParams);

    const { publications, pagination } = await publicationService.getPublications(query);

    return successResponse(publications, pagination);
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
    const data = createPublicationSchema.parse(body);

    const publication = await publicationService.createPublication(data, user.userId);

    return successResponse(publication);
  } catch (error) {
    const { message, statusCode, code, details} = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
