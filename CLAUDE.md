# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production 
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Deployment
- `npm run deploy:vercel` - Deploy to Vercel production
- `npm run deploy:vercel:preview` - Deploy to Vercel preview

### Maintenance
- `npm run clean` - Clean node_modules and reinstall
- `npm run dev:clean` - Start dev server with cache cleared

## Architecture Overview

NebulaZone is a React marketplace application with real-time features built on Vite. The application supports:

### Core Features
- **Product Marketplace**: Direct sales and auction listings
- **Real-time Chat**: WebSocket-based messaging between buyers/sellers
- **Social Posts**: Community posts with comments
- **Payment Integration**: Toss Payments for transactions
- **OAuth Authentication**: Kakao and Naver social login

### Key Technologies
- **Frontend**: React 19, React Router 7, Vite
- **Real-time**: STOMP over WebSocket, custom WebSocketManager
- **HTTP Client**: Axios with JWT interceptors
- **Payments**: Toss Payments SDK
- **Analytics**: Vercel Analytics

## Project Structure

### Core Application Files
- `src/App.jsx` - Main app with routing and WebSocket provider setup
- `src/main.jsx` - Entry point
- `src/services/api.js` - Legacy centralized API client (being phased out)
- `src/services/api/` - Modular API services organized by domain

### Modular Component Architecture

The codebase follows a well-organized component structure:

#### Component Organization
- `src/components/chat/` - Chat-related components (ChatHistory, ChatInput, ChatRoomListItem)
- `src/components/common/` - Reusable common components (ErrorBoundary, LoadingSpinner, etc.)
- `src/components/forms/` - Form-related components (PostForm, CommentForm, etc.)
- `src/components/layout/` - Layout components (HeaderNav, PageContainer)
- `src/components/product/` - Product-related components and specialized sub-modules
- `src/components/product/create/` - Multi-step product creation components
- `src/components/profile/` - User profile management components
- `src/components/transaction/` - Transaction-related components  
- `src/components/ui/` - Basic UI components (Button, Pagination, Toast, etc.)

#### Services Architecture
- `src/services/api/` - Domain-specific API modules (auth.js, products.js, chat.js, etc.)
- `src/services/managers/` - Service managers (JwtManager for authentication)
- `src/services/websocket/` - WebSocket connection management

#### Utilities & Helpers
- `src/utils/auth/` - Authentication utilities
- `src/utils/error/` - Error handling utilities
- `src/utils/formatting/` - Data formatting utilities

### Architecture Patterns

#### Authentication & State Management
- **JwtManager** (`src/services/managers/JwtManager.js`) - Centralized JWT token management with event system
- **Context Providers** - NotificationContext, ToastContext for global state
- **PrivateRoute** component for route protection

#### Real-time Features
- **WebSocketManager** (`src/services/websocket/WebSocketManager.js`) - Singleton WebSocket connection manager
- **useWebSocket** hook - WebSocket connection lifecycle
- **useChat** hook - Chat room subscription and messaging
- **useNotification** hook - User notification management

#### Error Handling
- **ErrorBoundary** component catches React errors
- **ErrorHandler** utility for centralized error processing
- **Toast system** for user notifications

#### Complex Page Componentization
Large pages are broken down into smaller, focused components:
- **ProductCreatePage** uses CategorySelector, ProductSelector, ProductForm, StepIndicator
- **MyPage** uses ProfileHeader, ProfileInfoEditor, PasswordEditor, AddressEditor, AccountSettings

### Page Structure
```
/                    - LandingPage
/products/direct     - Direct sale products
/products/auction    - Auction products  
/products/create     - Product creation (authenticated)
/posts              - Community posts
/chat/rooms         - Chat room list (authenticated)
/chat/:roomId       - Individual chat room (authenticated)
/mypage             - User profile (authenticated)
/transactions       - Transaction history (authenticated)
```

## Environment Configuration

The application uses different API base URLs:
- **Development**: `http://localhost:8080` (backend server)
- **Production**: `/api` (proxied through Vercel)

Environment files:
- `.env.development` - Local development settings
- `.env.production` - Production deployment settings

## WebSocket Implementation

### Connection Management
- WebSocket connects automatically on user authentication
- Uses JWT token in connection headers
- Auto-reconnection with exponential backoff
- Singleton pattern prevents multiple connections

### Subscription Patterns
- **Notifications**: `/topic/notification/{userId}`
- **Chat**: `/topic/chat/{roomId}`
- **Message sending**: `/app/chat/message`

### Integration Points
- `App.jsx` WebSocketProvider manages global connection
- Individual pages use specific hooks (useChat, useNotification)
- Connection status displayed in development mode

## API Integration

### Modular API Structure
The API layer is organized into domain-specific modules in `src/services/api/`:
- `auth.js` - Authentication (login, logout, token refresh)
- `users.js` - User profile management
- `products.js` - Product CRUD operations
- `auctions.js` - Auction and bidding functionality
- `chat.js` - Chat room and messaging
- `posts.js` - Community posts
- `comments.js` - Post comments
- `transactions.js` - Transaction history
- `notifications.js` - User notifications
- `points.js` - Point management
- `catalogs.js` - Product catalogs

### Authentication Flow
- JWT tokens stored in localStorage
- Automatic token injection via Axios interceptors
- Token refresh and logout handling
- OAuth redirect handling for social login

### Error Handling Strategy
- JWT errors trigger automatic logout and redirect
- Network errors display user-friendly messages
- Retry logic for failed requests
- 401 errors handled differently for different endpoints

## Payment Integration

Uses Toss Payments SDK with dedicated components:
- `TossPaymentComponent.jsx` - Payment processing
- `TossPaymenrSuccesspage.jsx` - Success handling
- Integration with product purchase flow

## Development Notes

### Component Patterns
- Functional components with hooks
- Custom hooks for business logic
- Context for global state management
- Error boundaries for crash protection
- Multi-step forms broken into sub-components
- Each component directory includes index.js for clean imports

### Code Conventions
- JSX components in `.jsx` files
- Separate CSS files for complex styling
- Utils directory for shared functionality
- Services directory for API logic
- Components organized by domain/functionality
- Index files in each component directory for barrel exports

### Import Patterns
- Use barrel exports from component directories (e.g., `import { ProfileHeader } from '../components/profile'`)
- Prefer organized API imports (e.g., `import { userApi } from '../services/api/users'`)
- Services managers imported from `../services/managers/`

### Testing Approach
Currently no test framework is configured. When adding tests, check if the project needs a testing setup.