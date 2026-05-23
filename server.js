import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import http from 'http';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

async function ask(system, user, temp = 0.3) {
  const res = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    temperature: temp,
    max_tokens: 2000,
  });
  return res.choices[0].message.content.trim();
}

const server = new McpServer({ name: 'customer-support', version: '1.0.0' });

server.registerTool('generate_faq', {
  description: 'Generate a comprehensive FAQ page for a product or service. Covers the questions customers actually ask.',
  inputSchema: z.object({
    product_name: z.string(),
    product_description: z.string().describe('What it does and who it is for'),
    pricing: z.string().optional().describe('Pricing model and tiers'),
    known_questions: z.string().optional().describe('Questions you already know customers ask'),
    category: z.enum(['saas', 'ecommerce', 'service', 'app', 'marketplace']).optional().default('saas'),
  }),
}, async ({ product_name, product_description, pricing, known_questions, category }) => {
  const price = pricing ? `\nPricing: ${pricing}` : '';
  const known = known_questions ? `\nCustomers already ask: ${known_questions}` : '';
  const text = await ask(
    `You are a customer support specialist who builds FAQ pages that actually reduce support tickets. You know the questions that 80% of customers ask fall into 5 categories: pricing/billing, how it works, data/privacy, getting started, and limits/restrictions. You write answers that are clear and direct, avoid corporate jargon, and anticipate the follow-up question. You organize FAQs into logical sections.`,
    `Generate a comprehensive FAQ for:
Product: ${product_name} — ${product_description}
Type: ${category}${price}${known}

Create 15-20 FAQ items organized in sections:

## Getting Started
[4-5 questions about how to begin, setup, first steps]

## Features & Usage
[4-5 questions about what it does and how to use it]

## Pricing & Billing
[3-4 questions about costs, trials, refunds, upgrades]

## Data & Privacy
[2-3 questions about data handling, security, exports]

## Troubleshooting
[2-3 questions about common issues and fixes]

Format each as:
**Q: [Question]**
A: [Direct, helpful answer in 1-3 sentences]`
  );
  return { content: [{ type: 'text', text }] };
});

server.registerTool('write_support_response', {
  description: 'Write a professional, empathetic customer support response to any customer issue or complaint.',
  inputSchema: z.object({
    customer_message: z.string().describe('The customer\'s message or complaint'),
    issue_type: z.enum(['bug', 'billing', 'feature_request', 'confusion', 'angry_complaint', 'refund_request', 'cancellation']),
    your_product: z.string().describe('Your product/service name'),
    resolution: z.string().optional().describe('What you can actually do to resolve this (if known)'),
    cannot_do: z.string().optional().describe('What you cannot do for this customer'),
    tone: z.enum(['formal', 'friendly', 'empathetic']).optional().default('friendly'),
  }),
}, async ({ customer_message, issue_type, your_product, resolution, cannot_do, tone }) => {
  const res = resolution ? `\nWhat we can offer: ${resolution}` : '';
  const cant = cannot_do ? `\nWhat we cannot do: ${cannot_do}` : '';
  const text = await ask(
    `You are a customer support specialist who turns angry customers into loyal fans. You know the formula: acknowledge → empathize → address the issue → offer solution → end positively. You never say "I'm sorry you feel that way" (dismissive). For bugs: acknowledge, give timeline. For billing: be clear about what you can and can't do. For feature requests: validate without overpromising. For angry customers: de-escalate before problem-solving. Always end with a specific next step.`,
    `Write a ${tone} customer support response for:
Product: ${your_product}
Issue type: ${issue_type}
Customer message: "${customer_message}"${res}${cant}

Write a response that:
- Opens by acknowledging the customer's situation (not just "Thank you for reaching out")
- Addresses the specific issue they raised
- Offers a concrete next step or solution
- Ends on a positive, action-oriented note
- Is 100-200 words
- Does NOT use corporate boilerplate`
  );
  return { content: [{ type: 'text', text }] };
});

