# FlowSync MVP — Sprint-Ready User Stories

Source: `flowsync.md` (PRD v1.0, Q3 2026). Scope: MVP only.

**Conventions**
- Acceptance criteria are written as BDD scenarios in Gherkin: one `Scenario` per behaviour, `Given` / `When` / `Then` with `And` / `But` for extra steps, one step per line, and concrete example data.
- The `@Inferred` Gherkin tag marks a scenario that is not literally in the PRD. A `# Inferred:` comment marks a single inferred step or detail inside an otherwise PRD-based scenario. Inferred items in prose are tagged `[Inferred]`.
- Each story ends with a **Technical context** block (stack and constraints from PRD §4–§5; no architecture is proposed).
- No estimations. "Depends on" lists only functional ordering.
- Cross-cutting scenarios (section 0) apply to every story and are not repeated.

---

## 0. Cross-cutting criteria (apply to all stories)

```gherkin
Feature: Cross-cutting requirements (PRD §3.1, §4)

  Scenario: X-1 A user's data is never visible to another user
    Given users "A" and "B" each have tasks and, optionally, a Google connection
    When user "A" requests any task, session or Google-connection data
    Then only the data of "A" is returned
    And no data of "B" is accessible

  Scenario: X-2 Validation errors are shown in a clear way
    Given a form with a validation rule, such as email format, password length or a required field
    When the user submits a value that breaks the rule
    Then a human-readable message explains the problem
    And no raw technical error is shown

  Scenario: X-3 The interface is usable on desktop and mobile
    Given a desktop browser or a mobile browser
    When the user uses any FlowSync screen
    Then the screen is usable without a native app

  Scenario: X-4 The task list loads fast
    Given a user with 200 tasks
    When the user loads the task list
    Then the list is rendered in under 1 second
```

---

## Epic 1 — Authentication and account

### US-01 — Create an account
**As a** visitor, **I want to** create an account with email and password, **so that** I have my own private space for my tasks.

```gherkin
Feature: US-01 Create an account

  Scenario: Successful registration
    Given I am a visitor on the sign-up screen
    When I submit the email "ana@example.com" and the password "secret123"
    Then my account is created

  @Inferred
  Scenario: Registration authenticates me without a separate login
    # Inferred: auto-login; the PRD only says the user "llega a una pantalla de bienvenida"
    Given I have just registered successfully
    Then I am authenticated
    And I am not asked to log in separately

  Scenario: Successful registration leads to the welcome screen
    Given I have just registered successfully and I am authenticated
    When the registration finishes
    Then I land on the welcome screen described in US-05

  Scenario: Password shorter than 8 characters is rejected
    Given I am a visitor on the sign-up screen
    When I submit the email "ana@example.com" and the password "short12"
    Then the account is not created
    And I see a clear message about the minimum password length of 8 characters

  @Inferred
  Scenario: Password length boundary
    Given I am a visitor on the sign-up screen
    When I submit a password of exactly 8 characters
    Then the password is accepted
    But when I submit a password of exactly 7 characters
    Then the password is rejected

  @Inferred
  Scenario: Malformed email is rejected
    # PRD §4 lists "email inválido" as a validation error
    Given I am a visitor on the sign-up screen
    When I submit the email "not-an-email" and a valid password
    Then the account is not created
    And I see a clear message that the email is not valid

  @Inferred
  Scenario Outline: Empty or whitespace-only fields are rejected
    Given I am a visitor on the sign-up screen
    When I submit the email "<email>" and the password "<password>"
    Then the account is not created
    And I see which fields are required

    Examples:
      | email           | password  |
      |                 | secret123 |
      | ana@example.com |           |
      | "   "           | "   "     |

  @Inferred
  Scenario: Several errors are shown together
    Given I am a visitor on the sign-up screen
    When I submit a malformed email and a password of 3 characters
    Then I see the email error and the password error at the same time

  @Inferred
  Scenario: Email is normalized before checking uniqueness
    # See Open Questions Q9
    Given an account exists for "ana@example.com"
    When I submit the email " Ana@Example.com " with a valid password
    Then the email is treated as "ana@example.com"
    And no second account is created
    And I am handled as "email already registered" (US-02)

  @Inferred
  Scenario: Double submit or concurrent requests create a single account
    Given I am a visitor on the sign-up screen
    When the same registration is submitted twice, or two requests with the same email arrive at the same time
    Then at most one account is created
    And the other attempt is handled as "email already registered" (US-02)

  @Inferred
  Scenario: Server or network failure during registration
    Given I am a visitor on the sign-up screen
    When the server or network fails while I submit
    Then I see a clear non-technical message
    And the data I typed is preserved, except the password
    And no account is left that exists but cannot be used to log in

  @Inferred
  Scenario: Account created but authentication or redirect fails
    Given my account was created
    When authentication or the redirect to the welcome screen fails
    Then I can log in with my new credentials (US-03)
    And no duplicate account is created

  @Inferred
  Scenario: Direct API call with an invalid payload
    Given I call the registration endpoint directly, bypassing the UI
    When I send missing fields or fields of the wrong type
    Then the request is rejected
    And the same validation rules as in the UI apply

  @Inferred
  Scenario: Authenticated user opens the sign-up screen
    # Behaviour defined in Open Questions Q10
    Given I am already authenticated
    When I open the sign-up screen
    Then the behaviour follows the decision recorded for Q10

  @Inferred
  Scenario: The sign-up form is accessible and responsive
    Given I use a mobile browser or a desktop browser
    When I fill in and submit the sign-up form
    Then it works on both
    And its fields are labelled
    And validation errors can be read with keyboard and screen reader
```

