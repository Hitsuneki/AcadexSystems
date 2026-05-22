/**
 * Selectable courses & programs for user profiles.
 * Grouped for the course picker UI; use COURSE_PROGRAMS for a flat list.
 */

export interface CourseGroup {
  id: string;
  label: string;
  programs: readonly string[];
}

export const COURSE_GROUPS: readonly CourseGroup[] = [
  {
    id: 'stem',
    label: 'STEM & Technology',
    programs: [
      'BS Computer Science',
      'BS Information Technology',
      'BS Information Systems',
      'BS Computer Engineering',
      'BS Software Engineering',
      'BS Data Science',
      'BS Cybersecurity',
      'BS Electronics Engineering',
      'BS Electrical Engineering',
      'BS Mechanical Engineering',
      'BS Civil Engineering',
      'BS Industrial Engineering',
      'BS Chemical Engineering',
      'BS Architecture',
      'BS Applied Mathematics',
      'BS Physics',
      'BS Biology',
      'BS Chemistry',
      'BS Environmental Science',
      'BS Statistics',
    ],
  },
  {
    id: 'business',
    label: 'Business & Economics',
    programs: [
      'BS Business Administration',
      'BS Accountancy',
      'BS Finance',
      'BS Economics',
      'BS Marketing',
      'BS Entrepreneurship',
      'BS Hospitality Management',
      'BS Tourism Management',
      'BS Real Estate Management',
      'BS Public Administration',
      'MBA',
      'Master of Business Administration',
    ],
  },
  {
    id: 'health',
    label: 'Health & Medical Sciences',
    programs: [
      'BS Nursing',
      'BS Pharmacy',
      'BS Medical Technology',
      'BS Physical Therapy',
      'BS Occupational Therapy',
      'BS Radiologic Technology',
      'BS Nutrition & Dietetics',
      'BS Public Health',
      'BS Psychology (Pre-Med track)',
      'Doctor of Medicine (MD)',
      'Doctor of Dental Medicine (DMD)',
    ],
  },
  {
    id: 'social',
    label: 'Social Sciences & Humanities',
    programs: [
      'BS Psychology',
      'BS Sociology',
      'BS Political Science',
      'BS International Studies',
      'BS History',
      'BS Philosophy',
      'BS English',
      'BS Communication',
      'BS Journalism',
      'BS Multimedia Arts',
      'BS Film',
      'BS Anthropology',
      'BS Social Work',
      'BS Criminology',
    ],
  },
  {
    id: 'education',
    label: 'Education',
    programs: [
      'BS Elementary Education',
      'BS Secondary Education',
      'BS Early Childhood Education',
      'BS Special Education',
      'Bachelor of Library & Information Science',
      'Master of Arts in Education',
      'Master of Education',
    ],
  },
  {
    id: 'law-arts',
    label: 'Law, Arts & Design',
    programs: [
      'Bachelor of Laws (LLB / JD)',
      'BS Fine Arts',
      'BS Interior Design',
      'BS Industrial Design',
      'BS Music',
      'BS Theater Arts',
      'BS Fashion Design',
    ],
  },
  {
    id: 'agri',
    label: 'Agriculture & Natural Resources',
    programs: [
      'BS Agriculture',
      'BS Agricultural Engineering',
      'BS Forestry',
      'BS Fisheries',
      'BS Animal Science',
      'BS Food Technology',
    ],
  },
  {
    id: 'graduate',
    label: 'Graduate & Research Programs',
    programs: [
      'Master of Science (MS)',
      'Master of Arts (MA)',
      'Master of Engineering (MEng)',
      'Master of Public Administration (MPA)',
      'Master of Social Work (MSW)',
      'PhD / Doctor of Philosophy',
      'Doctor of Education (EdD)',
      'Postgraduate Diploma',
      'Research Fellowship Program',
    ],
  },
  {
    id: 'vocational',
    label: 'Vocational & Associate',
    programs: [
      'Associate in Computer Technology',
      'Associate in Hospitality Management',
      'Associate in Business Administration',
      'Technical-Vocational (TESDA) Program',
      'Senior High School — STEM',
      'Senior High School — ABM',
      'Senior High School — HUMSS',
      'Senior High School — GAS',
      'Senior High School — TVL',
    ],
  },
  {
    id: 'other',
    label: 'Other',
    programs: [
      'Interdisciplinary Studies',
      'Undeclared / Exploring',
      'Faculty / Staff (Non-student)',
      'Independent Researcher',
      'Other Program',
    ],
  },
] as const;

/** Flat list of every selectable program (deduplicated). */
export const COURSE_PROGRAMS: readonly string[] = COURSE_GROUPS.flatMap((g) => g.programs);

export function isKnownCourse(value: string): boolean {
  return COURSE_PROGRAMS.includes(value);
}

/** Include a legacy/custom value when editing an existing profile. */
export function courseOptionsWithCurrent(current?: string): string[] {
  if (!current?.trim() || isKnownCourse(current)) {
    return [...COURSE_PROGRAMS];
  }
  return [current.trim(), ...COURSE_PROGRAMS];
}
