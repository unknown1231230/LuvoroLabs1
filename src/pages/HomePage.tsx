"use client";

import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Atom, FlaskConical, Brain, Rocket, Lightbulb, Scale } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchSiteMetric } from '@/utils/supabaseUtils';
import { courses as allCourses } from '@/utils/courseContent';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const HomePage = () => {
  const { session, loading: authLoading } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(false);
  const controls = useAnimation();
  
  const { data: siteViews = 0, isLoading: isLoadingSiteViews } = useQuery({
    queryKey: ['siteViews'],
    queryFn: () => fetchSiteMetric('site_views'),
  });

  const featuredCourses = allCourses.slice(0, 3);
  
  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animation for hero section
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Animation for metrics section
  const [metricsRef, metricsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Animation for courses section
  const [coursesRef, coursesInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  useEffect(() => {
    if (heroInView) {
      controls.start(i => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1 }
      }));
    }
  }, [heroInView, controls]);

  return (
    <React.Fragment>
      <div className="space-y-12">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="text-center py-16 bg-transparent text-foreground rounded-lg relative overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={heroInView ? { scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
              className="mb-6 inline-block"
            >
              <Rocket className="h-24 w-24 mx-auto text-primary animate-float" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-6xl font-extrabold mb-4 text-foreground"
            >
              Launch Your Learning Journey
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl max-w-3xl mx-auto mb-8 text-muted-foreground"
            >
              Welcome to Luvoro Labs, your launchpad for mastering AP subjects. Dive into
              interactive lessons, track your progress, and achieve academic excellence.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              {session ? (
                <Button asChild size="lg" className="btn-hover-effect bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="btn-hover-effect bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/auth">
                    <span className="flex items-center">
                      Explore Courses <BookOpen className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className="btn-hover-effect">
                <Link to="/courses">
                  <span>View All Courses</span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1 }}
            className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"
          />
        </section>

        {/* Students Helped Metric */}
        <section ref={metricsRef} className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={metricsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Card className="w-full max-w-md mx-auto shadow-lg glass-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl text-purpleAccent-foreground">
                  <Users className="text-purpleAccent-foreground" /> Site Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSiteViews ? (
                  <div className="text-center text-muted-foreground">
                    <div className="h-12 w-24 mx-auto bg-muted rounded animate-pulse-slow" />
                  </div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={metricsInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
                    className="text-6xl font-extrabold text-center text-purpleAccent"
                  >
                    {siteViews.toLocaleString()}
                  </motion.p>
                )}
                <p className="text-center text-muted-foreground mt-2">Join our growing community of learners!</p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Featured Courses Section */}
        <section ref={coursesRef} className="space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={coursesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center text-primary"
          >
            Our Courses
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={coursesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center text-muted-foreground max-w-2xl mx-auto"
          >
            Get started with our most popular AP courses, designed for deep understanding and exam readiness.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={coursesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="card-hover depth-effect"
              >
                <Card className="flex flex-col shadow-sm glass-card border-border h-full">
                  <CardHeader className="flex-row items-center space-x-4 pb-2">
                    {course.icon}
                    <CardTitle className="text-foreground">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-muted-foreground">{course.description}</CardDescription>
                  </CardContent>
                  <div className="p-6 pt-0">
                    {course.isComingSoon ? (
                      <Button className="w-full" disabled>
                        Coming Soon
                      </Button>
                    ) : (
                      <Button asChild className="w-full btn-hover-effect bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link to={course.link!}><span>View Course</span></Link>
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={coursesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button asChild size="lg" variant="outline" className="text-foreground hover:text-primary border-border btn-hover-effect w-full max-w-md mx-auto">
              <Link to="/courses"><span>View All Courses</span></Link>
            </Button>
          </motion.div>
        </section>
        
        {/* Additional Features Section */}
        <section className="py-16 bg-muted/30 rounded-xl">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-center text-primary mb-12"
            >
              Why Choose Luvoro Labs?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Lightbulb className="h-8 w-8 text-primary" />,
                  title: "Interactive Learning",
                  description: "Engage with dynamic simulations and real-time feedback to master complex concepts."
                },
                {
                  icon: <Scale className="h-8 w-8 text-primary" />,
                  title: "Personalized Path",
                  description: "Adaptive learning paths tailored to your strengths and weaknesses."
                },
                {
                  icon: <Atom className="h-8 w-8 text-primary" />,
                  title: "AP Focused",
                  description: "Curriculum designed specifically for AP exam success."
                },
                {
                  icon: <FlaskConical className="h-8 w-8 text-primary" />,
                  title: "Practice Tests",
                  description: "Realistic practice exams with detailed performance analytics."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl border-border card-hover depth-effect"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </React.Fragment>
  );
};

export default HomePage;