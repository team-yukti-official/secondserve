const DEFAULT_MODEL = 'openai/gpt-oss-20b';

const buildMessages = (messages) => {
    if (!Array.isArray(messages)) {
        return [];
    }

    return messages
        .filter((message) => message && typeof message === 'object')
        .map((message) => ({
            role: String(message.role || 'user'),
            content: String(message.content || '')
        }))
        .filter((message) => message.content.trim().length > 0);
};

const chat = async (req, res) => {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY || String(req.body.apiKey || '').trim();
        if (!apiKey) {
            return res.status(500).json({
                error: 'OpenRouter API key is not configured on the backend.'
            });
        }

        const messages = buildMessages(req.body.messages);
        if (!messages.length) {
            return res.status(400).json({
                error: 'Messages are required.'
            });
        }

        const model = String(req.body.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL).trim();
        const temperature = Number.isFinite(Number(req.body.temperature))
            ? Number(req.body.temperature)
            : 0.4;
        const maxTokens = Number.isFinite(Number(req.body.max_tokens))
            ? Number(req.body.max_tokens)
            : 220;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'HTTP-Referer': req.get('origin') || req.get('referer') || 'https://secondserve-m33f.onrender.com',
                'X-Title': 'SecondServe Serve Bot'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens: maxTokens,
                stream: false
            })
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
            const errorMessage = data?.error?.message || data?.message || 'OpenRouter request failed';
            return res.status(response.status).json({
                error: errorMessage,
                details: data
            });
        }

        const reply = data?.choices?.[0]?.message?.content || '';
        return res.json({
            reply,
            model: data?.model || model,
            usage: data?.usage || null
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Chat assistant request failed.',
            details: error.message
        });
    }
};

module.exports = {
    chat
};
