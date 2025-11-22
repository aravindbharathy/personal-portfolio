import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changethispassword';

  const hashedPassword = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create tags
  const tags = await Promise.all([
    // Research Methods
    prisma.tag.upsert({
      where: { slug: 'usability-testing' },
      update: {},
      create: {
        name: 'Usability Testing',
        slug: 'usability-testing',
        category: 'RESEARCH_METHOD',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'user-interviews' },
      update: {},
      create: {
        name: 'User Interviews',
        slug: 'user-interviews',
        category: 'RESEARCH_METHOD',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'surveys' },
      update: {},
      create: {
        name: 'Surveys',
        slug: 'surveys',
        category: 'RESEARCH_METHOD',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'journey-mapping' },
      update: {},
      create: {
        name: 'Journey Mapping',
        slug: 'journey-mapping',
        category: 'RESEARCH_METHOD',
      },
    }),
    // Industries
    prisma.tag.upsert({
      where: { slug: 'ecommerce' },
      update: {},
      create: {
        name: 'E-commerce',
        slug: 'ecommerce',
        category: 'INDUSTRY',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'healthcare' },
      update: {},
      create: {
        name: 'Healthcare',
        slug: 'healthcare',
        category: 'INDUSTRY',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'fintech' },
      update: {},
      create: {
        name: 'FinTech',
        slug: 'fintech',
        category: 'INDUSTRY',
      },
    }),
    // Topics
    prisma.tag.upsert({
      where: { slug: 'accessibility' },
      update: {},
      create: {
        name: 'Accessibility',
        slug: 'accessibility',
        category: 'TOPIC',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'user-research' },
      update: {},
      create: {
        name: 'User Research',
        slug: 'user-research',
        category: 'TOPIC',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'ux-design' },
      update: {},
      create: {
        name: 'UX Design',
        slug: 'ux-design',
        category: 'TOPIC',
      },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create sample project
  const project = await prisma.project.create({
    data: {
      title: 'E-commerce Checkout Optimization',
      slug: 'ecommerce-checkout-optimization',
      overview: 'Conducted comprehensive user research to identify and address pain points in the checkout process, resulting in a 35% reduction in cart abandonment.',
      objectives: `## Research Objectives

1. Identify friction points in the checkout flow
2. Understand user expectations and mental models
3. Evaluate current vs. competitor checkout experiences
4. Provide actionable recommendations for improvement`,
      methodology: `## Research Approach

We employed a mixed-methods approach combining:

- **Usability Testing**: 20 moderated sessions with existing and potential customers
- **User Interviews**: 15 in-depth interviews to understand shopping behaviors
- **Analytics Analysis**: 3 months of checkout funnel data review
- **Competitor Analysis**: Evaluation of 5 leading e-commerce platforms`,
      findings: `## Key Findings

1. **Guest Checkout Friction**: 60% of users abandoned when forced to create an account
2. **Form Complexity**: Average 8.5 minutes to complete checkout (industry standard: 4-5 min)
3. **Trust Indicators**: Missing security badges caused hesitation in 45% of sessions
4. **Mobile Experience**: 70% higher abandonment rate on mobile vs. desktop
5. **Shipping Clarity**: Unclear shipping costs discovered at final step frustrated users`,
      impact: `## Business Impact

- **35% reduction** in cart abandonment rate
- **18% increase** in conversion rate
- **$2.4M additional revenue** in first quarter post-implementation
- **42% improvement** in mobile checkout completion
- **Net Promoter Score** increased from 32 to 51`,
      timeframe: '3 months',
      role: 'Lead User Researcher',
      researchType: 'EVALUATIVE',
      industry: 'E-commerce',
      methodsUsed: ['Usability Testing', 'User Interviews', 'Analytics Analysis', 'Competitor Analysis'],
      featured: true,
      published: true,
      authorId: admin.id,
    },
  });

  console.log('✅ Created sample project:', project.title);

  // Link tags to project
  await prisma.projectTag.createMany({
    data: [
      { projectId: project.id, tagId: tags[0].id }, // Usability Testing
      { projectId: project.id, tagId: tags[4].id }, // E-commerce
      { projectId: project.id, tagId: tags[8].id }, // User Research
    ],
  });

  // Add to timeline
  await prisma.contentTimeline.create({
    data: {
      contentType: 'PROJECT',
      contentId: project.id,
      title: project.title,
      excerpt: project.overview,
      date: project.createdAt,
      url: `/projects/${project.slug}`,
      tags: ['Usability Testing', 'E-commerce', 'User Research'],
    },
  });

  console.log('✅ Added project to timeline');

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Admin credentials:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('\n⚠️  Please change the admin password after first login!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
