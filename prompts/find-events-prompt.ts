export const find_events_prompt = ({
  text,
  hrefs,
}: {
  text: string | Uint8Array; // TODO this should just be a string
  hrefs: string[];
}) => ({
  system_prompt:
    "Find all the upcoming events on the page. The current year is 2025. DO NOT include events from previous years. e.g. 2024. The event must be Located in London, UK. DO NOT include events outside of London, UK. e.g. Seoul, Paris, New York etc.",
  user_prompt: `<page_text>${text}</page_text> <hrefs>${hrefs}</hrefs>`,
});
