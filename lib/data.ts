
export type Program = {
  id: string;
  university: string;
  program: string;
  country: string;
  city: string;
  level: string;
  field: string;
  tuition: number;
  tuitionPeriod: string;
  duration: number;
  currency: string;
  intake: string;
  requirement: string;
  source: string;
  verified: string;
  tag: string;
};

export type Scholarship = {
  id: string;
  name: string;
  provider: string;
  country: string;
  coverage: string;
  level: string;
  deadline: string;
  eligibility: string;
  source: string;
  verified: string;
};

// Empty defaults: live records will be loaded from Supabase.
export const programs: Program[] = [];
export const scholarships: Scholarship[] = [];
