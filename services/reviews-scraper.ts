import { openai } from "@ai-sdk/openai";
import { perplexity } from "@ai-sdk/perplexity";
import { generateObject, generateText } from "ai";
import { z } from "zod";

const reviewSchema = z.object({
	reviews: z.array(
		z
			.object({
				url: z.string().url(),
				text: z.string(),
				publication: z.string(),
			})
			.nullable(),
	),
});

export class ReviewScraper {
	gatherReviews = async ({
		exhibitionName,
		galleryName,
	}: {
		exhibitionName: string;
		galleryName: string;
	}): Promise<z.infer<typeof reviewSchema>> => {
		try {
			const text = await generateText({
				// @ts-ignore
				model: perplexity("sonar"),
				// @ts-ignore
				apiKey: process.env.PERPLEXITY_API_KEY,
				system:
					"You are a diligent researcher tasked with finding art exhibition reviews from reputable sources I will provide you with a gallery name and exhibition name Id like you to find reviews on the internet from a variety of sources Think; PlasterMagazine, the Toe Rag, Timeout Magazine, Wallpaper, The Guardian, The Independent, The Art Newspaper, etc. You are not limited to these sources. Please return the url of where the review was found, first 4 lines of text and the name of the reviewer DO NOT make up reviews, only return reviews that exist on the internet",
				prompt: `Exhibition name: ${exhibitionName}, Gallery Name: ${galleryName}`,
			});

			if (!text) {
				console.log("no text found");
				return { reviews: [] };
			}

			const result = await generateObject({
				model: openai("gpt-4o"),
				system: "Format the reviews into a structured object",
				prompt: text.steps.map((step) => step.text).join("\n"),
				schema: reviewSchema,
			});

			console.log("result yes", result.object.reviews);

			return result.object;
		} catch (error) {
			console.log("Error extracting data:", error);
		}

		return { reviews: [] };
	};

	async handler() {
		const reviews = await this.gatherReviews({
			exhibitionName: "Yay, to have a mouth!",
			galleryName: "Arcadia Missa",
		});

		console.log("reviews", reviews);

		console.timeEnd("scraping");

		return reviews;
	}
}
