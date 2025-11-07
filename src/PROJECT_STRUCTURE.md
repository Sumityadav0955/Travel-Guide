# Project Structure

This document outlines the directory structure and organization of the Offbeat Travel App.

## Directory Structure

```
src/
├── components/           # React components organized by feature
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components
│   ├── location/        # Location-related components
│   ├── user/            # User-related components
│   ├── review/          # Review-related components
│   └── media/           # Media handling components
├── pages/               # Page components for routing
├── hooks/               # Custom React hooks
├── services/            # API services and external integrations
├── types/               # TypeScript type definitions
├── context/             # React context for state management
├── router/              # Routing configuration
└── assets/              # Static assets
```

## Key Files

- `types/index.ts` - Core TypeScript interfaces and types
- `context/AppContext.tsx` - Global application state management
- `router/index.tsx` - Route configuration and navigation
- `components/common/` - Reusable UI components
- `pages/` - Top-level page components

## Implementation Status

✅ **Completed:**
- Directory structure setup
- Core TypeScript interfaces (User, Location, Review, Photo)
- Basic routing structure (awaiting React Router installation)
- Component placeholders and organization
- Global state management setup
- Error boundary implementation

⏳ **Pending:**
- React Router installation and integration
- Component implementations (will be done in subsequent tasks)
- API service implementations
- Custom hook implementations

## Next Steps

1. Install React Router dependency
2. Implement authentication system (Task 2)
3. Build user profile components (Task 3)
4. Create location recommendation system (Task 4)

## Notes

- All components are currently placeholders and will be implemented in their respective tasks
- The routing structure is prepared but requires React Router installation
- TypeScript interfaces follow the design document specifications
- State management uses React Context with useReducer for scalability