**Depends on:** US-05 (destination screen), US-02 (duplicate-email behaviour; the login screen it links to comes from US-03) `[Inferred]`.

**Technical context:** Password min length 8. No email verification link and no "remember password" in MVP. Session via access tokens (`@adonisjs/auth`). Validation with VineJS, and it must be enforced server-side `[Inferred]`. Email uniqueness must be guaranteed at the data level, not only in application checks `[Inferred]`. Passwords must not be stored in plain text, and neither passwords nor tokens may appear in logs `[Inferred]`. Where the client keeps the access token and the exact hashing approach are not decided here; they are for the specs. Users persistence with a uniqueness constraint on email is needed `[Inferred]`.

**Known risks (for awareness, no PRD change implied)**
- No email verification and no password recovery in MVP: a user who mistypes their email at sign-up may be locked out permanently `[Inferred]`.
- US-02 reveals that an email is registered, which allows probing for existing accounts. The PRD accepts this explicitly for the MVP `[Inferred]`.
- Unverified emails mean accounts can be created with other people's addresses `[Inferred]`.

### US-02 — Be told when my email is already registered
**As a** visitor, **I want to** be informed when my email already has an account, **so that** I can go to login instead of getting stuck.

```gherkin
Feature: US-02 Duplicate email on registration

  Scenario: Registering with an email that already exists
    Given an account exists for "ana@example.com"
    When I try to register with "ana@example.com"
    Then no new account is created
    And I see a message saying the email is already registered

  Scenario: The message offers a way to log in
    Given I see the "email already registered" message
    Then it offers a way to go to the login screen
```

**Depends on:** US-01. **Technical context:** Email uniqueness must be enforced. Revealing that an email is registered is accepted by the PRD for the MVP.

### US-03 — Log in
**As a** registered user, **I want to** log in with my email and password, **so that** I can access my tasks.

```gherkin
Feature: US-03 Log in

  Scenario: Successful login
    Given I have an account with the email "ana@example.com"
    When I submit "ana@example.com" and my correct password
    Then I am authenticated
    And I am taken to my task list
    # Inferred: destination is the task list

  @Inferred
  Scenario: Wrong credentials
    Given I have an account with the email "ana@example.com"
    When I submit "ana@example.com" and a wrong password
    Then I am not authenticated
    And I see a clear error message
    And the message does not reveal which field was wrong

  @Inferred
  Scenario: Empty or malformed fields
    Given I am on the login screen
    When I submit an empty or malformed email or an empty password
    Then I see clear validation messages
```

**Depends on:** US-01. **Technical context:** Access-token session.

### US-04 — Log out
**As an** authenticated user, **I want to** log out, **so that** nobody else can use my session on this device.

