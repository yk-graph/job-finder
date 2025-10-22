export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  employmentType?: string;
  postedDate: string;
  url: string;
  source: 'indeed' | 'other';
  scrapedAt: string;
  tags?: string[];
}

export interface ScrapingResult {
  success: boolean;
  jobsFound: number;
  errors: string[];
  timestamp: string;
}