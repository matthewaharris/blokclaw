import { useTheme } from '../context/ThemeContext'

export default function DMCA() {
  const { isDark } = useTheme()

  const headingClass = isDark ? 'text-white' : 'text-gray-900'
  const cardClass = isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-700'

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className={`text-3xl font-bold mb-2 ${headingClass}`}>
        DMCA & Takedown Policy
      </h1>
      <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        Last updated: February 2026
      </p>

      <div className={`rounded-lg shadow-sm p-8 space-y-6 ${cardClass}`}>
        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            Overview
          </h2>
          <p>
            BlokClaw respects the intellectual property rights of others. If you believe that
            content listed on BlokClaw infringes your copyright or other intellectual property
            rights, or if you believe a listing impersonates your service, you may submit a
            takedown request following the process below.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            How to Submit a Takedown Request
          </h2>
          <p className="mb-3">
            Send your takedown request to <strong>dmca@blokclaw.com</strong> with the following
            information:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Identification of the copyrighted work</strong> or intellectual property
              you claim has been infringed, or the service being impersonated.
            </li>
            <li>
              <strong>Identification of the infringing listing</strong> on BlokClaw, including
              the API name, slug, or URL (e.g., blokclaw.com/api/example-api).
            </li>
            <li>
              <strong>Your contact information:</strong> name, email address, and (if applicable)
              the organization you represent.
            </li>
            <li>
              <strong>A statement</strong> that you have a good faith belief that the use of the
              material is not authorized by the rights owner, its agent, or the law.
            </li>
            <li>
              <strong>A statement</strong> that the information in your notice is accurate, and
              under penalty of perjury, that you are authorized to act on behalf of the rights
              owner.
            </li>
            <li>
              <strong>Your physical or electronic signature.</strong>
            </li>
          </ol>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            What Happens Next
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We will review your request and may remove or disable access to the allegedly
              infringing listing.</li>
            <li>We will attempt to notify the provider who submitted the listing.</li>
            <li>If the provider submits a valid counter-notification, we may restore the listing
              after 10 business days unless you notify us of legal action.</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            Impersonation & Fraud Reports
          </h2>
          <p>
            If someone has registered an API listing that impersonates your service (e.g.,
            using your brand name and pointing to a fraudulent endpoint), you do not need to
            follow the full DMCA process. Email <strong>dmca@blokclaw.com</strong> with
            evidence of ownership (e.g., proof of domain ownership) and we will investigate
            and take action promptly.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            Repeat Infringers
          </h2>
          <p>
            BlokClaw will terminate the accounts of providers who are repeat infringers in
            appropriate circumstances.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-bold mb-3 ${headingClass}`}>
            Contact
          </h2>
          <p>
            DMCA Agent: <strong>dmca@blokclaw.com</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
