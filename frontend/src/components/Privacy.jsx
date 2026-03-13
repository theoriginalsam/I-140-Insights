import { T } from "./shared";

const S = {
  wrap:  { maxWidth: 800, margin: "0 auto", padding: "40px 24px", color: T.text, fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.7 },
  h1:    { fontSize: 28, fontWeight: 700, marginBottom: 8, color: T.text },
  date:  { color: T.textMuted, fontSize: 13, marginBottom: 40 },
  h2:    { fontSize: 18, fontWeight: 600, marginTop: 36, marginBottom: 10, color: T.text },
  p:     { marginBottom: 14, color: T.textSub },
  ul:    { paddingLeft: 20, marginBottom: 14, color: T.textSub },
  li:    { marginBottom: 6 },
};

export default function Privacy() {
  return (
    <div style={S.wrap}>
      <h1 style={S.h1}>Privacy Policy</h1>
      <p style={S.date}>Effective Date: March 13, 2026 · Last Updated: March 13, 2026</p>

      <h2 style={S.h2}>1. Overview</h2>
      <p style={S.p}>
        I-140 Tracker ("we", "our", or "the site") is a free, community-driven tool that helps
        I-140 petition applicants (National Interest Waiver and EB-1A categories) track case
        processing times and trends. We are committed to protecting your privacy and handling
        your data transparently.
      </p>

      <h2 style={S.h2}>2. Data We Collect</h2>
      <p style={S.p}>We collect two categories of data:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Public case status data</strong> — Receipt numbers, case statuses, and processing dates sourced from the USCIS Case Status API (publicly available information).</li>
        <li style={S.li}><strong>Voluntarily submitted profile data</strong> — If you choose to submit your profile (degree, field of study, employer type, RFE details), we collect only the information you provide. We do <strong>not</strong> collect your name, contact information, or any directly identifying information.</li>
      </ul>
      <p style={S.p}>We do <strong>not</strong> collect geolocation data, financial information, medical information, or device identifiers.</p>

      <h2 style={S.h2}>3. How We Use Your Data</h2>
      <ul style={S.ul}>
        <li style={S.li}>To display aggregated processing time trends and approval rate statistics.</li>
        <li style={S.li}>To allow applicants to benchmark their profile against anonymized community data.</li>
        <li style={S.li}>To detect processing waves and alert the community to approval spikes.</li>
      </ul>
      <p style={S.p}>We do <strong>not</strong> use your data for advertising, profiling, or any commercial purpose.</p>

      <h2 style={S.h2}>4. Data Sharing</h2>
      <p style={S.p}>
        We do <strong>not</strong> sell, rent, or share your data with any third parties, marketers, or partners
        for any reason. Aggregated, anonymized statistics (e.g., "42% approval rate for NIW cases
        filed in 2023") may be displayed publicly on this site, but these contain no individually
        identifiable information.
      </p>
      <p style={S.p}>
        Third-party use or disclosure of user information — including de-identified, anonymized, or
        pseudonymized data — is prohibited without active consent from the user.
      </p>

      <h2 style={S.h2}>5. Data Retention</h2>
      <p style={S.p}>
        Public case status data is retained as long as the site operates, as it constitutes public record.
        Voluntarily submitted profile data is retained until you request deletion or the site ceases operation.
        If your account or submission is dormant for more than 2 years, we may delete it.
      </p>

      <h2 style={S.h2}>6. Your Rights & Data Deletion</h2>
      <p style={S.p}>
        You have the right to request permanent deletion of any data you have submitted.
        To request deletion, email <strong>privacy@i140tracker.com</strong> with the subject line
        "Data Deletion Request." We will process your request within <strong>30 days</strong>.
      </p>
      <p style={S.p}>
        You may also close your account at any time by emailing the same address. Upon closure,
        all voluntarily submitted profile data associated with your submission will be permanently deleted.
      </p>

      <h2 style={S.h2}>7. Data Breach Notification</h2>
      <p style={S.p}>
        In the event of a data breach that may affect your submitted data, we will notify affected
        users via email (if provided) within 72 hours of discovery and provide instructions for
        any actions you may take.
      </p>

      <h2 style={S.h2}>8. Transfer of Ownership</h2>
      <p style={S.p}>
        If this site is transferred to a new owner, we will notify users and ensure the new
        owner's policies align with ours. Users will be provided the option to request deletion
        of their data prior to any ownership transfer.
      </p>

      <h2 style={S.h2}>9. California Consumer Privacy Act (CCPA)</h2>
      <p style={S.p}>
        California residents have the right to know what personal information is collected,
        request deletion of their data, and opt out of sale of personal information.
        We do not sell personal information. To exercise your rights, contact us at
        <strong> privacy@i140tracker.com</strong>.
      </p>

      <h2 style={S.h2}>10. Policy Changes</h2>
      <p style={S.p}>
        We will notify users of material changes to this Privacy Policy by posting a notice on
        the site and updating the effective date above. For significant changes, we will seek
        active consent and provide a plain-language summary of what changed.
      </p>

      <h2 style={S.h2}>11. Contact</h2>
      <p style={S.p}>
        Questions about this Privacy Policy? Email us at <strong>privacy@i140tracker.com</strong>.
      </p>
    </div>
  );
}
