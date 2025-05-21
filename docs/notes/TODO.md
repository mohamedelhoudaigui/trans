#### **I. FEATURES 

##### **A. BACKEND 

*   **[ ] User & Profile Management:**
    *   `[X]` Basic CRUD (Create, Read, Update, Delete) Users - *Partially Done*
    *   `[ ]` Enhanced User Profiles (Bio, display name, stats, etc.)
    *   `[X]` Avatar Upload/Management (URL-based currently) - *Consider direct upload & storage later*
    *   `[ ]` User Search Functionality
    *   `[ ]` User Status (Online, Offline, In-Game) - *Partially via WebSocket connections*
*   **[ ] Authentication & Authorization:**
    *   `[X]` Email/Password Login - *Done*
    *   `[X]` JWT Access & Refresh Tokens - *Done*
    *   `[X]` Secure Token Storage (HttpOnly cookies for refresh token - *Self-Review if current method is optimal*)
    *   `[X]` OAuth 2.0 Integration (Google initially) - *Done*
    *   `[ ]` Add more OAuth providers (e.g., 42 Intra, GitHub)
    *   `[X]` Two-Factor Authentication (2FA) with TOTP (Speakeasy/QR) - *Done*
    *   `[ ]` Role-Based Access Control (RBAC) - (Admin, User, etc. - *Future Consideration*)
*   **[ ] Social Features:**
    *   `[X]` Friendships (Add, Remove, List, Check) - *Done*
    *   `[ ]` Block/Unblock Users
    *   `[ ]` Direct Messaging / Chat (Real-time):
        *   `[X]` WebSocket for real-time message passing - *Done*
        *   `[X]` Message Persistence (SQLite) - *Done*
        *   `[ ]` Chat History Retrieval (Paginated) - *Partially Done (ChatHistory endpoint)*
        *   `[ ]` Read Receipts / Typing Indicators
        *   `[ ]` Group Chats / Channels
*   **[ ] Game Logic (Core Pong & Beyond - "The Ultimate Playground"):**
    *   `[ ]` Pong Game Core Mechanics (Server-side validation, state management)
    *   `[ ]` Real-time Multiplayer via WebSockets (Matchmaking, game state sync)
    *   `[ ]` Matchmaking System (Simple queue, skill-based - *Future*)
    *   `[ ]` Game Invites & Acceptance Flow
    *   `[X]` Match History & Leaderboards - *Backend: Table stubs might exist, Frontend: Needs implementation*
    *   `[ ]` Spectator Mode for Games
    *   `[ ]` Customizable Game Settings (e.g., ball speed, paddle size - *Future*)
    *   `[ ]` Power-ups / Special Game Modes (FAAFO Zone)
*   **[ ] API & System:**
    *   `[ ]` Comprehensive API Documentation (Swagger/OpenAPI - *TODO in compose*)
    *   `[ ]` Rate Limiting on API endpoints
    *   `[ ]` Input Validation & Sanitization (Beyond basic - more robust schemas) - *Partially Done (`check_and_sanitize`)*
    *   `[ ]` Health Check Endpoint (`/healthz`)
    *   `[ ]` Metrics Endpoint (`/metrics` for Prometheus)
    *   `[ ]` Graceful Shutdown Enhancement

##### **B. FRONTEND 

*   **[ ] User Interface & Experience:**
    *   `[X]` Basic Layout & Navigation (App Router) - *Partially Done*
    *   `[ ]` Responsive Design for multiple screen sizes
    *   `[ ]` Consistent UI Theme & Component Library (e.g., TailwindCSS + custom, or a library like Shadcn/UI, Mantine)
    *   `[ ]` Accessibility (a11y) considerations
*   **[ ] User & Profile Features:**
    *   `[X]` User Registration & Login Forms - *To be built against backend APIs*
    *   `[ ]` User Profile Page (View & Edit)
    *   `[X]` Avatar Display & Upload Interface - *To be built*
    *   `[X]` 2FA Setup & Verification Flow - *To be built*
*   **[ ] Social Features:**
    *   `[ ]` Friend List Display & Management (Add/Remove friend UI)
    *   `[X]` Chat Interface: - *Partially Done (`chat/page.js`)*
        *   `[X]` Display conversations & messages - *Partially Done*
        *   `[X]` Real-time message sending/receiving - *Client-side logic exists, needs WebSocket integration*
        *   `[ ]` UI for blocking users, user status indicators
*   **[ ] Game Interface:**
    *   `[ ]` Pong Game Canvas & Rendering (e.g., using HTML5 Canvas, PixiJS, or similar)
    *   `[ ]` Real-time input handling and sync with backend
    *   `[ ]` Game Lobbies, Matchmaking UI
    *   `[ ]` Display of Scores, Match Results
    *   `[X]` Leaderboard Display - *To be built*
    *   `[ ]` Spectator View UI
*   **[ ] State Management:**
    *   `[ ]` Robust client-side state management (Context API, Zustand, Jotai, or Redux Toolkit - choose one for "Pragmatic Purity")
*   **[ ] Client-Side API Interaction:**
    *   `[ ]` Centralized API client/service for interacting with the backend (e.g., using `fetch` wrappers, SWR, or React Query).
