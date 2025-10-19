"use client";

import React from 'react';
import { BookOpen, FlaskConical, Brain, Atom, Rocket, Lightbulb } from 'lucide-react';

// Define the structure for a lesson
export interface Lesson {
  id: string;
  title: string;
  description: string;
  link: string;
  content?: string; // Optional content for LessonPage
  questions?: {
    id: string;
    type: 'multiple-choice';
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

// Define the structure for a module
export interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  lessons: Lesson[];
}

// Define the structure for a course
export interface Course {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  modules: Module[];
}

// --- Course Data ---
export const courses: Course[] = [
  {
    id: 'ap-physics',
    title: 'AP Physics 1',
    description: 'Explore the fundamental principles of physics, including Newtonian mechanics, work, energy, power, and simple harmonic motion.',
    icon: <Atom className="h-6 w-6 text-blue-500" />,
    link: '/courses/ap-physics',
    modules: [
      {
        id: 'kinematics',
        title: "Module 1: Kinematics",
        description: "Study motion in one and two dimensions, including displacement, velocity, acceleration, and projectile motion.",
        icon: <Rocket className="h-5 w-5" />,
        lessons: [
          {
            id: 'kinematics-1d',
            title: 'Lesson 1.1: Introduction to 1D Kinematics',
            description: 'Understand position, displacement, velocity, speed, and acceleration in one dimension.',
            link: '/courses/ap-physics/lessons/kinematics-1d',
            content: `
              <p>Kinematics is the branch of classical mechanics that describes the motion of points, bodies (objects), and systems of bodies without considering the forces that cause them to move. In one-dimensional (1D) kinematics, we focus on motion along a straight line.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Key Concepts:</h3>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Position:</strong> The location of an object relative to a reference point.</li>
                <li><strong>Displacement:</strong> The change in position of an object. It is a vector quantity.</li>
                <li><strong>Distance:</strong> The total path length covered by an object. It is a scalar quantity.</li>
                <li><strong>Velocity:</strong> The rate at which an object changes its position. It is a vector quantity (speed with direction).</li>
                <li><strong>Speed:</strong> The magnitude of velocity. It is a scalar quantity.</li>
                <li><strong>Acceleration:</strong> The rate at which an object changes its velocity. It is a vector quantity.</li>
              </ul>
              <h3 class="text-xl font-semibold mt-4 mb-2">Equations of Motion (Constant Acceleration):</h3>
              <ul class="list-disc list-inside space-y-1">
                <li>v = v₀ + at</li>
                <li>Δx = v₀t + ½at²</li>
                <li>v² = v₀² + 2aΔx</li>
                <li>Δx = (v₀ + v)/2 * t</li>
              </ul>
              <p class="mt-4">Where: v = final velocity, v₀ = initial velocity, a = acceleration, t = time, Δx = displacement.</p>
            `,
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: 'Which of the following is a scalar quantity?',
                options: ['Displacement', 'Velocity', 'Speed', 'Acceleration'],
                correctAnswer: 'Speed',
                explanation: 'Speed is the magnitude of velocity and does not include direction, making it a scalar quantity. Displacement, velocity, and acceleration are vector quantities as they have both magnitude and direction.',
              },
              {
                id: 'q2',
                type: 'multiple-choice',
                question: 'An object moves from position x=5m to x=15m. What is its displacement?',
                options: ['10m', '-10m', '20m', '5m'],
                correctAnswer: '10m',
                explanation: 'Displacement is the final position minus the initial position. So, 15m - 5m = 10m.',
              },
            ],
          },
          {
            id: 'kinematics-2d',
            title: 'Lesson 1.2: 2D Motion & Projectiles',
            description: 'Analyze motion in two dimensions, focusing on projectile motion.',
            link: '/courses/ap-physics/lessons/kinematics-2d',
            content: `
              <p>Two-dimensional kinematics extends the concepts of 1D motion to motion in a plane. This is particularly useful for analyzing projectile motion, where an object moves under the influence of gravity alone.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Projectile Motion:</h3>
              <p>Projectile motion is the motion of an object thrown or projected into the air, subject only to the acceleration of gravity. The key is to treat horizontal and vertical motions independently.</p>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Horizontal Motion:</strong> Constant velocity (assuming no air resistance). a_x = 0.</li>
                <li><strong>Vertical Motion:</strong> Constant acceleration due to gravity (a_y = -9.8 m/s²).</li>
              </ul>
              <p class="mt-4">The time an object spends in the air is determined by its vertical motion, and this time is the same for both horizontal and vertical components.</p>
            `,
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: 'In projectile motion, neglecting air resistance, what is true about the horizontal velocity?',
                options: ['It constantly increases', 'It constantly decreases', 'It remains constant', 'It changes direction'],
                correctAnswer: 'It remains constant',
                explanation: 'Without air resistance, there are no horizontal forces acting on the projectile, so its horizontal velocity remains constant.',
              },
            ],
          },
          {
            id: 'relative-velocity',
            title: 'Lesson 1.3: Relative Velocity',
            description: 'Explore how velocities are perceived from different frames of reference.',
            link: '/courses/ap-physics/lessons/relative-velocity',
            content: `
              <p>Relative velocity is the velocity of an object or observer B in the rest frame of another object or observer A. It is the velocity that A would perceive B to have.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Key Concepts:</h3>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Relative Velocity Equation:</strong> V_AB = V_A - V_B (velocity of A relative to B).</li>
                <li>This concept is crucial for understanding motion in different reference frames, such as a boat moving in a river or an airplane flying in wind.</li>
              </ul>
            `,
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: 'A boat travels at 10 m/s relative to the water. The river flows at 3 m/s. What is the boat\'s speed relative to the shore if it travels downstream?',
                options: ['7 m/s', '10 m/s', '13 m/s', '3 m/s'],
                correctAnswer: '13 m/s',
                explanation: 'When traveling downstream, the velocities add up: 10 m/s (boat) + 3 m/s (river) = 13 m/s.',
              },
            ],
          },
        ],
      },
      {
        id: 'dynamics',
        title: "Module 2: Dynamics",
        description: "Explore Newton's Laws of Motion, forces, friction, and applications of dynamics.",
        icon: <FlaskConical className="h-5 w-5" />,
        lessons: [
          {
            id: 'newtons-laws',
            title: 'Lesson 2.1: Newton\'s Laws of Motion',
            description: 'Learn about inertia, F=ma, and action-reaction pairs.',
            link: '/courses/ap-physics/lessons/newtons-laws',
            content: `
              <p>Newton's Laws of Motion are three fundamental laws of classical mechanics that describe the relationship between a body and the forces acting upon it, and its motion in response to those forces.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">The Three Laws:</h3>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>First Law (Inertia):</strong> An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.</li>
                <li><strong>Second Law (F=ma):</strong> The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force, in the same direction as the net force, and inversely proportional to the mass of the object.</li>
                <li><strong>Third Law (Action-Reaction):</strong> For every action, there is an equal and opposite reaction.</li>
              </ul>
            `,
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: 'Which law states that an object in motion stays in motion unless acted upon by an external force?',
                options: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Law of Conservation of Energy'],
                correctAnswer: 'Newton\'s First Law',
                explanation: 'This is the definition of Newton\'s First Law, also known as the Law of Inertia.',
              },
            ],
          },
          {
            id: 'friction',
            title: 'Lesson 2.2: Friction and Forces',
            description: 'Understand static and kinetic friction, and apply force concepts.',
            link: '/courses/ap-physics/lessons/friction',
            content: `
              <p>Friction is a force that opposes motion between two surfaces in contact. It can be static (preventing motion) or kinetic (opposing motion once it has started).</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Types of Friction:</h3>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Static Friction (f_s):</strong> Acts to prevent an object from sliding. Its magnitude varies from zero up to a maximum value.</li>
                <li><strong>Kinetic Friction (f_k):</strong> Acts on an object in motion. Its magnitude is generally constant for a given pair of surfaces.</li>
              </ul>
              <p class="mt-4">Both types of friction depend on the normal force and the coefficient of friction (μ).</p>
            `,
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: 'Which type of friction acts on an object that is already in motion?',
                options: ['Static friction', 'Kinetic friction', 'Rolling friction', 'Fluid friction'],
                correctAnswer: 'Kinetic friction',
                explanation: 'Kinetic friction opposes motion when an object is already sliding across a surface.',
              },
            ],
          },
        ],
      },
      {
        id: 'work-energy-power',
        title: "Module 3: Work, Energy, and Power",
        description: "Understand concepts of work, kinetic energy, potential energy, conservation of energy, and power.",
        icon: <Lightbulb className="h-5 w-5" />,
        lessons: [
          {
            id: 'work-energy-theorem',
            title: 'Lesson 3.1: Work and the Work-Energy Theorem',
            description: 'Define work, calculate work done by forces, and understand its relation to kinetic energy.',
            link: '/courses/ap-physics/lessons/work-energy-theorem',
            content: `
              <p>Work is done when a force causes a displacement of an object. The Work-Energy Theorem states that the net work done on an object equals the change in its kinetic energy.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Key Concepts:</h3>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Work (W):</strong> W = Fd cos(θ), where F is force, d is displacement, and θ is the angle between them.</li>
                <li><strong>Kinetic Energy (KE):</strong> KE = ½mv², where m is mass and v is velocity.</li>
                <li><strong>Work-Energy Theorem:</strong> W_net = ΔKE = KE_f - KE_i.</li>
              </ul>
            `,
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: 'If a force of 10 N pushes an object 5 meters in the direction of the force, how much work is done?',
                options: ['2 J', '5 J', '10 J', '50 J'],
                correctAnswer: '50 J',
                explanation: 'Work = Force × Displacement = 10 N × 5 m = 50 Joules.',
              },
            ],
          },
        ],
      },
      {
        id: 'rotational-motion',
        title: "Module 4: Rotational Motion",
        description: "Learn about rotational kinematics, torque, angular momentum, and rotational kinetic energy.",
        icon: <BookOpen className="h-5 w-5" />,
        lessons: [], // Placeholder for future lessons
      },
    ],
  },
  {
    id: 'ap-chemistry',
    title: 'AP Chemistry',
    description: 'Dive into the world of atoms, molecules, and chemical reactions. Covers topics like stoichiometry, thermodynamics, and kinetics.',
    icon: <FlaskConical className="h-6 w-6 text-green-500" />,
    link: '/courses/ap-chemistry',
    modules: [], // Placeholder
  },
  {
    id: 'ap-biology',
    title: 'AP Biology',
    description: 'Study the science of life, from molecular biology to ecology. Understand biological processes and their impact on living organisms.',
    icon: <Brain className="h-6 w-6 text-purple-500" />,
    link: '/courses/ap-biology',
    modules: [], // Placeholder
  },
];

