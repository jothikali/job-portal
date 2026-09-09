import nodemailer from 'nodemailer';

// ─── Transporter ─────────────────────────────────────────────────────────────
// Uses Gmail SMTP. Set EMAIL_USER and EMAIL_PASS in your Render env vars.
// For Gmail: enable "App Passwords" (2FA required) and use the 16-char app password.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ─── Shortlist / Interview Notification ──────────────────────────────────────
export const sendShortlistEmail = async ({
    candidateEmail,
    candidateName,
    jobTitle,
    stageName,        // e.g. "Aptitude Round", "Technical Interview", "HR Discussion"
    interviewDate,    // optional — null for Aptitude
    interviewTime,    // optional — null for Aptitude
    interviewLink,    // optional — null for Aptitude
}) => {
    const isInterview = !!interviewDate;

    // ── Format date/time display ──────────────────────────────────────────────
    let scheduleLine = '';
    if (isInterview && interviewDate) {
        const dateObj  = new Date(`${interviewDate}T${interviewTime || '00:00'}:00`);
        const dateFmt  = dateObj.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeFmt  = interviewTime
            ? new Date(`1970-01-01T${interviewTime}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            : '';
        scheduleLine = `${dateFmt}${timeFmt ? ' at ' + timeFmt : ''}`;
    }

    // ── CTA button ────────────────────────────────────────────────────────────
    const ctaBlock = interviewLink
        ? `<a href="${interviewLink}"
              style="display:inline-block;background:#0F172A;color:#ffffff;text-decoration:none;
                     padding:14px 36px;border-radius:12px;font-weight:700;font-size:14px;
                     letter-spacing:0.05em;margin-top:24px;">
               Join Interview / Assessment →
           </a>`
        : '';

    // ── Schedule block ────────────────────────────────────────────────────────
    const scheduleBlock = scheduleLine
        ? `<div style="background:#F1F5F9;border-radius:12px;padding:16px 20px;margin:20px 0;">
               <p style="margin:0;font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Scheduled For</p>
               <p style="margin:6px 0 0;font-size:16px;font-weight:800;color:#0F172A;">${scheduleLine}</p>
           </div>`
        : '';

    // ── HTML email template ───────────────────────────────────────────────────
    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">

        <!-- Header bar -->
        <tr>
          <td style="background:#0F172A;padding:28px 40px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:14px;">
                  <img src="${process.env.FRONTEND_URL || 'https://job-portal-two-teal.vercel.app'}/icons/job-logo.jpeg"
                       width="40" height="40" style="border-radius:10px;display:block;" alt="Job Nest" />
                </td>
                <td>
                  <p style="margin:0;color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.03em;">Job Nest</p>
                  <p style="margin:2px 0 0;color:#94A3B8;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Recruitment Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">

            <!-- Stage badge -->
            <div style="display:inline-block;background:#EFF6FF;color:#2563EB;padding:6px 16px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px;">
              ${stageName}
            </div>

            <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#0F172A;line-height:1.2;">
              Congratulations, ${candidateName}! 🎉
            </h1>
            <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
              We are pleased to inform you that you have been shortlisted for the
              <strong style="color:#0F172A;">${jobTitle}</strong> position at Job Nest.
              You are moving forward to the <strong style="color:#2563EB;">${stageName}</strong> stage.
            </p>

            ${scheduleBlock}

            ${isInterview
                ? `<p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 4px;">
                     Please join the meeting using the button below. Make sure to be ready <strong>5 minutes early</strong>
                     with your camera and microphone enabled.
                   </p>`
                : `<p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 4px;">
                     Our team will contact you shortly with further details about your assessment.
                     Please keep an eye on your email and the Job Nest portal.
                   </p>`
            }

            ${ctaBlock}

            <!-- Divider -->
            <hr style="border:none;border-top:1px solid #E2E8F0;margin:32px 0;" />

            <!-- Tips -->
            <p style="margin:0 0 10px;font-size:12px;font-weight:800;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Quick Tips</p>
            <ul style="margin:0;padding-left:18px;color:#64748B;font-size:13px;line-height:1.8;">
              <li>Log in to <a href="${process.env.FRONTEND_URL || '#'}/my-jobs" style="color:#2563EB;">Job Nest → My Jobs</a> to track your application status.</li>
              <li>Keep your resume and portfolio ready for review.</li>
              <li>Reach out to our HR team if you have any questions.</li>
            </ul>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;padding:24px 40px;border-top:1px solid #E2E8F0;">
            <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">
              This is an automated message from <strong>Job Nest Recruitment</strong>.<br/>
              Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;

    await transporter.sendMail({
        from: `"Job Nest Recruitment" <${process.env.EMAIL_USER}>`,
        to:   candidateEmail,
        subject: `🎉 You've been shortlisted for ${jobTitle} — ${stageName}`,
        html,
    });
};
