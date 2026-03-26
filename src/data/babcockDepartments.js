// Shared Babcock University school and department data
// Used by ManageOfficers, ManageWardens, and WardenDashboard

export const BABCOCK_SCHOOLS = [
    'School of Computing and Engineering Sciences',
    'School of Management and Social Sciences',
    'School of Law and Security Studies',
    'School of Education and Humanities',
    'School of Agriculture, Food and Natural Resources',
    'School of Medicine and Health Sciences',
    'School of Nursing',
    'Postgraduate School',
];

export const BABCOCK_DEPARTMENTS = [
    'Accounting', 'Architecture', 'Banking and Finance',
    'Biochemistry', 'Biology', 'Business Administration',
    'Chemical Engineering', 'Chemistry', 'Christian Religious Studies',
    'Civil Engineering', 'Communication Arts', 'Community Development',
    'Computer Engineering', 'Computer Science', 'Criminology and Security Studies',
    'Economics', 'Education', 'Electrical and Electronics Engineering',
    'English and Literary Studies', 'Estate Management', 'Finance',
    'History and International Studies', 'Information Technology',
    'Law (LLB)', 'Marketing', 'Mass Communication',
    'Mathematics', 'Mechanical Engineering', 'Microbiology',
    'Music', 'Nursing', 'Peace Studies and Conflict Resolution',
    'Philosophy', 'Physics', 'Political Science and Public Administration',
    'Psychology', 'Public Health', 'Religion',
    'Software Engineering', 'Sociology', 'Statistics',
    'Taxation', 'Theatre Arts', 'Urban and Regional Planning',
];

// Map each school to related departments (for filtering)
export const SCHOOL_TO_DEPARTMENTS = {
    'School of Computing and Engineering Sciences': [
        'Computer Science', 'Computer Engineering', 'Software Engineering',
        'Information Technology', 'Electrical and Electronics Engineering',
        'Civil Engineering', 'Mechanical Engineering', 'Chemical Engineering',
        'Architecture', 'Urban and Regional Planning', 'Estate Management',
    ],
    'School of Management and Social Sciences': [
        'Accounting', 'Banking and Finance', 'Business Administration',
        'Economics', 'Finance', 'Marketing', 'Mass Communication',
        'Political Science and Public Administration', 'Psychology', 'Sociology',
        'Taxation', 'Community Development', 'Communication Arts',
    ],
    'School of Law and Security Studies': [
        'Law (LLB)', 'Criminology and Security Studies',
        'Peace Studies and Conflict Resolution',
    ],
    'School of Education and Humanities': [
        'Education', 'English and Literary Studies', 'History and International Studies',
        'Christian Religious Studies', 'Religion', 'Music', 'Theatre Arts', 'Philosophy',
    ],
    'School of Agriculture, Food and Natural Resources': [
        'Biology', 'Biochemistry', 'Microbiology', 'Chemistry',
        'Physics', 'Mathematics', 'Statistics',
    ],
    'School of Medicine and Health Sciences': [
        'Public Health',
    ],
    'School of Nursing': [
        'Nursing',
    ],
    'Postgraduate School': [],
};
