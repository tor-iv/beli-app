import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <ChevronLeft className="h-6 w-6 text-secondary transition-colors hover:text-foreground" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="prose prose-sm max-w-none rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="mb-6 text-sm italic text-secondary">Last Updated: October 2025</p>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">1. Information We Collect</h2>
            <p className="mb-3 text-base leading-relaxed text-foreground">
              When you create an account on Beli, we collect information you provide such as your
              name, email address, phone number, and profile details. We also collect the restaurant
              ratings, reviews, photos, and dining preferences you share on the platform.
            </p>
            <p className="text-base leading-relaxed text-foreground">
              We automatically collect certain information about your device and how you interact
              with our app, including your location data (with your permission) to help you discover
              nearby restaurants.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">
              2. How We Use Your Information
            </h2>
            <p className="mb-3 text-base leading-relaxed text-foreground">
              We use your information to provide and improve our services, including:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-base text-foreground">
              <li>
                Personalizing restaurant recommendations based on your preferences and ratings
              </li>
              <li>Connecting you with friends and other food enthusiasts</li>
              <li>Sending you notifications about activity on your profile and new restaurants</li>
              <li>Analyzing usage patterns to improve the app experience</li>
              <li>Facilitating restaurant reservations and related features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">3. Information Sharing</h2>
            <p className="mb-3 text-base leading-relaxed text-foreground">
              Your restaurant reviews, ratings, and public profile information are visible to other
              Beli users according to your privacy settings. If you have a public account, anyone
              can see this information. With a private account, only approved followers can see your
              content.
            </p>
            <p className="text-base leading-relaxed text-foreground">
              We do not sell your personal information to third parties. We may share data with
              service providers who help us operate the app, but they are required to protect your
              information and use it only for the services they provide to us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">4. Data Retention</h2>
            <p className="text-base leading-relaxed text-foreground">
              We retain your information for as long as your account is active or as needed to
              provide you services. You can request deletion of your data at any time by deleting
              your account in the app settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">5. Your Privacy Controls</h2>
            <p className="mb-3 text-base leading-relaxed text-foreground">
              You have control over your privacy on Beli through various settings:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-base text-foreground">
              <li>Toggle between public and private account</li>
              <li>Manage notification preferences</li>
              <li>Block or mute other users</li>
              <li>Control cookie preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">6. Security</h2>
            <p className="text-base leading-relaxed text-foreground">
              We implement reasonable security measures to protect your information from
              unauthorized access, alteration, disclosure, or destruction. However, no internet
              transmission is ever completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">7. Children&apos;s Privacy</h2>
            <p className="text-base leading-relaxed text-foreground">
              Beli is not directed to children under the age of 13. We do not knowingly collect
              personal information from children under 13. If you believe we have collected
              information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-foreground">8. Changes to This Policy</h2>
            <p className="text-base leading-relaxed text-foreground">
              We may update this privacy policy from time to time. We will notify you of any
              significant changes by posting the new policy in the app and updating the &quot;Last
              Updated&quot; date. Your continued use of Beli after changes are posted constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-foreground">9. Contact Us</h2>
            <p className="text-base leading-relaxed text-foreground">
              If you have questions about this privacy policy or how we handle your data, please
              contact us at{' '}
              <a href="mailto:privacy@beli.com" className="text-primary hover:underline">
                privacy@beli.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
