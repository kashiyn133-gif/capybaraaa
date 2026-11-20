# Capyplan — Living Companion Edition

Capyplan is a local-first productivity planner with task parsing, ranked planning, focus sessions, habits, progress, DecisionOS and an animated 3D capybara companion.

## Run locally

Requires Node.js 18 or newer. No `npm install` is required.

```bash
node server.js
```

Open the address printed in the terminal (default `http://localhost:5500`). If the port is occupied, choose another one:

```cmd
set PORT=5512
node server.js
```

Then open `http://localhost:5512`.

## Voice Companion

Tap **Talk to Capy**, then **Speak** and allow microphone access. Chrome/Edge support the Web Speech recognition API on localhost. If speech recognition is unavailable, type the same commands in the companion's command box. Speech output uses the browser's built-in speech synthesis.

Supported local commands include:

- `Add task prepare the pitch tomorrow for 45 minutes`
- `Plan my day`
- `What should I do next?`
- `Start focus` / `Pause focus` / `Take a break`
- `Complete task prepare the pitch`
- `Postpone task prepare the pitch`
- `Delete task prepare the pitch`
- `Show my patterns` / `How am I doing?`
- Hinglish aliases: `mera din plan karo`, `ab kya karun`, `focus shuru karo`, `break do`, `mere tasks dikhao`, `meri patterns dikhao`

Voice commands operate the same local task list, planner and focus timer. Microphone access is requested only after the user taps Speak. Voice recognition and speech synthesis are browser-provided; no audio is sent to Capyplan's server by this app code. Recognition itself may be processed by the browser's speech service according to browser settings.

The local companion handles the supported productivity commands without an API key. Open-ended AI conversation still requires configuring a compatible provider in `.env` using `.env.example`.

## Pattern Detective

Pattern Detective uses saved tasks, deadlines, estimates, tags and focus minutes. It reports measured estimate accuracy only when there is enough completed-task history; it labels insufficient history rather than inventing trends.

## Adaptive Calendar

With **Auto-replan** enabled, task additions, completions, deletions, postponements and available-time changes rebuild the current schedule. The planner rearranges the plan only; it does not silently change task deadlines, delete tasks or mark commitments complete. **I lost 30 minutes** reduces today's available minutes and rebuilds the plan.

## Living Capybara

The companion uses 20 individual transparent 3D pose frames and 25 named motion routines (dance, boogie, jump, victory, think, rest, walk, clap, wave and others). Task, focus, planning and DecisionOS actions trigger different reactions. Focus progress unlocks cosmetic options and environments. Companion personality and cosmetic choices are stored separately from task data.

## Existing features retained

- Brain Dump and natural-language task parser
- Priority scoring, task list and daily plan
- Focus timer, breaks and Capy Call reminders
- Capybara levels, focus history, habits and badges
- Business view, CSV export and standup update
- Backup and restore
- DecisionOS, Energy Intelligence, Consequence Map, Time Bankruptcy and What-If simulator
- Optional compatible AI provider backend

## Data and privacy

Tasks and focus history remain in browser local storage (`capyplan.v1`). Companion preferences are stored separately (`capyplan.companion.v1`). Back up your data before changing browser origins or ports. Voice recognition requires a user action and microphone permission. No third-party analytics are included.

## Checks

Run `npm run check` to check JavaScript syntax. Full browser/microphone interaction should be tested in Chrome or Edge on the user's machine because browser speech recognition support and permission vary by environment.

## Guided Journey (new)

Capyplan now opens with a short introduction and a four-part navigation: Plan, Focus, Reflect and Explore tools. The original Brain Dump, ranked planner, task list, focus timer, habits, Business view, Pattern Detective, Adaptive Calendar, DecisionOS and Voice Companion remain available in their respective scenes. First-time guidance is shown once per browser session; use **How it works** to replay it.

## Focus protection: important platform limitation

The web/PWA version provides a distraction-free Capyplan focus screen and links/instructions for the device's built-in focus settings. A browser page cannot reliably silence operating-system notifications or block other applications. It therefore does **not** claim that system-wide blocking is active.

- **Windows:** use Windows Notifications / Do not disturb or Focus settings. For actual blocking of selected desktop apps, a separately installed, permissioned Windows companion is required.
- **Android:** use Settings → Digital Wellbeing & parental controls → Focus mode and select the apps to pause. Actual programmatic app suspension requires a separately installed Android companion with explicit user-granted permissions.

The Windows and Android native companions are not included in this web ZIP. Existing Capyplan tasks and focus history remain local to the browser as before.
