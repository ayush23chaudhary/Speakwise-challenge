const axios = require('axios');

/**
 * Evaluate speech using Gemini AI (Optimized for speed & accuracy)
 * @param {string} transcript - The transcribed text
 * @param {number} duration - Recording duration in seconds (optional)
 * @returns {Promise<Object>} - Evaluation results with scores and feedback
 */
async function evaluateSpeech(transcript, duration = 60) {
  try {
    if (!transcript || transcript.trim().length === 0) {
      return generateDefaultScores();
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    // Using Gemini 2.5 Flash for fastest processing (latest model)
    const GEMINI_MODEL = 'gemini-2.5-flash';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    // Calculate speech metrics
    const wordCount = transcript.split(' ').length;
    const wordsPerMinute = Math.round((wordCount / duration) * 60);

    const prompt = `
You are an expert English speech evaluator trained on CEFR standards. Analyze this ${duration}-second introduction.

Transcript: "${transcript}"

Metrics: ${wordCount} words, ${wordsPerMinute} WPM

Evaluate strictly:
- Fluency: Natural pace (120-150 WPM ideal), smooth flow, minimal hesitations
- Pronunciation: Clear articulation (infer from text quality)
- Grammar: Proper tenses, subject-verb agreement, sentence variety
- Vocabulary: Range, accuracy, sophistication
- Confidence: Assertiveness, clarity, pace consistency
- Structure: Clear intro-body-conclusion, logical progression
- Filler Words: Penalize excessive hesitations (um, uh, like, you know)

Return ONLY this JSON (no markdown):
{
  "scores": {
    "overall": <0-100>,
    "fluency": <0-100>,
    "pronunciation": <0-100>,
    "grammar": <0-100>,
    "vocabulary": <0-100>,
    "confidence": <0-100>,
    "structure": <0-100>,
    "fillerWords": <0-100>
  },
  "feedback": {
    "detailed": "<2-3 sentences overall feedback>",
    "improvementTips": ["<tip1>", "<tip2>", "<tip3>"],
    "strengths": ["<strength1>", "<strength2>"],
    "areasToImprove": ["<area1>", "<area2>"]
  }
}

Score fairly. Be concise.
`;

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response (handling markdown code blocks)
    let jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/);
    if (!jsonMatch) {
      jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    }
    
    if (jsonMatch) {
      const evaluation = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return evaluation;
    } else {
      console.error('Failed to parse AI response');
      return generateDefaultScores();
    }
  } catch (error) {
    console.error('Evaluation error:', error.message);
    return generateDefaultScores();
  }
}

/**
 * Generate default/fallback scores
 */
function generateDefaultScores() {
  return {
    scores: {
      overall: 50,
      fluency: 50,
      pronunciation: 50,
      grammar: 50,
      vocabulary: 50,
      confidence: 50,
      structure: 50,
      fillerWords: 50
    },
    feedback: {
      detailed: 'Evaluation could not be completed. Please try again.',
      improvementTips: ['Practice more', 'Focus on clarity', 'Build confidence'],
      strengths: ['Participated in the challenge'],
      areasToImprove: ['All aspects need more practice']
    }
  };
}

module.exports = { evaluateSpeech };
