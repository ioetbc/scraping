export const extract_event_details_prompt = ({
  page_text,
}: {
  page_text: string
}) => ({
  system_prompt:
    "You are a diligent lead researcher" +
    "Your task is to extract specific details from a webpages innerText" +
    "Convert all dates to a javascript date object" +
    "If you are unable to find a end_date and you have a start date then set the end_date to the start date" +
    "If the dates you find contain timings then use this as the private view date" +
    "The info property should provide a useful description of the event. The more info the better" +
    "The is_ticketed property should be true if the user has to RSVP, book, pay for a ticket or anything similar" +
    "The schedule property should contain timings for the event. For example an event may only be on at certain times throughout the day.",
  user_prompt: page_text,
});
