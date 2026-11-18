# REALITYFORGE

**Universal Devil's Advocate & Reality-Check** — a small, offline-first idea-review toolkit that challenges assumptions and turns proposals into testable next steps.

## What is included

- **Installable web app (PWA):** responsive interface designed for Android, iOS, Windows, and desktop/mobile browsers. It works offline after the first visit and stores saved reviews only in the browser's local storage.
- **Python CLI:** standard-library-only review generator (`python realityforge.py`).
- **Rust CLI:** dependency-free review generator (`cargo run --manifest-path rust/Cargo.toml -- ...`).
- Five modes: Devil, Investor, CTO, Auditor, and Execution.

The included analyzer is a transparent, deterministic checklist—not an AI model, market-research service, financial forecast, or substitute for professional advice. It does not send proposal text to a server, verify current facts, or invent market data. Treat its prompts as a starting point and supply evidence yourself.

## Run the web app

Serve the repository root over HTTP (service workers do not work from a `file://` URL):

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. For use on a phone, deploy the static files to an HTTPS host and open the URL in the browser. Use the browser's install/add-to-home-screen action where available. PWA installation and offline behavior vary by browser and operating system; this is not a native App Store or Microsoft Store package.

## Python CLI

Requires Python 3.9+ and no third-party packages:

```sh
python realityforge.py --mode devil --idea "A subscription app for neighborhood tool sharing" --format json
python realityforge.py --mode execution --idea "Pilot a tool-sharing service with 20 households"
```

Alternatively, pipe a longer proposal on stdin:

```sh
cat proposal.txt | python realityforge.py --mode auditor
```

## Rust CLI

Requires a stable Rust toolchain:

```sh
cargo run --manifest-path rust/Cargo.toml -- --mode cto --idea "A cross-platform offline-first app"
printf '%s' 'A paid marketplace for local tutors' | cargo run --manifest-path rust/Cargo.toml -- --mode investor
```

## Review workflow

1. Describe the proposal, intended user, and desired outcome.
2. Choose a mode and review the generated assumptions and questions.
3. Gather customer, technical, cost, and risk evidence; fill in unknowns rather than guessing.
4. Test the smallest reversible hypothesis before committing to a large build or spend.
5. Record a decision, owner, and review trigger outside the app if an auditable team decision log is needed.

The web app offers a structured REALITYFORGE worksheet; the CLI versions provide compact, repeatable checklists. They intentionally do not claim identical feature parity or produce unsupported verdicts. Financial scenarios, competitor comparisons, compliance advice, and execution budgets require proposal-specific inputs and reliable sources.

## Privacy and limitations

- The browser app has no analytics, account system, network API, or cloud sync. Saved proposal text remains in that browser's local storage; clear it with the app's Clear button or browser site-data controls.
- Do not enter confidential or sensitive material on shared devices.
- The web app's offline cache contains only the app shell.
- This project provides no warranty and is not legal, medical, investment, cybersecurity, or other professional advice. Get qualified review for high-stakes decisions.

## License

MIT. See [LICENSE](LICENSE).