server.registerTool('create_knowledge_base', {
  description: 'Create a structured knowledge base outline with article titles, descriptions, and content for key support topics.',
  inputSchema: z.object({
    product_name: z.string(),
    product_description: z.string(),
    common_tasks: z.string().describe('Things users commonly do with your product'),
    pricing: z.string().optional(),
  }),
}, async ({ product_name, product_description, common_tasks, pricing }) => {
  const price = pricing ? `\nPricing: ${pricing}` : '';
  const text = await ask(
    `You are a technical documentation specialist. You build knowledge bases that users can actually navigate. You organize by user journey (Getting Started → Core Features → Advanced → Billing → Troubleshooting). Each article has a clear title, a one-sentence summary, and a content outline. You know that most users read the first 2-3 help articles and give up if they don't find what they need.`,
    `Create a knowledge base structure for:
Product: ${product_name} — ${product_description}
Common tasks: ${common_tasks}${price}

For each section provide article titles + 3-5 bullet points of what the article covers:

## Getting Started (4-5 articles)
[Article 1: Title]
- [key point]
- [key point]
[Article 2: Title]
...

## Core Features (5-6 articles)
...

## Billing & Account (3-4 articles)
...

## Troubleshooting (3-4 articles)
...

## Best Practices (2-3 articles)
...

End with: Top 5 articles to write first (by impact on support ticket reduction)`
  );
  return { content: [{ type: 'text', text }] };
});

server.registerTool('analyze_support_tickets', {
  description: 'Analyze a batch of support tickets or customer feedback to identify top issues, patterns, and product improvements.',
  inputSchema: z.object({
    tickets: z.string().describe('Paste support tickets, reviews, or feedback (one per line or separated by ---). Can be raw text.'),
    product_name: z.string(),
    goal: z.enum(['reduce_tickets', 'product_improvements', 'churn_prevention', 'satisfaction_improvement']).optional().default('reduce_tickets'),
  }),
}, async ({ tickets, product_name, goal }) => {
  const text = await ask(
    `You are a customer insights analyst who turns raw support data into actionable product and business insights. You identify patterns across complaints, categorize issues by frequency and severity, find the root causes (not just symptoms), and translate them into specific recommendations. You distinguish between bugs (fix it), UX confusion (improve onboarding/docs), and missing features (consider adding).`,
    `Analyze these support tickets/feedback for ${product_name} with goal: ${goal}

Feedback:
---
${tickets}
---

Provide:
## Top Issue Categories (ranked by frequency, with count and example quote)

## Root Cause Analysis (what's actually causing the top 3 issues — surface vs. real problem)

## Quick Wins (3 things that could be done this week to reduce the top complaints)

## Product Changes to Consider (longer-term improvements suggested by the data)

## Support Documentation Gaps (what articles/FAQs are missing that would prevent these tickets)

## Churn Risk Assessment (which tickets indicate customers about to leave)`
  );
  return { content: [{ type: 'text', text }] };
});

const PORT = process.env.PORT;
if (PORT) {
  const sessions = new Map();
  const httpServer = http.createServer(async (req, res) => {
    if (req.url === '/health') { res.writeHead(200); res.end('ok'); return; }
    if (req.url !== '/' && !req.url?.startsWith('/mcp')) { res.writeHead(404); res.end(); return; }

    const sessionId = req.headers['mcp-session-id'];
    let transport;

    if (sessionId && sessions.has(sessionId)) {
      transport = sessions.get(sessionId);
    } else {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => sessions.set(id, transport),
      });
      res.on('close', () => {
        if (transport.sessionId) sessions.delete(transport.sessionId);
        transport.close();
      });
      await server.connect(transport);
    }

    await transport.handleRequest(req, res);
  });
  httpServer.listen(Number(PORT), () => console.log('Listening on port ' + PORT));
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