```gherkin
Feature: US-04 Log out

  Scenario: Log out
    Given I am authenticated
    When I choose "log out"
    Then my session ends
    And I am taken to a public screen
    # Inferred: the public screen is the login screen

  @Inferred
  Scenario: Access after logging out is denied
    Given I have logged out
    When I try to open a task screen or reuse my previous access token
    Then access is denied
```

**Depends on:** US-03. **Technical context:** Access-token revocation `[Inferred]`.

### US-05 — See a welcome screen after registering
**As a** new user, **I want to** see a short explanation of FlowSync and be invited to create my first task, **so that** I understand the value and get started quickly.

```gherkin
Feature: US-05 Welcome screen

  Scenario: Welcome screen content
    Given I have just registered successfully
    When I arrive after registration
    Then I see a welcome screen
    And it explains in one sentence what FlowSync does
    And it invites me to create my first task

  Scenario: Starting the first task from the welcome screen
    Given I am on the welcome screen
    When I click the action to create my first task
    Then I reach the task creation experience (US-06)
```

**Depends on:** US-01, US-06. **Technical context:** Minimal onboarding only; no multi-step flow.

### US-24 — Restrict access to authenticated users
**As a** user, **I want** my tasks and settings to be reachable only after logging in, **so that** my data stays private.

```gherkin
Feature: US-24 Authenticated access only

  Scenario: Unauthenticated access is denied
    Given I am not authenticated
    When I try to open a task screen or call a task or Google endpoint
    Then access is denied
    And I am directed to log in
    # Inferred: redirect to login

  Scenario: Another user's task cannot be reached
    Given I am authenticated as user "A"
    And a task with id 42 belongs to user "B"
    When I request or modify task 42
    Then it is not returned or modified
    # See X-1
```

**Depends on:** US-03. **Technical context:** Applies to every task, export and Google endpoint.

---

## Epic 2 — Task management (CRUD)

### US-06 — Create a task
**As a** user, **I want to** create a task with a title (and optionally a description and due date), **so that** I can capture what I need to do.

```gherkin
Feature: US-06 Create a task

  Background:
    Given I am authenticated

  Scenario: Create a task with only a title
    When I submit a task with the title "Send report" and nothing else
    Then the task is created with the status "pending"
    And it has no description and no due date

  Scenario: Create a task with optional fields
    When I submit a task with the title "Send report", a description and a due date
    Then the task is created with those values
    And its status is "pending"

  Scenario: Title is required
    When I submit a task without a title
    Then the task is not created
    And I see a clear message that the title is required

  Scenario: The new task appears in my list
    When I create a task successfully
    Then it appears in my task list
    And it is visible only to me
```

**Technical context:** Minimum fields: title, optional description, status, optional due date. Statuses: `pending`, `completed`, `archived`. Due date semantics (date vs. date-time, time zone) are an open decision, see Q4.

### US-07 — View my task list
**As a** user, **I want to** see the list of my tasks, **so that** I know what I have to do.

```gherkin
Feature: US-07 View my task list

  Background:
    Given I am authenticated

  Scenario: Listing my tasks
    Given I have tasks
    When I open the task list
    Then I see my tasks with at least title, status and due date
    # Inferred: displayed fields

  Scenario: Other users' tasks are not listed
    Given another user has tasks
    When I open my task list
    Then none of their tasks appear

  Scenario: List loads within the performance target
    Given I have 200 tasks
    When the list loads
    Then it is rendered in under 1 second
```

**Depends on:** US-06. **Technical context:** Performance target < 1s for ≤ 200 tasks.

### US-08 — Edit a task
**As a** user, **I want to** edit any field of an existing task, **so that** I can keep it accurate.

```gherkin
Feature: US-08 Edit a task

  Background:
    Given I am authenticated
    And I own a task titled "Send report"

  Scenario: Edit fields
    When I change its title, description, status or due date and save
    Then the changes are persisted
    And the list shows the updated values

  Scenario: Title cannot be emptied
    When I clear the title and save
    Then the change is rejected
    And I see a clear message that the title is required

  @Inferred
  Scenario: Remove the due date
    When I clear the due date and save
    Then the task is saved without a due date
```

