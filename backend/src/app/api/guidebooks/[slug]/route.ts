import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { guidebookService } from '@/services/guidebook.service';
import { updateGuidebookSchema } from '@/schemas/guidebook.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const guidebook = await guidebookService.getGuidebookBySlug(params.slug);
    return successResponse(guidebook);
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

    const existingGuidebook = await guidebookService.getGuidebookBySlug(params.slug);

    const body = await request.json();
    const data = updateGuidebookSchema.parse(body);

    const guidebook = await guidebookService.updateGuidebook(existingGuidebook.id, data);

    return successResponse(guidebook);
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

    const existingGuidebook = await guidebookService.getGuidebookBySlug(params.slug);

    await guidebookService.deleteGuidebook(existingGuidebook.id);

    return successResponse({ message: 'Guidebook deleted successfully' });
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
