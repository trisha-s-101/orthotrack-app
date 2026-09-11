# Architecture Decision Records

Key design decisions made during OrthoTrack development, with reasoning.

---

## ADR-001: JWT forwarding over service_role key for backend Supabase access

**Date:** Sometime in late July/early August (find date later)
**Status:** Decided

**Context:**
The Flask backend needs to read and write Supabase tables on behalf of the authenticated user (fetching injury records, inserting ROM sessions). Two options exist:
- Use the `service_role` key, which bypasses Row Level Security entirely
- Forward the user's JWT from the incoming `Authorization` header to a user-scoped Supabase client

**Decision:** Forward the user's JWT and construct a per-request Supabase client with it.

**Why:**
The `service_role` key would require writing authorization logic in Flask — checking that the `injury_id` in the request actually belongs to the authenticated user before every database operation. This duplicates what Supabase RLS already enforces declaratively. By forwarding the JWT, RLS runs automatically: the backend literally cannot return or modify another user's data without a deliberate code change to bypass it. The security boundary lives in one place (RLS policies), not spread across Flask route handlers.

**Tradeoff:**
The user's access token must be extracted from the request headers and threaded through to every Supabase call. Expired tokens cause 401s that require the user to re-authenticate. This is acceptable for a rehab tracking app where sessions refresh on a normal Supabase schedule, and the security benefit outweighs the plumbing cost.

---

## ADR-002: MediaPipe (local Python) over a cloud vision API for pose estimation

**Date:** July
**Status:** Decided

**Context:**
OrthoTrack needs to extract joint angles from rehabilitation exercise videos. Options considered:
- Send video frames to a cloud vision API (Google Cloud Vision, AWS Rekognition, Azure Video Indexer)
- Run MediaPipe Pose locally on the Flask server

**Decision:** MediaPipe running locally on the Flask backend, with no video frames leaving the server.

**Why:**
Rehabilitation videos are sensitive health data — they show a patient's body and movement patterns, often in a home or clinical setting. Sending this to a third-party API creates a data-custody problem: the frames leave the user's control, may be retained for model training, and introduce a HIPAA-adjacent privacy risk even for a non-covered-entity app. Running MediaPipe locally means video frames are processed in memory and never transmitted beyond the user's own request. Additionally, MediaPipe runs in real time on CPU with no per-call cost, which keeps the app free to use at any scale. 

**Tradeoff:**
The Flask server must have MediaPipe and its model weights installed (`pose_landmarker_lite.task`). Inference is CPU-bound, so very long videos are slower than a cloud API with dedicated GPU infrastructure. For typical 30–60 second rehab exercise clips this is not a bottleneck in practice.

---

## ADR-003: Personal longitudinal trends instead of population-norm comparisons

**Date:** Early August 
**Status:** Decided

**Context:**
ROM measurements (e.g. knee flexion angle) could be presented two ways:
- Compare the user's value against published clinical population norms ("your ROM is X% of normal")
- Track the user's own progress over time ("your ROM improved Y° since last session")

**Decision:** Track personal progress only. The app never presents population-norm comparisons.

**Why:**
Published ROM norms vary significantly by age, sex, injury type, surgical approach, time post-op, and measurement method. Presenting a single "normal" threshold to a recovering patient without clinical context can be misleading or psychologically harmful — a user at 6 weeks post-ACL-reconstruction seeing "62% of normal" has no way to interpret whether that is good, expected, or alarming without their physical therapist's input. The app is not a diagnostic tool and should not imply clinical benchmarks it cannot validate. Longitudinal personal trends (did I improve?) are both safer and more actionable for a self-tracking user: the relevant comparison is always "am I better than I was last week?" As the developer,  I do not have a medical background nor the ability to generate user-specific comparisons, so these features exist solely to supplement patients and physical therapists, not replace them or in any way offer medical advice.

**Tradeoff:**
The app cannot tell a new user whether their ROM is concerning in an absolute sense. This is a deliberate limitation. Any clinical threshold logic would require involving a licensed clinician in the product design, which is out of scope. All heuristics in the app (e.g. goal targets) are user-set, not medically prescribed. The app explicitly states this on every page as a disclaimer.
