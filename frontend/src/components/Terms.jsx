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

export default function Terms() {
  return (
    <div style={S.wrap}>
      <h1 style={S.h1}>Terms of Service</h1>
      <p style={S.date}>Effective Date: March 13, 2026 · Last Updated: March 13, 2026</p>

      <h2 style={S.h2}>1. Acceptance of Terms</h2>
      <p style={S.p}>
        By using I-140 Tracker ("the site"), you agree to these Terms of Service. If you do not
        agree, please do not use the site. We may update these terms and will notify users of
        material changes with a plain-language summary.
      </p>

      <h2 style={S.h2}>2. Description of Service</h2>
      <p style={S.p}>
        I-140 Tracker is a free community tool that aggregates publicly available USCIS case
        status data for I-140 petitions (NIW and EB-1A categories) and allows users to
        voluntarily contribute anonymized profile data to help the community understand
        processing trends.
      </p>

      <h2 style={S.h2}>3. Use of the Service</h2>
      <ul style={S.ul}>
        <li style={S.li}>The site is for personal, non-commercial use only.</li>
        <li style={S.li}>You may not use automated tools to scrape or abuse the site.</li>
        <li style={S.li}>You may not submit false, misleading, or fabricated case information.</li>
        <li style={S.li}>You must be 18 years or older to use this service.</li>
      </ul>

      <h2 style={S.h2}>4. Data You Submit</h2>
      <p style={S.p}>
        When you voluntarily submit profile data, you grant us a non-exclusive license to store
        and display that data in anonymized, aggregated form. You retain ownership of your data
        and may request deletion at any time (see our Privacy Policy).
      </p>

      <h2 style={S.h2}>5. No Legal Advice</h2>
      <p style={S.p}>
        Nothing on this site constitutes legal advice. Case processing trends are statistical
        estimates only and should not be relied upon for immigration decisions. Consult a
        licensed immigration attorney for legal guidance.
      </p>

      <h2 style={S.h2}>6. Accuracy of Data</h2>
      <p style={S.p}>
        Case status data is sourced from the USCIS Case Status API and is provided as-is.
        We make no guarantees about the accuracy, completeness, or timeliness of the data.
        Always verify your case status directly at uscis.gov.
      </p>

      <h2 style={S.h2}>7. No Data Sales</h2>
      <p style={S.p}>
        We do not sell user data or any data submitted through this site for profit or any
        monetary transaction. Aggregated, anonymized statistics may be displayed publicly.
      </p>

      <h2 style={S.h2}>8. Third-Party Services</h2>
      <p style={S.p}>
        The site uses the USCIS Torch API to retrieve case status data. Use of that data is
        governed by USCIS Terms of Use. We do not share user data with any third parties.
      </p>

      <h2 style={S.h2}>9. Limitation of Liability</h2>
      <p style={S.p}>
        The site is provided "as is" without warranties of any kind. We are not liable for
        any damages arising from use of the site, reliance on its data, or service interruptions.
      </p>

      <h2 style={S.h2}>10. Account Closure</h2>
      <p style={S.p}>
        You may close your account and request deletion of all submitted data at any time by
        emailing <strong>privacy@i140tracker.com</strong>. We will process requests within 30 days.
      </p>

      <h2 style={S.h2}>11. Changes to Terms</h2>
      <p style={S.p}>
        We will notify users of changes to these terms by posting a notice on the site and
        updating the effective date. For material changes, we will seek active consent and
        provide a plain-language summary of what changed.
      </p>

      <h2 style={S.h2}>12. Contact</h2>
      <p style={S.p}>
        Questions? Email us at <strong>privacy@i140tracker.com</strong>.
      </p>
    </div>
  );
}
