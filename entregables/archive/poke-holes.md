# Hallazgos mas relevantes en el uso de IA como poke-hole.

Lo lancé sobre la primera historia de usuario:

Here is a user story with its acceptance criteria:
 US-01 — Create an account

  As a visitor, I want to create an account with email and password, so that I have my own private space for my tasks.

  Acceptance criteria
  1. Given I am a visitor on the sign-up screen, when I submit a valid email and a password of at least 8 characters, then my account is created and I am authenticated.
  2. Given I submit a password shorter than 8 characters, when I submit, then the account is not created and I see a clear message about the minimum length.
  3. Given I submit a malformed email [Inferred] (PRD §4 mentions "email inválido" as a validation error), when I submit, then the account is not created and I see a clear message.
  4. Given I leave email or password empty [Inferred], when I submit, then I see which fields are required.
  5. Given my account was just created, when registration finishes, then I land on the welcome screen (US-05).

  Technical context: Password min length 8. No email verification link and no "remember password" in MVP. Session via access tokens (@adonisjs/auth). Validation with VineJS. Passwords must not be stored in plain text [Inferred].

Your task: identify edge cases, implicit assumptions,
missing scenarios, and any unmentioned dependencies or risks.
Do not rewrite the story; simply list what is missing
or what you have assumed.

OUTPUT:

Edge cases not covered

- Email normalization. Ana@X.com and ana@x.com may be treated as different accounts. Leading and trailing whitespace is also unaddressed. This affects the duplicate check in US-02 and login in US-03.
- Concurrent registration. Two simultaneous submits with the same email could both pass an application-level check. Uniqueness has to hold at the data level too.
- Double submit or repeated clicks. Nothing prevents duplicate requests or a double-created account.
- Password boundaries. Exactly 8 characters should pass and 7 should fail. There is no maximum length, and no stated handling of very long inputs, whitespace-only passwords, or unicode and emoji.
- Email boundaries. There is no maximum length, and nothing on unusual-but-valid formats (plus-addressing, subdomains, international domains).
- Several validation errors at once. AC 2–4 don't say whether all errors are shown together or one at a time.
- Network or server failure on submit. The story doesn't say what the user sees or whether their input is preserved.
- An already-authenticated user visiting the sign-up screen. The behavior is undefined.
- Browser back button after registration, or a page refresh on the welcome screen.
- Failure between account creation and token issuance. The account could exist while the user isn't authenticated.

Implicit assumptions

- AC 1 says "authenticated" on registration. That means auto-login with no separate login step. The PRD doesn't say this explicitly; it only says the user "llega a una pantalla de bienvenida".
- AC 5 assumes US-05 exists and that the welcome screen needs an authenticated session.
- "Valid email" is undefined. It could be a format check only, or something stricter.
- "Clear message" is subjective and not testable as written. There are no message texts and no language (the PRD is in Spanish, the stories are in English), so the UI language is unspecified.
- Validation location is assumed. The story doesn't say whether it is client-side, server-side or both. Server-side is the only one that can be trusted.
- The story doesn't say if the user must retype the password, or if there is a confirm-password field or show/hide toggle.
- The story assumes no terms-of-service or privacy-policy acceptance. For a product that stores Google tokens, a GDPR-style consent step may be required but isn't mentioned.
- The PRD says no "remember password" and no email verification. That means unverified emails can be registered, including typos and other people's addresses.

Missing scenarios

- Server-side validation when the API is called directly, bypassing the UI.
- Rejecting malformed payloads such as missing fields, wrong types, or extra fields.
- What the user sees after authentication if the redirect to the welcome screen fails.
- Handling of leaked or very common passwords. The PRD only sets a length rule, so this may be deliberately out of scope.
- Rate limiting or abuse protection (bot sign-ups, enumeration attempts). Nothing is mentioned, and the PRD doesn't require it.
- Accessibility of the form: labelled fields, error announcements, keyboard use.
- Mobile layout of the sign-up form, which X-3 requires.

Unmentioned dependencies

- US-05 for the destination screen, and US-02 for the duplicate-email behavior. US-01 doesn't declare either dependency.
- A login screen, which US-02 needs to link to.
- Token issuance and storage on the client. The story doesn't say where the token lives (memory, cookie or local storage), which has security implications.
- Persistence schema for users, including a uniqueness constraint on email.
- Frontend routing, including the guards from US-24.

Risks

- Security. A hashing algorithm isn't named. The "Inferred" note says only "not plain text". Passwords and tokens must also stay out of logs.
- Email enumeration. US-02 tells the user the email is already registered. The PRD accepts this, but it lets anyone probe which emails have accounts, and it conflicts with the more careful wording assumed in US-03.
- No email verification. Typos can lock out real users, and there's no recovery path because "recordar contraseña" is out of scope. A user who mistypes their email at sign-up may be unable to ever get back in.
- Over-tagging [Inferred]. AC 3 and AC 4 are tagged as inferred, but the PRD's NFR on validation errors arguably covers them. The tag is useful, but the PRD §4 citation makes the line blurry.
- Testability. AC 1 bundles three outcomes (account created, authenticated, and implicitly redirected) in one criterion, which makes failures hard to isolate.

Para mi los hallazgos más relevantes son:
- Los edge cases son muy buenos, del nivel de un senior QA.
- La sección de riesgos es útil para anticipar posibles bugs o missing requirements.
- Sobre este output se puede seguir trabajando, e.g., ahora reescribe la user story, o priorizame los AC, etc.
