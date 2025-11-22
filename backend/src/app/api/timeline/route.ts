import { NextRequest } from 'next/server';
import { timelineService } from '@/services/timeline.service';
import { timelineQuerySchema } from '@/schemas/timeline.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = timelineQuerySchema.parse(searchParams);

    const { timeline, hasMore, total } = await timelineService.getTimeline(query);

    return successResponse({
      items: timeline,
      hasMore,
      total,
    });
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
