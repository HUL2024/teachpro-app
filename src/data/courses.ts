import type { Course } from '../lib/types'

function makeLessons(courseTitle: string, topics: string[]) {
  return topics.map((topic, i) => ({
    id: `${courseTitle.slice(0, 3).toLowerCase()}-l${i + 1}`,
    title: topic,
    content: `This lesson covers "${topic}" as part of ${courseTitle}. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.`,
    practicalExample: `Example: Apply "${topic}" during your next lesson or staff meeting and note what changes in student or staff engagement.`,
    photos: [] as string[],
    resources: [{ name: `${topic} — Template.pdf`, url: '#' }],
    quizzes:
      i === topics.length - 1
        ? []
        : [
            {
              id: `${courseTitle.slice(0, 3).toLowerCase()}-q${i + 1}`,
              question: `Which of the following best relates to "${topic}"?`,
              options: [
                'Learning objectives',
                "Teacher's salary",
                'School budget',
                "Student's home address",
              ],
              correctIndex: 0,
              explanation:
                'Effective practice always centers on clear learning objectives and student outcomes.',
            },
          ],
  }))
}

export const COURSES: Course[] = [
  {
    id: 'lesson-planning-101',
    title: 'How to Write an Effective Lesson Plan',
    category: 'Lesson Planning',
    description:
      'Learn how to design clear, structured, and effective lesson plans that improve student outcomes.',
    isDemo: true,
    lessons: makeLessons('How to Write an Effective Lesson Plan', [
      'Why Lesson Planning Matters',
      'Setting Learning Objectives',
      'Structuring a Lesson',
      'Choosing Teaching Materials',
      'Differentiating Instruction',
      'Formative Assessment in a Lesson',
      'Time Management in the Classroom',
      'Aligning Lessons to the Curriculum',
      'Reviewing and Improving Your Plan',
      'Putting It All Together',
    ]),
    finalAssessment: [
      {
        id: 'lp-final-1',
        question: 'What should every lesson plan begin with?',
        options: [
          'Clear learning objectives',
          'A list of student names',
          'The school budget',
          'A disciplinary policy',
        ],
        correctIndex: 0,
        explanation: 'Objectives guide every other part of the lesson.',
      },
    ],
  },
  {
    id: 'classroom-management-fundamentals',
    title: 'Classroom Management Fundamentals',
    category: 'Classroom Management',
    description:
      'Build practical strategies to manage classroom behavior and create a positive learning environment.',
    isDemo: true,
    lessons: makeLessons('Classroom Management Fundamentals', [
      'Principles of Classroom Management',
      'Setting Classroom Rules',
      'Building Routines',
      'Managing Large Classes',
      'Positive Reinforcement',
      'Handling Disruptive Behavior',
      'Student Discipline Approaches',
      'Creating a Positive Environment',
      'Communicating with Parents',
      'Reflecting on Your Classroom Culture',
    ]),
    finalAssessment: [
      {
        id: 'cm-final-1',
        question: 'What is the most effective first step in classroom management?',
        options: [
          'Setting clear rules and routines',
          'Punishing every mistake',
          'Ignoring behavior issues',
          'Removing all group work',
        ],
        correctIndex: 0,
        explanation: 'Clear rules and routines prevent most disruptions before they start.',
      },
    ],
  },
  {
    id: 'school-administration-fundamentals',
    title: 'Fundamentals of School Administration',
    category: 'School Administration',
    description:
      'Core skills for principals, vice principals, and administrators to run schools effectively.',
    isDemo: true,
    lessons: makeLessons('Fundamentals of School Administration', [
      'Role of a School Administrator',
      'School Leadership Styles',
      'Managing Teachers',
      'Staff Communication',
      'Student Records Management',
      'School Policies',
      'Handling Conflict',
      'Community Relations',
      'Planning the School Calendar',
      'Evaluating School Performance',
    ]),
    finalAssessment: [
      {
        id: 'sa-final-1',
        question: 'A key responsibility of a school administrator is:',
        options: [
          'Supporting teachers and maintaining records',
          'Teaching every class personally',
          'Avoiding all staff meetings',
          'Ignoring school policy',
        ],
        correctIndex: 0,
        explanation: 'Administrators enable teaching by supporting staff and systems.',
      },
    ],
  },
  {
    id: 'school-financial-management',
    title: 'School Financial Management',
    category: 'School Financial Management',
    description:
      'Learn budgeting, fee management, and financial reporting for schools.',
    isDemo: true,
    lessons: makeLessons('School Financial Management', [
      'Fundamentals of School Finance',
      'Building a School Budget',
      'Managing School Fees',
      'Financial Record Keeping',
      'Handling Cash and Receipts',
      'Vendor and Procurement Basics',
      'Payroll Basics for Schools',
      'Financial Reporting',
      'Preventing Financial Mismanagement',
      'Annual Financial Planning',
    ]),
    finalAssessment: [
      {
        id: 'fm-final-1',
        question: 'Why is accurate financial record keeping important for a school?',
        options: [
          'It ensures transparency and accountability',
          'It is only needed for large schools',
          'It replaces the need for a budget',
          'It is optional if fees are low',
        ],
        correctIndex: 0,
        explanation: 'Accurate records build trust with parents, staff, and authorities.',
      },
    ],
  },
  {
    id: 'effective-teaching-methods',
    title: 'Effective Teaching Methods',
    category: 'Teaching & Pedagogy',
    description:
      'Explore proven, student-centered teaching methods that improve learning outcomes.',
    isDemo: true,
    lessons: makeLessons('Effective Teaching Methods', [
      'What Makes Teaching Effective',
      'Student-Centered Learning',
      'Active Learning Strategies',
      'Questioning Techniques',
      'Differentiated Instruction',
      'Using Formative Assessment',
      'Inclusive Education Practices',
      'Teaching Large or Mixed-Ability Classes',
      'Using Local Resources Creatively',
      'Reflective Teaching Practice',
    ]),
    finalAssessment: [
      {
        id: 'et-final-1',
        question: 'Student-centered learning primarily focuses on:',
        options: [
          "Actively engaging students in their own learning",
          'The teacher talking for the entire lesson',
          'Only using textbooks',
          'Avoiding group work',
        ],
        correctIndex: 0,
        explanation: 'Student-centered learning shifts focus from lecture to active engagement.',
      },
    ],
  },
]

