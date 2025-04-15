import OpenAI from "openai";
import {ChatModel} from "openai/resources/shared.mjs";
import {zodResponseFormat} from "openai/helpers/zod.mjs";
import {ZodObject, ZodSchema} from "zod";

const GPT_MODEL: ChatModel = "gpt-4.1-mini";

const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export const llm = async ({
  system_prompt,
  user_prompt,
  schema,
}: {
  system_prompt: string;
  user_prompt: string;
  schema: ZodSchema;
}) => {
  const completion = await client.beta.chat.completions.parse({
    model: GPT_MODEL,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: system_prompt,
      },
      {
        role: "user",
        content: user_prompt,
      },
    ],
    response_format: zodResponseFormat(schema, "response_schema"),
  });

  const message = completion.choices[0]?.message;

  if (!message) throw new Error("no response from llm");

  if (message.refusal) throw new Error(message.refusal);

  if (message.parsed) return message.parsed;
};
