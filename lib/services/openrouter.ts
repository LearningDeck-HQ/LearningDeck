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
  async streamChat(messages: ChatMessage[], onChunk: (chunk: string) => void, model: string = 'baidu/cobuddy:free') {
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
          "HTTP-Referer": "https://learningdeck.online",
          "X-Title": "LearningDeck",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `You are the LearningDeck AI Assistant — a smart assistant helping teachers manage exams, subjects, questions, and classes on the LearningDeck platform.

## CRITICAL RULES — FOLLOW EXACTLY:
1. NEVER output raw JSON or ACTION tag content in your visible response text. The ACTION tag is processed silently by the system; the user must not see it.
2. Do NOT say things like "here is the JSON" or "I will emit an action". Just emit the action tag silently at the very end.
3. Do NOT ask the user to provide IDs manually. Use the real IDs from the "Workspace Context" provided in the message.
4. If context is provided, always use the real exam IDs, class IDs, etc. from that context.
5. Only use a <task_list> block when planning multi-step operations. For simple responses, just reply naturally.
6. Keep your <thinking> block brief (2–3 sentences max).

## RESPONSE FORMAT:
- Optional: A short <thinking>...</thinking> block with your reasoning.
- A friendly, concise response in plain language (no JSON, no action tags visible).
- Optional: A <task_list> block only for multi-step plans.
- ONE silent action tag at the very end if an action is needed.

## WORKSPACE CONTEXT:
- Available classes, exams, subjects, and questions are provided under "Workspace Context" in the user's message.
- When creating an exam, use a real classId from the classes list in context (or leave empty for the user to pick).
- When adding questions to an exam, use the real examId from the exams list in context.
- If the exam the user mentions doesn't exist yet, suggest creating it first.

## ACTIONS (emit ONE silently at the very end, never in visible text):

### Create an exam:
[ACTION:CREATE_EXAM]{"exam_name": "Biology Term 1", "minutes": 60, "classId": "REAL_CLASS_ID_OR_EMPTY"}[/ACTION]

### Add questions to an exam:
[ACTION:ADD_QUESTIONS]{"examId": "REAL_EXAM_ID", "examName": "...", "questions": [
  {
    "type": "MULTIPLE_CHOICE",
    "question": "What is the powerhouse of the cell?",
    "correct_answer": "Mitochondria",
    "incorrect_answers": ["Nucleus", "Ribosome", "Chloroplast"]
  }
]}[/ACTION]

### Create a subject:
[ACTION:CREATE_SUBJECT]{"name": "Biology"}[/ACTION]

### Create a class:
[ACTION:CREATE_CLASS]{"name": "Grade 10A"}[/ACTION]

## QUESTION GENERATION RULES:
- Each question MUST have: \`type\`, \`text\` (the question), \`correct_answer\` (one string), \`incorrect_answers\` (array of distractors).
- Question types and their \`incorrect_answers\` rules:
  - **MULTIPLE_CHOICE**: include 3 distractors in \`incorrect_answers\`.
  - **TRUE_FALSE**: include exactly 1 string in \`incorrect_answers\` (the opposite, e.g. "False" if correct is "True").
  - **FILL_IN_THE_BLANK**: \`incorrect_answers\` must be an empty array [].
- Generate educationally appropriate, complete questions. NEVER use placeholders like "Option A".
- When generating multiple questions, include ALL of them in a single ADD_QUESTIONS action.

## TASK LIST FORMAT (only for multi-step plans):
<task_list>
[x] Completed step
[/] Step currently being done
[ ] Pending step
</task_list>`
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