**Depends on:** US-06. **Technical context:** Changes to due date or status trigger Google Calendar behaviour defined in Epic 5.

### US-09 — Delete a task
**As a** user, **I want to** delete a task, **so that** I can remove what I no longer need.

```gherkin
Feature: US-09 Delete a task

  Background:
    Given I am authenticated

  Scenario: Delete my task
    Given I own a task titled "Send report"
    When I delete it
    Then it no longer appears in my list
    And it is not included in exports

  @Inferred
  Scenario: Confirmation before deleting
    Given I own a task titled "Send report"
    When I click delete
    Then I am asked to confirm before it is deleted

  Scenario: Cannot delete another user's task
    Given a task belongs to another user
    When I try to delete it
    Then the action is denied
    # See X-1
```

**Depends on:** US-06. **Technical context:** If the task has a Google Calendar event, see US-19.

### US-10 — Change a task's status
**As a** user, **I want to** change a task's status (e.g., mark it completed), **so that** I can track progress.

```gherkin
Feature: US-10 Change a task's status

  Background:
    Given I am authenticated

  Scenario: Mark a task as completed
    Given I own a task with the status "pending"
    When I mark it as completed
    Then its status is "completed"

  @Inferred
  Scenario Outline: Any status can be set from any other
    Given I own a task with the status "<from>"
    When I set its status to "<to>"
    Then its status is "<to>"

    Examples:
      | from      | to        |
      | pending   | archived  |
      | completed | pending   |
      | archived  | pending   |
      | archived  | completed |

  @Inferred
  Scenario: The list reflects the new status
    Given I changed a task's status and saved
    When I look at the list
    Then it shows the new status immediately
```

**Depends on:** US-06. **Technical context:** Only the three statuses defined. Google Calendar side effects in US-19. Allowed transitions are an open question (Q3).

---

## Epic 3 — Organization and filtering

### US-11 — Filter tasks by status
**As a** user, **I want to** filter my tasks by status, **so that** I can focus on pending, completed or archived ones.

```gherkin
Feature: US-11 Filter tasks by status

  Background:
    Given I am authenticated
    And I have tasks that are pending, completed and archived

  Scenario Outline: Filter by one status
    When I select the "<status>" filter
    Then only tasks with the status "<status>" are listed

    Examples:
      | status    |
      | pending   |
      | completed |
      | archived  |

  @Inferred
  Scenario: A filter with no matches
    Given I have no completed tasks
    When I select the "completed" filter
    Then I see a message that nothing matches
    And it is different from the first-task empty state (US-13)

  @Inferred
  Scenario: Clear the filter
    Given a status filter is active
    When I clear the filter
    Then I see all my tasks again
```

**Depends on:** US-07, US-10. **Technical context:** Which statuses are visible when no filter is chosen is an open decision (Q2).

### US-12 — See the most relevant tasks for "today" first
**As a** user, **I want** the list ordered so what matters today appears first, **so that** I can act without sorting manually.

```gherkin
Feature: US-12 Default ordering by relevance for today

  Background:
    Given I am authenticated

  Scenario: Today-relevant tasks come first
    Given I have tasks with different due dates
    When I open the list without choosing an order
    Then the tasks most relevant to today are displayed first

  Scenario: The ordering criterion is documented
    Given the criterion is decided during refinement
    When the story is accepted
    Then the criterion is documented
    And it is applied consistently

  @Inferred
  Scenario: Proposed criterion, subject to confirmation in refinement
    Given I have a task overdue, a task due today, a task due next week and a task without a date
    When I open the list without choosing an order
    Then the overdue and due-today tasks appear first
    And then upcoming tasks by nearest due date
    And then tasks without a due date
```

**Depends on:** US-07. **Technical context:** The PRD explicitly leaves the criterion to the team during refinement (Q1).

### US-13 — See an empty state with an invitation to create a task
**As a** user with no tasks, **I want to** see a friendly empty state, **so that** I know what to do next.

