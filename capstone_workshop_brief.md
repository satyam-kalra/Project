# Skills for Hire Atlantic — Advanced Data + AI Program
## Week 8 TA Session: Capstone Project Workshop

**Duration:** 60 minutes  
**Format:** Workshop — bring your project  
**Prerequisites:** Capstone project in progress

---

## Capstone deliverables reminder
Your capstone submission consists of:
1. Walkthrough Video (5–7 minutes)
2. Written Response 1: Problem definition
3. Written Response 2: Approach and tool selection
4. Written Response 3: Reflection on learnings

---

## Part 1: Walkthrough Video (20 minutes)

### What the video must include
- Show what you built — walk through the actual work
- Show key results — demonstrate outputs, not just describe them
- Explain what results mean — connect back to your original problem
- Note limitations — assumptions, constraints, data issues

### Video structure (5–7 minutes)
- **0:00–0:30** — Brief intro: what problem you solved
- **0:30–3:00** — Walk through what you built (show code, dashboards, pipelines)
- **3:00–5:00** — Show and explain key results
- **5:00–6:00** — Discuss limitations and assumptions
- **6:00–7:00** — Wrap up: what this means for the problem

### Rubric: what gets a strong score
- **Limited (1 point):** Unclear execution, vague results, little acknowledgement of limitations
- **Adequate (2 points):** Clear demo, explains results at basic level, some acknowledgement of limitations
- **Strong (3 points):** Confident walkthrough, meaningful outputs explained in relation to the problem,
  thoughtful discussion of tradeoffs

### Recording tips
- Use screen recording with voiceover (Loom, OBS, Zoom recording)
- Test audio before recording the full video
- Practice once before recording final version
- Stay within 5–7 minutes — going over looks unprepared

---

## Part 2: Written Responses (30 minutes)

### Written Response 1: Problem Definition
**Question:** Describe the problem you chose to work on and why it is worth solving.

**What to include**
- Define the problem clearly — be specific, not vague
- Describe the context — who has this problem? what’s the current state?
- Identify a useful outcome — what does success look like?

**Example: weak vs strong**
- **Weak:** “I wanted to analyze sales data to find patterns.”
- **Strong:** “Atlantic seafood distributors lose an estimated 15% of inventory to spoilage due to
  unpredictable demand. I built a forecasting model to predict weekly orders by product category,
  helping procurement managers reduce over-ordering. A useful outcome is forecast accuracy within
  10% of actual demand.”

**Rubric**
- **Limited:** Problem is vague or overly broad, unclear who benefits
- **Adequate:** Problem is clear with reasonable context, outcome identified
- **Strong:** Specific problem with strong context, clear value articulation, explains who benefits
  and why

---

### Written Response 2: Approach & Tools
**Question:** Explain how you decided to approach the problem and which tools or techniques you
selected.

**What to include**
- High-level approach — what was your overall strategy?
- Specific tools/techniques — what from this course did you use?
- Why these choices were appropriate — justify your decisions
- Alternatives considered — what else could you have done?

**Example: weak vs strong**
- **Weak:** “I used Python and scikit-learn because that’s what we learned.”
- **Strong:** “I approached this as a time-series regression problem. I used pandas for data prep, created
  lag features to capture weekly patterns, and compared Linear Regression vs Random Forest. I chose
  Random Forest because initial EDA showed non-linear relationships between weather and sales. I
  considered ARIMA but chose the ML approach because I also had external features (weather,
  promotions) that ARIMA wouldn’t incorporate easily.”

**Rubric**
- **Limited:** Approach unclear, tool choices seem arbitrary, no alternatives considered
- **Adequate:** Logical approach, tools explained with basic justification, some acknowledgement of
  alternatives
- **Strong:** Well-structured approach aligned to problem, thoughtful tool justification, alternatives
  and tradeoffs explicitly considered

---

### Written Response 3: Reflection
**Question:** Write a reflection on what you learned by completing this project.

**What to include**
- What worked better or worse than expected — be specific
- What you would change next time — concrete improvements
- What this taught you about applying tools to real problems — bigger picture learning

**Example: weak vs strong**
- **Weak:** “I learned a lot about machine learning. The project was challenging but rewarding.”
- **Strong:** “Data cleaning took 60% of my time — far more than expected. The raw data had inconsistent
  date formats and missing values that broke my initial pipeline. Next time, I’d build validation checks
  earlier. I also learned that model accuracy isn’t everything — my Random Forest had better RMSE, but
  the simpler Linear Regression was easier to explain to stakeholders and ran 10x faster. This taught
  me that tool selection depends on the deployment context, not just performance metrics.”

**Rubric**
- **Limited:** Generic reflection, limited insight into what worked/didn’t, few concrete takeaways
- **Adequate:** Identifies what worked and didn’t, at least one meaningful insight
- **Strong:** Thoughtful and specific, clearly articulates lessons learned, shows growth grounded in
  actual execution

---

## Part 3: Common Issues (10 minutes)

### Video issues
- **Too long:** Cut explanations, show don’t tell. 7 minutes max.
- **Too descriptive:** Show actual execution, not just slides about what you did
- **No limitations discussed:** Every project has constraints — acknowledge them

### Written response issues
- **Vague problem:** “Analyze data” isn’t a problem. Who has the problem? What’s the cost?
- **No tool justification:** “I used X because we learned it” isn’t enough. Why was it appropriate?
- **Generic reflection:** Avoid “I learned a lot.” What specifically? Give examples.

### Data issues
- **Sensitive data:** Do NOT submit proprietary or personal data. Use public datasets or anonymize.
- **Data not included:** Provide sample data or clear sourcing instructions.

---

## Submission checklist
1. Video is 5–7 minutes (not over)
2. Video shows actual execution, not just slides
3. Video discusses limitations/assumptions
4. Response 1 defines a specific problem with clear context and outcome
5. Response 2 justifies tool choices and mentions alternatives
6. Response 3 includes specific examples of what worked/didn’t
7. No sensitive or proprietary data included

Good luck with your capstone submissions!
