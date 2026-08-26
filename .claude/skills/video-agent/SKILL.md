---
name: video-agent
description: Drive this repo's video pipeline — research an angle, write a script cut to picture, generate B-roll and a presenter, compose a HyperFrames video with inspectable keyframes, run motion QA, and render an MP4. Use when asked to make, script, edit, compose, or render a video in this project, or to fix how a shot moves.
---

# Video Agent

The pipeline lives at `lib/video/` and is exposed over HTTP under `/api/video/`.
The UI at `/video` is a thin client over those endpoints — anything it can do,
you can do with `curl`. Start the app first (`npm run dev`).

## The pipeline

```
radar → brief → script → [approve] → assets → compose → motion QA → render
```

Every stage writes back to `.data/video-projects/<id>/project.json`. The project
directory *is* a HyperFrames project:

```
<project>/project.json   pipeline state
<project>/index.html     the composition
<project>/assets/…       B-roll, presenter
<project>/out.mp4        after a render
```

So `npx hyperframes render .data/video-projects/<id>` works with no export step.

## Driving it

```sh
BASE=http://localhost:3000/api/video

# 1. Angles for a niche (Claude when ANTHROPIC_API_KEY is set, offline templates otherwise)
curl -s -X POST $BASE/radar -H 'content-type: application/json' \
  -d '{"niche":"AI video editing","keywords":["hyperframes","keyframes"]}'

# 2. Create a project. Paste one angle object from step 1 as "angle".
curl -s -X POST $BASE/projects -H 'content-type: application/json' \
  -d '{"name":"…","settings":{"workflow":"explainer","durationSeconds":60,
       "format":"avatar","aspect":"16:9","brollProvider":"placeholder"},"angle":{…}}'

# 3. Script it
curl -s -X POST $BASE/projects/$ID/script

# 4. Edit scenes and approve. Only id is required per scene; omitted fields are kept.
curl -s -X PATCH $BASE/projects/$ID -H 'content-type: application/json' \
  -d '{"scenes":[{"id":"scene-2","motion":"arc-left","motionIntensity":0.8,"durationSeconds":7}]}'
curl -s -X PATCH $BASE/projects/$ID -d '{"scriptApproved":true}' -H 'content-type: application/json'

# 5. Footage, then the composition
curl -s -X POST $BASE/projects/$ID/assets -d '{}' -H 'content-type: application/json'
curl -s -X POST $BASE/projects/$ID/compose

# 6. Motion QA. autoCorrect fixes what it can and recomposes; useCli also runs
#    `npx hyperframes keyframes --json` when the CLI is installed.
curl -s -X POST $BASE/projects/$ID/qa -d '{"autoCorrect":true}' -H 'content-type: application/json'

# 7. Render (needs Node 22+, the hyperframes CLI, and FFmpeg)
curl -s -X POST $BASE/projects/$ID/render -d '{"fps":30,"quality":"standard"}' -H 'content-type: application/json'
```

`GET /api/video/config` lists workflows, motion presets, providers, and which
provider keys are actually set.

## Reading the QA report

`report.findings` is ordered error → warn → info. Each finding names the scene
and carries a `fix` that is safe to apply verbatim through `PATCH /projects/:id`.
`report.tracks` is every keyframe in the composition — `{sceneId, target,
property, keys:[{t, value}]}` — which is what to read when asked *why* a shot
looks wrong rather than *whether* it does.

Errors mean the video is broken (a keyframe outside its clip window, a scene
with no footage). Warnings mean it will render but read badly (a camera past its
overscan, four identical moves, narration nobody can say in the time given).

## Writing a composition by hand

If a request needs a shape the generator does not cover, write the HTML directly
and skip `compose`. The renderer contract is small:

- Root element carries `data-composition-id`, `data-width`, `data-height`,
  `data-duration`.
- Timed elements carry `data-start` and `data-duration` in seconds. Visibility is
  keyed off those, not off CSS.
- Media elements also take `data-media-start` (trim) and `data-volume`.
- Exactly one **paused** GSAP timeline per composition, registered as
  `window.__timelines["<composition-id>"]`. The renderer seeks it per frame, so
  nothing may run on its own clock — no `setInterval`, no unseekable CSS
  animation, no `Date.now()`.
- Animate only `opacity`, `x`, `y`, `scale`, `rotation`, `width`, `height`.

Camera moves go on a wrapper, never on the timed clip itself. This repo nests
three (`cam-x` → `cam-y` → `cam-z`) so an arc is a linear `x` track paired with an
eased, bowed `y` track — no motion-path plugin, and every property stays
seek-safe. See `lib/video/motion.ts` for the preset table and
`lib/video/compose.ts` for how keyframes become GSAP calls.

Keep travel inside the overscan: layers are `OVERSCAN` (18%) larger than the
frame, so a move may travel at most 9% of the frame in any direction before an
edge shows. `lib/video/qa.ts` enforces this.

## Providers

Generation never fails the pipeline. Without `FAL_KEY` / `HEYGEN_API_KEY` the
providers fall back to locally generated placeholder cards and record why on the
asset, so compose, preview, QA, and render all still work. Check
`GET /api/video/config` → `availability` before telling a user a provider ran.
