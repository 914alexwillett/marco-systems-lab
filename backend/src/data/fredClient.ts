import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

export interface FredObservation {
  date: string;
  value: string;
}

export const fetchSeries = async (
  seriesId: string,
  startDate = "1990-01-01"
): Promise<FredObservation[]> => {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    throw new Error("FRED_API_KEY is missing in environment variables.");
  }

  const response = await axios.get(BASE_URL, {
    params: {
      series_id: seriesId,
      api_key: apiKey,
      file_type: "json",
      observation_start: startDate,
      frequency: "m"
    }
  });

  return response.data.observations as FredObservation[];
};
