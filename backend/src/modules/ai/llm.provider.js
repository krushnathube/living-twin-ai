// Optional live-LLM provider. When LLM_API_KEY is set, the council can generate
// diagnosis text from a real model; otherwise the built-in reasoning engine is used.
import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';

export async function llmDiagnose({ fault, faultKey, agentNames, telemetry }) {
  if (!config.llm.enabled) return null;
  try {
    const prompt = `You are a multi-agent diagnostic council for a connected-vehicle fleet.
Fault: ${fault.label} (${faultKey}). Telemetry: ${JSON.stringify(telemetry)}.
Agents: ${agentNames.join(', ')}.
Respond ONLY with JSON: {"agents":[{"agentName":"...","finding":"one sentence"}],"rootCause":"1-2 sentences","recommendedAction":"...","riskNote":"...","confidence":0-100}`;
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': config.llm.apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: config.llm.model, max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    const txt = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').replace(/```json|```/g, '').trim();
    return JSON.parse(txt);
  } catch (e) {
    logger.warn('LLM diagnosis failed — using built-in engine', { msg: e.message });
    return null;
  }
}
