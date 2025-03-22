import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

type Exhibition = {
  exhibition_name: string;
  info: string | null;
  start_date: string | null;
  end_date: string | null;
  private_view_start_date: string | null;
  private_view_end_date: string | null;
  featured_artists: string;
  exhibition_page_url: string;
  image_urls: string;
  schedule: string;
  is_ticketed: boolean;
  ticket_description: string;
};

export class DatabaseService {
  client: pg.Pool;

  constructor() {
    this.client = new pg.Pool({
      connectionString: process.env.POSTGRES_URL,
    });
  }

  async get_galleries() {
    const result = await this.client.query("SELECT * FROM gallery");
    return result.rows;
  }

  async insert_exhibition(exhibition: Exhibition) {
    console.log("inserting exhibition", exhibition);
    await this.client.query(
      "INSERT INTO scraped_exhibition (exhibition_name, info, gallery_id, featured_artists, exhibition_page_url, is_ticketed, ticket_description, image_urls, schedule, private_view_start_date, private_view_end_date, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
      [
        exhibition.exhibition_name,
        exhibition.info,
        1,
        exhibition.featured_artists,
        exhibition.exhibition_page_url,
        exhibition.is_ticketed,
        exhibition.ticket_description,
        exhibition.image_urls,
        exhibition.schedule,
        exhibition.private_view_start_date,
        exhibition.private_view_end_date,
        exhibition.start_date,
        exhibition.end_date,
      ]
    );
  }
}
