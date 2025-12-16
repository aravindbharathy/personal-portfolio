# Contributing to Portfolio Template

Thank you for considering contributing to this portfolio template! We welcome contributions from everyone.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, browser)

### Suggesting Features

Feature requests are welcome! Please create an issue with:
- Clear description of the feature
- Use cases and benefits
- Potential implementation approach (optional)

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend && npm test

   # Frontend tests
   cd frontend && npm test

   # Type checking
   npm run type-check
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing new feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Add screenshots for UI changes

## 📝 Code Style

### TypeScript/JavaScript

- Use TypeScript for all new files
- Follow existing naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for components and types
  - `UPPER_SNAKE_CASE` for constants
- Use meaningful variable names
- Keep functions small and focused

### React Components

```typescript
// Good
export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <div className="project-card">
      {/* Component content */}
    </div>
  );
};

// Bad
export function comp(p) {
  return <div>{p.data}</div>;
}
```

### Backend Services

```typescript
// Good
export class ProjectService {
  async getProjects(query: ProjectQueryInput) {
    // Clear, focused method
  }
}

// Bad
export function getStuff(q) {
  // Vague, unclear purpose
}
```

## 🧪 Testing

- Write tests for new features
- Maintain or improve test coverage
- Test edge cases and error conditions
- Run the full test suite before submitting PR

## 📚 Documentation

When adding features:

1. **Update README.md** if it affects setup or usage
2. **Add/update feature docs** in `Docs/02-what/features/`
3. **Document implementation** in `Docs/03-how/implementation/`
4. **Update API docs** if adding/changing endpoints
5. **Add code comments** for complex logic

## 🎨 UI/UX Guidelines

- Follow mobile-first approach
- Maintain consistent spacing and typography
- Use existing Shadcn/UI components when possible
- Test on multiple screen sizes
- Ensure accessibility (ARIA labels, keyboard navigation)

## 🔒 Security

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Validate all user inputs
- Follow OWASP security best practices
- Report security vulnerabilities privately

## 🚀 Development Workflow

1. Pull latest changes from main
2. Create feature branch
3. Make changes locally
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Create Pull Request
8. Respond to review feedback
9. Celebrate when merged! 🎉

## ❓ Questions?

- Check the [Documentation](./Docs/README.md)
- Search existing [Issues](https://github.com/yourusername/portfolio/issues)
- Start a [Discussion](https://github.com/yourusername/portfolio/discussions)

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## 🙏 Thank You!

Every contribution, no matter how small, helps make this template better for everyone. Thank you for being part of the community!
