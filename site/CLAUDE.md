# web — planned GitHub Pages presentation

Metadata-only component on `main`. No website implementation is part of the initial Salvor self-scaffold.

## Canonical Sources
- `../README.md` — public overview and supported capabilities
- `../SETUP_PROMPT.md` — universal setup protocol
- `../docs/VENDOR_ADAPTERS.md` — current vendor-support truth

## Architecture Notes
- The repository sources above are authoritative; the future site is a generated semantic mirror.
- Existing mapped copy must update automatically during the future site build/deploy.
- If a source change requires a new section, interaction, or visual element, synchronization must stop with design review required. Ask the operator before adding the element.
- Once site code exists, source and mirror changes land together; silent public-content drift is forbidden.

## Build
- No site build exists on `main` yet. Do not import work from `ghpages/v1.0.0` without explicit approval.
- `VERSION.md` key: `WEB`; derived constant: `WEB_BUILD`.

Use `.salvor/DOMAIN_REF.md` for product truth and `.salvor/INFRA.md` for deployment details.
