"use client";

import React from 'react';
import { BookOpen, FlaskConical, Brain, Atom, Rocket, Lightbulb, Scale } from 'lucide-react'; // Added Scale icon

// Define the structure for a lesson
export interface Lesson {
  id: string;
  title: string;
  description: string;
  link: string;
  content?: string; // Optional content for LessonPage
  videoUrl?: string | null; // New: Optional video URL for LessonPage
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
                <li><strong>Position:</strong> The location of an object relative to a reference point. It's a vector quantity, meaning it has both magnitude and direction from an origin.</li>
                <li><strong>Displacement:</strong> The change in position of an object. It is a vector quantity, calculated as final position minus initial position (Δx = x_f - x_i).</li>
                <li><strong>Distance:</strong> The total path length covered by an object. It is a scalar quantity, always positive, and does not depend on direction.</li>
                <li><strong>Velocity:</strong> The rate at which an object changes its position. It is a vector quantity (speed with direction). Average velocity is Δx/Δt, while instantaneous velocity is the velocity at a specific moment.</li>
                <li><strong>Speed:</strong> The magnitude of velocity. It is a scalar quantity. Average speed is total distance/total time.</li>
                <li><strong>Acceleration:</strong> The rate at which an object changes its velocity. It is a vector quantity. A positive acceleration doesn't always mean speeding up; it depends on the direction of velocity.</li>
              </ul>
              <h3 class="text-xl font-semibold mt-4 mb-2">Equations of Motion (Constant Acceleration):</h3>
              <p>These equations are fundamental for solving problems involving constant acceleration in one dimension:</p>
              <ul class="list-disc list-inside space-y-1">
                <li>v = v₀ + at</li>
                <li>Δx = v₀t + ½at²</li>
                <li>v² = v₀² + 2aΔx</li>
                <li>Δx = (v₀ + v)/2 * t</li>
              </ul>
              <p class="mt-4">Where: v = final velocity, v₀ = initial velocity, a = acceleration, t = time, Δx = displacement.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Interactive Simulation:</h3>
              <p>Use our custom 1D Kinematics Simulator below to experiment with different initial conditions and observe the resulting motion!</p>
              <!-- SIMULATION_PLACEHOLDER_KINEMATICS_1D -->
              <h3 class="text-xl font-semibold mt-4 mb-2">Further Learning:</h3>
            `,
            videoUrl: "https://streamable.com/e/21b3js",
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
              <p>Two-dimensional kinematics extends the concepts of 1D motion to motion in a plane. This is particularly useful for analyzing projectile motion, where an object moves under the influence of gravity alone. The key to solving 2D motion problems is to break them down into independent 1D problems for the horizontal (x) and vertical (y) components.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Projectile Motion:</h3>
              <p>Projectile motion is the motion of an object thrown or projected into the air, subject only to the acceleration of gravity. We typically neglect air resistance for AP Physics 1 problems.</p>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Horizontal Motion:</strong> In the absence of air resistance, there are no horizontal forces acting on the projectile. Therefore, the horizontal velocity (v_x) remains constant throughout the flight. The horizontal acceleration (a_x) is 0.</li>
                <li><strong>Vertical Motion:</strong> The vertical motion is governed by gravity. The vertical acceleration (a_y) is constant and equal to -9.8 m/s² (downwards). The vertical velocity (v_y) changes due to gravity.</li>
              </ul>
              <p class="mt-4">The time an object spends in the air is determined by its vertical motion, and this time is the same for both horizontal and vertical components. This is a crucial link between the two independent motions.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Key Equations for Projectile Motion:</h3>
              <p>Apply the 1D kinematic equations separately for x and y components:</p>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Horizontal:</strong> Δx = v_x * t</li>
                <li><strong>Vertical:</strong>
                  <ul>
                    <li>v_y = v_0y + a_y * t</li>
                    <li>Δy = v_0y * t + ½a_y * t²</li>
                    <li>v_y² = v_0y² + 2a_y * Δy</li>
                  </ul>
                </li>
              </ul>
              <h3 class="text-xl font-semibold mt-4 mb-2">Further Learning:</h3>
            `,
            videoUrl: "https://streamable.com/e/21b3js",
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
              <p>Relative velocity is the velocity of an object or observer B in the rest frame of another object or observer A. It is the velocity that A would perceive B to have. Understanding relative velocity is crucial when dealing with situations where motion is observed from a moving reference frame, such as a boat in a river or an airplane in wind.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Key Concepts:</h3>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Reference Frames:</strong> All motion is relative. The velocity of an object depends on the observer's frame of reference.</li>
                <li><strong>Relative Velocity Equation (1D):</strong> If you want to find the velocity of object A relative to object B (V_AB), you can use the formula: V_AB = V_A - V_B. This means if A is moving at 10 m/s and B is moving at 3 m/s in the same direction, A's velocity relative to B is 7 m/s. If they are moving in opposite directions, their relative velocity would be 13 m/s (assuming B is moving in the negative direction).</li>
                <li><strong>Relative Velocity Equation (2D):</strong> For two-dimensional problems, you apply the vector subtraction (or addition, depending on the setup) to the x and y components separately. For example, V_boat/ground = V_boat/water + V_water/ground.</li>
              </ul>
              <p class="mt-4">This concept is crucial for understanding motion in different reference frames, such as a boat moving in a river or an airplane flying in wind. Always clearly define your reference frames and the velocities relative to those frames.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Further Learning:</h3>
            `,
            videoUrl: "https://streamable.com/e/21b3js",
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
              <p>Newton's Laws of Motion are three fundamental laws of classical mechanics that describe the relationship between a body and the forces acting upon it, and its motion in response to those forces. These laws form the basis of dynamics, the study of why objects move as they do.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">The Three Laws:</h3>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>First Law (Law of Inertia):</strong> An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This law introduces the concept of inertia, which is an object's resistance to changes in its state of motion. Mass is a quantitative measure of inertia.</li>
                <li><strong>Second Law (F=ma):</strong> The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force, in the same direction as the net force, and inversely proportional to the mass of the object. Mathematically, this is expressed as ΣF = ma, where ΣF is the net force, m is mass, and a is acceleration. This is the most powerful of Newton's laws, allowing us to quantify the relationship between force and motion.</li>
                <li><strong>Third Law (Action-Reaction):</strong> For every action, there is an equal and opposite reaction. This means that forces always occur in pairs. If object A exerts a force on object B, then object B simultaneously exerts an equal and opposite force on object A. These forces act on *different* objects and therefore do not cancel each other out.</li>
              </ul>
              <h3 class="text-xl font-semibold mt-4 mb-2">Further Learning:</h3>
            `,
            videoUrl: "https://streamable.com/e/21b3js",
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
              <p>Friction is a force that opposes motion between two surfaces in contact. It is a crucial force in everyday life, allowing us to walk, drive, and hold objects. Understanding friction is essential for analyzing many physical systems.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Types of Friction:</h3>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Static Friction (f_s):</strong> This force acts to prevent an object from sliding when a force is applied. It opposes the *tendency* of motion. Its magnitude varies from zero up to a maximum value, given by f_s,max = μ_s * N, where μ_s is the coefficient of static friction and N is the normal force. Once the applied force exceeds f_s,max, the object begins to move.</li>
                <li><strong>Kinetic Friction (f_k):</strong> This force acts on an object that is already in motion, opposing its sliding motion. Its magnitude is generally constant for a given pair of surfaces and is given by f_k = μ_k * N, where μ_k is the coefficient of kinetic friction. Typically, μ_k is less than μ_s, meaning it takes more force to start an object moving than to keep it moving.</li>
              </ul>
              <p class="mt-4">Both types of friction depend on the normal force (the force perpendicular to the surfaces in contact) and the coefficient of friction (μ), which is a property of the two surfaces in contact.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Applying Force Concepts:</h3>
              <p>When solving problems involving friction, it's critical to draw a free-body diagram, identify all forces acting on the object (gravity, normal force, applied force, friction), and then apply Newton's Second Law (ΣF = ma) in both the horizontal and vertical directions.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Further Learning:</h3>
            `,
            videoUrl: "https://streamable.com/e/21b3js",
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
              <p>In physics, work has a very specific definition. Work is done when a force causes a displacement of an object. For work to be done, there must be a force, a displacement, and at least some component of the force must be in the direction of the displacement.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Key Concepts:</h3>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Work (W):</strong> The work done by a constant force is calculated as W = Fd cos(θ), where F is the magnitude of the force, d is the magnitude of the displacement, and θ is the angle between the force vector and the displacement vector. The unit of work is the Joule (J), which is equivalent to N·m.</li>
                <li><strong>Kinetic Energy (KE):</strong> Kinetic energy is the energy an object possesses due to its motion. It is a scalar quantity and is given by the formula KE = ½mv², where m is the mass of the object and v is its speed. The unit of kinetic energy is also the Joule.</li>
                <li><strong>Work-Energy Theorem:</strong> This fundamental theorem states that the net work done on an object (the work done by the net force) equals the change in its kinetic energy. Mathematically, W_net = ΔKE = KE_f - KE_i. This theorem provides a powerful way to relate forces and motion without directly using acceleration.</li>
              </ul>
              <p class="mt-4">Understanding the Work-Energy Theorem allows us to analyze situations where forces are not constant or where the path taken is complex, by focusing on the initial and final states of kinetic energy.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Further Learning:</h3>
            `,
            videoUrl: "https://streamable.com/e/21b3js",
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
        lessons: [
          {
            id: 'rotational-kinematics',
            title: 'Lesson 4.1: Introduction to Rotational Kinematics',
            description: 'Understand angular displacement, velocity, and acceleration.',
            link: '/courses/ap-physics/lessons/rotational-kinematics',
            content: `
              <p>Rotational kinematics is the study of rotational motion without considering the forces that cause it. It's analogous to linear kinematics but deals with angular quantities.</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Key Concepts:</h3>
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Angular Position (θ):</strong> The angle of an object relative to a reference direction. Measured in radians.</li>
                <li><strong>Angular Displacement (Δθ):</strong> The change in angular position.</li>
                <li><strong>Angular Velocity (ω):</strong> The rate of change of angular position (ω = Δθ/Δt). Measured in rad/s.</li>
                <li><strong>Angular Acceleration (α):</strong> The rate of change of angular velocity (α = Δω/Δt). Measured in rad/s².</li>
              </ul>
              <h3 class="text-xl font-semibold mt-4 mb-2">Equations of Rotational Motion (Constant Angular Acceleration):</h3>
              <ul class="list-disc list-inside space-y-1">
                <li>ω = ω₀ + αt</li>
                <li>Δθ = ω₀t + ½αt²</li>
                <li>ω² = ω₀² + 2αΔθ</li>
                <li>Δθ = (ω₀ + ω)/2 * t</li>
              </ul>
              <p class="mt-4">These equations are identical in form to their linear counterparts, making it easier to apply what you already know!</p>
              <h3 class="text-xl font-semibold mt-4 mb-2">Further Learning:</h3>
            `,
            videoUrl: "https://streamable.com/e/21b3js", // Placeholder video
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: 'What is the SI unit for angular velocity?',
                options: ['meters/second', 'radians/second', 'degrees/second', 'revolutions/minute'],
                correctAnswer: 'radians/second',
                explanation: 'Angular velocity is measured in radians per second (rad/s) in the SI system.',
              },
            ],
          },
        ],
      },
      {
        id: 'gravitation',
        title: "Module 5: Universal Gravitation",
        description: "Explore Newton's Law of Universal Gravitation, gravitational fields, and orbital mechanics.",
        icon: <Scale className="h-5 w-5" />,
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

// New helper function to get the total count of all lessons
export const getTotalLessonsCount = (): number => {
  let count = 0;
  for (const course of courses) {
    for (const module of course.modules) {
      count += module.lessons.length;
    }
  }
  return count;
};

// New helper function to find personalized recommendations
export const findPersonalizedRecommendations = (
  userId: string | null,
  completedLessonIds: string[]
): string[] => {
  if (!userId) {
    return ["Log in to get personalized recommendations!"];
  }

  const recommendations: string[] = [];

  // Find the first uncompleted lesson
  for (const course of courses) {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!completedLessonIds.includes(lesson.id)) {
          recommendations.push(`Continue your journey in '${course.title}' with: ${lesson.title}`);
          return recommendations; // Return the first uncompleted lesson as the primary recommendation
        }
      }
    }
  }

  // If all lessons are completed
  recommendations.push("Congratulations! You've completed all available lessons.");
  recommendations.push("Explore new courses or review past lessons to reinforce your knowledge.");

  return recommendations;
};