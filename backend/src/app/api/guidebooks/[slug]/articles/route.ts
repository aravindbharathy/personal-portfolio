import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { guidebookService } from '@/services/guidebook.service';
import { addArticleToGuidebookSchema } from '@/schemas/guidebook.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    const existingGuidebook = await guidebookService.getGuidebookBySlug(params.slug);

    const body = await request.json();
    const data = addArticleToGuidebookSchema.parse(body);

    const article = await guidebookService.addArticleToGuidebook(existingGuidebook.id, data);

    return successResponse(article);
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
