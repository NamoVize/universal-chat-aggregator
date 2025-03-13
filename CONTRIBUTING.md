# Contributing to Universal Chat Aggregator

Thank you for your interest in contributing to the Universal Chat Aggregator project! We welcome contributions from everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment information (OS, app version, etc.)

### Suggesting Features

We welcome feature suggestions! To suggest a feature:

- Create an issue with "Feature request:" at the beginning of the title
- Clearly describe the feature and why it would be valuable
- If possible, outline how the feature might be implemented

### Code Contributions

To contribute code:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Write your code, following the code style of the project
4. Add tests for your changes if applicable
5. Ensure all tests pass
6. Submit a pull request

### Pull Request Process

1. Update the README.md if needed with details of your changes
2. Make sure your code follows our coding standards
3. Your pull request will be reviewed by maintainers
4. Feedback may be given for changes needed
5. Once approved, your changes will be merged

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/NamoVize/universal-chat-aggregator.git
   cd universal-chat-aggregator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development environment:
   ```
   npm run dev
   ```

## Code Style

- Use consistent indentation (2 spaces)
- Follow React best practices
- Write clear, descriptive comments
- Use meaningful variable and function names
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test on multiple platforms if possible

## Platform Integration Guidelines

When integrating a new messaging platform:

1. Create a new directory under `src/platforms` with the platform name
2. Implement the platform service following the existing patterns
3. Update the store to include the new platform
4. Add appropriate UI elements for the platform

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License.

## Questions?

If you have any questions, feel free to create an issue or contact the project maintainers directly.

Thank you for contributing to Universal Chat Aggregator!