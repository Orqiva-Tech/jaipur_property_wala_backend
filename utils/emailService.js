const nodemailer = require('nodemailer');

// Helper to resolve validated SMTP credentials with safe fallbacks
const getSmtpCredentials = () => {
  let user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  let rawPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
  let adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ? process.env.ADMIN_NOTIFICATION_EMAIL.trim() : '';

  const hasValidUser = user && user.includes('@') && !user.includes('your_email');
  const hasValidPass = rawPass && rawPass.length >= 8 && !rawPass.includes('your_app_password');

  // If user or pass from env is invalid (e.g. SMTP_USER has no @ or is just domain name),
  // use the verified fallback pair together so we NEVER mix an unmatched user and pass!
  if (!hasValidUser || !hasValidPass) {
    user = 'ankityadav941318@gmail.com';
    rawPass = 'dzwcjmthmtxwniwq';
  }

  if (!adminEmail || !adminEmail.includes('@') || adminEmail.includes('your_email') || adminEmail.includes('example.com')) {
    adminEmail = user;
  }

  return { user, pass: rawPass, adminEmail };
};

// Initialize Gmail SMTP Transporter with SSL
const createTransporter = () => {
  const { user, pass } = getSmtpCredentials();

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send notification email to the Admin regarding a new customer enquiry
 */
const sendAdminEnquiryNotification = async (enquiry) => {
  try {
    const transporter = createTransporter();
    const { user, adminEmail } = getSmtpCredentials();
    const dateFormatted = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const cleanPhone = (enquiry.phone || '').replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const mailOptions = {
      from: `"Jaipur Property Wala" <${user}>`,
      to: adminEmail,
      subject: `🔔 [You have a new query] ${enquiry.name} — ${enquiry.interestedProperty || 'General Property Inquiry'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1712; margin: 0; padding: 20px; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 2px solid #d4af37; }
            .header { background: linear-gradient(135deg, #091a13 0%, #153b2c 100%); color: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid #d4af37; }
            .header h1 { margin: 0; font-size: 22px; color: #f3e5ab; text-transform: uppercase; letter-spacing: 1.5px; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #a3c2b4; }
            .body { padding: 24px; color: #222; }
            .field-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
            .label { width: 140px; font-weight: bold; font-size: 13px; color: #153b2c; }
            .value { flex: 1; font-size: 14px; color: #333; }
            .btn { display: inline-block; background: #0f2e22; color: #f3e5ab !important; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 20px; font-size: 14px; border: 1px solid #d4af37; }
            .footer { background: #f9fbf9; padding: 16px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>JAIPUR PROPERTY WALA</h1>
              <p>⚡ You Have A New Query (Real-Time Notification)</p>
            </div>
            <div class="body">
              <p style="font-size: 15px; margin-top: 0;"><strong>Ankit ji, website par nayi customer query aayi hai:</strong></p>
              
              <div style="background: #f7faf8; border-radius: 10px; padding: 14px; border-left: 4px solid #d4af37; margin-bottom: 16px;">
                <div class="field-row">
                  <div class="label">Customer Name:</div>
                  <div class="value"><strong>${enquiry.name}</strong></div>
                </div>
                <div class="field-row">
                  <div class="label">Contact Phone:</div>
                  <div class="value">
                    <a href="tel:${enquiry.phone}" style="color: #0f2e22; font-weight: bold; text-decoration: none; font-size: 16px;">
                      📞 ${enquiry.phone}
                    </a>
                    &nbsp;&nbsp;
                    <a href="https://wa.me/${waPhone}" target="_blank" style="color: #25D366; font-weight: bold; text-decoration: none;">
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
                <div class="field-row">
                  <div class="label">Email Address:</div>
                  <div class="value">${enquiry.email ? `<a href="mailto:${enquiry.email}">${enquiry.email}</a>` : 'Not provided'}</div>
                </div>
                <div class="field-row">
                  <div class="label">Interested Scheme:</div>
                  <div class="value"><strong style="color: #b8860b;">${enquiry.interestedProperty || 'General Property Consultation'}</strong></div>
                </div>
                <div class="field-row">
                  <div class="label">Preferred City/Area:</div>
                  <div class="value">${enquiry.preferredLocation || 'Jaipur'}</div>
                </div>
                <div class="field-row">
                  <div class="label">Budget Range:</div>
                  <div class="value"><strong>${enquiry.budget || 'Any'}</strong></div>
                </div>
                <div class="field-row">
                  <div class="label">Query Source:</div>
                  <div class="value"><span style="background: #e6f4ea; color: #137333; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${enquiry.source || 'Website'}</span></div>
                </div>
                <div class="field-row">
                  <div class="label">Customer Message:</div>
                  <div class="value" style="font-style: italic;">"${enquiry.message || 'Customer requested a callback regarding available plots.'}"</div>
                </div>
                <div class="field-row" style="border-bottom: none;">
                  <div class="label">Received Date:</div>
                  <div class="value">${dateFormatted}</div>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="tel:${enquiry.phone}" class="btn">
                  📞 Turant Customer Ko Call Karein
                </a>
              </div>
            </div>
            <div class="footer">
              Jaipur Property Wala Management CRM • Automated Lead Dispatch
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin notification sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn('[Email Warning] Could not send admin notification email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification email to Admin for new job / career applications
 */
const sendAdminJobNotification = async (application) => {
  try {
    const transporter = createTransporter();
    const { user, adminEmail } = getSmtpCredentials();
    const dateFormatted = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const cleanPhone = (application.phone || '').replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const mailOptions = {
      from: `"Jaipur Property Wala Careers" <${user}>`,
      to: adminEmail,
      subject: `💼 [New Career Application] ${application.fullName} — ${application.jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1712; margin: 0; padding: 20px; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 2px solid #2563eb; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid #60a5fa; }
            .header h1 { margin: 0; font-size: 20px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1.5px; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #cbd5e1; }
            .body { padding: 24px; color: #222; }
            .field-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
            .label { width: 140px; font-weight: bold; font-size: 13px; color: #1e3a8a; }
            .value { flex: 1; font-size: 14px; color: #333; }
            .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>JAIPUR PROPERTY WALA RECRUITMENT</h1>
              <p>💼 New Candidate Job Application</p>
            </div>
            <div class="body">
              <p style="font-size: 15px; margin-top: 0;"><strong>Naya job candidate form submit hua hai:</strong></p>
              
              <div style="background: #f8fafc; border-radius: 10px; padding: 14px; border-left: 4px solid #2563eb; margin-bottom: 16px;">
                <div class="field-row">
                  <div class="label">Candidate Name:</div>
                  <div class="value"><strong>${application.fullName}</strong></div>
                </div>
                <div class="field-row">
                  <div class="label">Applied Position:</div>
                  <div class="value"><strong style="color: #2563eb;">${application.jobTitle}</strong></div>
                </div>
                <div class="field-row">
                  <div class="label">Contact Phone:</div>
                  <div class="value">
                    <a href="tel:${application.phone}" style="color: #0f172a; font-weight: bold; text-decoration: none; font-size: 15px;">
                      📞 ${application.phone}
                    </a>
                    &nbsp;&nbsp;
                    <a href="https://wa.me/${waPhone}" target="_blank" style="color: #25D366; font-weight: bold; text-decoration: none;">
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
                <div class="field-row">
                  <div class="label">Email Address:</div>
                  <div class="value"><a href="mailto:${application.email}">${application.email}</a></div>
                </div>
                <div class="field-row">
                  <div class="label">Location:</div>
                  <div class="value">${application.currentLocation || 'Jaipur'}</div>
                </div>
                <div class="field-row">
                  <div class="label">Experience:</div>
                  <div class="value"><strong>${application.experienceYears || 'Fresher'}</strong></div>
                </div>
                <div class="field-row">
                  <div class="label">Resume:</div>
                  <div class="value"><strong>${application.resumeOriginalName || 'Attached in Portal'}</strong></div>
                </div>
                <div class="field-row">
                  <div class="label">Cover Letter / Note:</div>
                  <div class="value" style="font-style: italic;">"${application.coverLetter || 'No cover letter provided.'}"</div>
                </div>
                <div class="field-row" style="border-bottom: none;">
                  <div class="label">Submitted Date:</div>
                  <div class="value">${dateFormatted}</div>
                </div>
              </div>
            </div>
            <div class="footer">
              Jaipur Property Wala Recruitment Portal • Automated Dispatch
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin job application notification sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn('[Email Warning] Job application email could not be delivered:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send acknowledgment / confirmation email to the Customer
 */
const sendCustomerEnquiryConfirmation = async (enquiry) => {
  if (!enquiry.email || !enquiry.email.includes('@')) {
    return { success: false, message: 'No valid customer email provided.' };
  }

  try {
    const { user } = getSmtpCredentials();
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Jaipur Property Wala" <${user}>`,
      to: enquiry.email,
      subject: `✨ Namaste ${enquiry.name} — Aapki Property Enquiry Safaltapoorvak Prapt Hui (Jaipur Property Wala)`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f4; margin: 0; padding: 20px; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.08); border: 1px solid #d4af37; }
            .header { background: linear-gradient(135deg, #091a13 0%, #153b2c 100%); color: #ffffff; padding: 28px 20px; text-align: center; border-bottom: 3px solid #d4af37; }
            .header h1 { margin: 0; font-size: 24px; color: #f3e5ab; letter-spacing: 1px; }
            .header p { margin: 8px 0 0; font-size: 13px; color: #a3c2b4; }
            .body { padding: 28px 24px; color: #2d3748; line-height: 1.6; }
            .highlight-box { background: #fbf9f1; border: 1px solid #e2d29b; border-radius: 12px; padding: 18px; margin: 20px 0; }
            .feature-list { list-style: none; padding: 0; margin: 15px 0; }
            .feature-list li { padding: 6px 0; font-size: 13.5px; }
            .btn { display: inline-block; background: #0f2e22; color: #f3e5ab !important; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin-top: 15px; font-size: 14px; border: 1px solid #d4af37; }
            .footer { background: #0f2e22; color: #d0ded6; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>JAIPUR PROPERTY WALA</h1>
              <p>Premier JDA & RERA Approved Townships • Jaipur | Ajmer | Kishangarh | Mumbai</p>
            </div>
            
            <div class="body">
              <h2 style="font-size: 18px; color: #0f2e22; margin-top: 0;">
                Namaste ${enquiry.name} ji,
              </h2>
              
              <p style="font-size: 14px;">
                <strong>Jaipur Property Wala</strong> par aapka swagat hai! Humein aapki property enquiry safaltapoorvak prapt ho gayi hai.
              </p>

              <div class="highlight-box">
                <div style="font-size: 13px; font-weight: bold; color: #855f0a; margin-bottom: 8px; text-transform: uppercase;">
                  📋 Aapki Enquiry Ka Vivaran:
                </div>
                <div style="font-size: 13.5px; color: #333;">
                  <strong>Interested Scheme:</strong> ${enquiry.interestedProperty || 'Direct Consultation'}<br/>
                  <strong>Location Preference:</strong> ${enquiry.preferredLocation || 'Prime Corridor'}<br/>
                  <strong>Budget:</strong> ${enquiry.budget || 'Custom Planning'}
                </div>
              </div>

              <p style="font-size: 14px;">
                Humare <strong>Senior Property Advisory Specialist</strong> agle <strong>15-30 minutes</strong> me aapse call par sampark karenge aur aapko:
              </p>

              <ul class="feature-list">
                <li>✅ <strong>Complete Scheme Layout Map & Pricing List</strong> provide karenge.</li>
                <li>✅ <strong>JDA & RERA Approval Documents</strong> verify karwayenge.</li>
                <li>✅ <strong>Free Direct Site Visit (Pick & Drop Facility)</strong> schedule karenge.</li>
                <li>✅ <strong>80% Nationalized Bank Loan</strong> ki poori suvidha batayenge.</li>
                <li>✅ <strong>0% Brokerage & 100% Free Consultation</strong> ensure karenge.</li>
              </ul>

              <p style="font-size: 14px; margin-bottom: 5px;">
                Agar aapko turant jankari chahiye, toh aap humari website par visit kar sakte hain ya email par sampark kar sakte hain.
              </p>

              <div style="text-align: center; margin: 25px 0;">
                <a href="https://jaipurpropertywala.in" class="btn">
                  🌐 Visit Website
                </a>
              </div>

              <p style="font-size: 13px; color: #718096; margin-bottom: 0;">
                Aapka vishwas, hamari pehchan.<br/>
                <strong>Team Jaipur Property Wala</strong>
              </p>
            </div>

            <div class="footer">
              <strong>Jaipur Property Wala Head Office:</strong> Plot No. 42, Jagatpura, Near Mahal Road, Jaipur, Rajasthan 302017<br/>
              Email: info@jaipurpropertywala.in | Website: jaipurpropertywala.in
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Customer confirmation sent successfully to ${enquiry.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[Email Warning] Customer confirmation could not be delivered to ${enquiry.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAdminEnquiryNotification,
  sendAdminJobNotification,
  sendCustomerEnquiryConfirmation,
  getSmtpCredentials
};
