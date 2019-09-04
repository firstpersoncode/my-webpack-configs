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
    shell.series(
      [
        setEnv("development"),
        `node node_modules/my-webpack-configs/utils/start.js`
      ],
      processExit
    );
    break;
  }
  case "build": {
    // execute multiple commands in series
    shell.series(
      [
        setEnv("production"),
        `node node_modules/my-webpack-configs/utils/build.js`
      ],
      processExit
    );
    break;
  }
  default:
    console.log(`Unknown script "${task}".`);
}
