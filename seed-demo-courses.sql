-- Seed data generated from the app's built-in demo courses, for the
-- new schema (learners/admins separated, multi-question lesson quizzes,
-- photos field). Run this AFTER supabase_schema.sql. Safe to run once.

insert into courses (id, title, category, description, published)
values ('lesson-planning-101', 'How to Write an Effective Lesson Plan', 'Lesson Planning', 'Learn how to design clear, structured, and effective lesson plans that improve student outcomes.', true)
on conflict (id) do nothing;

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'lesson-planning-101', 1, 'Why Lesson Planning Matters', 'This lesson covers "Why Lesson Planning Matters" as part of How to Write an Effective Lesson Plan. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Why Lesson Planning Matters" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Why Lesson Planning Matters — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'lesson-planning-101' and position = 1);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Why Lesson Planning Matters"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'lesson-planning-101' and l.position = 1
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'lesson-planning-101', 2, 'Setting Learning Objectives', 'This lesson covers "Setting Learning Objectives" as part of How to Write an Effective Lesson Plan. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Setting Learning Objectives" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Setting Learning Objectives — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'lesson-planning-101' and position = 2);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Setting Learning Objectives"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'lesson-planning-101' and l.position = 2
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'lesson-planning-101', 3, 'Structuring a Lesson', 'This lesson covers "Structuring a Lesson" as part of How to Write an Effective Lesson Plan. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Structuring a Lesson" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Structuring a Lesson — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'lesson-planning-101' and position = 3);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Structuring a Lesson"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'lesson-planning-101' and l.position = 3
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'lesson-planning-101', 4, 'Choosing Teaching Materials', 'This lesson covers "Choosing Teaching Materials" as part of How to Write an Effective Lesson Plan. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Choosing Teaching Materials" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Choosing Teaching Materials — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'lesson-planning-101' and position = 4);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Choosing Teaching Materials"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'lesson-planning-101' and l.position = 4
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'lesson-planning-101', 5, 'Differentiating Instruction', 'This lesson covers "Differentiating Instruction" as part of How to Write an Effective Lesson Plan. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Differentiating Instruction" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Differentiating Instruction — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'lesson-planning-101' and position = 5);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Differentiating Instruction"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'lesson-planning-101' and l.position = 5
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'lesson-planning-101', 6, 'Formative Assessment in a Lesson', 'This lesson covers "Formative Assessment in a Lesson" as part of How to Write an Effective Lesson Plan. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Formative Assessment in a Lesson" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Formative Assessment in a Lesson — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'lesson-planning-101' and position = 6);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Formative Assessment in a Lesson"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'lesson-planning-101' and l.position = 6
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'lesson-planning-101', 7, 'Time Management in the Classroom', 'This lesson covers "Time Management in the Classroom" as part of How to Write an Effective Lesson Plan. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Time Management in the Classroom" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Time Management in the Classroom — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'lesson-planning-101' and position = 7);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Time Management in the Classroom"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'lesson-planning-101' and l.position = 7
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'lesson-planning-101', 8, 'Aligning Lessons to the Curriculum', 'This lesson covers "Aligning Lessons to the Curriculum" as part of How to Write an Effective Lesson Plan. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Aligning Lessons to the Curriculum" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Aligning Lessons to the Curriculum — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'lesson-planning-101' and position = 8);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Aligning Lessons to the Curriculum"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'lesson-planning-101' and l.position = 8
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'lesson-planning-101', 9, 'Reviewing and Improving Your Plan', 'This lesson covers "Reviewing and Improving Your Plan" as part of How to Write an Effective Lesson Plan. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Reviewing and Improving Your Plan" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Reviewing and Improving Your Plan — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'lesson-planning-101' and position = 9);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Reviewing and Improving Your Plan"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'lesson-planning-101' and l.position = 9
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'lesson-planning-101', 10, 'Putting It All Together', 'This lesson covers "Putting It All Together" as part of How to Write an Effective Lesson Plan. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Putting It All Together" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Putting It All Together — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'lesson-planning-101' and position = 10);

