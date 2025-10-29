'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function ResumePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-4xl">
        {/* Header - Profile Style */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 shadow-card text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
            Victor Cox IV
          </h1>
          <div className="text-sm md:text-base text-gray-600 mb-4">
            vcox484@gmail.com • (651) 955-9920 • New York, NY
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="https://www.linkedin.com/in/tor-iv/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/tor-iv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://tor-iv.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              Portfolio
            </a>
            <a
              href="https://github.com/tor-iv/beli-app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              Take Home
            </a>
            <span className="text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full">
              beli: tor_iv
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/tutorial/group-dinner')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg group"
          >
            <span>Start Interactive Demo</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Experience Section */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4 pb-2 border-b-2 border-primary">
          Your Professional Journey
        </h2>

        <div className="bg-white rounded-2xl p-6 mb-4 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="text-lg md:text-xl font-bold text-gray-900">Bloomberg LP</div>
              <div className="text-base font-semibold text-primary mb-1">Software Engineer</div>
              <div className="text-sm text-gray-600 flex gap-3 flex-wrap">
                <span>New York, NY</span>
                <span>July 2023 - Present</span>
              </div>
            </div>
            <div className="flex-shrink-0 self-start">
              <div className="w-11 h-11 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-base font-bold text-green-600">
                9.2
              </div>
            </div>
          </div>
          <ul className="space-y-2 text-gray-900">
            <li className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
              Architected and led migration of critical data pipeline infrastructure from Apache Airflow 1 to 2, to fully managed infrastructure that reduced maintenance, allowed horizontal scalability
            </li>
            <li className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
              Designed streaming data architecture using Kafka, replacing batch processing systems, resulting in faster processing, enhanced fault tolerance, and enabling horizontal scaling to 10x load
            </li>
            <li className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
              Engineered MCP server integration with GitHub Copilot, building React document management interface that fed organizational knowledge into AI coding agents for context-aware code generation
            </li>
            <li className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
              Led multi-team migration from legacy cloud storage to modern solution, coordinating technical plans and implementation across teams
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-4 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="text-lg md:text-xl font-bold text-gray-900">Capital One</div>
              <div className="text-base font-semibold text-primary mb-1">TIP Fullstack Intern</div>
              <div className="text-sm text-gray-600 flex gap-3 flex-wrap">
                <span>McLean, VA</span>
                <span>Summer 2022</span>
              </div>
            </div>
            <div className="flex-shrink-0 self-start">
              <div className="w-11 h-11 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-base font-bold text-lime-600">
                8.5
              </div>
            </div>
          </div>
          <ul className="space-y-2 text-gray-900">
            <li className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
              Engineered a full-stack database recommendation system using ReactJS, AWS Lambda, S3, and Python, implementing RESTful APIs and serverless architecture that reduced team queries by 60%
            </li>
            <li className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
              Built and deployed a Slack chatbot integration using Node.js and the Slack API for query processing
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-4 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="text-lg md:text-xl font-bold text-gray-900">HCI Lab, University of Notre Dame</div>
              <div className="text-base font-semibold text-primary mb-1">Undergraduate Researcher</div>
              <div className="text-sm text-gray-600 flex gap-3 flex-wrap">
                <span>Notre Dame, IN</span>
                <span>Fall 2021 - Spring 2023</span>
              </div>
            </div>
            <div className="flex-shrink-0 self-start">
              <div className="w-11 h-11 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-base font-bold text-lime-600">
                8.0
              </div>
            </div>
          </div>
          <ul className="space-y-2 text-gray-900">
            <li className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
              Developed system (Flask, PostgreSQL, Java) to collect gig worker behavioral data, analyzed Uber algorithm bias using pandas, and designed a UX-research-based prototype to help gig workers with task planning
            </li>
            <li className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
              Co-authored paper "A Bottom-Up End-User Intelligent Assistant Approach to Empower Gig Workers against AI Inequality" published at CHIWORK '22
            </li>
          </ul>
        </div>

        {/* Education */}
        <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 pb-2 border-b-2 border-primary">
          Education
        </h2>

        <div className="bg-white rounded-2xl p-6 mb-4 shadow-card">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="text-lg md:text-xl font-bold text-gray-900">University of Notre Dame</div>
              <div className="text-base text-gray-600">Bachelor of Science in Computer Science</div>
              <div className="text-base text-gray-600">Minor: Studio Arts (Ceramics)</div>
              <div className="text-sm text-gray-600 flex gap-3 flex-wrap mt-1">
                <span>Notre Dame, IN</span>
                <span>Spring 2023</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                GPA 3.8
              </span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 pb-2 border-b-2 border-primary">
          Technical Skills
        </h2>

        {/* Languages */}
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3 mt-4">
          Languages
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          <SkillBadge name="Python" rating="9.5" color="green" />
          <SkillBadge name="JavaScript" rating="9.0" color="green" />
          <SkillBadge name="TypeScript" rating="8.5" color="green" />
          <SkillBadge name="Node.js" rating="8.0" color="lime" />
          <SkillBadge name="C/C++" rating="8.5" color="green" />
          <SkillBadge name="Java" rating="8.0" color="lime" />
        </div>

        {/* Frameworks & Libraries */}
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3 mt-4">
          Frameworks & Libraries
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          <SkillBadge name="React" rating="8.5" color="green" />
          <SkillBadge name="Next.js" rating="8.5" color="green" />
          <SkillBadge name="Flask" rating="8.0" color="lime" />
          <SkillBadge name="pandas" rating="8.0" color="lime" />
        </div>

        {/* Data & Streaming */}
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3 mt-4">
          Data & Streaming
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          <SkillBadge name="Airflow" rating="9.0" color="green" />
          <SkillBadge name="Kafka" rating="9.0" color="green" />
          <SkillBadge name="PostgreSQL" rating="8.0" color="lime" />
          <SkillBadge name="MongoDB" rating="7.5" color="lime" />
        </div>

        {/* Cloud & Infrastructure */}
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3 mt-4">
          Cloud & Infrastructure
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          <SkillBadge name="AWS" rating="8.0" color="lime" />
          <SkillBadge name="Lambda" rating="8.0" color="lime" />
          <SkillBadge name="S3" rating="8.0" color="lime" />
          <SkillBadge name="Docker" rating="8.5" color="green" />
          <SkillBadge name="Firebase" rating="8.0" color="lime" />
          <SkillBadge name="Vercel" rating="8.0" color="lime" />
          <SkillBadge name="Linux" rating="9.5" color="green" />
        </div>

        {/* APIs & Integration */}
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3 mt-4">
          APIs & Integration
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          <SkillBadge name="Supabase" rating="8.0" color="lime" />
          <SkillBadge name="Cloud Vision" rating="8.0" color="lime" />
          <SkillBadge name="PayPal API" rating="8.0" color="lime" />
          <SkillBadge name="Stripe" rating="7.5" color="lime" />
        </div>

        {/* Projects */}
        <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 pb-2 border-b-2 border-primary">
          Featured Projects
        </h2>

        <div className="bg-white rounded-2xl p-6 mb-4 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="text-lg md:text-xl font-bold text-gray-900">Hanzi a day</div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
              95% Match
            </span>
          </div>
          <p className="text-gray-900">
            Vercel-deployed Next.js application featuring daily Hanzi character learning with spaced repetition methodology
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-4 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="text-lg md:text-xl font-bold text-gray-900">Keeper's Heart AR Platform</div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
              98% Match
            </span>
          </div>
          <p className="text-gray-900">
            Built full-stack AR marketing app for scanning competitor whiskey bottles and automated PayPal rebates. Integrated Google Cloud Vision API for real-time detection across 15+ brands. Implemented 6-layer fraud prevention (cryptographic hashing, rate limiting, receipt validation). Stack: Next.js, TypeScript, Supabase, PayPal API
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-4 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="text-lg md:text-xl font-bold text-gray-900">tors-studio</div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
              92% Match
            </span>
          </div>
          <p className="text-gray-900">
            (In Progress) Firebase-deployed React marketplace with Stripe payment integration for pottery auctions and creative idea collection
          </p>
        </div>

        {/* Hobbies */}
        <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 pb-2 border-b-2 border-primary">
          Beyond Code
        </h2>

        <div className="bg-white rounded-2xl p-6 mb-4 shadow-card">
          <p className="text-gray-900">
            Ceramics and pottery • Baking/Cooking • Fantasy/Sci-fi • Chinese (Language) (Very Bad at it) • Yo-yo • Travel • Eating • Rec Sports • Urban Planning • Climbing • Lifting
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-white border-l-4 border-primary rounded-lg p-4 shadow-card">
          <p className="text-sm text-gray-600">
            * Ratings are playful self-assessments inspired by restaurant reviews, not actual performance metrics. They reflect enthusiasm and comfort level rather than objective skill measurements.
          </p>
        </div>
      </div>
    </div>
  )
}

// Skill Badge Component
function SkillBadge({ name, rating, color }: { name: string; rating: string; color: 'green' | 'lime' }) {
  const ratingColor = color === 'green' ? 'text-green-600' : 'text-lime-600'

  return (
    <div className="bg-white rounded-xl p-3 shadow-card hover:shadow-card-hover transition-shadow flex flex-col items-center text-center">
      <div className={`w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-sm font-bold ${ratingColor} mb-2`}>
        {rating}
      </div>
      <div className="text-xs font-semibold text-gray-900">{name}</div>
    </div>
  )
}
