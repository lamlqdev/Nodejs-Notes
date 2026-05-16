module.exports = {
  apps: [{
    name: 'noa-stock-worker',
    script: './dist/server.js', // what file to run
    cwd: '/home/deploy/noa-stock-app/Noa-Stock-Prediction/worker', // current working directory
    instances: 'max', // number of instances to run
    exec_mode : "cluster", // execution mode
    env: {
      NODE_ENV: 'production', // environment variable
      PORT: 3001 // port to run the application
    },
    env_file: '/home/deploy/noa-stock-app/Noa-Stock-Prediction/worker/.env', // environment file
    error_file: '/home/deploy/noa-stock-app/Noa-Stock-Prediction/logs/worker-error.log', // error log file
    out_file: '/home/deploy/noa-stock-app/Noa-Stock-Prediction/logs/worker-out.log', // output log file
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
  }],

  deploy: {
    production: {
      user: "deploy",
      host: "45.79.251.64", // host of the server
      // key no need provide when run on bitbucket
      // key: "~/.ssh/id_rsa_tony_plgroup", // key of the server
      ref: "origin/new_server", // branch of the project on the server
      repo: "git@bitbucket.org:marievdb/plgroup_backend.git", // repository of the project on the server
      path: "/home/deploy/autodeploy/plgroup_backend", // path of the project on the server
      ssh_options: "IdentitiesOnly=yes",
      "post-deploy": // commands to execute after the deployment
        "cp /home/deploy/autodeploy/plgroup_backend/shared/.env /home/deploy/autodeploy/plgroup_backend/current/.env && cp /home/deploy/autodeploy/plgroup_backend/shared/credentials.json /home/deploy/autodeploy/plgroup_backend/source/credentials.json && yarn install && export NODE_OPTIONS=--max_old_space_size=4096 && yarn build && pm2 restart plgroup_backend_autodeploy",
      "post-setup": // commands to execute after the setup
        "cp /home/deploy/autodeploy/plgroup_backend/shared/.env /home/deploy/autodeploy/plgroup_backend/current/.env && cp /home/deploy/autodeploy/plgroup_backend/shared/credentials.json /home/deploy/autodeploy/plgroup_backend/source/credentials.json && yarn install && export NODE_OPTIONS=--max_old_space_size=4096 && yarn build && pm2 start dist/main.js --name plgroup_backend_autodeploy",
      "pre-deploy-local": "echo 'This is a local executed command'" // commands to execute before the deployment on local machine
    }
  }
};