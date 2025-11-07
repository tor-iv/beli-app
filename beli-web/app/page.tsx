'use client';

import { ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResumePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-6 md:py-12">
        {/* Beli Project Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary/90 p-6 text-white shadow-card md:p-8">
          <h2 className="mb-3 text-3xl font-bold">beli Web Clone</h2>
          <p className="mb-4 text-white/90">
            Built to demonstrate my interest in joining the beli team and showcase full-stack development skills.
            Features include Tastemakers (NYC food experts with badges), Group Dinner AI matching, What to Order recommendations,
            social feeds, and leaderboards. Built with React Native + Next.js + TypeScript.
          </p>
          <button
            onClick={() => router.push('/tutorial/group-dinner')}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-primary transition-transform hover:scale-105"
          >
            <span>Try Interactive Demo</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Header - Profile Style */}
        <div className="mb-6 rounded-2xl bg-white p-6 text-center shadow-card md:p-8">
          <h1 className="mb-3 text-4xl font-bold text-gray-900 md:text-5xl">Victor Cox IV</h1>
          <div className="mb-4 text-sm text-gray-600 md:text-base">
            vcox484@gmail.com • (651) 955-9920 • New York, NY
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://www.linkedin.com/in/tor-iv/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/tor-iv"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              GitHub
            </a>
            <a
              href="https://tor-iv.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Portfolio
            </a>
            <a
              href="https://github.com/tor-iv/beli-app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Take Home
            </a>
            <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              beli: tor_iv
            </span>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="mb-6 flex items-start gap-3 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">
            <strong>Note:</strong> Ratings are playful self-assessments inspired by Beli's
            restaurant review system—not actual performance metrics!
          </p>
        </div>

        {/* Experience Section */}
        <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold md:text-3xl">
          Experience
        </h2>

        <div className="hover:shadow-card-hover mb-4 rounded-2xl bg-white p-6 shadow-card transition-shadow">
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="text-lg font-bold text-gray-900 md:text-xl">Bloomberg LP</div>
              <div className="mb-1 text-base font-semibold text-primary">Software Engineer</div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span>New York, NY</span>
                <span>July 2023 - Present</span>
              </div>
            </div>
            <div className="flex-shrink-0 self-start">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-base font-bold text-green-600">
                9.2
              </div>
            </div>
          </div>
          <ul className="space-y-2 text-gray-900">
            <li className="relative pl-4 before:absolute before:left-0 before:font-bold before:text-primary before:content-['•']">
              Architected and led migration of critical data pipeline infrastructure from Apache
              Airflow 1 to 2, to fully managed infrastructure that reduced maintenance, allowed
              horizontal scalability
            </li>
            <li className="relative pl-4 before:absolute before:left-0 before:font-bold before:text-primary before:content-['•']">
              Designed streaming data architecture using Kafka, replacing batch processing systems,
              resulting in faster processing, enhanced fault tolerance, and enabling horizontal
              scaling to 10x load
            </li>
            <li className="relative pl-4 before:absolute before:left-0 before:font-bold before:text-primary before:content-['•']">
              Engineered MCP server integration with GitHub Copilot, building React document
              management interface that fed organizational knowledge into AI coding agents for
              context-aware code generation
            </li>
            <li className="relative pl-4 before:absolute before:left-0 before:font-bold before:text-primary before:content-['•']">
              Led multi-team migration from legacy cloud storage to modern solution, coordinating
              technical plans and implementation across teams
            </li>
          </ul>
        </div>

        <div className="hover:shadow-card-hover mb-4 rounded-2xl bg-white p-6 shadow-card transition-shadow">
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="text-lg font-bold text-gray-900 md:text-xl">Capital One</div>
              <div className="mb-1 text-base font-semibold text-primary">TIP Fullstack Intern</div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span>McLean, VA</span>
                <span>Summer 2022</span>
              </div>
            </div>
            <div className="flex-shrink-0 self-start">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-base font-bold text-lime-600">
                8.5
              </div>
            </div>
          </div>
          <ul className="space-y-2 text-gray-900">
            <li className="relative pl-4 before:absolute before:left-0 before:font-bold before:text-primary before:content-['•']">
              Engineered a full-stack database recommendation system using ReactJS, AWS Lambda, S3,
              and Python, implementing RESTful APIs and serverless architecture that reduced team
              queries by 60%
            </li>
            <li className="relative pl-4 before:absolute before:left-0 before:font-bold before:text-primary before:content-['•']">
              Built and deployed a Slack chatbot integration using Node.js and the Slack API for
              query processing
            </li>
          </ul>
        </div>

        <div className="hover:shadow-card-hover mb-4 rounded-2xl bg-white p-6 shadow-card transition-shadow">
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="text-lg font-bold text-gray-900 md:text-xl">
                HCI Lab, University of Notre Dame
              </div>
              <div className="mb-1 text-base font-semibold text-primary">
                Undergraduate Researcher
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span>Notre Dame, IN</span>
                <span>Fall 2021 - Spring 2023</span>
              </div>
            </div>
            <div className="flex-shrink-0 self-start">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-base font-bold text-lime-600">
                8.0
              </div>
            </div>
          </div>
          <ul className="space-y-2 text-gray-900">
            <li className="relative pl-4 before:absolute before:left-0 before:font-bold before:text-primary before:content-['•']">
              Developed system (Flask, PostgreSQL, Java) to collect gig worker behavioral data,
              analyzed Uber algorithm bias using pandas, and designed a UX-research-based prototype
              to help gig workers with task planning
            </li>
            <li className="relative pl-4 before:absolute before:left-0 before:font-bold before:text-primary before:content-['•']">
              Co-authored paper "A Bottom-Up End-User Intelligent Assistant Approach to Empower Gig
              Workers against AI Inequality" published at CHIWORK '22
            </li>
          </ul>
        </div>

        {/* Education */}
        <h2 className="mb-4 mt-8 border-b-2 border-primary pb-2 text-2xl font-bold md:text-3xl">
          Education
        </h2>

        <div className="mb-4 rounded-2xl bg-white p-6 shadow-card">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <div>
              <div className="text-lg font-bold text-gray-900 md:text-xl">
                University of Notre Dame
              </div>
              <div className="text-base text-gray-600">Bachelor of Science in Computer Science</div>
              <div className="text-base text-gray-600">Minor: Studio Arts (Ceramics)</div>
              <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
                <span>Notre Dame, IN</span>
                <span>Spring 2023</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                GPA 3.8
              </span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <h2 className="mb-4 mt-8 border-b-2 border-primary pb-2 text-2xl font-bold md:text-3xl">
          Technical Skills
        </h2>

        {/* Languages */}
        <h3 className="mb-3 mt-4 text-sm font-semibold uppercase tracking-wide text-primary">
          Languages
        </h3>
        <div className="mb-4 grid grid-cols-3 gap-3 md:grid-cols-6">
          <SkillBadge name="Python" rating="9.5" color="green" />
          <SkillBadge name="JavaScript" rating="9.0" color="green" />
          <SkillBadge name="TypeScript" rating="8.5" color="green" />
          <SkillBadge name="Node.js" rating="8.0" color="lime" />
          <SkillBadge name="C/C++" rating="8.5" color="green" />
          <SkillBadge name="Java" rating="8.0" color="lime" />
        </div>

        {/* Frameworks & Libraries */}
        <h3 className="mb-3 mt-4 text-sm font-semibold uppercase tracking-wide text-primary">
          Frameworks & Libraries
        </h3>
        <div className="mb-4 grid grid-cols-3 gap-3 md:grid-cols-6">
          <SkillBadge name="React" rating="8.5" color="green" />
          <SkillBadge name="Next.js" rating="8.5" color="green" />
          <SkillBadge name="Flask" rating="8.0" color="lime" />
          <SkillBadge name="pandas" rating="8.0" color="lime" />
        </div>

        {/* Data & Streaming */}
        <h3 className="mb-3 mt-4 text-sm font-semibold uppercase tracking-wide text-primary">
          Data & Streaming
        </h3>
        <div className="mb-4 grid grid-cols-3 gap-3 md:grid-cols-6">
          <SkillBadge name="Airflow" rating="9.0" color="green" />
          <SkillBadge name="Kafka" rating="9.0" color="green" />
          <SkillBadge name="PostgreSQL" rating="8.0" color="lime" />
          <SkillBadge name="MongoDB" rating="7.5" color="lime" />
        </div>

        {/* Cloud & Infrastructure */}
        <h3 className="mb-3 mt-4 text-sm font-semibold uppercase tracking-wide text-primary">
          Cloud & Infrastructure
        </h3>
        <div className="mb-4 grid grid-cols-3 gap-3 md:grid-cols-6">
          <SkillBadge name="AWS" rating="8.0" color="lime" />
          <SkillBadge name="Lambda" rating="8.0" color="lime" />
          <SkillBadge name="S3" rating="8.0" color="lime" />
          <SkillBadge name="Docker" rating="8.5" color="green" />
          <SkillBadge name="Firebase" rating="8.0" color="lime" />
          <SkillBadge name="Vercel" rating="8.0" color="lime" />
          <SkillBadge name="Linux" rating="9.5" color="green" />
        </div>

        {/* APIs & Integration */}
        <h3 className="mb-3 mt-4 text-sm font-semibold uppercase tracking-wide text-primary">
          APIs & Integration
        </h3>
        <div className="mb-4 grid grid-cols-3 gap-3 md:grid-cols-6">
          <SkillBadge name="Supabase" rating="8.0" color="lime" />
          <SkillBadge name="Cloud Vision" rating="8.0" color="lime" />
          <SkillBadge name="PayPal API" rating="8.0" color="lime" />
          <SkillBadge name="Stripe" rating="7.5" color="lime" />
        </div>

        {/* Projects */}
        <h2 className="mb-4 mt-8 border-b-2 border-primary pb-2 text-2xl font-bold md:text-3xl">
          Featured Projects
        </h2>

        <div className="hover:shadow-card-hover mb-4 rounded-2xl bg-white p-6 shadow-card transition-shadow">
          <div className="mb-3 flex items-start justify-between">
            <div className="text-lg font-bold text-gray-900 md:text-xl">Hanzi a day</div>
            <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              95% Match
            </span>
          </div>
          <p className="text-gray-900">
            Vercel-deployed Next.js application featuring daily Hanzi character learning with spaced
            repetition methodology
          </p>
        </div>

        <div className="hover:shadow-card-hover mb-4 rounded-2xl bg-white p-6 shadow-card transition-shadow">
          <div className="mb-3 flex items-start justify-between">
            <div className="text-lg font-bold text-gray-900 md:text-xl">
              Keeper's Heart AR Platform
            </div>
            <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              98% Match
            </span>
          </div>
          <p className="text-gray-900">
            Built full-stack AR marketing app for scanning competitor whiskey bottles and automated
            PayPal rebates. Integrated Google Cloud Vision API for real-time detection across 15+
            brands. Implemented 6-layer fraud prevention (cryptographic hashing, rate limiting,
            receipt validation). Stack: Next.js, TypeScript, Supabase, PayPal API
          </p>
        </div>

        <div className="hover:shadow-card-hover mb-4 rounded-2xl bg-white p-6 shadow-card transition-shadow">
          <div className="mb-3 flex items-start justify-between">
            <div className="text-lg font-bold text-gray-900 md:text-xl">tors-studio</div>
            <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              92% Match
            </span>
          </div>
          <p className="text-gray-900">
            (In Progress) Firebase-deployed React marketplace with Stripe payment integration for
            pottery auctions and creative idea collection
          </p>
        </div>

        {/* Hobbies */}
        <h2 className="mb-4 mt-8 border-b-2 border-primary pb-2 text-2xl font-bold md:text-3xl">
          Beyond Code
        </h2>

        <div className="mb-4 rounded-2xl bg-white p-6 shadow-card">
          <p className="text-gray-900">
            Ceramics and pottery • Baking/Cooking • Fantasy/Sci-fi • Chinese (Language) (Very Bad at
            it) • Yo-yo • Travel • Eating • Rec Sports • Urban Planning • Climbing • Lifting
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border-l-4 border-primary bg-white p-4 shadow-card">
          <p className="text-sm text-gray-600">
            * Ratings are playful self-assessments inspired by restaurant reviews, not actual
            performance metrics. They reflect enthusiasm and comfort level rather than objective
            skill measurements.
          </p>
        </div>
      </div>
    </div>
  );
}

// Skill Badge Component
const SkillBadge = ({
  name,
  rating,
  color,
}: {
  name: string;
  rating: string;
  color: 'green' | 'lime';
}) => {
  const ratingColor = color === 'green' ? 'text-green-600' : 'text-lime-600';

  return (
    <div className="hover:shadow-card-hover flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-card transition-shadow">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-sm font-bold ${ratingColor} mb-2`}
      >
        {rating}
      </div>
      <div className="text-xs font-semibold text-gray-900">{name}</div>
    </div>
  );
};
