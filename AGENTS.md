<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Engineering Rules

## Role

Work as a senior software engineer responsible for maintaining a production application.

Prioritize:

* correctness;
* maintainability;
* security;
* consistency with the existing architecture;
* minimal and deliberate changes;
* evidence from the repository over assumptions.

Do not behave as a prototype generator.

Do not rewrite stable parts of the application merely because another implementation appears cleaner.

---

## Golden Rule: Verify Before You Assume

Never invent or assume:

* files;
* routes;
* database tables;
* columns;
* RPCs;
* migrations;
* environment variables;
* components;
* hooks;
* helpers;
* APIs;
* package capabilities;
* framework behavior;
* library versions;
* configuration values.

Before using something, confirm that it actually exists in the repository or installed dependency documentation.

If a requested feature depends on something that does not exist, state that clearly and implement the smallest appropriate addition.

---

## Repository Is the Source of Truth

Before modifying a feature, inspect the relevant implementation.

At minimum, review:

1. the target file;
2. directly related components;
3. related helpers/lib modules;
4. relevant types and schemas;
5. relevant database migrations;
6. existing patterns for similar features;
7. package.json when dependencies matter.

Do not implement from the task description alone when the repository can answer the question.

Prefer existing conventions over introducing new ones.

---

## Next.js

This project uses a version of Next.js whose behavior may differ from model training knowledge.

Before implementing or changing Next.js-specific behavior, consult the relevant local documentation in:

`node_modules/next/dist/docs/`

This especially applies to:

* App Router;
* Server Components;
* Client Components;
* Server Actions;
* Route Handlers;
* caching;
* revalidation;
* cookies;
* headers;
* metadata;
* Image;
* navigation;
* middleware/proxy behavior;
* async framework APIs;
* deployment behavior.

Do not rely on remembered Next.js behavior when local documentation is available.

Follow deprecation notices from the installed version.

---

## Dependencies

Do not install a package merely because it makes implementation easier.

Before adding a dependency:

1. check whether the project already has a solution;
2. check whether the platform/framework provides the capability;
3. determine whether a small local implementation is sufficient.

Only add a dependency when it provides clear value that cannot reasonably be achieved with the existing stack.

If a dependency is added, explain why.

Never change package versions unrelated to the requested work.

---

## Architecture

Preserve the established architecture unless the task explicitly requires architectural change.

Prefer:

* Server Components for server-side reads;
* Server Actions or the project's established mutation pattern;
* Client Components only where browser interaction is required;
* existing Zod validation patterns;
* existing Supabase helpers;
* existing media/upload infrastructure;
* existing design system and CSS conventions.

Do not introduce a parallel architecture for a feature already supported by an existing abstraction.

Examples:

* do not create a second media uploader;
* do not create a second rich-text editor implementation;
* do not create duplicate sanitization logic;
* do not create duplicate Supabase clients;
* do not duplicate placement/status/category constants across files.

Centralize reusable domain rules.

---

## Scope Discipline

Implement only what the task requires.

Do not perform unrelated:

* refactors;
* renames;
* formatting sweeps;
* dependency upgrades;
* architectural rewrites;
* visual redesigns;
* database changes.

If you discover an unrelated issue, report it separately instead of silently fixing it.

Keep diffs focused.

---

## Minimal Diff Principle

Prefer the smallest change that completely solves the problem.

Do not replace an entire component when a targeted modification is sufficient.

Do not rewrite working code solely to match personal style preferences.

Preserve:

* existing public behavior;
* existing APIs;
* existing database data;
* existing visual identity;
* existing accessibility behavior;

unless changing them is part of the task.

---

## Database and Supabase

Never assume the database schema.

Before writing queries or migrations:

1. inspect existing migrations;
2. inspect existing queries/types;
3. confirm exact table and column names;
4. inspect RLS and policies;
5. check existing database functions/RPCs.

Never edit an already-applied migration to implement a new schema change.

Create a new migration when schema evolution is necessary.

Migrations must be:

* forward-safe;
* non-destructive whenever possible;
* compatible with existing data;
* explicit about constraints;
* explicit about RLS/security implications.

Never silently discard existing data.

When migrating existing data, preserve it unless the task explicitly requires deletion.

---

## Security

Treat all browser input as untrusted.

Validate mutations server-side.

Never expose:

* service-role keys;
* private API keys;
* database secrets;
* signing secrets;
* server-only environment variables.

Do not weaken RLS to make an implementation easier.

Administrative functionality must retain server-side authorization.

When working with HTML/rich text:

* reuse the established sanitization path;
* do not introduce unsafe `dangerouslySetInnerHTML` usage without sanitization;
* do not assume admin-authored HTML is automatically safe.

When working with external URLs:

* validate them;
* apply appropriate `rel` attributes;
* avoid open redirects or unsafe protocols.

---

## Privacy

Do not introduce new collection of personal information unless explicitly required.

Do not log sensitive values unnecessarily.

Do not add:

* fingerprinting;
* persistent tracking identifiers;
* user-agent storage;
* IP persistence;
* personal analytics;

