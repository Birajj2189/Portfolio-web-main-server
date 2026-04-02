module.exports = {
  apps: [
    {
      name: 'strapi',
      cwd: '/Users/sow-biraj-mahanta/PERSONAL/Portfolio/BE',
      script: 'npm',
      args: 'run develop',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'auth-service',
      cwd: '/Users/sow-biraj-mahanta/PERSONAL/Portfolio/BE/auth-service',
      script: 'npm',
      args: 'run dev',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
