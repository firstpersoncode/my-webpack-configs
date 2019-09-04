const webpack = require("webpack");
const rimraf = require("rimraf");
const chalk = require("chalk");

const webpackConfig = require("../webpack")(
  process.env.NODE_ENV || "production"
);

const paths = require("../utils/paths");
const { logMessage, compilerPromise } = require("./helpers");

const build = async () => {
  rimraf.sync(paths.BUILD_CLIENT);
  rimraf.sync(paths.BUILD_SERVER);

  const [clientConfig] = webpackConfig;
  const webpackCompiler = webpack([clientConfig]);

  const clientCompiler = webpackCompiler.compilers.find(
    compiler => compiler.name === "client"
  );
  const clientPromise = compilerPromise("client", clientCompiler);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  clientCompiler.watch({}, (error, stats) => {
    if (!error && !stats.hasErrors()) {
      console.log(stats.toString(clientConfig.stats));
      return;
    }
    console.error(chalk.red(stats.compilation.errors));
  });

  // wait until client and server is compiled
  try {
    await clientPromise;
    logMessage("Done!", "info");
    process.exit();
  } catch (error) {
    logMessage(error, "error");
  }
};

build();
