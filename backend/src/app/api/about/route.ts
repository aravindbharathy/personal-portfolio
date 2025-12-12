import { NextRequest, NextResponse } from 'next/server';
import { aboutService } from '@/services/about.service';
import { updateAboutSchema } from '@/schemas/about.schema';
import { authenticate } from '@/middleware/auth.middleware';

export async function GET() {
  try {
    const about = await aboutService.getAbout();

    if (!about) {
      return NextResponse.json(
        { success: false, error: 'About information not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: about,
    });
  } catch (error) {
    console.error('Error fetching about:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch about information' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate request - will throw if unauthorized
    await authenticate(request);

    const body = await request.json();
    const validatedData = updateAboutSchema.parse(body);

    const about = await aboutService.updateAbout(validatedData);

    return NextResponse.json({
      success: true,
      data: about,
    });
  } catch (error: any) {
    console.error('Error updating about:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update about information' },
      { status: 500 }
    );
  }
}
