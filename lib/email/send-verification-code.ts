import { sendEmail } from "./send-email";

export async function sendVerificationCodeEmail(email: string, code: string) {
  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: `
      <div style="background-color:#f4f6f8;padding:40px 0;">
        <div style="
          max-width:520px;
          margin:0 auto;
          background:#ffffff;
          border-radius:12px;
          padding:32px;
          font-family:Arial, Helvetica, sans-serif;
          color:#111827;
          box-shadow:0 10px 25px rgba(0,0,0,0.08);
        ">
          
          <h2 style="
            margin:0 0 12px;
            font-size:22px;
            font-weight:700;
            text-align:center;
          ">
            Verify your email
          </h2>

          <p style="
            margin:0 0 24px;
            font-size:14px;
            line-height:1.6;
            color:#4b5563;
            text-align:center;
          ">
            Use the verification code below to complete your sign-up.
          </p>

          <div style="
            text-align:center;
            margin:24px 0;
          ">
            <span style="
              display:inline-block;
              padding:16px 24px;
              font-size:28px;
              font-weight:700;
              letter-spacing:8px;
              background:#f9fafb;
              border:1px dashed #d1d5db;
              border-radius:10px;
              color:#111827;
            ">
              ${code}
            </span>
          </div>

          <p style="
            margin:24px 0 0;
            font-size:13px;
            color:#6b7280;
            text-align:center;
          ">
            This code expires in <strong>10 minutes</strong>.
          </p>

          <hr style="
            border:none;
            border-top:1px solid #e5e7eb;
            margin:32px 0;
          ">

          <p style="
            font-size:12px;
            color:#9ca3af;
            text-align:center;
            line-height:1.5;
            margin:0;
          ">
            If you didn’t request this, you can safely ignore this email.
          </p>

        </div>
      </div>
    `,
  });
}
