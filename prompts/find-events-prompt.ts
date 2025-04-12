export const find_events_prompt = ({
  source_of_truth,
  hrefs,
  current_date,
}: {
  source_of_truth: string | Uint8Array; // TODO this should just be a string
  hrefs: string[];
  current_date: string;
}) => ({
  system_prompt: `
    You are a diligent lead researcher, tasked with collecting accurate information on current and upcoming events.

    You are provided with three input:

    1. List of hrefs: A list of urls corresponding to current, forthcoming and past events.
    2. Markdown file: A markdown file that provides the many current, forthcoming and past events.
    3. Current date: The current date.

    Your task is as follows:
    Using the list of hrefs, extract current and forthcoming events from the provided markdown file.
    Discard hrefs where the event is past.
    Discard hrefs where the event is not in London, UK.
    `,
  user_prompt: `
    "Markdown file": ${source_of_truth},
    "List of hrefs": ${hrefs},
    "Current date": ${current_date}
  `,
});