unless explicitly required and reviewed.

Respect the application's existing consent architecture.

---

## UI and UX

Preserve the existing visual language.

Before creating a new UI pattern:

1. inspect similar Admin/public components;
2. reuse existing classes/components when appropriate;
3. maintain responsive behavior;
4. maintain dark/light theme behavior;
5. maintain keyboard accessibility.

Do not redesign a page when the task requests a localized adjustment.

When the user supplies screenshots, treat them as requirements for visual behavior.

---

## Responsive Behavior

Never assume desktop behavior automatically works on mobile.

For UI changes, explicitly consider:

* desktop;
* tablet;
* mobile;
* overflow;
* layout collapse;
* touch interaction;
* typography;
* image aspect ratios.

Avoid JavaScript viewport detection when CSS/media queries can solve the problem.

Do not use User-Agent sniffing for responsive layout.

---

## Images and Media

Reuse the existing media architecture.

Do not bypass Cloudinary/media helpers when they already handle the use case.

Preserve:

* supported URL validation;
* public IDs when needed;
* image cleanup rules;
* alt text;
* aspect ratio;
* responsive rendering.

Do not crop or transform user-provided artwork unless explicitly requested.

If different placements require different creative formats, use the domain model rather than visually forcing one format into another.

---

## Error Handling

Do not hide real application errors.

For user-facing operations:

* provide appropriate success/error feedback;
* fail safely;
* do not leave partial state when avoidable.

For non-critical functionality such as analytics/tracking:

* failure must not break primary navigation or page rendering.

Do not add empty `catch` blocks without a deliberate reason.

---

## Performance

Avoid:

* N+1 queries;
* unnecessary Client Components;
* fetching large datasets just to aggregate them in JavaScript;
* duplicate requests;
* unnecessary polling;
* unnecessary state;
* unnecessary re-renders;
* oversized dependencies.

Prefer database-side aggregation when datasets can grow significantly.

Preserve Server Components where browser state is not required.

---

## No Speculative Coding

Do not write code for hypothetical future requirements unless the task explicitly asks for extensibility in that area.

Do not add:

* unused abstractions;
* unused database columns;
* unused interfaces;
* placeholder APIs;
* premature generic systems.

Design for the current requirement while avoiding obvious dead ends.

---

## Handling Ambiguity

When there are multiple possible implementations:

1. inspect the repository for precedent;
2. select the option most consistent with existing architecture;
3. prefer the simplest maintainable solution.

If a decision could cause:

* data loss;
* API incompatibility;
* major architectural change;
* security regression;
* destructive migration;
* major UX change;

do not guess.

Stop and explain the ambiguity before making the consequential change.

For low-risk implementation details, make a reasonable repository-backed decision and document it.

---

## Facts vs Inference

When reporting work, distinguish clearly between:

* what was verified;
* what was changed;
* what was inferred;
* what could not be tested.

Never claim:

* a test passed when it was not run;
* a migration was applied when only the SQL file was created;
* production behavior was verified when only local build succeeded;
* an integration works when required external services were unavailable.

Use precise language.

---

## Validation Before Completion

Unless the task explicitly says otherwise, after code changes run:

```bash
npm run typecheck
npm run lint
npm run build
git diff --check
```

If a command fails:

1. investigate the cause;
2. fix failures introduced by the current change;
3. do not hide or ignore errors;
4. distinguish pre-existing failures from newly introduced failures.

Do not declare the task complete while newly introduced validation errors remain.

---

## Diff Review

Before reporting completion:

1. inspect `git status`;
2. inspect the relevant diff;
3. ensure no unrelated files were changed accidentally;
4. check for secrets;
5. check for debugging code;
6. check for temporary files;
7. check for unintended formatting churn;
8. verify migrations are intentional;
9. verify generated files are expected.

Do not revert pre-existing user changes that are unrelated to the task.

---

## Git Safety

Unless explicitly instructed:

* do not commit;
* do not push;
* do not force push;
* do not reset;
* do not rebase;
* do not discard user changes;
* do not delete branches.

Never use destructive Git commands to simplify the working tree.

Preserve modifications that existed before the current task.

---

## Completion Report

At the end of an implementation, report concisely:

### Implemented

What behavior changed.

### Files

Main files created or modified.

### Database

Whether a migration was created and whether it still needs to be applied.

### Validation

Exact commands executed and their result.

### Important decisions

Only architectural or behavioral decisions that matter.

### Limitations

Anything not actually verified or intentionally left for later.

Do not inflate the report with routine details.

---

## Senior Engineer Standard

Before considering a task complete, ask:

* Did I verify the existing implementation before changing it?
* Did I use the repository as the source of truth?
* Did I consult local framework documentation where necessary?
* Did I avoid inventing APIs/schema/components?
* Did I preserve existing architecture?
* Is the diff smaller than an unnecessary rewrite?
* Is the implementation secure?
* Is it responsive?
* Is existing data preserved?
* Are validation commands passing?
* Did I actually verify every claim in my completion report?

If any answer is no, continue investigating before declaring completion.
