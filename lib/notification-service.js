const axios = require('axios');
const { getConfig } = require('../config/config');

class NotificationService {
  constructor() {
    this.config = getConfig();
  }

  async sendNotifications(reportData, trendAnalysis) {
    const notifications = [];

    try {
      if (this.config.notifications.slack.enabled) {
        notifications.push(this.sendSlackNotification(reportData, trendAnalysis));
      }

      if (this.config.notifications.teams.enabled) {
        notifications.push(this.sendTeamsNotification(reportData, trendAnalysis));
      }

      await Promise.allSettled(notifications);
    } catch (error) {
      console.error('❌ Error sending notifications:', error.message);
    }
  }

  async sendSlackNotification(reportData, trendAnalysis) {
    try {
      const payload = this.createSlackPayload(reportData, trendAnalysis);
      
      await axios.post(this.config.notifications.slack.webhookUrl, payload);
      console.log('✅ Slack notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error.message);
      throw error;
    }
  }

  async sendTeamsNotification(reportData, trendAnalysis) {
    try {
      const payload = this.createTeamsPayload(reportData, trendAnalysis);
      
      await axios.post(this.config.notifications.teams.webhookUrl, payload);
      console.log('✅ Teams notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Teams notification:', error.message);
      throw error;
    }
  }

  createSlackPayload(reportData, trendAnalysis) {
    const status = reportData.stats.assertions.failed === 0 ? 'success' : 'failure';
    const emoji = status === 'success' ? '✅' : '❌';
    const color = status === 'success' ? 'good' : 'danger';

    return {
      channel: this.config.notifications.slack.channel,
      username: 'Newman API Tests',
      icon_emoji: ':test_tube:',
      attachments: [
        {
          color: color,
          title: `${emoji} API Test Results - ${reportData.successRate}% Success Rate`,
          fields: [
            {
              title: 'Total Assertions',
              value: reportData.stats.assertions.total,
              short: true
            },
            {
              title: 'Failed Assertions',
              value: reportData.stats.assertions.failed,
              short: true
            },
            {
              title: 'Duration',
              value: `${(reportData.duration / 1000).toFixed(2)}s`,
              short: true
            },
            {
              title: 'Requests',
              value: reportData.stats.requests.total,
              short: true
            }
          ],
          footer: 'Newman API Testing',
          ts: Math.floor(new Date(reportData.timestamp).getTime() / 1000)
        }
      ]
    };
  }

  createTeamsPayload(reportData, trendAnalysis) {
    const status = reportData.stats.assertions.failed === 0 ? 'success' : 'failure';
    const themeColor = status === 'success' ? '00FF00' : 'FF0000';

    return {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: themeColor,
      summary: `API Test Results - ${reportData.successRate}% Success Rate`,
      sections: [
        {
          activityTitle: 'Newman API Test Results',
          activitySubtitle: `Executed on ${new Date(reportData.timestamp).toLocaleString()}`,
          facts: [
            {
              name: 'Success Rate',
              value: `${reportData.successRate}%`
            },
            {
              name: 'Total Assertions',
              value: reportData.stats.assertions.total
            },
            {
              name: 'Failed Assertions',
              value: reportData.stats.assertions.failed
            },
            {
              name: 'Duration',
              value: `${(reportData.duration / 1000).toFixed(2)}s`
            },
            {
              name: 'Total Requests',
              value: reportData.stats.requests.total
            }
          ]
        }
      ]
    };
  }
}

module.exports = NotificationService;