insert into final_assessment_questions (id, course_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), 'lesson-planning-101', 1, 'What should every lesson plan begin with?', ARRAY['Clear learning objectives', 'A list of student names', 'The school budget', 'A disciplinary policy']::text[], 0, 'Objectives guide every other part of the lesson.'
where not exists (select 1 from final_assessment_questions where course_id = 'lesson-planning-101' and position = 1);

insert into courses (id, title, category, description, published)
values ('classroom-management-fundamentals', 'Classroom Management Fundamentals', 'Classroom Management', 'Build practical strategies to manage classroom behavior and create a positive learning environment.', true)
on conflict (id) do nothing;

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'classroom-management-fundamentals', 1, 'Principles of Classroom Management', 'This lesson covers "Principles of Classroom Management" as part of Classroom Management Fundamentals. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Principles of Classroom Management" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Principles of Classroom Management — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'classroom-management-fundamentals' and position = 1);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Principles of Classroom Management"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'classroom-management-fundamentals' and l.position = 1
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'classroom-management-fundamentals', 2, 'Setting Classroom Rules', 'This lesson covers "Setting Classroom Rules" as part of Classroom Management Fundamentals. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Setting Classroom Rules" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Setting Classroom Rules — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'classroom-management-fundamentals' and position = 2);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Setting Classroom Rules"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'classroom-management-fundamentals' and l.position = 2
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'classroom-management-fundamentals', 3, 'Building Routines', 'This lesson covers "Building Routines" as part of Classroom Management Fundamentals. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Building Routines" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Building Routines — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'classroom-management-fundamentals' and position = 3);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Building Routines"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'classroom-management-fundamentals' and l.position = 3
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'classroom-management-fundamentals', 4, 'Managing Large Classes', 'This lesson covers "Managing Large Classes" as part of Classroom Management Fundamentals. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Managing Large Classes" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Managing Large Classes — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'classroom-management-fundamentals' and position = 4);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Managing Large Classes"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'classroom-management-fundamentals' and l.position = 4
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'classroom-management-fundamentals', 5, 'Positive Reinforcement', 'This lesson covers "Positive Reinforcement" as part of Classroom Management Fundamentals. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Positive Reinforcement" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Positive Reinforcement — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'classroom-management-fundamentals' and position = 5);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Positive Reinforcement"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'classroom-management-fundamentals' and l.position = 5
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'classroom-management-fundamentals', 6, 'Handling Disruptive Behavior', 'This lesson covers "Handling Disruptive Behavior" as part of Classroom Management Fundamentals. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Handling Disruptive Behavior" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Handling Disruptive Behavior — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'classroom-management-fundamentals' and position = 6);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Handling Disruptive Behavior"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'classroom-management-fundamentals' and l.position = 6
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'classroom-management-fundamentals', 7, 'Student Discipline Approaches', 'This lesson covers "Student Discipline Approaches" as part of Classroom Management Fundamentals. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Student Discipline Approaches" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Student Discipline Approaches — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'classroom-management-fundamentals' and position = 7);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Student Discipline Approaches"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'classroom-management-fundamentals' and l.position = 7
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'classroom-management-fundamentals', 8, 'Creating a Positive Environment', 'This lesson covers "Creating a Positive Environment" as part of Classroom Management Fundamentals. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Creating a Positive Environment" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Creating a Positive Environment — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'classroom-management-fundamentals' and position = 8);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Creating a Positive Environment"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'classroom-management-fundamentals' and l.position = 8
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'classroom-management-fundamentals', 9, 'Communicating with Parents', 'This lesson covers "Communicating with Parents" as part of Classroom Management Fundamentals. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Communicating with Parents" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Communicating with Parents — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'classroom-management-fundamentals' and position = 9);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Communicating with Parents"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'classroom-management-fundamentals' and l.position = 9
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'classroom-management-fundamentals', 10, 'Reflecting on Your Classroom Culture', 'This lesson covers "Reflecting on Your Classroom Culture" as part of Classroom Management Fundamentals. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Reflecting on Your Classroom Culture" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Reflecting on Your Classroom Culture — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'classroom-management-fundamentals' and position = 10);

