# Free-first transition plan — inactentertainment/livefit-info

## Approved direction
All public content and working tools should remain free; no paid subscriptions, paid membership pages, marketing signup popups or newsletter collection. Preserve app functionality, pages, assets, legal disclosures and branding. No live publishing until tests pass.

## Preservation and exceptions
- Before disabling any feature, identify backend/auth, saved data, payment, email and functional dependencies. Keep all existing code in Git history; back up database schemas and data when applicable.
- Basketball Brilliance is a special case: free coach/player/parent accounts and shared rosters, assignments and saved progress are REQUIRED. Do not replace them with local-only demos or remove authentication.
- Preserve functional dialogs (save, export, import, help, legally required safety notices). Remove only promotional popups, marketing opt-ins and paywalls where appropriate.
- Preserve public navigation, SEO canonical URL structure, service workers and mobile behavior.
- Do not break preexisting users' saved data, purchased content or commitments. Honor past entitlements and clarify migration before removing access routes.
- Audit site for paid offers and marketing collection; do not remove functional app modals.

## Required review before launch
1. Inventory all public entry points, navigation/menu/footer items, pricing widgets, auth requirements and email-capture endpoints, including non-index pages.
2. Implement the new public access model while preserving existing feature logic and dependencies.
3. Test with desktop and mobile; all tools, offline modes, Save/Restore/Import/Export, service-worker cache, inbound URLs and search indexing.
4. Test connected/back-end functions with real isolated accounts where applicable; verify data access restrictions.
5. Review affiliate disclosures, privacy policies and consent controls. Do not replace email popups with tracking without review.
6. Deploy only after validation and provide exact production URLs and commit hashes.

Status: development branch preparation only. No production deployment or completed functionality tests represented by this document.
