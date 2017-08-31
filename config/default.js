module.exports = {
  serverPort: process.env.GMR_SERVER_PORT || 3000,
  gitlab: {
    userKey: process.env.GITLAB_KEY,
    url: process.env.GITLAB_URL || 'https://gitlab.com/',
    oauth: {
      client: {
        id: process.env.GITLAB_APP_ID || '',
        secret: process.env.GITLAB_SECRET_KEY || ''
      },
      auth: {
        tokenHost: process.env.GITLAB_URL || 'https://gitlab.com/'
      }
    }
  }
}