insert into final_assessment_questions (id, course_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), 'classroom-management-fundamentals', 1, 'What is the most effective first step in classroom management?', ARRAY['Setting clear rules and routines', 'Punishing every mistake', 'Ignoring behavior issues', 'Removing all group work']::text[], 0, 'Clear rules and routines prevent most disruptions before they start.'
where not exists (select 1 from final_assessment_questions where course_id = 'classroom-management-fundamentals' and position = 1);

insert into courses (id, title, category, description, published)
values ('school-administration-fundamentals', 'Fundamentals of School Administration', 'School Administration', 'Core skills for principals, vice principals, and administrators to run schools effectively.', true)
on conflict (id) do nothing;

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-administration-fundamentals', 1, 'Role of a School Administrator', 'This lesson covers "Role of a School Administrator" as part of Fundamentals of School Administration. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Role of a School Administrator" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Role of a School Administrator — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-administration-fundamentals' and position = 1);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Role of a School Administrator"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-administration-fundamentals' and l.position = 1
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-administration-fundamentals', 2, 'School Leadership Styles', 'This lesson covers "School Leadership Styles" as part of Fundamentals of School Administration. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "School Leadership Styles" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"School Leadership Styles — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-administration-fundamentals' and position = 2);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "School Leadership Styles"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-administration-fundamentals' and l.position = 2
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-administration-fundamentals', 3, 'Managing Teachers', 'This lesson covers "Managing Teachers" as part of Fundamentals of School Administration. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Managing Teachers" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Managing Teachers — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-administration-fundamentals' and position = 3);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Managing Teachers"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-administration-fundamentals' and l.position = 3
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-administration-fundamentals', 4, 'Staff Communication', 'This lesson covers "Staff Communication" as part of Fundamentals of School Administration. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Staff Communication" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Staff Communication — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-administration-fundamentals' and position = 4);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Staff Communication"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-administration-fundamentals' and l.position = 4
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-administration-fundamentals', 5, 'Student Records Management', 'This lesson covers "Student Records Management" as part of Fundamentals of School Administration. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Student Records Management" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Student Records Management — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-administration-fundamentals' and position = 5);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Student Records Management"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-administration-fundamentals' and l.position = 5
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-administration-fundamentals', 6, 'School Policies', 'This lesson covers "School Policies" as part of Fundamentals of School Administration. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "School Policies" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"School Policies — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-administration-fundamentals' and position = 6);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "School Policies"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-administration-fundamentals' and l.position = 6
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-administration-fundamentals', 7, 'Handling Conflict', 'This lesson covers "Handling Conflict" as part of Fundamentals of School Administration. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Handling Conflict" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Handling Conflict — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-administration-fundamentals' and position = 7);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Handling Conflict"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-administration-fundamentals' and l.position = 7
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-administration-fundamentals', 8, 'Community Relations', 'This lesson covers "Community Relations" as part of Fundamentals of School Administration. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Community Relations" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Community Relations — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-administration-fundamentals' and position = 8);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Community Relations"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-administration-fundamentals' and l.position = 8
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-administration-fundamentals', 9, 'Planning the School Calendar', 'This lesson covers "Planning the School Calendar" as part of Fundamentals of School Administration. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Planning the School Calendar" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Planning the School Calendar — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-administration-fundamentals' and position = 9);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Planning the School Calendar"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-administration-fundamentals' and l.position = 9
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-administration-fundamentals', 10, 'Evaluating School Performance', 'This lesson covers "Evaluating School Performance" as part of Fundamentals of School Administration. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Evaluating School Performance" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Evaluating School Performance — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-administration-fundamentals' and position = 10);

insert into final_assessment_questions (id, course_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), 'school-administration-fundamentals', 1, 'A key responsibility of a school administrator is:', ARRAY['Supporting teachers and maintaining records', 'Teaching every class personally', 'Avoiding all staff meetings', 'Ignoring school policy']::text[], 0, 'Administrators enable teaching by supporting staff and systems.'
where not exists (select 1 from final_assessment_questions where course_id = 'school-administration-fundamentals' and position = 1);

