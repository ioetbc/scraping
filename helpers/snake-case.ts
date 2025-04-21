export const snake_case = (value: string) =>
	value
		.replace(":", "")
		.replace("-", "")
		.replace("–", "")
		.replace("|", "")
		.replace(/\s+/g, "_")
		.replace('"', "")
		.replace("`", "")
		.replace("'", "")
		.replace("’", "")
		.toLowerCase();
