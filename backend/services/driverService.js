const { Op } = require('sequelize');
const { Driver } = require('../models');
const { sendEmail } = require('./emailService');

const emailExpiredDrivers = async () => {
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const todayStr = today.toISOString().split('T')[0];
  const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];

  const drivers = await Driver.findAll({
    where: {
      license_expiry_date: {
        [Op.between]: [todayStr, thirtyDaysLaterStr],
      },
      status: {
        [Op.ne]: 'Suspended',
      },
    },
  });

  const emailResults = [];

  for (const driver of drivers) {
    const subject = 'Action Required: License Renewal Notice - TransitOps';
    const text = `Dear ${driver.name},\n\nThis is a notification that your commercial license (${driver.license_number}) is set to expire on ${driver.license_expiry_date}. Please submit your updated credentials to management as soon as possible.\n\nBest regards,\nTransitOps Operations Team`;
    
    const html = `
      <h3>License Renewal Notice</h3>
      <p>Dear <strong>${driver.name}</strong>,</p>
      <p>This is a notification that your driver's license (Number: <code>${driver.license_number}</code>, Category: <code>${driver.license_category}</code>) is set to expire on <strong>${driver.license_expiry_date}</strong>.</p>
      <p>According to safety compliance guidelines, drivers with expired licenses cannot be assigned to trips. Please renew and submit your updated credentials as soon as possible.</p>
      <br/>
      <p>Best regards,</p>
      <p><strong>TransitOps Operations Team</strong></p>
    `;

    try {
      // Driver model doesn't store email, only contact_number. We will mock a corporate email address: name@transitops.com
      const emailAddress = `${driver.name.toLowerCase().replace(/\s+/g, '')}@transitops.com`;
      
      const emailResponse = await sendEmail({
        to: emailAddress,
        subject,
        text,
        html,
      });

      emailResults.push({
        driverId: driver.id,
        name: driver.name,
        email: emailAddress,
        licenseExpiryDate: driver.license_expiry_date,
        status: 'Sent',
        messageId: emailResponse.messageId,
        previewUrl: emailResponse.previewUrl,
      });
    } catch (error) {
      emailResults.push({
        driverId: driver.id,
        name: driver.name,
        status: 'Failed',
        error: error.message,
      });
    }
  }

  return emailResults;
};

module.exports = {
  emailExpiredDrivers,
};