*   **[ ] Notifications:**
    *   `[ ]` Real-time in-app notifications (friend requests, game invites, new messages) - *Likely via WebSocket*

##### **C. DEVOPS 

*   **[X] Containerization & Orchestration (Docker & Compose):**
    *   `[X]` Dockerfiles for all services (Backend, Frontend, ELK components) - *Done / In Progress*
    *   `[X]` Comprehensive `docker-compose.yml` for local development & homelab deployment - *In Progress / Mostly Done*
    *   `[X]` Universal `Makefile` for streamlined operations - *Done*
*   **[X] Logging & Monitoring (The All-Seeing Eye):**
    *   **[X] ELK Stack Setup:** - *In Progress / Configs Defined*
        *   `[X]` Elasticsearch: Data persistence, single-node config. - *Done*
        *   `[X]` Logstash: Pipeline for parsing Docker/application logs (Beats input, ES output). - *Config Defined*
        *   `[X]` Kibana: For log visualization and querying. - *Config Defined*
        *   `[X]` Filebeat: To ship logs from Docker containers to Logstash. - *Config Defined*
    *   `[ ]` **Prometheus & Grafana:**
        *   `[X]` Prometheus setup for metrics scraping. - *Done*
        *   `[X]` Grafana setup for dashboarding. - *Done*
        *   `[ ]` Custom metrics endpoint in Backend (`/metrics`).
        *   `[ ]` Key dashboards in Grafana (Backend performance, System overview).
        *   `[ ]` Alertmanager configuration for critical alerts.
    *   `[ ]` **cAdvisor Integration with Prometheus** (for container resource metrics) - *TODO in compose comments*
*   **[ ] General DevOps Practices:**
    *   `[X]` `.env` file management for configuration (root and service-specific). - *Done*
    *   `[ ]` Secrets Management (Initial exploration: e.g., Docker secrets in compose, or SOPS for local encrypted files).
    *   `[X]` Git-Driven Configuration (All configs in Git). - *Implicitly Done by using Git*
    *   `[ ]` Backup & Restore strategy for persistent volumes (SQLite, ES data, Prometheus data, Grafana config).
*   **[ ] CI/CD (Automating the Forge - Axiom V.D):**
    *   `[ ]` **GitHub Actions (or chosen self-hosted CI like Gitea Actions/Drone):**
        *   `[ ]` **Linting & Formatting Checks:** On every push/PR (ESLint, Prettier, ShellCheck, YAML Lint).
        *   `[ ]` **Build Stage:** Build Docker images for backend & frontend.
        *   `[ ]` **Test Stage:**
            *   `[X]` Run backend API/DB tests (`./db-test.sh`). - *Done*
            *   `[ ]` Add frontend unit/integration tests (e.g., Jest, React Testing Library).
            *   `[ ]` (Future) Frontend E2E tests (e.g., Playwright, Cypress).
        *   `[ ]` **Security Scans:** Scan Docker images for vulnerabilities (e.g., Trivy).
        *   `[ ]` **Deploy Stage (Homelab):**
            *   `[ ]` Script to pull new images and `docker-compose up -d --remove-orphans` on the homelab server (triggered manually or on merge to `main`).
            *   `[ ]` (Advanced) Blue/Green or Canary deployment strategy for homelab (FAAFO).
    *   `[ ]` **Helm?** - *Future research if considering Kubernetes. Not relevant for pure Docker Compose.*
*   **[ ] API Documentation & Infrastructure:**
    *   `[ ]` **Swagger/OpenAPI for Backend:** - *TODO in compose comments*
        *   `[ ]` Auto-generate docs from code annotations or a spec file.
        *   `[ ]` Serve Swagger UI via a Docker container or backend endpoint.
*   **[ ] Network Security & Access Control:**
    *   `[ ]` Review exposed ports; minimize external exposure.
    *   `[ ]` (Future) Consider a reverse proxy (Nginx, Traefik) for all inbound traffic, SSL termination.

---

#### **II. BUGS, FIXES && PATCHES (The "Data ex Ruina" Ledger)**

*   `[ ]` Frontend: Resolve React Hydration errors (ensure client/server render match, manage client-only components correctly). - *Identified*
*   `[ ]` Test Scripts: Improve robustness of ID and token extraction in `db-test.sh` (less reliance on `jq` availability or specific response structures if possible, more error checking).
*   `[ ]` Backend: `ChatHistory` endpoint in `controllers.chat.js` - needs pagination and potentially to fetch messages for *both* `sender_id = X AND recipient_id = Y` OR `sender_id = Y AND recipient_id = X`.
*   `[ ]` Backend: `user_create` in `models.users.js` returns `result.changes` (which is 1). Consider returning the `lastInsertRowid` (the new user's ID) for easier chaining in tests/clients.
*   `[ ]` Devops: Elasticsearch memory lock issues on some hosts - document workarounds or ensure `ulimits` and `vm.max_map_count` are robustly handled/documented.
*   `[ ]` Devops: Ensure ELK security is planned for, even if `ELASTICSEARCH_DISABLE_SECURITY=true` is used for initial FAAFO. Create follow-up tasks for enabling it.

