# Reactive Lo-Fi Soundtrack Design

**Date:** 2026-08-25

**Branch:** `feat/lofi-player`

**Status:** Approved in conversation

## Objective

Replace the current ambient track with a memorable CC0 lo-fi track and make its arrangement react to the visitor's position and deliberate interactions without autoplay, surprise volume changes, or unnecessary network and runtime dependencies.

The musical identity is **Brazilian cyber-noir**: warm jazz harmony and an organic beat underneath restrained synthesized percussion, low pulses, and a short terminal-like melodic signature.

## Source Track and Provenance

Use the seamless-loop edit of **Chill Lofi Inspired** by **omfgdude**, edited by **qubodup**, as the only prerecorded source.

- Composition page: <https://opengameart.org/content/chill-lofi-inspired>
- Loop-edit page: <https://opengameart.org/content/chill-lofi-inspired-loop-edit>
- Source file: `chilllofir-loop.ogg`
- Published license: CC0 1.0 Universal / public-domain dedication
- Local name: `assets/audio/chill-lofi-inspired-loop.mp3`
- MIME type: `audio/mpeg`
- Local conversion: FFmpeg/libmp3lame at 160 kbps from the CC0 loop edit, for the existing cross-browser MP3 delivery path
- Duration: 97.253878 seconds
- Sample rate and channels: 44.1 kHz stereo
- Local file size: 1,945,645 bytes
- Local SHA-256: `78a47d301a61ae686362dd863fa7743ad7abc6b82009cf6d927a7d7e814c4535`

Store these facts in `assets/audio/LICENSE-chill-lofi-inspired.md` and retain a visible provenance link in the player even though CC0 does not require attribution. Remove the superseded Dimly Lit MP3 and license record after the new asset is present and verified.

## Experience Principles

1. **Explicit opt-in:** audio remains paused and the MP3 is not requested until the visitor presses play.
2. **Musical continuity:** section changes reshape the current track; they never restart or jump within it.
3. **Restraint:** reactivity should be noticeable over a visit, not on every pixel of scrolling or every pointer movement.
4. **Equal input methods:** pointer hover, keyboard focus, click, and touch produce equivalent meaningful responses where applicable.
5. **Safe fallback:** failure or absence of Web Audio API leaves a conventional, fully usable HTML audio player.
6. **No third-party runtime:** playback, synthesis, and visualization use platform APIs only.

## Architecture

Keep the existing HTML audio element for loading, playback, loop, seeking, and duration. On the first successful user-initiated play, attempt to create one `AudioContext` and connect the element once through this graph:

```text
HTMLMediaElementSource ─┐
                       ├─> scene filter ─> master gain ─> safety compressor ─> analyser ─> destination
procedural voices ─────┘
```

The scene filter is a `BiquadFilterNode`. The master gain controls the existing volume and mute UI when enhanced audio is active. A conservative `DynamicsCompressorNode` immediately before the analyser acts only as a safety limiter; it must not be configured to make the track louder. An `AnalyserNode` supplies real signal levels to the player's equalizer.

Create and connect the graph synchronously from the first play gesture, before awaiting media playback. If graph creation fails before the media source is created, record fallback state on the player and continue through the original `<audio>` element. If a failure occurs after creating the media source, connect that source directly to the destination before entering fallback so playback cannot become silent. In fallback mode the existing element volume and mute properties remain authoritative and no synthesized voices or reactive visualization run.

The engine has three small responsibilities:

- **Transport:** play, pause, seek, loop, visibility behavior, persisted volume, and mute.
- **Scene controller:** determine the dominant page section and transition filter/gain parameters.
- **Procedural layer:** schedule short oscillator/noise voices for the Brazilian percussion and terminal motif.

Keep these responsibilities in the existing inline script to preserve the zero-build structure, using separate functions and one configuration object rather than scattered constants.

## Scene Detection and Timing

Observe `#top`, `#sobre`, `#experiencia`, `#projetos`, `#skills`, and `#contato` with `IntersectionObserver`. Choose the section with the greatest visible ratio once its ratio is at least 0.35. If no section meets that threshold, retain the current scene. Scroll events do not synthesize sound directly.

Scene changes are quantized using `tempoBpm` and `beatOffsetSeconds` stored in the audio configuration and calibrated against the downloaded loop waveform before the reactive scheduler is finalized. Schedule a pending change on the next beat. Validate both timing constants as finite positive values at initialization; if either is invalid, or the context is unavailable or suspended, use an immediate 500 ms parameter ramp instead. Seeking cancels pending events and recomputes the next beat from the new playback position.

Every parameter change uses `AudioParam` ramps; no filter, gain, or pan value changes abruptly.

## Musical Scene Map

| Section | Audio character | Procedural behavior |
| --- | --- | --- |
| `#top` | Warm, slightly closed base with restrained tape-like darkness | Play the four-note terminal signature once after opt-in, not on every return |
| `#sobre` | Open the midrange slightly | Add a very quiet low pulse on sparse beats |
| `#experiencia` | Stable, grounded tone | Add a minimal synthesized cell resembling muted surdo, rim, and shaker |
| `#projetos` | Brighter filter and modest energy lift | A project card can trigger one pitched accent from the signature |
| `#skills` | More digital texture without raising overall loudness | A skill group can trigger a short two-note response |
| `#contato` | Gradually remove procedural density and soften the filter | Resolve the signature once when the scene becomes active |

