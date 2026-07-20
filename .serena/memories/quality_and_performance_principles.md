# Quality and Performance Principles

> Serena memories are retrieval aids, not canonical truth. Canon: ../../RULES.md, ../../.salvor/active_state.md.

Salvor always prioritizes top-quality code, maintainability, accessibility, and runtime performance over delivery speed. This applies across the core repository, documentation, the site (`site/` on `main`, deployed via `.github/workflows/pages.yml`), release packaging, and future integrations.

Every planning loop must explicitly favor:
- clean, greenfield-quality architecture over prototype accretion or hodge-podged reuse;
- small, focused, understandable files and clear responsibilities;
- fast page loads, minimal dependencies, optimized assets, and measured browser performance;
- responsive, accessible behavior and progressive enhancement;
- automated tests plus real-browser verification across desktop, tablet, and small-phone viewports;
- code quality appropriate for scrutiny by industry peers.

Approved visual designs may still receive small refinements after conversion to DOM, but refinements must preserve the locked design system and the quality/performance constraints above.
