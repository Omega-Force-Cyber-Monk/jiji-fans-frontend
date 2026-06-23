# Git & Commit Standards

## 1. Message Structure
Follow the **Conventional Commits** specification:
`<type>(<scope>): <description>`

### Types:
* **feat**: A new feature (e.g., adding a new stock adjustment logic).
* **fix**: A bug fix (e.g., fixing an order total calculation).
* **refactor**: Code change that neither fixes a bug nor adds a feature.
* **docs**: Documentation only changes.
* **style**: Changes that do not affect the meaning of the code (white-space, formatting).
* **chore**: Updating build tasks, package manager configs, etc.
* **test**: Adding missing tests or correcting existing tests.

### Scopes (Project Specific):
`schema`, `api`, `inventory`, `orders`, `auth`, `ui-components`, `ledger`.

## 2. The "Atomic Commit" Rule
* **One Task, One Commit:** Do not bundle a UI fix with a Database schema change.
* **No `git add .`:** Never stage all files at once. Files must be staged manually based on their functional relation.
* **Frequency:** Commit often, push sparingly. Small commits make code reviews significantly easier.

## 3. Commit Message Guidelines
* **Imperative Mood:** Use "add" instead of "added", "change" instead of "changed".
* **No Period at the end:** Keep the subject line concise.
* **Character Limit:** Keep the subject line under 50 characters if possible.

## 4. Workflow Procedure
1.  **Identify Changes:** Group modified files by module (e.g., all files related to the `Order` model).
2.  **Stage Separately:** `git add path/to/module/`
3.  **Validate:** Ensure the staged changes are self-contained and don't break the build.
4.  **Commit:** `git commit -m "feat(orders): implement status transition logic"`
5.  **Repeat:** Move to the next module/functionality.