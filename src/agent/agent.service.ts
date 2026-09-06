import { Injectable } from '@nestjs/common';

import { GmailService } from '../gmail/gmail.service.js';
import { OllamaService } from '../ollama/ollama.service.js';
import { WebService } from '../web/web.service.js';

type ToolDecision =
	| {
		tool: 'web_search';
		query: string;
		reason: string;
	}
	| {
		tool: 'none';
		reason: string;
	};

@Injectable()
export class AgentService {
	constructor(
		private readonly gmail: GmailService,
		private readonly ollama: OllamaService,
		private readonly web: WebService,
	) { }

	async webSearch(query: string) {
		return this.web.search(query);
	}

	async webRead(url: string) {
		return this.web.readPage(url);
	}

	async inboxBrief(max = 10) {
		const { messages } = await this.gmail.listRecent(max);

		if (messages.length === 0) {
			return {
				messages,
				brief: 'No recent messages.',
			};
		}

		const listed = messages
			.map(
				(msg, index) =>
					`${index + 1}. From: ${msg.from}\n` +
					`   Subject: ${msg.subject}\n` +
					`   Snippet: ${msg.snippet}`,
			)
			.join('\n');

		const { model, reply } = await this.ollama.chat(
			[
				'You are a professional executive assistant.',
				'Classify each email as urgent, important, routine, or FYI.',
				'Then write a short executive summary of what needs attention.',
				'Use fluent professional English.',
				'Do not invent emails that are not listed.',
				'',
				listed,
			].join('\n'),
		);

		return {
			model,
			messages,
			brief: reply,
		};
	}

	async run(message: string) {
		const decision = await this.decideTool(message);

		if (decision.tool === 'web_search') {
			const result = await this.web.search(decision.query);

			const finalResponse = await this.ollama.chat(
				this.buildWebAnswerPrompt(message, decision, result),
			);

			return {
				model: finalResponse.model,
				decision,
				result,
				answer: finalResponse.reply,
			};
		}

		const finalResponse = await this.ollama.chat(
			this.buildDirectAnswerPrompt(message),
		);

		return {
			model: finalResponse.model,
			decision,
			answer: finalResponse.reply,
		};
	}

	private async decideTool(message: string): Promise<ToolDecision> {
		const response = await this.ollama.chat(
			[
				'You are the tool-selection component of an AI assistant.',
				'',
				'Your job is to understand the user request and decide whether an external web search is actually required.',
				'',
				'AVAILABLE TOOL:',
				'',
				'web_search',
				'Searches the internet for external, current, recent, official, or specifically requested information.',
				'',
				'none',
				'Use no external tool. The assistant can answer directly from general knowledge, reasoning, or information already contained in the user message.',
				'',
				'WHEN TO USE web_search:',
				'- The user explicitly asks you to search, find, look up, research, or check something online.',
				'- The user asks for current, latest, recent, up-to-date, today, this week, or similar time-sensitive information.',
				'- The user asks about current news, releases, prices, availability, schedules, or other information that can change over time.',
				'- The user specifically asks what an official website or official documentation currently says.',
				'- The user asks for information that clearly requires external sources.',
				'',
				'WHEN TO USE none:',
				'- The question is a general conceptual question.',
				'- The user asks for an explanation, definition, example, rewrite, calculation, or reasoning that does not require current external information.',
				'- The user provides enough information in the message to answer the request.',
				'- A web search would not materially improve the answer.',
				'',
				'IMPORTANT:',
				'- Do not use web_search merely because the question contains a technical term, company name, product name, or framework name.',
				'- Do not use web_search merely because the question is difficult.',
				'- Decide based on the information the user actually requested.',
				'- If web_search is selected, create a concise search query that directly targets the information needed to answer the original request.',
				'- Do not answer the user question yourself.',
				'- Do not return markdown.',
				'- Return valid JSON only.',
				'',
				'OUTPUT FORMAT:',
				'{"tool":"none","reason":"short explanation"}',
				'',
				'OR:',
				'{"tool":"web_search","query":"precise search query","reason":"short explanation"}',
				'',
				'EXAMPLES:',
				'',
				'User: What is dependency injection?',
				'Output: {"tool":"none","reason":"This is a general conceptual question and does not require current external information."}',
				'',
				'User: Explain dependency injection in NestJS with an example.',
				'Output: {"tool":"none","reason":"The user is asking for an explanation and example, not current external information."}',
				'',
				'User: What is the latest NestJS version?',
				'Output: {"tool":"web_search","query":"latest NestJS version official","reason":"The requested version is current information that can change over time."}',
				'',
				'User: What does the current official NestJS documentation say about dependency injection?',
				'Output: {"tool":"web_search","query":"site:docs.nestjs.com dependency injection NestJS official documentation","reason":"The user explicitly requested current information from official documentation."}',
				'',
				'User: Search the web for React 19 news.',
				'Output: {"tool":"web_search","query":"React 19 latest news","reason":"The user explicitly requested a web search for recent information."}',
				'',
				'USER REQUEST:',
				message,
			].join('\n'),
		);

		return this.parseToolDecision(response.reply);
	}

