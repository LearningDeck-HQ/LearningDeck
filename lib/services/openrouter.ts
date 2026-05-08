export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const getApiKey = () => {
  // Use the prefix required by your framework (e.g., NEXT_PUBLIC_ or VITE_)
  return process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
};

const OPENROUTER_API_KEY = getApiKey()

const MODEL = 'baidu/cobuddy:free';

export const openRouterService = {
  async streamChat(messages: ChatMessage[], onChunk: (chunk: string) => void) {
    if (!OPENROUTER_API_KEY) {
      onChunk("Error: VITE_OPENROUTER_API_KEY is not set in .env");
      return;
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://learningdeck.online", // Optional
          "X-Title": "LearningDeck", // Optional
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: `You are the LearningDeck AI Assistant. You help teachers manage exams, subjects, and questions.
              
              CONTEXT AWARENESS:
              - You have access to @exams, @subjects, @questions, and @classes.
              - If the user provides context, use it to give specific answers.
              
              INTERACTIVE TOOLS:
              - If the user asks to create an exam (e.g., "create a science exam"), you should respond with a friendly message AND a specific JSON block at the end of your response to trigger the fine-tuning UI.
              - Example JSON block:
                [ACTION:CREATE_EXAM]{"name": "Science Exam", "subject": "Science", "questions_count": 10, "class": "Grade 10"}[/ACTION]
              
              Always be professional, helpful, and concise.`
            },
            ...messages
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        onChunk(`Error: ${error.error?.message || response.statusText}`);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        onChunk("Error: Failed to read stream");
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content || "";
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error("Error parsing chunk", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("OpenRouter Error:", error);
      onChunk(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};
