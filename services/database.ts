import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

type Exhibition = {
  exhibition_name: string | null;
  info: string | null;
  start_date: Date | null;
  end_date: Date | null;
  private_view_start_date: Date | null;
  private_view_end_date: Date | null;
  featured_artists: string;
  exhibition_page_url: string;
  image_urls: string;
  schedule: string;
  is_ticketed: boolean;
  ticket_description: string;
  gallery_id: string;
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

  async get_seen_exhibitions() {
    const result = await this.client.query("SELECT name FROM seen_exhibition");
    return result.rows.map((row) => row.name);
  }

  async get_events_opening_soon(): Promise<string[]> {
    const result = await this.client.query(
      `
        SELECT exhibition_details_url
        FROM exhibition
        WHERE exhibition.private_view_start_date is NULL AND
        exhibition.private_view_end_date is NULL AND
        start_date > NOW() AND
        start_date <= NOW() + INTERVAL '5 day';
      `
    );

    return result.rows.map((row) => row.exhibition_details_url);
  }

  async insert_exhibition(exhibition: Exhibition) {
    console.log("inserting exhibition", exhibition);
    await this.client.query(
      `INSERT INTO scraped_exhibition (exhibition_name, info, gallery_id, featured_artists, exhibition_page_url, is_ticketed, image_urls, private_view_start_date, private_view_end_date, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, // ON CONFLICT (exhibition_name) DO NOTHING
      [
        exhibition.exhibition_name,
        exhibition.info,
        exhibition.gallery_id,
        exhibition.featured_artists,
        exhibition.exhibition_page_url,
        exhibition.is_ticketed,
        exhibition.image_urls,
        exhibition.private_view_start_date,
        exhibition.private_view_end_date,
        exhibition.start_date,
        exhibition.end_date,
      ]
    );
  }
}
