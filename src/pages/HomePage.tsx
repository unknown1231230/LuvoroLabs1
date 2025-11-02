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
import { motion } from 'framer-motion';

const HomePage = () => {
  const { session, loading: authLoading } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
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

  // Set mounted state after initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render animations after component is mounted to prevent flashing
  if (!isMounted) {
    return (
      <div className="space-y-12">
        {/* Hero Section - static version while mounting */}
        <section className="text-center py-16 bg-transparent text-foreground rounded-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-6">
              <Rocket className="h-24 w-24 mx-auto text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-foreground">
              Launch Your Learning Journey
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8 text-muted-foreground">
              Welcome to Luvoro Labs, your launchpad for mastering AP subjects. Dive into
              interactive lessons, track your progress, and achieve academic excellence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              {session ? (
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/auth">
                    <span className="flex items-center">
                      Explore Courses <BookOpen className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link to="/courses">
                  <span>View All Courses</span>
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        </section>

        {/* Students Helped Metric */}
        <section className="text-center">
          <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-purpleAccent-foreground">
                <Users className="text-purpleAccent-foreground" /> Site Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSiteViews ? (
                <div className="text-center text-muted-foreground">
                  <div className="h-12 w-24 mx-auto bg-muted rounded animate-pulse" />
                </div>
              ) : (
                <p className="text-6xl font-extrabold text-center text-purpleAccent">
                  {siteViews.toLocaleString()}
                </p>
              )}
              <p className="text-center text-muted-foreground mt-2">Join our growing community of learners!</p>
            </CardContent>
          </Card>
        </section>

        {/* Featured Courses Section - static version while mounting */}
        <section className="space-y-8">
          <h2 className="text-4xl font-bold text-center text-primary">
            Our Courses
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Get started with our most popular AP courses, designed for deep understanding and exam readiness.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course, index) => (
              <div key={course.id} className="h-full">
                <Card className="flex flex-col shadow-sm h-full">
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
                      <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link to={course.link!}><span>View Course</span></Link>
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
          <div>
            <Button asChild size="lg" variant="outline" className="text-foreground hover:text-primary border-border w-full max-w-md mx-auto">
              <Link to="/courses"><span>View All Courses</span></Link>
            </Button>
          </div>
        </section>
        
        {/* Additional Features Section - static version while mounting */}
        <section className="py-16 bg-muted/30 rounded-xl">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-primary mb-12">
              Why Choose Luvoro Labs?
            </h2>
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
                <div key={index} className="p-6 rounded-xl border border-border">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center py-16 bg-transparent text-foreground rounded-lg relative overflow-hidden">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-6"
            >
              <Rocket className="h-24 w-24 mx-auto text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold mb-4 text-foreground"
            >
              Launch Your Learning Journey
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl max-w-3xl mx-auto mb-8 text-muted-foreground"
            >
              Welcome to Luvoro Labs, your launchpad for mastering AP subjects. Dive into
              interactive lessons, track your progress, and achieve academic excellence.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              {session ? (
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/auth">
                    <span className="flex items-center">
                      Explore Courses <BookOpen className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link to="/courses">
                  <span>View All Courses</span>
                </Link>
              </Button>
            </motion.div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        </section>

        {/* Students Helped Metric */}
        <section className="text-center">
          <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-purpleAccent-foreground">
                <Users className="text-purpleAccent-foreground" /> Site Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSiteViews ? (
                <div className="text-center text-muted-foreground">
                  <div className="h-12 w-24 mx-auto bg-muted rounded animate-pulse" />
                </div>
              ) : (
                <p className="text-6xl font-extrabold text-center text-purpleAccent">
                  {siteViews.toLocaleString()}
                </p>
              )}
              <p className="text-center text-muted-foreground mt-2">Join our growing community of learners!</p>
            </CardContent>
          </Card>
        </section>

        {/* Featured Courses Section */}
        <section className="space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center text-primary"
          >
            Our Courses
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="h-full"
              >
                <Card className="flex flex-col shadow-sm h-full">
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
                      <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button asChild size="lg" variant="outline" className="text-foreground hover:text-primary border-border w-full max-w-md mx-auto">
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
                  className="p-6 rounded-xl border border-border"
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