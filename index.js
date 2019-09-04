#! /usr/bin/env node
const shell = require("./utils/shellHelpers");
const paths = require("./utils/paths");

const [task] = process.argv.slice(2);
const processExit = (err, code) => {
  if (err) {
    process.exit(1);
  }
  process.exit(code);
};

const setEnv = env => `cross-env NODE_ENV=${env}`;
const transpile = `yarn-or-npm babel -d ${paths.BUILD_}/transpiled ./${paths.SRC_} --extensions .es6,.js,.es,.jsx,.mjs,.ts,.tsx --ignore **/*.d.ts`;

// // execute a single shell command
// shell.exec('node', function(err){
//     console.log('executed test');
// }});

switch (task) {
  case "analyze": {
    // execute multiple commands in series
    shell.series(
      [
        setEnv("production"),
        `webpack --config config/webpack/client.prod.js --json > ${paths.BUILD_CLIENT}/static/bundle-stats.json`,
        `webpack-bundle-analyzer ${paths.BUILD_CLIENT}/static/bundle-stats.json`
      ],
      processExit
    );
    break;
  }
  case "start": {
    // execute multiple commands in series
    shell.series([setEnv("development"), "node utils/start.js"], processExit);
    break;
  }
  case "build": {
    // execute multiple commands in series
    shell.series([setEnv("production"), "node utils/build.js"], processExit);
    break;
  }
  default:
    console.log(`Unknown script "${task}".`);
}
