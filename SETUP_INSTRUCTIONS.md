# Setup Instructions

## Required Dependencies

To complete the routing setup, you need to install React Router:

```bash
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

## PowerShell Execution Policy

If you encounter PowerShell execution policy errors, you can:

1. **Temporary solution (current session only):**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Alternative: Use Command Prompt instead:**
   ```cmd
   npm install react-router-dom
   npm install --save-dev @types/react-router-dom
   ```

3. **Use yarn if available:**
   ```bash
   yarn add react-router-dom
   yarn add --dev @types/react-router-dom
   ```

## After Installing Dependencies

Once React Router is installed, the routing system will be fully functional. The current setup includes:

- ✅ Route configuration in `src/router/index.tsx`
- ✅ Page components in `src/pages/`
- ✅ Layout structure ready for navigation
- ⏳ Router integration (pending dependency installation)

## Verification

After installing dependencies, you can verify the setup works by running:

```bash
npm run dev
```

The application should start without TypeScript errors and display the home page.