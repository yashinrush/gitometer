import type { RepoMetadata, ArchitectureGraph } from '../types';

export const DEFAULT_OPENAI_API_KEY =
  (import.meta as any).env?.VITE_OPENAI_API_KEY || '';

export interface OpenAiVideoScene {
  stage: number;
  title: string;
  headline: string;
  narration: string;
  duration: number;
  highlightNodes: string[];
  toneColor?: string;
}

export interface OpenAiErrorDetails {
  isQuotaExhausted: boolean;
  message: string;
  code?: string;
}

/**
 * Check whether an OpenAI API key is configured
 */
export function isOpenAiConfigured(apiKey?: string): boolean {
  const key = apiKey?.trim() || DEFAULT_OPENAI_API_KEY;
  return Boolean(key && key.startsWith('sk-'));
}

/**
 * Parse OpenAI API error response safely
 */
async function parseOpenAiError(response: Response): Promise<OpenAiErrorDetails> {
  try {
    const json = await response.json();
    const message = json?.error?.message || response.statusText;
    const code = json?.error?.code || '';
    const isQuotaExhausted =
      response.status === 429 ||
      code === 'insufficient_quota' ||
      code === 'credit_balance_exhausted' ||
      message.toLowerCase().includes('quota') ||
      message.toLowerCase().includes('credits');

    return {
      isQuotaExhausted,
      message,
      code,
    };
  } catch {
    return {
      isQuotaExhausted: response.status === 429,
      message: `OpenAI request failed with HTTP ${response.status}`,
    };
  }
}

/**
 * Generate 60-second animated video storyboard script using OpenAI GPT-4o
 */
export async function generateOpenAiVideoScript(
  metadata: RepoMetadata,
  graph: ArchitectureGraph,
  readme: string,
  apiKey?: string
): Promise<OpenAiVideoScene[]> {
  const key = apiKey?.trim() || DEFAULT_OPENAI_API_KEY;
  if (!key) {
    throw new Error('No OpenAI API Key configured.');
  }

  const subsystemsStr = graph.subsystems.map((s) => `- ${s.name} (${s.id})`).join('\n');
  const sampleNodesStr = graph.nodes
    .slice(0, 15)
    .map((n) => `- ${n.id}: "${n.label}" in [${n.subsystem}]`)
    .join('\n');

  const prompt = `You are a Principal Tech Video Director creating a synchronized 60-second animated architectural video script for repository "${metadata.fullName}".
Description: ${metadata.description}

Subsystems:
${subsystemsStr}

Sample Components:
${sampleNodesStr}

README Context:
${readme.slice(0, 2000)}

Generate EXACTLY 5 synchronized sequential scenes (12 seconds each, totaling 60 seconds) that guide developers through how data and requests flow through this architecture.
Respond ONLY with a JSON object containing a "scenes" array:
{
  "scenes": [
    {
      "stage": 1,
      "title": "Short stage title (e.g. 1. Entry & CLI)",
      "headline": "Punchy 3-8 word headline describing this stage",
      "narration": "Conversational, engaging narration script spoken during this 12-second stage (20-30 words).",
      "duration": 12,
      "highlightNodes": ["node_id_1", "node_id_2"],
      "toneColor": "#3b82f6"
    }
  ]
}
Each scene MUST correspond to one of the 5 architectural phases:
Stage 1: User / CLI Entry & Gateway triggers
Stage 2: Core Processing / AI Intelligence / Routing
Stage 3: Domain Orchestration / Pipeline execution
Stage 4: State Mutation / In-Memory Staging / Persistence
Stage 5: Verification / Safety Gating / Response Delivery`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical video director specializing in animated software architecture explainers. Always output valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorDetails = await parseOpenAiError(response);
    const err: any = new Error(errorDetails.message);
    err.isQuotaExhausted = errorDetails.isQuotaExhausted;
    err.code = errorDetails.code;
    throw err;
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(text);
  const rawScenes = parsed.scenes || parsed;

  if (Array.isArray(rawScenes) && rawScenes.length >= 5) {
    return rawScenes.slice(0, 5);
  }

  throw new Error('OpenAI returned invalid scene structure.');
}

/**
 * Generate high-fidelity spoken audio narration using OpenAI TTS (tts-1)
 * Returns a playable Blob Object URL
 */
export async function generateOpenAiSpeech(
  text: string,
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy',
  apiKey?: string
): Promise<string> {
  const key = apiKey?.trim() || DEFAULT_OPENAI_API_KEY;
  if (!key) {
    throw new Error('No OpenAI API Key configured.');
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: voice,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorDetails = await parseOpenAiError(response);
    const err: any = new Error(errorDetails.message);
    err.isQuotaExhausted = errorDetails.isQuotaExhausted;
    err.code = errorDetails.code;
    throw err;
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
