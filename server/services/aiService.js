// ==========================================
// AI CAREER ANALYSIS SERVICE (Groq)
// ==========================================

const { debug } = require("./logger");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const getGuidance = (careerGoal) => {
  const goal = String(careerGoal || "").toLowerCase();

  if (
    goal.includes("mern") ||
    goal.includes("full stack") ||
    goal.includes("web developer")
  ) {
    return "Focus areas: advanced React, REST APIs, authentication and authorization, testing, TypeScript, backend architecture, database optimization, Git/GitHub, Docker, deployment.";
  }

  if (goal.includes("project manager") || goal.includes("project management")) {
    return "Focus areas: project planning, Agile/Scrum, team coordination, risk management, PM tools, SDLC, communication, documentation, stakeholder management.";
  }

  return `Focus on practical, job-relevant skills for: ${careerGoal}.`;
};

const generateCareerAnalysis = async (profile) => {
  const { education, gpa, skills, interests, careerGoal } = profile;

  const currentSkills = Array.isArray(skills) ? skills : [];
  const currentInterests = Array.isArray(interests) ? interests : [];

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY .env file mein nahi mili.");
  }

  const systemPrompt = `You are CareerAI, a professional career advisor for university students.
Return ONLY valid JSON in exactly this structure:
{
  "careerRecommendations": [{"title": "...", "reason": "..."}],
  "skillGaps": ["..."],
  "learningRoadmap": [{"title": "...", "description": "..."}]
}
Rules:
- Exactly 3 careerRecommendations (reason under 25 words).
- Exactly 5 skillGaps: NEW skills, 2-5 words each, never from the student's current skills.
- Exactly 5 learningRoadmap steps that develop those skill gaps (title under 8 words, description under 30 words).
- Roadmap order: foundation, related skill, practical work, advanced/job-ready, real project or deployment.
- The career goal is the top priority. No extra fields, no markdown.`;

  const userPrompt = `Education: ${education}
GPA: ${gpa}
Current skills: ${currentSkills.join(", ")}
Interests: ${currentInterests.join(", ")}
Career goal: ${careerGoal}

${getGuidance(careerGoal)}`;

  const normalizedCurrentSkills = currentSkills.map((s) =>
    String(s).toLowerCase().trim(),
  );

  const isExistingSkill = (gap) => {
    const g = String(gap).toLowerCase().trim();
    return normalizedCurrentSkills.some(
      (s) => g === s || (s.length > 2 && g.includes(s)),
    );
  };

  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const start = Date.now();

    try {
      debug("");
      debug("==========================================");
      debug(`AI ANALYSIS ATTEMPT ${attempt}/${maxAttempts} (Groq: ${MODEL})`);
      debug("==========================================");

      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: attempt === 1 ? 0.2 : 0.5,
          max_tokens: 2500,
          // gpt-oss soch kar jawab deta hai; low rakhne se tez rehta hai
          ...(MODEL.startsWith("openai/gpt-oss")
            ? { reasoning_effort: "low" }
            : {}),
        }),
      });

      debug(`GROQ RESPONSE TIME: ${((Date.now() - start) / 1000).toFixed(2)}s`);

      if (!response.ok) {
        // Groq ka response body error message mein nahi daal rahe (leak se bachne ke liye)
        throw new Error(`Groq API error ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (typeof content !== "string" || !content.trim()) {
        throw new Error("Groq ne empty response diya.");
      }

      let analysis;

      try {
        analysis = JSON.parse(content);
      } catch {
        // Raw content log nahi karte (user ka personal data ho sakta hai)
        throw new Error("Groq ne invalid JSON diya.");
      }

      if (Array.isArray(analysis.careerRecommendations)) {
        analysis.careerRecommendations = analysis.careerRecommendations.slice(
          0,
          3,
        );
      }

      if (Array.isArray(analysis.skillGaps)) {
        analysis.skillGaps = analysis.skillGaps.slice(0, 5);
      }

      if (Array.isArray(analysis.learningRoadmap)) {
        analysis.learningRoadmap = analysis.learningRoadmap
          .slice(0, 5)
          .map((item, i) => ({
            step: i + 1,
            title: String(item?.title || "").trim(),
            description: String(item?.description || "").trim(),
          }));
      }

      const okRecs =
        Array.isArray(analysis.careerRecommendations) &&
        analysis.careerRecommendations.length === 3 &&
        analysis.careerRecommendations.every(
          (r) =>
            r && String(r.title || "").trim() && String(r.reason || "").trim(),
        );

      const okGaps =
        Array.isArray(analysis.skillGaps) &&
        analysis.skillGaps.length === 5 &&
        analysis.skillGaps.every((s) => typeof s === "string" && s.trim());

      const okRoadmap =
        Array.isArray(analysis.learningRoadmap) &&
        analysis.learningRoadmap.length === 5 &&
        analysis.learningRoadmap.every((r) => r.title && r.description);

      const noExistingGap = okGaps && !analysis.skillGaps.some(isExistingSkill);

      if (okRecs && okGaps && okRoadmap && noExistingGap) {
        debug("AI RESPONSE VALIDATED SUCCESSFULLY");
        debug(
          `TOTAL AI SERVICE TIME: ${((Date.now() - start) / 1000).toFixed(2)}s`,
        );
        return analysis;
      }

      debug(
        `INVALID -> recs:${okRecs} gaps:${okGaps} roadmap:${okRoadmap} noExistingGap:${noExistingGap}. RETRYING...`,
      );
    } catch (error) {
      console.error(`AI attempt ${attempt} error:`, error.message);
    }
  }

  throw new Error(
    "AI could not generate a valid career analysis after multiple attempts.",
  );
};

module.exports = generateCareerAnalysis;
