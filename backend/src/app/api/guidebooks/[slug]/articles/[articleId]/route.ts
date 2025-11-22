import { NextRequest } from 'next/server';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';
import { guidebookService } from '@/services/guidebook.service';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; articleId: string } }
) {
  try {
    const user = await authenticate(request);
    requireAdmin(user);

    await guidebookService.removeArticleFromGuidebook(params.articleId);

    return successResponse({ message: 'Article removed successfully' });
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
