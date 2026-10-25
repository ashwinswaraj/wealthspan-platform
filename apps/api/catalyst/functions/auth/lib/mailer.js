"use strict";
/** Sends the login email with Catalyst Mail. FROM_EMAIL must be a verified sender in Catalyst. */
const createMailer = (app, { fromEmail, appUrl }) => ({
  async send({ to, method, secret }) {
    const link = `${appUrl}/login/verify?email=${encodeURIComponent(to)}&token=${encodeURIComponent(secret)}`;
    const body =
      method === "otp"
        ? `<p>Your Wealthspan login code is</p><p style="font-size:28px;letter-spacing:6px"><b>${secret}</b></p><p>It works for 10 minutes. If you did not ask for it, ignore this email.</p>`
        : `<p><a href="${link}">Log in to Wealthspan</a></p><p>This link works once, for 10 minutes. If you did not ask for it, ignore this email.</p>`;
    await app.email().sendMail({
      from_email: fromEmail,
      to_email: [to],
      subject: method === "otp" ? "Your Wealthspan login code" : "Your Wealthspan login link",
      html_mode: true,
      content: body,
    });
  },
});

module.exports = { createMailer };