```gherkin
Feature: US-13 Empty state

  Background:
    Given I am authenticated

  Scenario: New account with no tasks
    Given I have no tasks
    When I open the task list
    Then I see an empty state
    And it invites me to create my first task

  @Inferred
  Scenario: All tasks are archived
    # Depends on the default-visibility decision, Q2
    Given all my tasks are archived
    When I open the task list in its default view
    Then I see the same empty state

  Scenario: Use the invitation
    Given I see the empty state
    When I click the invitation action
    Then I reach task creation (US-06)
```

**Depends on:** US-07.

---

## Epic 4 — Export

### US-14 — Export my tasks to CSV
**As a** user, **I want to** export my tasks to a CSV file, **so that** I can take my data with me.

```gherkin
Feature: US-14 Export tasks to CSV

  Background:
    Given I am authenticated

  Scenario: Download a CSV
    Given I have tasks
    When I request an export
    Then I download a CSV file

  Scenario: CSV content
    Given I exported my tasks
    When I open the file
    Then each task has at least title, description, status and due date

  @Inferred
  Scenario: Filters do not limit the export
    Given a status filter is active
    When I export
    Then all my tasks are exported, whatever their status

  @Inferred
  Scenario: Special characters are escaped
    Given a task has a description with commas, quotes and line breaks
    When I export and open the file
    Then the task is on a single row with its values intact

  @Inferred
  Scenario: Export with no tasks
    Given I have no tasks
    When I export
    Then I get a file with only the header row, or a clear message

  Scenario: Only my tasks are exported
    Given other users have tasks
    When I export
    Then only my tasks are included
    # See X-1
```

**Depends on:** US-06. **Technical context:** Includes tasks of every status `[Inferred]`.

---

## Epic 5 — Google Calendar synchronisation

> Direction in MVP: **FlowSync → Google Calendar**. Full reverse sync is NOT committed (see Deferred item D-1).

### US-15 — Spike: define sync behaviour before building
**As a** product team, **I want to** run a technical spike on Google Calendar sync, **so that** we commit only to what is feasible and well-defined.

```gherkin
Feature: US-15 Google Calendar sync spike

  Scenario: Due date to event mapping is defined
    Given the spike is completed
    When the results are reviewed
    Then they document how a task due date becomes an event
    And they cover all-day versus timed events and time zone handling

  Scenario: Reverse sync decision is recorded
    Given the spike is completed
    Then it states whether and how Google to FlowSync sync is included, with conflict handling
    Or it confirms that it stays out of the MVP

  Scenario: Limits and edge cases are recorded
    Given the spike is completed
    Then it records how recurring events, all-day events, API rate limits and retries are handled or excluded

  Scenario: Open questions have decisions
    Given the spike is completed
    Then the open questions for Epic 5 (Q4 to Q7) have a recorded decision
```

**Blocks:** US-16 to US-22. **Technical context:** PRD §3.5 and §7 recommend this before committing the breakdown. It also covers the Google Cloud project and OAuth consent setup risk (PRD §7) `[Inferred: setup included here]`.

### US-16 — Connect my Google account
**As a** user, **I want to** connect my Google account to FlowSync, **so that** my tasks can appear in my calendar.

```gherkin
Feature: US-16 Connect Google account

  Background:
    Given I am authenticated

  Scenario: Successful connection
    Given I am not connected to Google
    When I choose "connect Google" and grant permission
    Then my account shows as connected

  @Inferred
  Scenario: Permission denied
    Given I am on Google's consent screen
    When I deny access
    Then I return to FlowSync still disconnected
    And I see a clear message

  Scenario: Tokens are stored securely
    Given the connection succeeded
    Then the Google tokens are stored securely
    And they are never exposed to other users
    # See X-1

  @Inferred
  Scenario: Already connected
    Given I am already connected
    When I view the Google connection option
    Then I see the connected state
    And I am not offered a duplicate connect action
```

**Depends on:** US-03, US-15. **Technical context:** OAuth 2.0, Google Calendar API, read and write permissions on the calendar. Secure token storage (PRD §4). Target: ≥ 40% of registered users connect (PRD §6), so the entry point should be easy to find `[Inferred]`.

### US-17 — See my tasks with a due date as calendar events
**As a** connected user, **I want** tasks with a due date to appear as events in my Google Calendar, **so that** I don't have to copy them by hand.