// Helper function to find a course by ID
export const findCourseById = (courseId: string): Course | undefined => {
  return courses.find(course => course.id === courseId);
};

// Helper function to find a lesson by ID within a specific course
export const findLessonById = (courseId: string, lessonId: string): Lesson | undefined => {
  const course = findCourseById(courseId);
  if (!course) return undefined;

  for (const module of course.modules) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
};

// Helper function to find the next lesson
export const findNextLessonPath = (currentLessonId: string, currentCourseId: string): string | null => {
  const course = findCourseById(currentCourseId);
  if (!course) return null;

  for (let i = 0; i < course.modules.length; i++) {
    const module = course.modules[i];
    const lessonIndex = module.lessons.findIndex(l => l.id === currentLessonId);

    if (lessonIndex !== -1) {
      // Found the current lesson in this module
      if (lessonIndex < module.lessons.length - 1) {
        // There's a next lesson in the current module
        return module.lessons[lessonIndex + 1].link;
      } else {
        // This is the last lesson in the current module
        if (i < course.modules.length - 1) {
          // There's a next module, return the first lesson of the next module
          const nextModule = course.modules[i + 1];
          if (nextModule.lessons.length > 0) {
            return nextModule.lessons[0].link;
          }
        }
        // No next lesson in the current module or next module, return to course overview
        return course.link;
      }
    }
  }
  return null; // Should not happen if currentLessonId is valid
};