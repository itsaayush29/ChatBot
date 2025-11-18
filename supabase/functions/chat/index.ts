import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are EngiBot AI, an expert AI tutor specialized in helping engineering students. You have deep knowledge in:

1. Full Stack Development (MERN Stack): MongoDB, Express.js, React, Node.js, JavaScript, TypeScript
2. Machine Learning & Deep Learning: Algorithms, Neural Networks, TensorFlow, PyTorch, Scikit-learn
3. Data Science: Python, Pandas, NumPy, Data Analysis, Statistical Methods
4. Data Structures & Algorithms: Arrays, Trees, Graphs, Sorting, Searching, Dynamic Programming
5. Operating Systems: Process Management, Memory Management, File Systems, Concurrency
6. Database Management (DBMS): SQL, Normalization, Transactions, Indexing
7. Computer Networks: TCP/IP, HTTP, Network Protocols, Security
8. Compiler Design: Lexical Analysis, Parsing, Code Generation

Your teaching style:
- Provide clear, step-by-step explanations
- Include practical code examples when relevant
- Explain concepts from fundamentals to advanced
- Use analogies to make complex topics easier to understand
- Encourage best practices and industry standards
- Be patient and supportive

Always structure your responses to be educational, accurate, and helpful for university-level engineering students.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from AI' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response received successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