```gherkin
Feature: US-17 Tasks appear as calendar events

  Background:
    Given I am authenticated
    And I am connected to Google

  Scenario: New task with a due date
    When I create a task with a due date
    Then a corresponding event appears in my Google Calendar

  @Inferred
  Scenario: Adding a due date to an existing task
    Given I have a task without a due date and without an event
    When I add a due date to it
    Then an event is created for it

  Scenario: Task without a due date
    When I create a task without a due date
    Then no event is created

  Scenario: Event creation fails
    Given the task is saved but the event creation fails
    Then the behaviour of US-21 applies

  @Inferred
  Scenario: Event content
    Given an event was created for a task
    When I open it in Google Calendar
    Then it shows the task title
    And its time follows the decision recorded in US-15
```

**Depends on:** US-06, US-16. **Technical context:** Each task must be linked to its event so later updates and deletes target the right one `[Inferred]`. Time-zone handling per US-15 (PRD §7).

### US-18 — Get existing tasks synced when I connect
**As a** user who already has tasks, **I want** my existing dated tasks to appear in the calendar after connecting, **so that** I don't have to recreate anything.

```gherkin
Feature: US-18 Sync existing tasks on connect

  Background:
    Given I am authenticated

  Scenario: Existing dated tasks get events
    Given I have pending tasks with due dates and no events
    When I complete the Google connection
    Then events are created for them

  Scenario: Tasks without a due date are skipped
    Given I have pending tasks without a due date
    When I complete the Google connection
    Then no events are created for them

  @Inferred
  Scenario: Completed and archived tasks are skipped
    Given I have completed and archived tasks with due dates
    When I complete the Google connection
    Then no events are created for them
```

**Depends on:** US-17. **Technical context:** Rate limits may apply to bulk creation (PRD §7).

### US-19 — Keep calendar events up to date when tasks change
**As a** connected user, **I want** date changes, completion and deletion in FlowSync reflected in Google Calendar, **so that** my calendar never shows stale tasks.

```gherkin
Feature: US-19 Keep events in sync with task changes

  Background:
    Given I am authenticated
    And I am connected to Google
    And I have a task with a due date and an event

  Scenario: Change the due date
    When I change the task's due date
    Then the event is updated to the new date

  @Inferred
  Scenario: Remove the due date
    When I remove the task's due date
    Then the event is removed

  Scenario: Complete the task
    When I mark the task as completed
    Then the event is removed or marked as appropriate
    # Inferred: default is removal; exact behaviour is open (Q5)

  Scenario: Delete the task
    When I delete the task
    Then the event is removed from Google Calendar

  @Inferred
  Scenario: Archive the task
    When I set the task to archived
    Then it is treated like a completed task

  @Inferred
  Scenario: Reopen a completed task
    Given the task is completed and has no event
    When I set it back to pending and it has a due date
    Then an event is created again
```

**Depends on:** US-08, US-09, US-10, US-17. **Technical context:** "Elimina o se marca según corresponda" in the PRD is ambiguous; a decision is needed (Q5).

### US-20 — Disconnect my Google account
**As a** connected user, **I want to** disconnect my Google account at any time, **so that** I control what FlowSync can access.

```gherkin
Feature: US-20 Disconnect Google account

  Background:
    Given I am authenticated
    And I am connected to Google

  Scenario: Disconnect
    When I choose "disconnect"
    Then my account shows as disconnected

  Scenario: Nothing is sent after disconnecting
    Given I disconnected
    When I create, edit or delete tasks
    Then nothing is sent to Google Calendar

  Scenario: Tasks are kept
    When I disconnect
    Then all my tasks remain in FlowSync unchanged

  @Inferred
  Scenario: Stored tokens are removed
    When I disconnect
    Then my Google tokens are removed from FlowSync

  @Inferred
  Scenario: Reconnect later
    Given I disconnected earlier
    When I connect again
    Then the flows of US-16 and US-18 apply
```

**Depends on:** US-16. **Technical context:** What happens to already-created events in Google is an open question (Q6); default `[Inferred]`: left untouched.

### US-21 — Never lose a task because sync failed
**As a** connected user, **I want** my task to be saved even if Google is unavailable, **so that** a Google outage never blocks my work.