The procedural sounds use oscillators, filtered noise buffers generated in memory, envelopes, and filters. No external samples are added. Their combined gain stays well below the source track, and the master chain must avoid clipping.

## Interaction Rules

- Project accents respond to the first `pointerenter` or `focusin` for a card and to touch/click activation.
- Skill responses operate at the skill-group level, not for every chip crossed by the pointer.
- A global cooldown prevents more than one interactive cue within 800 ms.
- Re-entering the same element during the cooldown produces no sound.
- Cues use a deterministic variation derived from the target's existing data attribute. They do not use uncontrolled randomness in tests or playback behavior.
- No interaction produces sound while playback is paused, muted, in error state, or running in fallback mode.

## Player Interface

Preserve the play/pause, progress, elapsed/duration, mute, and volume controls and their stable `data-*` selectors. Replace the track metadata and provenance URL. Add a small localized scene label such as `signal://projects`, updated only when the active scene changes.

When enhanced playback is active, the five equalizer bars reflect smoothed analyser bands through `requestAnimationFrame`. Stop this loop on pause, tab hiding, error, fallback, or teardown. Under `prefers-reduced-motion: reduce`, keep the bars static and skip the animation loop; audio playback and gradual scene transitions remain available.

The interface must continue to fit within the existing desktop and mobile safe-area layout. Do not add a second player, modal, or onboarding prompt.

## State and Lifecycle

- Initial state is `idle`; no audio network request and no `AudioContext` exist.
- The play button sets `loading`, initializes or resumes enhanced audio synchronously from the same user gesture, then starts the media element.
- Successful playback sets `playing`; pause sets `paused`; media or graph failure sets either conventional fallback playback or `error` if the media itself cannot play.
- Hiding the document pauses playback and cancels scheduled cues. Returning to the tab never resumes automatically.
- Seeking cancels pending voices, updates the beat clock, and leaves the current scene selected.
- Looping keeps the same scene and resets the beat calculation from the configured offset.
- Language changes update all player and scene text without rebuilding the audio graph.
- Volume and mute persist in the existing local storage keys. Playback permission never persists; every page load requires a new play gesture.

## Accessibility and User Safety

- Keep localized accessible names, visible status text, keyboard-operable ranges, `aria-pressed`, and `aria-live` behavior.
- Never use sound as the only indication of a page state or interaction.
- Do not steal focus or synthesize cues for programmatic focus changes made during initialization.
- Keep the default volume at or below the current 0.3 setting.
- Cap procedural-layer gain independently of the user volume and use short attack/release envelopes to prevent clicks.
- Respect reduced motion for visualization, while retaining user-controlled audio because reduced-motion preference is not an audio mute preference.

## Performance and Security

- Self-host the single 1.9 MB MP3 and retain `preload="none"`.
- Create the audio graph and in-memory noise buffer only after opt-in.
- Reuse nodes and the noise buffer; do not allocate audio objects in scroll handlers.
- Use one `IntersectionObserver` and one visualization frame loop only while playing.
- Add no CDN scripts, npm runtime packages, workers, analytics, or remote audio requests.
- Preserve the current Content Security Policy. Because the implementation changes the inline script, recalculate its SHA-256 and update both `_headers` and `worker.js` in the same change.

## Verification

Extend `verify.mjs` and existing static/security tests to cover:

1. The new source, title, creator, CC0 provenance, `preload="none"`, loop behavior, and absence of audio requests before play.
2. A successful manual play response with `audio/mpeg` and the correct local asset.
3. Enhanced and fallback states without requiring audible assertions.
4. Dominant-section scene changes and preservation of media time across changes.
5. Deterministic project and skill cues, including the 800 ms cooldown.
6. Volume, mute, seek, loop, language change, pause, hidden-tab behavior, and non-resumption.
7. Keyboard/pointer parity and localized scene/player labels.
8. Static equalizer behavior under reduced motion.
9. Mobile viewport containment and final-content clearance.
10. Agreement between the inline script hash in `_headers` and `worker.js`.

Run at minimum:

```bash
npm run verify:static
npm run test:hooks
node --test test/*.test.mjs
npm start
node verify.mjs http://localhost:3000
npm run screenshot -- http://localhost:3000 reactive-lofi
```

Inspect desktop and mobile screenshots. Add or extend a `test/*.test.mjs` security test so the inline-script hash agreement is exercised by the test command above.

## Acceptance Criteria

- The chosen CC0 track replaces Dimly Lit with documented provenance and an exact checksum.
- The player remains silent, opt-in, localized, accessible, self-hosted, and lazy-loaded.
- Each major section has the approved musical character, and changes are smooth and beat-aware.
- Projects and skill groups produce restrained, deterministic cues with keyboard and pointer parity.
- The system falls back to conventional playback when Web Audio API enhancement is unavailable.
- Reactive visualization stops when inappropriate and is disabled for reduced motion.
- No runtime dependency, autoplay, unexpected resume, clipping, stale CSP hash, or unrelated repository change is introduced.

## Out of Scope

- Source separation or multitrack stems.
- Recording or downloading additional percussion samples.
- User-selectable songs, playlists, or visualizer themes.
- Persisting playback or current time across page loads.
- Reacting continuously to cursor coordinates or raw scroll position.
- Background playback after the document becomes hidden.
