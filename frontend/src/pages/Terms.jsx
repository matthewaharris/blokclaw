import { useTheme } from '../context/ThemeContext'

export default function Terms() {
  const { isDark } = useTheme()

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Terms of Service
      </h1>
      <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        Last updated: February 2026
      </p>

      <div className={`rounded-lg shadow-sm p-8 space-y-6 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-700'}`}>
        <section>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using BlokClaw ("the Service"), including submitting, browsing, or
            programmatically discovering APIs through our registry, you agree to be bound by these
            Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            2. Description of Service
          </h2>
          <p>
            BlokClaw is an open-source API registry that allows providers to register APIs and
            AI agents to discover them programmatically. BlokClaw does not host, operate, or
            control any of the APIs listed in the registry.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            3. Use at Your Own Risk
          </h2>
          <p>
            APIs listed on BlokClaw are submitted by third parties. BlokClaw does not verify
            the accuracy, safety, reliability, or legality of listed APIs unless explicitly
            marked as "Verified." You use any API discovered through BlokClaw entirely at your
            own risk. BlokClaw is not responsible for any damages, data loss, security incidents,
            or other harm resulting from the use of listed APIs.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            4. Prohibited Content
          </h2>
          <p className="mb-3">
            You may not submit APIs or content to BlokClaw that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Points to malicious, phishing, or malware-distributing endpoints</li>
            <li>Targets internal/private networks (localhost, private IPs)</li>
            <li>Facilitates illegal activities or violates applicable laws</li>
            <li>Contains spam, misleading descriptions, or fraudulent information</li>
            <li>Infringes on intellectual property rights of others</li>
            <li>Promotes harassment, hate speech, or violence</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            5. Right to Remove
          </h2>
          <p>
            BlokClaw reserves the right to remove any API listing, provider account, or agent
            registration at any time and for any reason, including but not limited to violations
            of these Terms, reports from other users, or at our sole discretion. We may also
            restrict or terminate access for repeat violators.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            6. Reporting
          </h2>
          <p>
            If you believe an API listing violates these Terms or poses a security risk, you
            may report it using the report feature on the API detail page. We will review
            reports and take appropriate action.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            7. Disclaimer of Warranties
          </h2>
          <p>
            The Service is provided "as is" and "as available" without warranties of any kind,
            either express or implied. BlokClaw does not warrant that the Service will be
            uninterrupted, error-free, or free of harmful components.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            8. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, BlokClaw and its contributors shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages
            arising from your use of the Service or any APIs discovered through it.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            9. Changes to Terms
          </h2>
          <p>
            We may update these Terms at any time. Continued use of the Service after changes
            constitutes acceptance of the updated Terms. We encourage you to review this page
            periodically.
          </p>
        </section>
      </div>
    </div>
  )
}