```gherkin
Feature: US-21 Resilience to Google failures

  Background:
    Given I am authenticated
    And I am connected to Google

  Scenario: Task is saved when Google fails
    Given Google's API is unavailable or returns an error
    When I create, edit, complete or delete a task
    Then the change is saved in FlowSync
    And I am not shown a failure of the task itself

  Scenario: Failed sync is retried
    Given a sync operation failed
    Then it is retried later

  @Inferred
  Scenario: Retry applies the current state
    Given a sync operation failed and the task changed again in the meantime
    When a retry succeeds
    Then the event in Google reflects the current state of the task, not a stale one

  @Inferred
  Scenario: Revoked or invalid Google token
    Given my Google token was revoked or is invalid
    When a sync is attempted
    Then the failure is handled
    And no task data is lost
```

**Depends on:** US-17, US-19. **Technical context:** Retry policy (attempts, intervals, rate limits) is defined in US-15. Success metric: < 5% of sync operations fail unrecoverably (PRD §6).

### US-22 — Log sync operations
**As an** engineer or support person, **I want** Google sync operations logged, **so that** I can diagnose failures.

```gherkin
Feature: US-22 Sync logging

  Scenario: Every sync operation is logged
    Given a sync operation runs, such as creating, updating or deleting an event
    When it finishes
    Then a log entry records the operation and its outcome, success or failure

  @Inferred
  Scenario: Failures are diagnosable
    Given a sync operation failed
    Then the log entry includes the affected task and user identifiers
    And it includes the error

  @Inferred
  Scenario: No secrets in logs
    Given sync logs are written
    Then they contain no Google tokens and no passwords
```

**Depends on:** US-17. **Technical context:** Observability NFR (PRD §4). Supports the < 5% unrecoverable-failure measurement.

---

## Suggested ordering (dependency-based, not an estimate)

1. Foundation: US-01, US-02, US-03, US-04, US-24, US-05 (US-05 needs US-06)
2. Core: US-06, US-07, US-08, US-09, US-10
3. Organization/Export: US-11, US-12, US-13, US-14
4. Google: US-15 (can start in parallel with 1–3), then US-16 → US-17 → US-18, US-19, US-20, US-21, US-22

---

## Open questions (need a product decision)

| # | Question | Related |
|---|----------|---------|
| Q1 | Ordering criterion for "relevant today". | US-12 |
| Q2 | Does the default list hide `archived` (and/or `completed`) tasks? PRD says "all archived" counts as empty, suggesting archived is hidden. `[Inferred]` | US-11, US-13 |
| Q3 | Allowed status transitions (any-to-any?). `[Inferred]` | US-10 |
| Q4 | Is the due date a date only or a date-time? How does it become an event time/duration and in which time zone? | US-15, US-17 |
| Q5 | On completion: delete the event or mark it (e.g., title prefix)? What about `archived`? | US-19 |
| Q6 | On disconnect: leave existing events or remove them? | US-20 |
| Q7 | Retry policy (attempts, intervals) and the user's visibility of sync status (PRD does not require UI for it). | US-21 |
| Q8 | Field limits (title/description length) `[Inferred]`. | US-06 |
| Q9 | Email normalization rules (case, whitespace) and maximum email/password length. `[Inferred]` | US-01, US-03 |
| Q10 | What happens when an authenticated user opens the sign-up screen (redirect to task list, or show it)? `[Inferred]` | US-01 |
| Q11 | Language of the UI and of validation messages (PRD is in Spanish, stories in English); wording of messages. `[Inferred]` | US-01, X-2 |
| Q12 | Is any terms/privacy acceptance, rate limiting or breached-password check required? The PRD mentions none, so they are not in the story. `[Inferred]` | US-01 |

## Deferred / explicitly out of this version

- **D-1 Reverse sync** (Google → FlowSync): desirable per PRD note, not committed until US-15 concludes.
- Out of scope per PRD §1: teams/shared tasks, non-Google calendars, push/email notifications, native mobile app, labels/projects/subtasks, configurable reminders beyond Google's own.
- Not required in MVP: email verification, "remember password".
