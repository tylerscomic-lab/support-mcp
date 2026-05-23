# support-mcp

AI-powered customer support tools MCP server. Generate FAQ content, draft support responses, build knowledge bases, and analyze support ticket themes — all natively inside Claude, Cursor, Windsurf, or any MCP-compatible AI client.

**Live on MCPize:** [mcpize.com/mcp/support-mcp](https://mcpize.com/mcp/support-mcp)

---

## Tools

| Tool | Description |
|------|-------------|
| `generate_faq` | Generate a comprehensive FAQ document for a product or service from a brief description |
| `draft_support_response` | Write a professional, empathetic support reply for a customer issue |
| `build_knowledge_base_article` | Create a structured help center article with steps, screenshots placeholders, and tips |
| `analyze_ticket_themes` | Identify patterns in support tickets and generate response playbooks for common issues |

---

## Usage

Use via MCPize gateway (no local setup required):

```json
{
  "mcpServers": {
    "support": {
      "url": "https://support-mcp.mcpize.run/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_MCPIZE_API_KEY"
      }
    }
  }
}
```

Or run locally:

```bash
git clone https://github.com/tylerscomic-lab/support-mcp
cd support-mcp
npm install
GROQ_API_KEY=your_key node server.js
```

---

## Examples

**Generate FAQ content:**
```
generate_faq(
  product_name: "TaskFlow",
  product_description: "AI project management for solo founders",
  customer_type: "Freelancers and consultants",
  num_questions: 15
)
```

**Draft a support response:**
```
draft_support_response(
  customer_issue: "I was charged twice this month and I can't find my invoice",
  product_context: "SaaS subscription, monthly billing via Stripe",
  tone: "empathetic",
  resolution: "Refund the duplicate charge, send invoice link"
)
```

**Build a knowledge base article:**
```
build_knowledge_base_article(
  topic: "How to connect your calendar to TaskFlow",
  product_name: "TaskFlow",
  audience: "Non-technical users",
  article_type: "how-to"
)
```

---

## Powered by

- [Groq](https://groq.com) — Llama 3.3 70B for fast inference
- [Model Context Protocol](https://modelcontextprotocol.io) — Anthropic's open standard
- [MCPize](https://mcpize.com) — MCP server hosting and marketplace

---

## Pricing

Available on [MCPize marketplace](https://mcpize.com/mcp/support-mcp):
- **Free:** 20 requests/day
- **Pro:** $9.99/month — unlimited requests

---

## More MCP Servers

Browse the full suite: [mcpize.com](https://mcpize.com) | GitHub org: [github.com/tylerscomic-lab](https://github.com/tylerscomic-lab)
