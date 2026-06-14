const BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'gemma4';

async function ollamaGenerate(prompt, systemPrompt = '', stream = false) {
  const body = {
    model: MODEL,
    prompt,
    system: systemPrompt,
    stream,
    options: {
      temperature: 0.3,
      max_tokens: 4096,
    },
  };

  const url = `${BASE_URL}/api/generate`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  return response;
}

async function fetchJSON(prompt, systemPrompt) {
  const res = await ollamaGenerate(prompt, systemPrompt, false);
  const data = await res.json();
  return data.response;
}

function extractJSON(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export async function reviewCodeDiff(diff, title, language) {
  try {
    const systemPrompt = `You are a senior code reviewer. Review the provided code diff and return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "overall_assessment": "string summary",
  "issues": [{ "line_reference": number, "severity": "critical|warning|suggestion", "description": "string", "fix_suggestion": "string" }],
  "strengths": ["string"],
  "security_concerns": ["string"],
  "performance_notes": ["string"],
  "overall_score": number (1-10)
}`;

    const prompt = `Review this pull request:\nTitle: ${title}\nLanguage: ${language}\n\nCode Diff:\n${diff}`;
    const text = await fetchJSON(prompt, systemPrompt);
    const json = extractJSON(text);

    if (json) {
      return { success: true, review: json };
    }
    return { success: true, review: {
      overall_assessment: text,
      issues: [],
      strengths: [],
      security_concerns: [],
      performance_notes: [],
      overall_score: 5,
    }};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function explainCode(code, language, res) {
  try {
    const systemPrompt = 'You are a code explainer. Explain the provided code line by line in plain English. Be thorough but accessible. Break down complex concepts.';

    const prompt = `Explain this ${language} code in detail:\n\n${code}`;
    const response = await ollamaGenerate(prompt, systemPrompt, true);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        res.write('data: [DONE]\n\n');
        res.end();
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim()) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              res.write(`data: ${JSON.stringify({ text: json.response })}\n\n`);
            }
          } catch (e) { }
        }
      }
    }
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}

export async function fixBug(code, bugDescription, language) {
  try {
    const systemPrompt = 'You are a debugger. Analyze the code and bug description, then return ONLY valid JSON with this structure: { "bug_identified": "string", "root_cause": "string", "fixed_code": "string (the complete corrected code)", "explanation": "string" }';

    const prompt = `Language: ${language}\nBug Description: ${bugDescription}\n\nCode with Bug:\n${code}`;
    const text = await fetchJSON(prompt, systemPrompt);
    const json = extractJSON(text);

    if (json) {
      return { success: true, result: json };
    }
    return { success: true, result: {
      bug_identified: 'Could not parse AI response',
      root_cause: 'N/A',
      fixed_code: code,
      explanation: text,
    }};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function generateCode(description, language, complexity, res) {
  try {
    const systemPrompt = `You are a code generator. Generate ${complexity} complexity code based on the description. Output ONLY the code with brief comments.`;

    const prompt = `Generate ${language} code for: ${description}\nComplexity: ${complexity}`;
    const response = await ollamaGenerate(prompt, systemPrompt, true);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        res.write('data: [DONE]\n\n');
        res.end();
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim()) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              res.write(`data: ${JSON.stringify({ text: json.response })}\n\n`);
            }
          } catch (e) { }
        }
      }
    }
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}

export async function reviewCode(code, language) {
  try {
    const systemPrompt = 'You are a senior code reviewer. Review the provided code and return ONLY valid JSON with this exact structure: { "overall_assessment": "string", "issues": [{ "line_reference": number, "severity": "critical|warning|suggestion", "description": "string", "fix_suggestion": "string" }], "strengths": ["string"], "security_concerns": ["string"], "performance_notes": ["string"], "overall_score": number (1-10) }';

    const prompt = `Review this ${language} code:\n\n${code}`;
    const text = await fetchJSON(prompt, systemPrompt);
    const json = extractJSON(text);

    if (json) {
      return { success: true, review: json };
    }
    return { success: true, review: {
      overall_assessment: text,
      issues: [],
      strengths: [],
      security_concerns: [],
      performance_notes: [],
      overall_score: 5,
    }};
  } catch (error) {
    return { success: false, error: error.message };
  }
}
