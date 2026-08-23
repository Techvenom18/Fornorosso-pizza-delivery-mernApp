// Shared, reusable email templates. Table-based layout with inline styles,
// since email clients (Outlook especially) don't reliably support modern CSS.
const offerEmailHtml = (offer, recipientEmail) => `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#f4ede0; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4ede0; padding: 30px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff9f43, #ff4b3e); background-color:#ff4b3e; padding: 32px 24px; border-radius: 14px 14px 0 0; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 10px;">
                <tr>
                  <td style="background-color:#ffffff; width:44px; height:44px; border-radius:50%; text-align:center; vertical-align:middle; font-size:20px; font-weight:bold; color:#ff4b3e;">F</td>
                </tr>
              </table>
              <h1 style="color:#ffffff; margin:0; font-size:24px; letter-spacing: 0.5px;">FornoRosso</h1>
              <p style="color:#ffffff; margin:6px 0 0; font-size:13px; opacity:0.9;">Wood-fired favorites, delivered fast</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff; padding: 36px 32px;">
              <p style="font-size:13px; color:#9b8f80; text-transform:uppercase; letter-spacing:1px; margin:0 0 8px; font-weight:bold;">Today's Exclusive Offer</p>
              <h2 style="font-size:22px; color:#2b2140; margin:0 0 18px; line-height:1.35;">${offer}</h2>

              <p style="font-size:14px; color:#5c5468; line-height:1.6; margin:0 0 26px;">
                Dear valued customer,<br/><br/>
                We're excited to bring you today's special offer, freshly baked just for you.
                Whether you're craving a classic Margherita or building something bold from scratch,
                now's the perfect time to treat yourself. This offer is available for today only,
                so don't wait too long!
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color:#ff4b3e; border-radius:30px;">
                    <a href="http://localhost:5173" style="display:inline-block; padding: 14px 36px; color:#ffffff; text-decoration:none; font-weight:bold; font-size:14px;">
                      Order Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fff9f0; padding: 22px 32px; border-radius: 0 0 14px 14px; border-top: 1px solid #f0e0c8;">
              <p style="font-size:12px; color:#9b8f80; margin:0 0 6px; text-align:center;">
                You're receiving this email because you subscribed to offers at FornoRosso with ${recipientEmail}.
              </p>
              <p style="font-size:12px; color:#9b8f80; margin:0; text-align:center;">
                &copy; 2026 FornoRosso. Built for OIBSIP Level 3.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = { offerEmailHtml };