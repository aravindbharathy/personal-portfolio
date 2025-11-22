import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { publicationService } from '@/services/publication.service';
import { updatePublicationSchema } from '@/schemas/publication.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const publication = await publicationService.getPublicationBySlug(params.slug);
    return successResponse(publication);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    const existingPublication = await publicationService.getPublicationBySlug(params.slug);

    const body = await request.json();
    const data = updatePublicationSchema.parse(body);

    const publication = await publicationService.updatePublication(existingPublication.id, data);

    return successResponse(publication);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    const existingPublication = await publicationService.getPublicationBySlug(params.slug);

    await publicationService.deletePublication(existingPublication.id);

    return successResponse({ message: 'Publication deleted successfully' });
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