insert into courses (id, title, category, description, published)
values ('school-financial-management', 'School Financial Management', 'School Financial Management', 'Learn budgeting, fee management, and financial reporting for schools.', true)
on conflict (id) do nothing;

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-financial-management', 1, 'Fundamentals of School Finance', 'This lesson covers "Fundamentals of School Finance" as part of School Financial Management. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Fundamentals of School Finance" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Fundamentals of School Finance — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-financial-management' and position = 1);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Fundamentals of School Finance"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-financial-management' and l.position = 1
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-financial-management', 2, 'Building a School Budget', 'This lesson covers "Building a School Budget" as part of School Financial Management. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Building a School Budget" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Building a School Budget — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-financial-management' and position = 2);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Building a School Budget"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-financial-management' and l.position = 2
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-financial-management', 3, 'Managing School Fees', 'This lesson covers "Managing School Fees" as part of School Financial Management. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Managing School Fees" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Managing School Fees — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-financial-management' and position = 3);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Managing School Fees"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-financial-management' and l.position = 3
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-financial-management', 4, 'Financial Record Keeping', 'This lesson covers "Financial Record Keeping" as part of School Financial Management. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Financial Record Keeping" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Financial Record Keeping — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-financial-management' and position = 4);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Financial Record Keeping"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-financial-management' and l.position = 4
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-financial-management', 5, 'Handling Cash and Receipts', 'This lesson covers "Handling Cash and Receipts" as part of School Financial Management. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Handling Cash and Receipts" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Handling Cash and Receipts — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-financial-management' and position = 5);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Handling Cash and Receipts"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-financial-management' and l.position = 5
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-financial-management', 6, 'Vendor and Procurement Basics', 'This lesson covers "Vendor and Procurement Basics" as part of School Financial Management. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Vendor and Procurement Basics" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Vendor and Procurement Basics — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-financial-management' and position = 6);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Vendor and Procurement Basics"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-financial-management' and l.position = 6
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-financial-management', 7, 'Payroll Basics for Schools', 'This lesson covers "Payroll Basics for Schools" as part of School Financial Management. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Payroll Basics for Schools" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Payroll Basics for Schools — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-financial-management' and position = 7);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Payroll Basics for Schools"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-financial-management' and l.position = 7
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-financial-management', 8, 'Financial Reporting', 'This lesson covers "Financial Reporting" as part of School Financial Management. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Financial Reporting" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Financial Reporting — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-financial-management' and position = 8);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Financial Reporting"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-financial-management' and l.position = 8
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-financial-management', 9, 'Preventing Financial Mismanagement', 'This lesson covers "Preventing Financial Mismanagement" as part of School Financial Management. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Preventing Financial Mismanagement" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Preventing Financial Mismanagement — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-financial-management' and position = 9);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Preventing Financial Mismanagement"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'school-financial-management' and l.position = 9
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'school-financial-management', 10, 'Annual Financial Planning', 'This lesson covers "Annual Financial Planning" as part of School Financial Management. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Annual Financial Planning" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Annual Financial Planning — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'school-financial-management' and position = 10);

insert into final_assessment_questions (id, course_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), 'school-financial-management', 1, 'Why is accurate financial record keeping important for a school?', ARRAY['It ensures transparency and accountability', 'It is only needed for large schools', 'It replaces the need for a budget', 'It is optional if fees are low']::text[], 0, 'Accurate records build trust with parents, staff, and authorities.'
where not exists (select 1 from final_assessment_questions where course_id = 'school-financial-management' and position = 1);

