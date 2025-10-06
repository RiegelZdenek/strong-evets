# Publishing Guide

## Pre-publish Checklist

- [x] ✅ All tests passing
- [x] ✅ TypeScript compiles without errors
- [x] ✅ README.md is comprehensive
- [x] ✅ Examples are working
- [x] ✅ JSDoc documentation is complete
- [x] ✅ Package.json is properly configured
- [x] ✅ License file exists
- [x] ✅ .gitignore is set up

## Publishing Steps

1. **Verify everything works:**
   ```bash
   npm run build
   npm test
   ```

2. **Create git repository (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Safe Events v1.0.0"
   ```

3. **Publish to npm:**
   ```bash
   npm login
   npm publish
   ```

4. **Create GitHub repository:**
   - Go to GitHub and create a new repository named `safe-events`
   - Push your local repository:
   ```bash
   git remote add origin https://github.com/RiegelZdenek/safe-events.git
   git branch -M main
   git push -u origin main
   ```

5. **Create a release:**
   - Go to GitHub releases
   - Create a new release with tag `v1.0.0`
   - Copy changelog content to release notes

## Post-publish

1. **Update badges in README** with actual npm package info
2. **Consider setting up:**
   - GitHub Actions for CI/CD
   - CodeCov for coverage reporting
   - Dependabot for dependency updates

## Future Versions

When updating:
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run tests and build
4. Commit changes
5. Create git tag: `git tag v1.x.x`
6. Push with tags: `git push --tags`
7. `npm publish`

Good luck! 🚀