import { prisma } from '@/lib/prisma';
import { slugify, generateUniqueSlug } from '@/lib/slugify';
import { NotFoundError, ConflictError } from '@/utils/error-handler';
import { calculatePagination, generatePaginationMeta } from '@/utils/pagination';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
} from '@/schemas/project.schema';
import type { Prisma } from '@prisma/client';

export class ProjectService {
  /**
   * Get all projects with filtering and pagination
   */
  async getProjects(query: ProjectQueryInput, userId?: string) {
    const { page = 1, limit = 20, researchType, industry, tag, featured, sort = 'createdAt', order = 'desc' } = query;
    const { skip, take } = calculatePagination({ page, limit });

    // Build where clause
    const where: Prisma.ProjectWhereInput = {
      published: userId ? undefined : true, // Show all if authenticated, only published if not
      ...(researchType && { researchType }),
      ...(industry && { industry }),
      ...(featured !== undefined && { featured }),
      ...(tag && {
        tags: {
          some: {
            tag: {
              slug: tag,
            },
          },
        },
      }),
    };

    // Execute queries
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          images: {
            orderBy: { order: 'asc' },
          },
          pictureGrids: {
            include: {
              pictures: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { [sort]: order },
        skip,
        take,
      }),
      prisma.project.count({ where }),
    ]);

    const pagination = generatePaginationMeta(page, limit, total);

    return { projects, pagination };
  }

  /**
   * Get featured projects
   */
  async getFeaturedProjects() {
    return prisma.project.findMany({
      where: {
        published: true,
        featured: true,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
          take: 1, // Just the first image for featured display
        },
        pictureGrids: {
          include: {
            pictures: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  }

  /**
   * Get a single project by slug
   */
  async getProjectBySlug(slug: string) {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        pictureGrids: {
          include: {
            pictures: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    return project;
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectInput, authorId: string) {
    const { tagIds, images, pictureGrids, ...projectData } = data;

    // Generate unique slug
    const baseSlug = slugify(data.title);
    const existingProjects = await prisma.project.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: { slug: true },
    });
    const slug = generateUniqueSlug(
      baseSlug,
      existingProjects.map((p) => p.slug)
    );

    // Create project with tags and images in a transaction
    const project = await prisma.$transaction(async (tx) => {
      // Create project
      const newProject = await tx.project.create({
        data: {
          ...projectData,
          slug,
          authorId,
          methodsUsed: projectData.methodsUsed,
        },
      });

      // Create tags associations
      if (tagIds && tagIds.length > 0) {
        await tx.projectTag.createMany({
          data: tagIds.map((tagId) => ({
            projectId: newProject.id,
            tagId,
          })),
        });
      }

      // Create images
      if (images && images.length > 0) {
        await tx.projectImage.createMany({
          data: images.map((img) => ({
            projectId: newProject.id,
            ...img,
          })),
        });
      }

      // Create picture grids with their pictures
      if (pictureGrids && pictureGrids.length > 0) {
        for (const grid of pictureGrids) {
          const { pictures, ...gridData } = grid;

          // Create the grid
          const createdGrid = await tx.projectPictureGrid.create({
            data: {
              projectId: newProject.id,
              ...gridData,
            },
          });

          // Create the pictures for this grid
          if (pictures && pictures.length > 0) {
            await tx.projectGridPicture.createMany({
              data: pictures.map((pic) => ({
                gridId: createdGrid.id,
                ...pic,
              })),
            });
          }
        }
      }

      // If published, add to timeline
      if (newProject.published) {
        const tags = await tx.tag.findMany({
          where: {
            projects: {
              some: {
                projectId: newProject.id,
              },
            },
          },
        });

        await tx.contentTimeline.create({
          data: {
            contentType: 'PROJECT',
            contentId: newProject.id,
            title: newProject.title,
            excerpt: newProject.overview,
            date: newProject.publishedAt || newProject.createdAt,
            url: `/projects/${newProject.slug}`,
            tags: tags.map((t) => t.name),
          },
        });
      }

      return newProject;
    });

    // Return with relations
    return this.getProjectBySlug(project.slug);
  }

  /**
   * Update a project
   */
  async updateProject(id: string, data: UpdateProjectInput) {
    const { tagIds, images, pictureGrids, ...projectData } = data;

    // If title is being updated, regenerate slug
    let slug: string | undefined;
    if (data.title) {
      const baseSlug = slugify(data.title);
      const existingProjects = await prisma.project.findMany({
        where: {
          slug: {
            startsWith: baseSlug,
          },
          NOT: {
            id,
          },
        },
        select: { slug: true },
      });
      slug = generateUniqueSlug(
        baseSlug,
        existingProjects.map((p) => p.slug)
      );
    }

    const project = await prisma.$transaction(async (tx) => {
      // Update project
      const updated = await tx.project.update({
        where: { id },
        data: {
          ...projectData,
          ...(slug && { slug }),
        },
      });

      // Update tags if provided
      if (tagIds !== undefined) {
        // Delete existing tags
        await tx.projectTag.deleteMany({
          where: { projectId: id },
        });

        // Create new tags
        if (tagIds.length > 0) {
          await tx.projectTag.createMany({
            data: tagIds.map((tagId) => ({
              projectId: id,
              tagId,
            })),
          });
        }
      }

      // Update images if provided
      if (images !== undefined) {
        // Delete existing images
        await tx.projectImage.deleteMany({
          where: { projectId: id },
        });

        // Create new images
        if (images.length > 0) {
          await tx.projectImage.createMany({
            data: images.map((img) => ({
              projectId: id,
              ...img,
            })),
          });
        }
      }

      // Update picture grids if provided
      if (pictureGrids !== undefined) {
        // Delete existing picture grids (cascades to pictures)
        await tx.projectPictureGrid.deleteMany({
          where: { projectId: id },
        });

        // Create new picture grids with their pictures
        if (pictureGrids.length > 0) {
          for (const grid of pictureGrids) {
            const { pictures, ...gridData } = grid;

            // Create the grid
            const createdGrid = await tx.projectPictureGrid.create({
              data: {
                projectId: id,
                ...gridData,
              },
            });

            // Create the pictures for this grid
            if (pictures && pictures.length > 0) {
              await tx.projectGridPicture.createMany({
                data: pictures.map((pic) => ({
                  gridId: createdGrid.id,
                  ...pic,
                })),
              });
            }
          }
        }
      }

      // Update timeline if exists
      await tx.contentTimeline.updateMany({
        where: {
          contentType: 'PROJECT',
          contentId: id,
        },
        data: {
          title: updated.title,
          excerpt: updated.overview,
          url: `/projects/${updated.slug}`,
          date: updated.publishedAt || updated.createdAt,
        },
      });

      return updated;
    });

    return this.getProjectBySlug(project.slug);
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string) {
    await prisma.$transaction(async (tx) => {
      // Delete from timeline
      await tx.contentTimeline.deleteMany({
        where: {
          contentType: 'PROJECT',
          contentId: id,
        },
      });

      // Delete project (cascades to tags and images)
      await tx.project.delete({
        where: { id },
      });
    });
  }

  /**
   * Toggle publish status
   */
  async togglePublish(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    const newPublishStatus = !project.published;

    await prisma.$transaction(async (tx) => {
      // Update project
      await tx.project.update({
        where: { id },
        data: { published: newPublishStatus },
      });

      // Add to or remove from timeline
      if (newPublishStatus) {
        await tx.contentTimeline.create({
          data: {
            contentType: 'PROJECT',
            contentId: id,
            title: project.title,
            excerpt: project.overview,
            date: new Date(),
            url: `/projects/${project.slug}`,
            tags: project.tags.map((t) => t.tag.name),
          },
        });
      } else {
        await tx.contentTimeline.deleteMany({
          where: {
            contentType: 'PROJECT',
            contentId: id,
          },
        });
      }
    });

    return { published: newPublishStatus };
  }
}

export const projectService = new ProjectService();
