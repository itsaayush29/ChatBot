import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Code2, Brain, BookOpen, Zap, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Code2,
      title: 'Full Stack Development',
      description: 'Master MERN stack, JavaScript, TypeScript, and modern web development',
    },
    {
      icon: Brain,
      title: 'ML & Deep Learning',
      description: 'Learn Machine Learning, Deep Learning, and Data Science concepts',
    },
    {
      icon: BookOpen,
      title: 'Core CS Concepts',
      description: 'DS, Algorithms, OS, DBMS, Networks, and Compiler Design',
    },
    {
      icon: Zap,
      title: 'Smart Explanations',
      description: 'Get step-by-step solutions with code examples and conceptual clarity',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl mb-6 shadow-elevated">
            <Code2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            EngiBot AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Your AI-Powered Engineering Study Companion
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Master university subjects and top engineering domains with an AI tutor specialized in Full Stack
            Development, Machine Learning, Data Science, and core Computer Science fundamentals.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8">
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-elevated transition-all hover:-translate-y-1 border-2">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 bg-gradient-accent rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Topics Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Topics Covered</h2>
          <Card className="p-8 shadow-elevated">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-3 text-primary">Development</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• MERN Stack (MongoDB, Express, React, Node.js)</li>
                  <li>• JavaScript & TypeScript</li>
                  <li>• RESTful APIs & GraphQL</li>
                  <li>• Modern Web Frameworks</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-primary">AI & Data Science</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Machine Learning Algorithms</li>
                  <li>• Deep Learning & Neural Networks</li>
                  <li>• Data Science with Python</li>
                  <li>• Statistical Analysis</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-primary">Computer Science</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Data Structures & Algorithms</li>
                  <li>• Operating Systems</li>
                  <li>• Database Management (DBMS)</li>
                  <li>• Computer Networks</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-primary">Advanced Topics</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Compiler Design</li>
                  <li>• System Design</li>
                  <li>• Software Engineering</li>
                  <li>• Code Optimization</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="p-12 max-w-2xl mx-auto bg-gradient-primary shadow-elevated">
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to Start Learning?</h2>
            <p className="text-lg text-white/90 mb-8">
              Join EngiBot AI today and get personalized help with your engineering studies.
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate('/auth')} className="text-lg px-8">
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
