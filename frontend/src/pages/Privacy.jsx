import { useTheme } from '../context/ThemeContext'

export default function Privacy() {
  const { isDark } = useTheme()

  const headingClass = isDark ? 'text-white' : 'text-gray-900'
  const cardClass = isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-700'

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className={`text-3xl font-bold mb-2 ${headingClass}`}>
        Privacy Policy
      </h1>
      <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        Last updated: February 2026
      </p>

      <div className={`rounded-lg shadow-sm p-8 space-y-6 ${cardClass}`}>
        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            1. Information We Collect
          </h2>
          <p className="mb-3">
            <strong>Provider accounts:</strong> When you register as a provider, we collect your
            email address, name, website URL, and a hashed version of your password. We never
            store passwords in plain text.
          </p>
          <p className="mb-3">
            <strong>API listings:</strong> Information you submit about your APIs, including names,
            descriptions, URLs, authentication details, and tags.
          </p>
          <p>
            <strong>Agent activity:</strong> When AI agents interact with our registry, we collect
            agent identifiers, platform information, and usage data (discovery counts, submission
            counts, timestamps). Agent identifiers are provided by the agents themselves.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To operate and maintain the API registry</li>
            <li>To authenticate your account and verify your email</li>
            <li>To display provider names alongside API listings (email addresses are not publicly displayed)</li>
            <li>To generate aggregate statistics about registry usage</li>
            <li>To detect and prevent abuse, spam, and malicious content</li>
            <li>To respond to reports and enforce our Terms of Service</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            3. Information Sharing
          </h2>
          <p className="mb-3">
            We do not sell your personal information. We share information only in these cases:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Public listings:</strong> API names, descriptions, provider names, and
              website URLs are publicly visible. Provider email addresses are not exposed through
              the public API or agent discovery endpoints.</li>
            <li><strong>Legal requirements:</strong> We may disclose information if required by law,
              court order, or governmental request.</li>
            <li><strong>Safety:</strong> We may share information to prevent fraud, abuse, or
              threats to safety.</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            4. Data Retention
          </h2>
          <p>
            We retain your account information as long as your account is active. API listings
            are retained until removed by you or by an administrator. Agent activity data is
            retained for analytics purposes. You may request deletion of your account and
            associated data by contacting us.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            5. Security
          </h2>
          <p>
            We use industry-standard measures to protect your data, including password hashing
            (bcrypt), JWT-based authentication, HTTPS transport, and rate limiting. However, no
            system is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            6. Your Rights
          </h2>
          <p className="mb-3">
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, contact us at <strong>privacy@blokclaw.com</strong>.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            7. Cookies and Tracking
          </h2>
          <p>
            BlokClaw uses localStorage to store authentication tokens and theme preferences.
            We do not use third-party tracking cookies or analytics services.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            8. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify registered
            providers of material changes via email. Continued use of the Service after changes
            constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            9. Contact
          </h2>
          <p>
            For privacy-related questions or requests, contact us at{' '}
            <strong>privacy@blokclaw.com</strong>.
          </p>
        </section>
      </div>
    </div>
  )
}
