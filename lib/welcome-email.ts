type Language = "en" | "ka";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

// Template only: this module does not send email or contact an email provider.
export function buildWelcomeEmail(language: Language, siteUrl: string) {
  const origin = new URL(siteUrl);
  if (origin.protocol !== "https:") throw new Error("Email links must use HTTPS");
  const home = escapeHtml(origin.origin);
  const copy = language === "ka" ? {
    subject: "თქვენ Convert-ის სიაში ხართ!",
    preview: "მადლობა მხარდაჭერისთვის. აპის გაშვების შესახებ აუცილებლად შეგატყობინებთ.",
    label: "კეთილი იყოს თქვენი მობრძანება",
    title: "მეტი სიცხადე.",
    accent: "მეტი შესაძლებლობა.",
    heading: "თქვენ სიაში ხართ.",
    intro: "მადლობა, რომ Convert-ის მოლოდინის სიას შემოუერთდით და თავიდანვე გვიჭერთ მხარს.",
    detail: "ჩვენ ვქმნით ყოველდღიური ფინანსების მართვის უფრო მარტივ გზას. როგორც კი აპი გაეშვება, ამ ელფოსტაზე შეგატყობინებთ.",
    closing: "მოხარული ვართ, რომ ჩვენთან ხართ.",
    team: "Convert-ის გუნდი",
    button: "ეწვიეთ Convert-ს",
    footer: "ეს წერილი მიიღეთ, რადგან Convert-ის მოლოდინის სიაში დარეგისტრირდით. თუ ეს თქვენ არ ყოფილხართ, შეგიძლიათ უგულებელყოთ წერილი.",
  } : {
    subject: "You're on the Convert list!",
    preview: "Thank you for your support. We'll let you know when the app launches.",
    label: "WELCOME TO CONVERT",
    title: "More clarity.",
    accent: "More possibility.",
    heading: "You're on the list.",
    intro: "Thank you for joining the Convert waitlist and supporting us from the beginning.",
    detail: "We're building a simpler way to manage everyday financial life. When the app launches, we'll let you know at this email address.",
    closing: "We're glad you're here.",
    team: "The Convert team",
    button: "Visit Convert",
    footer: "You received this confirmation because you joined the Convert waitlist. If that wasn't you, you can ignore this email.",
  };
  const html = `<!doctype html>
<html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(copy.subject)}</title></head>
<body style="margin:0;padding:0;background-color:#eef3f5;font-family:Arial,Helvetica,sans-serif;color:#152538;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${copy.preview}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#eef3f5;"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px;">
<tr><td style="background-color:#0d1b2b;border-radius:20px 20px 0 0;padding:32px 28px 36px;">
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td><img src="${home}/icon.png" width="44" height="44" alt="Convert logo" style="display:block;border:0;border-radius:10px;"></td><td style="padding-left:12px;font-size:27px;font-weight:bold;letter-spacing:-1px;color:#ffffff;">convert<span style="color:#66f1c2;">.</span></td></tr></table>
<p style="margin:36px 0 16px;color:#a9c2d5;font-size:11px;letter-spacing:2px;">${copy.label}</p>
<h1 style="margin:0;font-size:38px;line-height:1.18;letter-spacing:-1px;color:#ffffff;">${copy.title}<br><span style="font-family:Georgia,serif;font-style:italic;font-weight:normal;color:#66f1c2;">${copy.accent}</span></h1>
</td></tr>
<tr><td style="background-color:#ffffff;padding:34px 28px 36px;border-radius:0 0 20px 20px;">
<p style="margin:0 0 20px;font-size:24px;line-height:1.35;font-weight:bold;">${copy.heading}</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#415267;">${copy.intro}</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#415267;">${copy.detail}</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#66f1c2" style="border-radius:10px;"><a href="${home}" style="display:inline-block;padding:15px 23px;font-size:14px;font-weight:bold;text-decoration:none;color:#0d1b2b;">${copy.button} &rarr;</a></td></tr></table>
<p style="margin:28px 0 0;font-size:15px;line-height:1.7;color:#415267;">${copy.closing}<br><strong style="color:#152538;">${copy.team}</strong></p>
</td></tr>
<tr><td style="padding:22px 16px;text-align:center;font-size:12px;line-height:1.7;color:#637587;">${copy.footer}</td></tr>
</table></td></tr></table></body></html>`;
  return {
    subject: copy.subject,
    html,
    text: [copy.heading, copy.intro, copy.detail, copy.closing, copy.team, origin.origin, copy.footer].join("\n\n"),
  };
}
