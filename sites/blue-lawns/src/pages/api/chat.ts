// Astro API route: streams responses from OpenAI via Vercel AI SDK
// Uses the knowledge base at /docs/landscaping.md as context
import type { APIRoute } from 'astro';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import fs from 'node:fs/promises';

export const prerender = false;

const openai = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY!,
});

let knowledgeBaseCache: string | null = null;

async function loadKnowledgeBase(): Promise<string> {
	if (knowledgeBaseCache) return knowledgeBaseCache;
	const kbUrl = new URL('../../../docs/landscaping.md', import.meta.url);
	const kb = await fs.readFile(kbUrl, 'utf-8');
	// Keep a safety cap to reduce prompt size; can be improved with chunking later
	knowledgeBaseCache = kb.slice(0, 50000);
	return knowledgeBaseCache;
}

export const POST: APIRoute = async ({ request }) => {
	try {
		const { messages } = (await request.json()) as {
			messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
		};

		const kb = await loadKnowledgeBase();

		const system = [
			'You are the Blue Lawns Landscaping Expert chatbot for Cape May County, NJ.',
			'Primary goal: capture qualified leads while being helpful and professional.',
			'Use the provided knowledge base to answer with local expertise (coastal, erosion, sandy soil).',
			'Always try to guide toward capturing: name, email, phone, city, services of interest.',
			'Pricing to mention when relevant: Preserve $262/mo, Nurture $315/mo, 3D Design starting at $500.',
			'Company phone: 609-425-2954. Service area: all of Cape May County.',
			'Keep responses concise and clear. Use bullet lists when helpful.',
			'Knowledge Base follows:\n\n' + kb,
		].join('\n');

		const result = await streamText({
			model: openai('gpt-4o-mini'),
			system,
			messages,
		});

		return result.toAIStreamResponse();
	} catch (err) {
		return new Response('Bad Request', { status: 400 });
	}
};




