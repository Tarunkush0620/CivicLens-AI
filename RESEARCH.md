# CivicLens AI — Research Notes (RESEARCH.md)

**Companions:** `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `SKILL.md`
**Purpose:** the research foundation for CivicLens. It collects the problem background, related work, positioning, technical findings, testable hypotheses, and an evaluation method. Use it to write the related-work and evaluation sections of the technical report for the IEEE Computer Society AI Rising Stars Award (deadline 15 December, 11:59 PM EDT).
**Last researched:** 25 October 2026. Web sources change, so re-check anything you cite before submission.

> **How to use this file honestly.** Section 12 separates what the sources support from what is still an assumption. Do not copy a claim into the award application until it is marked "supported" or you have verified it yourself. Sources below were summarized in my own words. Read the originals before citing.

---

## 1. Research Framing

### 1.1 Problem statement
Citizens notice civic problems (potholes, garbage, broken streetlights) far more often than they report them. Reporting takes effort: choosing a category, finding the right department, describing the problem, and giving a location. Authorities then receive reports of uneven quality, often with duplicates, and the reporter rarely sees verified follow-up.

### 1.2 Core idea
Use a general multimodal model (Gemini) to turn a single citizen photograph into a structured, explainable, de-duplicated, trackable case, then use the same model family to compare before and after photos to support resolution verification, with humans confirming the AI at each decision point.

### 1.3 Research questions

| ID | Question |
|----|----------|
| RQ1 | How accurately can a general-purpose multimodal model classify civic issue type and severity from a single citizen-taken photo, without task-specific training? |
| RQ2 | Do model-generated complaints reduce citizen effort while remaining accurate, complete, and acceptable to users? |
| RQ3 | Can combining location, category, and text-embedding similarity detect duplicate reports reliably enough to reduce redundant cases? |
| RQ4 | Can a multimodal model judge before/after photo pairs well enough to support (not replace) human resolution verification? |
| RQ5 | What are the failure modes, fairness risks, and privacy risks of this workflow, and how well do the safeguards (confidence thresholds, human confirmation, EXIF stripping) work? |

---

## 2. Background and Context

### 2.1 Participatory civic reporting is established, and uneven
- **FixMyStreet (UK, mySociety).** A research report covering 2007-2017 found over 1.1 million neighborhood-issue reports sent to local authorities through the service. The authors note that reporting varies across places because of differences in awareness of the service and in people's propensity to report. [R5]
- **SeeClickFix (US).** Studies of Albany, NY data link reporting behavior to neighborhood characteristics. One study combines reporting data with demographic and socioeconomic indicators, and a related conference abstract concludes that neighborhood characteristics affect adoption, which may lead to inequities in access to public services. [R4, R6]
- **Related bias evidence.** Work on New York City's 311 system describes under-reporting of some problems by some subpopulations, because resident-generated data suffer from reporting bias. [R4]

**Implication for CivicLens:** a reporting tool can improve convenience and still amplify unequal reporting. The evaluation and discussion should treat equity as a first-class concern, not an afterthought (see Sections 9 and 11).

### 2.2 The Indian context
- **Swachhata-MoHUA.** The Ministry of Housing and Urban Affairs' app, built by Janaagraha's IChangeMyCity, lets a citizen post a photo of a civic issue such as a garbage dump. The complaint is forwarded to the city corporation and assigned to the ward's sanitary inspector. The citizen receives a push notification with a "resolved" image uploaded by the official and can reopen the complaint if unsatisfied. A 2020 news item reported more than 1.7 crore urban users. [R8, R9]
- **Uttar Pradesh Jansunwai / IGRS.** A coordinated grievance redressal portal run by the state government. District pages describe it as bringing complaints from different channels onto one platform for disposal and monitoring, with online registration and tracking and a 1076 helpline. [R10]
- **Observation:** India already has large grievance platforms with tracking and photo-based resolution evidence. CivicLens should not claim to invent civic reporting. Its contribution is in the AI layer in front of such platforms: structured understanding of the photo, explanation, de-duplication, and automated before/after support.

### 2.3 Road damage detection is an established research area
- The **IEEE Big Data Cup** has run road damage detection challenges since 2018. The CRDDC'2022 summary paper reports that after the 2018 challenge several municipalities in Japan began using automatic detection systems, and that practical feedback showed the algorithms needed to be more robust. [R2]
- **RDD2022** contains 47,420 road images from six countries (Japan, India, the Czech Republic, Norway, the United States, China) with more than 55,000 annotated damage instances covering four damage types, including potholes. [R1, R3]
- CRDDC'2022 drew over 60 registered teams from 19 countries; the best solution used an ensemble of YOLO and Faster R-CNN family models and reached an F1 of about 76% on combined test data. [R2]
- RDD images were mostly collected from **vehicle-mounted smartphones**, so they show roads from a driver's viewpoint. [R1]

**Implication:** supervised detectors (YOLO-style) are the standard baseline for pothole and crack detection. CivicLens uses a different input (citizen close-up photos) and a different goal (structured civic case creation, not network-wide survey), so the comparison must be framed carefully (Section 7).

---

## 3. Existing Solutions: Comparison

| Solution | What it does (from sources reviewed) | What CivicLens adds or changes |
|----------|---------------------------------------|--------------------------------|
| **FixMyStreet** | Citizens report local problems to the responsible authority; large-scale long-running dataset [R5] | AI-based photo understanding and drafting; duplicate suggestion; AI resolution check |
| **SeeClickFix** | Participatory reporting to local government; academic studies use its data to study participation and issue-type inference [R4] | Same as above, in an Indian context |
| **Swachhata-MoHUA** | Photo-based complaint, routed to city corporation and ward official, with resolution photo and reopen option [R8, R9] | AI classification and severity explanation at submission; semantic duplicate detection; AI check of the resolution photo |
| **UP Jansunwai / IGRS** | Unified grievance portal with online registration and tracking [R10] | Photo-first, low-effort submission and structured complaint generation that could feed such portals |
| **Supervised road-damage detectors (RDD / CRDDC)** | Detect and classify road damage in images, strong when trained and tuned for the task [R1, R2] | Broader issue types (garbage, streetlights, manholes) without per-class training; natural-language reasoning and complaint drafting |

**Caution on the "gap":** the sources show these tools' core features. They do not prove that none of them has AI categorization or duplicate handling internally. Before claiming a gap, check each product's current features and phrase the claim as "in the documentation we reviewed, ..." (see Section 12).

---

## 4. Related Academic Work

### 4.1 Multimodal models for road and infrastructure assessment
- **V-RoAst (zero-shot VQA for road safety).** Evaluates Gemini-1.5-flash and GPT-4o-mini on classifying road-safety attributes (iRAP standard) using over 2,000 street-level images from Thailand, compared against VGGNet and ResNet baselines. The authors report that the general VLMs underperform on spatial awareness and, in some versions, trail the supervised baselines, yet they generalize to unseen classes and offer flexible prompt-based reasoning without retraining; they conclude VLMs can serve as road assessment tools when combined with complementary data. [R7]
- **Benchmark of multimodal LLMs for pavement condition (PLOS One, 2026).** Evaluates seven models (three proprietary: Gemini 2.5 Pro, OpenAI o1, GPT-4o; four open-source: Gemma 3, Llama 3.2, two LLaVA variants) on four tasks: distress and feature identification, spatial pattern recognition, severity evaluation, and maintenance-interval estimation. It scores response rate, correctness, consistency, multimodal errors, and cost, and recommends GPT-4o as the best balance. [R11]
- **Zero-shot traffic accident detection with MLLMs (IAVVC 2025).** Tests Gemini and other models on infrastructure-camera images. Reported results show a trade-off: prompt changes raised precision for some models while lowering recall and F1. [R12]

**What this means for CivicLens:**
1. Zero-shot general models are plausible for this task but are **not uniformly strong**, especially on spatial reasoning and severity. Treat severity as the riskiest output and measure it separately (H2).
2. Prompting changes the precision/recall balance, so **prompt versions must be tracked and reported** (already in `ARCHITECTURE.md` section 7.5).
3. Cost and consistency matter alongside accuracy, so log them.
4. Your reporting should cover a **model comparison** if budget allows (for example Gemini versus one open-source model on the same test set), since the literature evaluates several models.

### 4.2 Civic reporting analytics
- Yong et al. use SeeClickFix data to study participation and also propose near-real-time processing to infer issue type or importance from incoming reports, framing accurate online processing as necessary for timely handling. [R4]
- This supports the premise that **automated triage of citizen reports is a recognized research need**, and it gives you a related-work anchor for the AI categorization component.

### 4.3 Government 2.0 and civic technology
- A 2024 IEEE ISMSIT paper compares urban-issue-reporting applications (Na Minha Rua LX in Lisbon, SeeClickFix, My City Report, FixMyStreet) and concludes that realizing the potential of these platforms needs ongoing evaluation, development, and integration into broader urban management. [R13]
- Use this to justify CivicLens's emphasis on **tracking, dashboards, and resolution verification** rather than submission alone.

---

## 5. Technical Research Findings (Gemini and Related)

These findings come from the Gemini API documentation. Verify against the live docs when you implement, because Google changes model names and SDK surfaces frequently.

### 5.1 Object detection output format (correction needed in earlier docs)
Gemini's documented bounding-box format is `box_2d = [ymin, xmin, ymax, xmax]` with coordinates **normalized to 0-1000**, relative to the image size. You convert to pixels by dividing by 1000 and multiplying by the image width or height. [R14]

**Action:** `DESIGN.md` and the schema example I wrote earlier used a 0-1 range. Switch to the documented format: store `box_2d` as integers 0-1000 in `[ymin, xmin, ymax, xmax]` order and convert in the client. (I have updated `DESIGN.md`; see the reply.)

### 5.2 Structured output
The documentation shows responses constrained to a schema defined with Pydantic (Python) or Zod (JavaScript) and parsed from the model's text output. This matches the Zod-based validation in `ARCHITECTURE.md`. [R14]

### 5.3 API surface may have changed
The current documentation examples use a newer "interactions" style call and recent model names, whereas the earlier `PRD.md` and `ARCHITECTURE.md` described `generateContent` through `@google/genai`. **Before coding, read the current Gemini API docs, confirm the SDK method names and the model identifier you will use, and record both in `.env.example` and the report.** The wrapper design in `ARCHITECTURE.md` (a single `gemini.ts`) means only one file changes. [R14]

### 5.4 Object detection is trained behavior, not guaranteed precision
The docs describe detection as a capability of the models, but it is not a specialized detector with published per-class accuracy for civic issues. Treat the box as a **visual aid**, evaluate it (IoU against your own labels on a subset), and hide it when absent or implausible.

### 5.5 Model drift
Because the model is hosted, behavior can change when versions change. Pin the model name in config, store `model_name` and `prompt_version` with each analysis, and rerun the evaluation before the final submission and again if you change either.

---

## 6. Positioning and Contribution Claims

### 6.1 Defensible contribution statements (draft)
Phrase these as what the project does and shows, not as firsts:

1. **A complete, evidence-to-resolution workflow** built on a general multimodal model: structured analysis with explanations, complaint drafting, duplicate detection, case tracking, and AI-assisted before/after verification, with human confirmation at key steps.
2. **A measured evaluation** of zero-shot civic-issue classification and severity on citizen-style photos from an Indian urban setting.
3. **A duplicate detection method** that combines geospatial proximity, category, and text-embedding similarity, with measured precision and recall and threshold analysis.
4. **A responsible-AI design**: schema validation of model output, confidence gating, EXIF stripping, privacy warnings, and an honest limitations analysis.
5. **An open, reproducible artifact**: public code, a labelled evaluation set (subject to consent and privacy checks), and prompt/model versions.

### 6.2 Claims to avoid unless verified
- "First" or "novel" in any absolute sense (you have not done a systematic literature review).
- "Production ready", "deployed with the municipality", or any impact on real resolution times without data.
- Accuracy figures not produced by your own `evaluate.ts` runs.
- Numbers in the UI mockups (12,450 issues, 76% resolution rate). They are design placeholders, not results.

### 6.3 Suggested framing for the award (originality, AI integration, impact)
- **Originality:** the integrated evidence-to-resolution pipeline and the duplicate/before-after components, grounded in a gap analysis of existing platforms.
- **AI integration:** four explicit Gemini stages (vision analysis, complaint generation, embeddings, comparison), each with validation and evaluation (see `ARCHITECTURE.md` section 7).
- **Measurable impact:** time-to-submit versus manual filing, classification accuracy, duplicate precision/recall, user satisfaction from a pilot (Section 8).

---

## 7. Hypotheses, Baselines, and Experiments

| ID | Hypothesis | Measure | Baseline / comparison |
|----|-----------|---------|------------------------|
| **H1** | Zero-shot Gemini classifies civic issue type with accuracy comparable to a reasonable supervised baseline on common categories | Accuracy, per-class precision/recall/F1, confusion matrix | (a) Majority-class baseline; (b) optionally a fine-tuned small image classifier on your labelled set; (c) a second VLM |
| **H2** | Severity ratings agree with human raters within one level at least 80% of the time | Quadratic weighted Cohen's kappa, within-one-level agreement | Human-human agreement between your two annotators (the ceiling) |
| **H3** | AI-generated complaints are rated at least as clear and complete as manual ones, and cut filing time | 1-5 ratings by blind reviewers; time in seconds; edit ratio (AI text vs final text) | Manual complaint filing by the same participants |
| **H4** | The combined duplicate score beats location-only matching | Precision, recall, F1 at several thresholds; PR curve | (a) Location-only within radius; (b) text-similarity-only |
| **H5** | AI before/after check agrees with human judgment on resolution status | Accuracy and confusion matrix over 4 labels; false "resolved" rate (the costly error) | Human labels from two annotators |
| **H6** | Confidence gating reduces wrong submissions | Error rate among low-confidence vs high-confidence outputs; calibration curve | No-gating condition |
| **H7** | The tool works acceptably across neighborhood types, lighting, and image quality | Accuracy broken down by area, time of day, camera quality | Overall accuracy |

**Optional comparison with supervised detectors:** for the pothole class only, evaluate a pretrained or fine-tuned YOLO-style detector (trained on RDD2022 [R1]) against Gemini on **your** pothole photos. Expect a domain shift: RDD images are mostly vehicle-mounted views, while citizen photos are close-ups from varied angles. Report this shift as a finding rather than hiding it. Check the RDD2022 license and terms before using it.

---

## 8. Evaluation Methodology

### 8.1 Dataset construction
- **Size target:** 150-300 images; at least 15-20 per category so per-class numbers mean something.
- **Sources:** your own photos around campus and Greater Noida (best), volunteer contributions with written consent, and properly licensed public images. Record the source and license per image in `labels.csv`.
- **Include negatives and hard cases:** images with no issue, blurry, night-time, partial, multiple issues, look-alikes (a manhole cover that is closed vs open).
- **Splits:** development set (for prompt tuning) and held-out test set (touched once at the end). Do not tune prompts on the test set.
- **Privacy:** no identifiable faces or number plates in the stored evaluation set; blur or exclude.

### 8.2 Annotation protocol
- Two annotators label each image independently (category, severity on the 4-level rubric, duplicate groups). A third resolves disagreements.
- Write a one-page labelling guideline with the severity rubric and examples before labelling.
- Report **inter-annotator agreement** (Cohen's kappa for category; weighted kappa for severity). This sets the ceiling for model performance.

### 8.3 Metrics
- **Classification:** accuracy, macro and per-class precision/recall/F1, confusion matrix.
- **Severity:** weighted kappa, within-one-level agreement, mean absolute error on the ordinal scale, and the rate of under-rating (calling a dangerous case low), which matters most for safety.
- **Detection box (if used):** IoU against labelled boxes on a 50-image subset; report the fraction with IoU of at least 0.5.
- **Complaint quality:** blind human ratings (clarity, completeness, formality, factual consistency with the photo, 1-5); hallucination check (does the text assert anything not visible or provided?).
- **Duplicate detection:** precision, recall, F1, PR curve across threshold values; analysis of false merges (harmful) and missed duplicates (wasteful).
- **Resolution check:** confusion matrix; false-resolved rate.
- **Efficiency:** time from opening the app to submitted case (median, IQR) vs the manual baseline.
- **System:** latency p50/p90/p99 per Gemini stage, cost per case, error and timeout rates.
- **Usability:** System Usability Scale (SUS) plus 2-3 open questions.

### 8.4 Statistical reporting
- Report 95% confidence intervals using bootstrap resampling over images (1,000+ resamples).
- For paired comparisons (AI vs manual filing time for the same participant), use a paired test (Wilcoxon signed-rank) and report effect sizes.
- Report all runs, not just the best prompt. State the number of prompt iterations tried on the dev set.
- With small samples, say so plainly and avoid over-precision (report 84%, not 84.37%).

### 8.5 User pilot design
- **Participants:** 20-30 students and local residents, with varied phone types and tech familiarity.
- **Tasks:** each participant reports 2-3 provided or real issues, once manually (writing the complaint themselves and choosing a category and department) and once with CivicLens. Counterbalance the order to avoid learning effects.
- **Data collected:** timings, edits to the AI text, SUS, short interview notes. No personal identifiers stored.
- **Approval:** get faculty or institutional sign-off for the pilot, and give participants an information sheet and consent form.

### 8.6 Reproducibility package
Publish: code, prompts with version tags, model identifiers, evaluation scripts, `labels.csv` (with consent-permitted images), and the exact commands to reproduce the tables. Store raw outputs from each run so any number in the report can be traced.

---

## 9. Threats to Validity

| Threat | Description | Mitigation |
|--------|-------------|-----------|
| **Selection bias** | Photos taken by you and friends look different from typical citizen photos | Recruit varied photographers; include low-quality images; report image-quality breakdown |
| **Dataset size** | Small test set gives wide confidence intervals | Report CIs; avoid strong claims for rare classes |
| **Label subjectivity** | Severity is partly subjective | Two annotators, rubric, report kappa |
| **Prompt overfitting** | Tuning prompts on data later used for testing | Strict dev/test separation |
| **Model drift** | Hosted model updates change behavior | Pin version; record in every result; rerun before submission |
| **Ecological validity** | Pilot users are students, not typical residents | Include some non-student residents; state the limitation |
| **Simulated routing** | Departments are not real integrations | Say clearly that routing is a simulation and impact on real resolution is untested |
| **Novelty effect** | Users like new tools in the first session | Note it; collect free-text feedback |
| **Geographic specificity** | Results from Greater Noida may not generalize | Frame as a case study; discuss extension |

---

## 10. Limitations to State Openly

1. A single photo cannot give true size, depth, or traffic context, so severity is a visual judgment and not an engineering measurement.
2. Zero-shot general models can be inconsistent and sensitive to prompt wording (see [R11, R12]).
3. Duplicate detection depends on GPS accuracy and description similarity, and can merge or miss cases.
4. The admin authentication is demo-grade.
5. There is no real municipal integration, so the effect on actual repair time is unmeasured.
6. Public photographs can capture faces or number plates despite warnings. Automatic blurring is future work.

Stating these plainly strengthens a research submission. Reviewers distrust work that claims no weaknesses.

---

## 11. Ethics, Privacy, and Responsible AI

- **Data minimization:** the app stores only photo, location, and complaint text; EXIF is stripped.
- **Consent:** pilot participants and anyone whose photos enter the evaluation set must agree in writing. Do not include photos with identifiable people.
- **Transparency:** tell users that images are analyzed by an external AI service (Google's Gemini API) and describe retention accurately. Check Google's current terms for the API tier you use.
- **Human oversight:** the user edits the complaint; the admin confirms resolution. The AI never closes a case on its own.
- **Equity:** reporting platforms reflect who uses them [R4, R6]. Analyze performance by area and photo quality, discuss how a photo-first tool might help people with less time or writing confidence yet still exclude those without smartphones, and avoid using report volume alone to rank neighborhoods.
- **Misuse:** consider false or malicious reports, and use of the platform for harassment (for example photographing neighbors). Keep rate limits, the "none detected" gate, and admin review.
- **Accountability:** log model, prompt version, and decisions so errors can be traced.

---

## 12. Evidence Status: What Is Supported, What Is Not Yet

| Statement | Status | Source or next step |
|-----------|--------|---------------------|
| Civic reporting platforms exist at scale and reporting is uneven across places | Supported | [R4, R5, R6] |
| India has photo-based grievance tools with tracking and resolution photos | Supported | [R8, R9, R10] |
| RDD2022 has 47,420 images, six countries, over 55,000 damage instances | Supported | [R1, R3] |
| Best CRDDC'2022 result was about 76% F1 | Supported | [R2] |
| General multimodal models have been benchmarked for road assessment with mixed results | Supported | [R7, R11] |
| Gemini bounding boxes use `box_2d` normalized to 0-1000 | Supported | [R14] |
| Existing platforms do **not** do AI severity explanation, semantic duplicate detection, and AI before/after checks | **Not verified** | Review each product's current feature list and release notes before claiming |
| CivicLens is "novel" | **Not verified** | Do a systematic search (Google Scholar, IEEE Xplore, arXiv) for "multimodal LLM civic complaint", "AI urban issue reporting", "duplicate detection citizen reports" and cite the closest work |
| CivicLens accuracy, F1, time saved | **Not yet measured** | Produce with `evaluate.ts` and the pilot |
| CivicLens reduces redundant complaints | **Not yet measured** | Needs duplicate evaluation and, ideally, a pilot with real reports |

---

## 13. Research Plan (about 7 weeks to the 15 December deadline)

| Week | Research tasks | Engineering dependency |
|------|----------------|------------------------|
| 1 | Write labelling guideline; start collecting photos; run a literature search for closest related work (Section 12); confirm Gemini SDK and model names | Phase 1 flow working |
| 2 | Finish dataset collection (150+ images); two-annotator labelling; compute agreement | `evaluate.ts` skeleton |
| 3 | Dev-set prompt iterations; run test set once; draft results for H1, H2 | Analysis stage stable |
| 4 | Duplicate pairs dataset; run H4 with ablations; resolution pairs for H5 | Duplicate and before/after features built |
| 5 | Pilot study (20-30 participants), SUS, timing | Deployed public demo |
| 6 | Analysis, charts, fairness breakdown (H7), limitations | Metrics page |
| 7 | Write the report (2-4 pages), record the demo video, get the faculty recommendation letter, final model/prompt freeze and rerun | Freeze code |

**Do not slip the order:** collect and label data early. It is the longest lead-time item and the one most often left too late.

---

## 14. Suggested Structure for the Technical Report (2-4 pages)

1. **Introduction:** problem, gap, contribution (3-4 sentences each).
2. **Related work:** civic reporting platforms (Section 2.1-2.2, 3), road-damage detection (2.3), multimodal models for infrastructure assessment (4.1).
3. **System:** pipeline diagram, Gemini stages, human-in-the-loop controls (from `ARCHITECTURE.md`).
4. **Evaluation:** datasets, annotation, metrics (Section 8).
5. **Results:** tables for H1-H7 with confidence intervals; pilot findings.
6. **Responsible AI and limitations:** Sections 10-11.
7. **Conclusion and future work:** real municipal integration, multilingual support, automatic blurring, longitudinal deployment.
8. **Appendix:** prompts and versions, label guideline, reproduction steps.

---

## 15. References

Retrieved 25 October 2026. Read the originals before citing, and add DOIs and page numbers in your preferred IEEE format.

| ID | Source |
|----|--------|
| R1 | Arya, D., Maeda, H., Ghosh, S. K., Toshniwal, D., Sekimoto, Y. "RDD2022: A multi-national image dataset for automatic Road Damage Detection." arXiv:2209.08538 (2022); published in *Geoscience Data Journal* 11(4), 846-862 (2024), doi:10.1002/gdj3.260. https://arxiv.org/abs/2209.08538 |
| R2 | Arya, D., et al. "Crowdsensing-based Road Damage Detection Challenge (CRDDC'2022)." IEEE Big Data 2022; arXiv:2211.11362. https://arxiv.org/abs/2211.11362 |
| R3 | RDD2022 dataset record, figshare (posted 2022-10-29). https://figshare.com/articles/dataset/RDD2022_-_The_multi-national_Road_Damage_Dataset_released_through_CRDDC_2022/21431547 |
| R4 | Yong, C., Chelmis, C., Lee, W., Zois, D.-S. "Understanding Online Civic Engagement: A Multi-Neighborhood Study of SeeClickFix." NSF PAR 10196229. https://par.nsf.gov/biblio/10196229 |
| R5 | Matthews, P., Rae, A., Nyanzu, E., Parsons, A. "FixMyStreet! The geography of citizen reporting on neighbourhood issues in the UK." Consumer Data Research Centre report (2018). https://stir.ac.uk/research/hub/publication/1278085 |
| R6 | Lee, W., Yong, C., Zois, D.-S., Chelmis, C. "Who Reports What? Neighborhood Observation and Civic Participation through Technology." SSWR 29th Annual Conference abstract (2025). https://sswr.confex.com/sswr/2025/webprogram/Paper56002.html |
| R7 | Jongwiriyanurak, N., et al. "V-RoAst: Visual Road Assessment. Can VLM be a Road Safety Assessor Using the iRAP Standard?" arXiv:2408.10872; ICCV 2025 Workshops. https://arxiv.org/abs/2408.10872 |
| R8 | Swachhata-MoHUA app listing (Ministry of Housing and Urban Affairs; built by Janaagraha/IChangeMyCity). https://apps.apple.com/kh/app/swachhata-mohua/id1124033628 |
| R9 | Swachhata application overview, Vikaspedia; and MoHUA revised-app news item, April 2020 (user-base figure). https://vikaspedia.in/e-governance/mobile-governance/swachhata-app |
| R10 | Uttar Pradesh Jansunwai / IGRS district portal pages, e.g. Ghaziabad. https://ghaziabad.nic.in/en/service/jansunwai/ |
| R11 | "Multimodal generative AI for automated pavement condition assessment: Benchmarking model performance." *PLOS One* 21(2): e0340380 (2026), doi:10.1371/journal.pone.0340380. https://pmc.ncbi.nlm.nih.gov/articles/PMC12900301/ |
| R12 | "Investigating Traffic Accident Detection Using Multimodal Large Language Models." IEEE IAVVC 2025; arXiv:2509.19096. https://arxiv.org/abs/2509.19096 |
| R13 | Soares, J., Coutinho, C. "Urban issue reporting applications towards government 2.0." ISMSIT 2024, IEEE, doi:10.1109/ISMSIT63511.2024.10757230. http://hdl.handle.net/10071/35199 |
| R14 | Google. "Image understanding," Gemini API documentation (object detection, bounding-box format, structured output). https://ai.google.dev/gemini-api/docs/image-understanding |

---

## 16. Open Questions to Resolve Early

1. Which Gemini model and SDK call will you use, and what are its current rate limits and data-use terms for your tier?
2. Can you get permission to photograph issues in your university area, and is faculty sign-off needed for the pilot?
3. Is the RDD2022 India subset usable for a pothole comparison under its license, and is the domain gap too large to be informative?
4. Will you compare more than one model (for example Gemini vs an open-source VLM) given the 7-week window?
5. Which municipal portal (Noida/Greater Noida authority, UP Jansunwai) would you target for the integration story, and can you describe its submission path accurately without claiming an integration you haven't built?
6. Who will serve as the second annotator, and who will write the faculty recommendation?