export const CATEGORIES = [
  {
    name: 'Teaching & Pedagogy',
    topics: [
      'Effective Teaching Methods',
      'Student-Centered Learning',
      'Assessment and Evaluation',
      'Inclusive Education',
    ],
  },
  {
    name: 'Lesson Planning',
    topics: [
      'How to Write an Effective Lesson Plan',
      'Learning Objectives',
      'Teaching Materials',
      'Lesson Evaluation',
    ],
  },
  {
    name: 'Classroom Management',
    topics: [
      'Classroom Management Fundamentals',
      'Managing Large Classes',
      'Student Discipline',
      'Positive Classroom Environment',
    ],
  },
  {
    name: 'School Administration',
    topics: [
      'Fundamentals of School Administration',
      'School Leadership',
      'Managing Teachers',
      'Student Records',
      'School Communication',
    ],
  },
  {
    name: 'School Financial Management',
    topics: [
      'Fundamentals of School Financial Management',
      'School Budgeting',
      'Managing School Fees',
      'Financial Record Keeping',
      'Financial Reporting',
    ],
  },
  {
    name: 'Educational Technology',
    topics: [
      'Digital Teaching Tools',
      'Online Teaching',
      'Creating Digital Learning Materials',
      'AI for Teachers',
    ],
  },
  {
    name: 'Teacher Professional Development',
    topics: [
      'Professional Ethics',
      'Teacher Leadership',
      'Communication Skills',
      'Career Development',
    ],
  },
]