insert into courses (id, title, category, description, published)
values ('effective-teaching-methods', 'Effective Teaching Methods', 'Teaching & Pedagogy', 'Explore proven, student-centered teaching methods that improve learning outcomes.', true)
on conflict (id) do nothing;

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'effective-teaching-methods', 1, 'What Makes Teaching Effective', 'This lesson covers "What Makes Teaching Effective" as part of Effective Teaching Methods. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "What Makes Teaching Effective" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"What Makes Teaching Effective — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'effective-teaching-methods' and position = 1);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "What Makes Teaching Effective"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'effective-teaching-methods' and l.position = 1
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'effective-teaching-methods', 2, 'Student-Centered Learning', 'This lesson covers "Student-Centered Learning" as part of Effective Teaching Methods. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Student-Centered Learning" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Student-Centered Learning — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'effective-teaching-methods' and position = 2);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Student-Centered Learning"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'effective-teaching-methods' and l.position = 2
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'effective-teaching-methods', 3, 'Active Learning Strategies', 'This lesson covers "Active Learning Strategies" as part of Effective Teaching Methods. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Active Learning Strategies" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Active Learning Strategies — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'effective-teaching-methods' and position = 3);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Active Learning Strategies"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'effective-teaching-methods' and l.position = 3
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'effective-teaching-methods', 4, 'Questioning Techniques', 'This lesson covers "Questioning Techniques" as part of Effective Teaching Methods. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Questioning Techniques" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Questioning Techniques — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'effective-teaching-methods' and position = 4);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Questioning Techniques"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'effective-teaching-methods' and l.position = 4
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'effective-teaching-methods', 5, 'Differentiated Instruction', 'This lesson covers "Differentiated Instruction" as part of Effective Teaching Methods. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Differentiated Instruction" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Differentiated Instruction — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'effective-teaching-methods' and position = 5);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Differentiated Instruction"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'effective-teaching-methods' and l.position = 5
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'effective-teaching-methods', 6, 'Using Formative Assessment', 'This lesson covers "Using Formative Assessment" as part of Effective Teaching Methods. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Using Formative Assessment" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Using Formative Assessment — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'effective-teaching-methods' and position = 6);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Using Formative Assessment"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'effective-teaching-methods' and l.position = 6
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'effective-teaching-methods', 7, 'Inclusive Education Practices', 'This lesson covers "Inclusive Education Practices" as part of Effective Teaching Methods. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Inclusive Education Practices" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Inclusive Education Practices — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'effective-teaching-methods' and position = 7);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Inclusive Education Practices"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'effective-teaching-methods' and l.position = 7
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'effective-teaching-methods', 8, 'Teaching Large or Mixed-Ability Classes', 'This lesson covers "Teaching Large or Mixed-Ability Classes" as part of Effective Teaching Methods. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Teaching Large or Mixed-Ability Classes" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Teaching Large or Mixed-Ability Classes — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'effective-teaching-methods' and position = 8);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Teaching Large or Mixed-Ability Classes"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'effective-teaching-methods' and l.position = 8
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'effective-teaching-methods', 9, 'Using Local Resources Creatively', 'This lesson covers "Using Local Resources Creatively" as part of Effective Teaching Methods. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Using Local Resources Creatively" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Using Local Resources Creatively — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'effective-teaching-methods' and position = 9);

insert into quizzes (id, lesson_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), l.id, 1, 'Which of the following best relates to "Using Local Resources Creatively"?', ARRAY['Learning objectives', 'Teacher''s salary', 'School budget', 'Student''s home address']::text[], 0, 'Effective practice always centers on clear learning objectives and student outcomes.'
from lessons l
where l.course_id = 'effective-teaching-methods' and l.position = 9
and not exists (select 1 from quizzes q where q.lesson_id = l.id and q.position = 1);

insert into lessons (id, course_id, position, title, content, practical_example, photos, resources)
select gen_random_uuid(), 'effective-teaching-methods', 10, 'Reflective Teaching Practice', 'This lesson covers "Reflective Teaching Practice" as part of Effective Teaching Methods. You will learn the core ideas, common mistakes to avoid, and how to apply this directly in a Liberian classroom or school setting.', 'Example: Apply "Reflective Teaching Practice" during your next lesson or staff meeting and note what changes in student or staff engagement.', '[]'::jsonb, '[{"name":"Reflective Teaching Practice — Template.pdf","url":"#"}]'::jsonb
where not exists (select 1 from lessons where course_id = 'effective-teaching-methods' and position = 10);

insert into final_assessment_questions (id, course_id, position, question, options, correct_index, explanation)
select gen_random_uuid(), 'effective-teaching-methods', 1, 'Student-centered learning primarily focuses on:', ARRAY['Actively engaging students in their own learning', 'The teacher talking for the entire lesson', 'Only using textbooks', 'Avoiding group work']::text[], 0, 'Student-centered learning shifts focus from lecture to active engagement.'
where not exists (select 1 from final_assessment_questions where course_id = 'effective-teaching-methods' and position = 1);

