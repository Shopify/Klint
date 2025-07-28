#!/bin/bash

# Script to update the create-editor template from the klint-editor working folder
# This reads files from the current folder and embeds them in the bash script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_SCRIPT="../packages/klint/bin/create-editor"

echo "Updating create-editor template from klint-editor..."

# Start building the script
cat > "$TARGET_SCRIPT" << 'HEADER'
#!/bin/bash

# Auto-generated create-editor script
# Generated from klint-editor working folder

PROJECT_DIR="${1:-.}"
PROJECT_NAME=$(basename "$PROJECT_DIR")

echo "Creating Klint editor in $PROJECT_DIR..."

# Create directory if it doesn't exist
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Create src directory
mkdir -p src

HEADER

# Add package.json
echo "# Create package.json" >> "$TARGET_SCRIPT"
echo "cat > package.json << EOF" >> "$TARGET_SCRIPT"
# Update package.json name dynamically and fix dependency
sed "s/\"name\": \"klint-playground\"/\"name\": \"\$PROJECT_NAME\"/" "$SCRIPT_DIR/package.json" | \
sed "s/\"@shopify\/klint\": \"file:..\/packages\/klint\"/\"@shopify\/klint\": \"latest\"/" >> "$TARGET_SCRIPT"
echo "EOF" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"

# Add vite.config.ts
echo "# Create vite.config.ts" >> "$TARGET_SCRIPT"
echo "cat > vite.config.ts << 'EOF'" >> "$TARGET_SCRIPT"
cat "$SCRIPT_DIR/vite.config.ts" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"
echo "EOF" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"

# Add tsconfig.json
echo "# Create tsconfig.json" >> "$TARGET_SCRIPT"
echo "cat > tsconfig.json << 'EOF'" >> "$TARGET_SCRIPT"
cat "$SCRIPT_DIR/tsconfig.json" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"
echo "EOF" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"

# Add tsconfig.node.json
echo "# Create tsconfig.node.json" >> "$TARGET_SCRIPT"
echo "cat > tsconfig.node.json << 'EOF'" >> "$TARGET_SCRIPT"
cat "$SCRIPT_DIR/tsconfig.node.json" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"
echo "EOF" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"

# Add index.html
echo "# Create index.html" >> "$TARGET_SCRIPT"
echo "cat > index.html << 'EOF'" >> "$TARGET_SCRIPT"
cat "$SCRIPT_DIR/index.html" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"
echo "EOF" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"

# Add src/main.tsx
echo "# Create src/main.tsx" >> "$TARGET_SCRIPT"
echo "cat > src/main.tsx << 'EOF'" >> "$TARGET_SCRIPT"
cat "$SCRIPT_DIR/src/main.tsx" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"
echo "EOF" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"

# Add src/App.tsx
echo "# Create src/App.tsx" >> "$TARGET_SCRIPT"
echo "cat > src/App.tsx << 'EOF'" >> "$TARGET_SCRIPT"
cat "$SCRIPT_DIR/src/App.tsx" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"
echo "EOF" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"

# Add .gitignore
echo "# Create .gitignore" >> "$TARGET_SCRIPT"
echo "cat > .gitignore << 'EOF'" >> "$TARGET_SCRIPT"
echo "node_modules" >> "$TARGET_SCRIPT"
echo "dist" >> "$TARGET_SCRIPT"
echo ".env" >> "$TARGET_SCRIPT"
echo "EOF" >> "$TARGET_SCRIPT"
echo "" >> "$TARGET_SCRIPT"

# Add completion message
cat >> "$TARGET_SCRIPT" << 'FOOTER'

echo "✅ Klint editor created successfully!"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_DIR"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "The editor will be available at http://localhost:5173"
FOOTER

# Make the script executable
chmod +x "$TARGET_SCRIPT"

echo "✅ Template updated successfully!"
echo "Updated: $TARGET_SCRIPT"