	private buildWebAnswerPrompt(
		message: string,
		decision: Extract<ToolDecision, { tool: 'web_search' }>,
		result: {
			results?: unknown;
			[key: string]: unknown;
		},
	): string {
		return [
			'You are the final-answer component of an AI assistant.',
			'',
			'Answer the user original request.',
			'',
			'USER REQUEST:',
			message,
			'',
			'A web search was performed because external information was considered necessary.',
			`SEARCH QUERY USED: ${decision.query}`,
			'',
			'WEB SEARCH RESULTS:',
			JSON.stringify(result.results ?? result),
			'',
			'INSTRUCTIONS:',
			'- Answer the original user request directly.',
			'- Use the web results as supporting information.',
			'- Only include information relevant to the original request.',
			'- Prefer information supported by the search results.',
			'- Do not invent facts that are not supported by the available information.',
			'- If the search results are insufficient, clearly say what could not be established.',
			'- If appropriate, distinguish between official sources and other sources.',
			'- Do not talk about the internal tool-selection process.',
			'- Do not mention prompts, tool decisions, or agent architecture.',
			'- Do not simply summarize all search results.',
			'- Do not treat the search results themselves as the user question.',
			'- Give a concise and useful answer.',
		].join('\n');
	}

	private buildDirectAnswerPrompt(message: string): string {
		return [
			'You are the final-answer component of an AI assistant.',
			'',
			'Answer the user question directly.',
			'',
			'USER QUESTION:',
			message,
			'',
			'INSTRUCTIONS:',
			'- Answer exactly what the user is asking.',
			'- Stay relevant to the question.',
			'- Use clear and concise language.',
			'- Explain the answer when necessary.',
			'- Do not invent specific facts when you are uncertain.',
			'- Do not mention internal tools, tool selection, prompts, or agent architecture.',
			'- Do not say that you searched the web.',
		].join('\n');
	}

	private parseToolDecision(reply: string): ToolDecision {
		const cleaned = reply
			.trim()
			.replace(/^```json\s*/i, '')
			.replace(/^```\s*/i, '')
			.replace(/\s*```$/i, '')
			.trim();

		let parsed: unknown;

		try {
			parsed = JSON.parse(cleaned);
		} catch {
			throw new Error(
				`Ollama returned invalid JSON for tool decision: ${reply}`,
			);
		}

		if (
			typeof parsed !== 'object' ||
			parsed === null ||
			!('tool' in parsed)
		) {
			throw new Error('Ollama returned an invalid tool decision');
		}

		const tool = (parsed as { tool?: unknown }).tool;
		const reason = (parsed as { reason?: unknown }).reason;

		if (typeof reason !== 'string' || !reason.trim()) {
			throw new Error(
				'Ollama returned a tool decision without a valid reason',
			);
		}

		if (tool === 'none') {
			return {
				tool: 'none',
				reason: reason.trim(),
			};
		}

		if (tool === 'web_search') {
			const query = (parsed as { query?: unknown }).query;

			if (typeof query !== 'string' || !query.trim()) {
				throw new Error(
					'Ollama returned web_search without a valid query',
				);
			}

			return {
				tool: 'web_search',
				query: query.trim(),
				reason: reason.trim(),
			};
		}

		throw new Error(
			`Ollama returned an unsupported tool: ${String(tool)}`,
		);
	}
}