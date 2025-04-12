# Klint

A modern creative coding library

## Release Process

This package uses GitHub Actions for automated releases. Here's how to create a new release:

1. Make your changes and commit them to the repository
2. Update the version in package.json:
   ```bash
   cd lib
   yarn version --new-version [patch|minor|major]
   ```
   This will:
   - Update the version in package.json
   - Create a git commit with the new version
   - Create a git tag with the new version (e.g., v1.0.0)

3. Push the changes and the tag:
   ```bash
   git push && git push --tags
   ```

4. The GitHub Action will automatically:
   - Run tests
   - Build the package
   - Publish to npm
   - Create a GitHub release with auto-generated release notes

## Required Secrets

The workflow requires an NPM_TOKEN secret to be set in the GitHub repository:

1. Create an npm access token with publish permissions
2. Add it as a secret named NPM_TOKEN in your GitHub repository settings