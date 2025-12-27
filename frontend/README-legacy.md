# Legacy `public/` moved here

This file was moved from `public/README.md` when the legacy static frontend was removed from the repository.

Notes:
- The legacy `public/` folder relied on CDN imports and is deprecated in favor of the Vite-based frontend in `frontend/`.
- The minimal assets required for runtime compatibility (favicon and `.well-known` entries) were copied into `frontend/public/` so tools or services that expect those paths continue to work.

If you need the original static `index.html` for historical reference, it was intentionally not copied into `frontend/public` because the new Vite app provides the real frontend.
