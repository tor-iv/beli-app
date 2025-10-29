import * as React from "react"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <ChevronLeft className="h-6 w-6 text-secondary hover:text-foreground transition-colors" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 prose prose-sm max-w-none">
          <p className="text-sm text-secondary italic mb-6">Last Updated: October 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">1. Information We Collect</h2>
            <p className="text-base text-foreground leading-relaxed mb-3">
              When you create an account on Beli, we collect information you provide such as your name, email address, phone number, and profile details. We also collect the restaurant ratings, reviews, photos, and dining preferences you share on the platform.
            </p>
            <p className="text-base text-foreground leading-relaxed">
              We automatically collect certain information about your device and how you interact with our app, including your location data (with your permission) to help you discover nearby restaurants.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
            <p className="text-base text-foreground leading-relaxed mb-3">
              We use your information to provide and improve our services, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-foreground">
              <li>Personalizing restaurant recommendations based on your preferences and ratings</li>
              <li>Connecting you with friends and other food enthusiasts</li>
              <li>Sending you notifications about activity on your profile and new restaurants</li>
              <li>Analyzing usage patterns to improve the app experience</li>
              <li>Facilitating restaurant reservations and related features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">3. Information Sharing</h2>
            <p className="text-base text-foreground leading-relaxed mb-3">
              Your restaurant reviews, ratings, and public profile information are visible to other Beli users according to your privacy settings. If you have a public account, anyone can see this information. With a private account, only approved followers can see your content.
            </p>
            <p className="text-base text-foreground leading-relaxed">
              We do not sell your personal information to third parties. We may share data with service providers who help us operate the app, but they are required to protect your information and use it only for the services they provide to us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">4. Data Retention</h2>
            <p className="text-base text-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time by deleting your account in the app settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">5. Your Privacy Controls</h2>
            <p className="text-base text-foreground leading-relaxed mb-3">
              You have control over your privacy on Beli through various settings:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-foreground">
              <li>Toggle between public and private account</li>
              <li>Manage notification preferences</li>
              <li>Block or mute other users</li>
              <li>Control cookie preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">6. Security</h2>
            <p className="text-base text-foreground leading-relaxed">
              We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is ever completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">7. Children&apos;s Privacy</h2>
            <p className="text-base text-foreground leading-relaxed">
              Beli is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">8. Changes to This Policy</h2>
            <p className="text-base text-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy in the app and updating the &quot;Last Updated&quot; date. Your continued use of Beli after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Contact Us</h2>
            <p className="text-base text-foreground leading-relaxed">
              If you have questions about this privacy policy or how we handle your data, please contact us at{" "}
              <a href="mailto:privacy@beli.com" className="text-primary hover:underline">
                privacy@beli.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
