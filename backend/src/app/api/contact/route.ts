import { NextRequest } from 'next/server';
import { contactRateLimit } from '@/middleware/rate-limit';
import { emailService } from '@/services/email.service';
import { contactSchema } from '@/schemas/contact.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    contactRateLimit(request);

    const body = await request.json();
    const data = contactSchema.parse(body);

    await emailService.sendContactEmail(data);

    return successResponse({
      message: 'Message sent successfully. We will get back to you soon!',
    });
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
