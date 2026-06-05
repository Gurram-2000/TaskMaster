# Contributing to TaskMaster

Thank you for your interest in contributing to TaskMaster! This guide will help you get started with development.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Report issues responsibly

## Getting Started

### 1. Fork & Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/TaskMaster.git
cd TaskMaster

# Add upstream remote
git remote add upstream https://github.com/Gurram-2000/TaskMaster.git
```

### 2. Setup Development Environment

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

### 3. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or for bugs
git checkout -b fix/bug-description
```

## Development Workflow

### Code Style

- Use ESLint: `npm run lint`
- Fix issues: `npm run lint:fix`
- Follow existing code patterns
- Use const/let, not var
- Add JSDoc comments for functions

### Testing

Write tests for new features:

```bash
npm test
npm run test:watch  # Watch mode
```

Test file location: `tests/feature-name.test.js`

### Before Commit

```bash
# Lint your code
npm run lint:fix

# Run tests
npm test

# Check for console errors
node src/server.js  # Verify no errors
```

## Commit Guidelines

### Message Format

```
type(scope): subject

body

footer
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Dependency updates

### Examples

```
feat(tasks): add task filtering by due date

Add ability to filter tasks by due date range
for better task management.

Closes #123
```

```
fix(auth): prevent token leaking in logs

Remove JWT token from error logs and
implement secure error messages.
```

## Pull Request Process

### 1. Keep Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 2. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

On GitHub:
- Describe your changes clearly
- Link related issues
- Add screenshots if UI changes
- Ensure CI checks pass

### 4. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Code refactoring

## Testing Done
Describe testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

## Adding Features

### 1. Model Changes

```javascript
// src/models/YourModel.js
const schema = new mongoose.Schema({
  field: {
    type: String,
    required: [true, 'Message'],
    validate: { /* ... */ }
  }
});
```

### 2. Controller Logic

```javascript
// src/controllers/yourController.js
exports.yourFunction = [
  // Validation
  body('field').notEmpty(),
  
  // Handler
  async (req, res) => {
    try {
      // Logic here
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
```

### 3. Routes

```javascript
// src/routes/yourRoutes.js
router.post('/', authenticate, yourController.yourFunction);
```

## API Changes

### Adding New Endpoint

1. Create controller function with validation
2. Add route handler
3. Add to appropriate routes file
4. Update README.md with:
   - Endpoint description
   - Request/response examples
   - Error scenarios
5. Add API testing guide example

### Modifying Existing Endpoint

1. Update controller logic
2. Update validation if needed
3. Update documentation
4. Add migration guide if breaking change
5. Update API testing guide

## Documentation

### Update README.md for:
- New endpoints
- New parameters
- Changed behavior
- New features

### Update API_TESTING_GUIDE.md for:
- New test scenarios
- New cURL examples
- New error cases

### Update DEPLOYMENT_GUIDE.md for:
- New environment variables
- New dependencies
- Configuration changes

## Database Changes

### Adding Fields to Model

```javascript
// Add to schema
yourField: {
  type: String,
  default: null
}

// No migration needed - MongoDB is flexible
// But document the change
```

### Removing Fields

```javascript
// Keep field for backward compatibility
// Or create migration script for production
```

## Performance Guidelines

### Query Optimization

- Use `.select()` to limit fields
- Use `.lean()` for read-only data
- Add indexes for frequently queried fields
- Avoid N+1 queries
- Use aggregation for complex queries

### Example

```javascript
// Bad: N+1 queries
const tasks = await Task.find();
for (let task of tasks) {
  const user = await User.findById(task.createdBy);
}

// Good: Single query with population
const tasks = await Task.find()
  .populate('createdBy', 'username email');
```

## Security Checklist

Before submitting PR:

- [ ] Input validation on all inputs
- [ ] Output sanitization
- [ ] No sensitive data in logs
- [ ] Password hashing for new auth
- [ ] Permission checks for protected operations
- [ ] CORS headers considered
- [ ] SQL injection prevention (N/A for MongoDB)
- [ ] No hardcoded secrets
- [ ] Secure error messages

## Testing Requirements

### What to Test

- Happy path (normal operation)
- Error cases
- Edge cases
- Permission checks
- Input validation
- Database operations
- API responses

### Test Structure

```javascript
describe('Feature Name', () => {
  describe('Successful scenario', () => {
    it('should do something', () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe('Error scenario', () => {
    it('should handle error', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Bug Reporting

### Create Issue with:

1. **Title**: Clear, concise description
2. **Description**: 
   - What you expected
   - What actually happened
   - Steps to reproduce
3. **Environment**:
   - OS and Node version
   - MongoDB version
   - Browser (if relevant)
4. **Logs**: Error messages and stack traces
5. **Screenshots**: If UI related

## Questions?

- Check existing issues/PRs
- Read documentation files
- Ask in pull request comments
- Open a discussion issue

## Helpful Resources

- [Express.js Docs](https://expressjs.com)
- [Mongoose Docs](https://mongoosejs.com)
- [JWT Introduction](https://jwt.io/introduction)
- [REST API Best Practices](https://restfulapi.net)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Code Review Process

### Your PR will be reviewed for:

1. **Functionality**: Does it work as intended?
2. **Code Quality**: Is it clean and maintainable?
3. **Security**: Are there security vulnerabilities?
4. **Performance**: Could it be optimized?
5. **Testing**: Are tests adequate?
6. **Documentation**: Is it well documented?
7. **Consistency**: Does it follow project patterns?

### Review Comments

- `MUST`: Required change before merge
- `SHOULD`: Recommended improvement
- `NICE_TO_HAVE`: Optional enhancement
- `QUESTION`: Clarification needed

## After Merge

- Your contribution is live!
- Follow up on any issues reported
- Be available for questions
- Consider adding related improvements

## Development Tips

### Debugging

```javascript
// Debug specific requests
console.log('Request:', req.body);
console.log('User:', req.user);

// Or use Node debugger
node --inspect src/server.js
```

### Database Debugging

```javascript
// Check database directly
// Use MongoDB Compass or CLI
mongo taskmaster
```

### Common Issues

**Issue**: Port already in use
```bash
# Find process on port 5000
lsof -ti:5000 | xargs kill
```

**Issue**: Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Database not connecting
```bash
# Check MongoDB is running
# Verify MONGODB_URI in .env
# Check network connectivity
```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to main branch
5. GitHub releases page auto-updates

---

## Thank You! 🎉

Your contributions make TaskMaster better for everyone. Happy coding!

---

**Questions?** Open an issue or discussion on GitHub.
**Need Help?** Check the README.md and documentation files.
