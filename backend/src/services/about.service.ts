import { prisma } from '@/lib/prisma';
import { UpdateAboutInput } from '@/schemas/about.schema';

export class AboutService {
  async getAbout() {
    // Get the first (and should be only) About record
    const about = await prisma.about.findFirst();

    // If no record exists, return null
    if (!about) {
      return null;
    }

    return about;
  }

  async updateAbout(data: UpdateAboutInput) {
    // Check if an About record exists
    const existing = await prisma.about.findFirst();

    if (existing) {
      // Update existing record
      return await prisma.about.update({
        where: { id: existing.id },
        data,
      });
    } else {
      // Create new record
      return await prisma.about.create({
        data,
      });
    }
  }
}

export const aboutService = new AboutService();
