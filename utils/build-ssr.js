const webpack = require("webpack");
const rimraf = require("rimraf");
const chalk = require("chalk");
const { choosePort } = require("react-dev-utils/WebpackDevServerUtils");

const webpackConfig = require("../webpack")(
  process.env.NODE_ENV || "production"
);

const paths = require("./paths");
const { logMessage, compilerPromise, sleep } = require("./helpers");

const HOST = process.env.HOST || "http://localhost";

const generateStaticHTML = async () => {
  const nodemon = require("nodemon");
  const fs = require("fs");
  const puppeteer = require("puppeteer");
  const PORT = await choosePort("localhost", 8505);

  process.env.PORT = PORT;

  const script = nodemon({
    script: `${paths.BUILD_SERVER}/server.js`,
    ignore: ["*"]
  });

  script.on("start", async () => {
    try {
      // TODO: add try/wait/retry here instead of just generally waiting for 2000 ms
      await sleep(2000);
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`${HOST}:${PORT}`);
      const pageContent = await page.content();
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFileSync(`${paths.BUILD_CLIENT}/index.html`, pageContent);
      await browser.close();
      script.emit("quit");
    } catch (err) {
      script.emit("quit");
      console.log(err);
    }
  });

  script.on("exit", code => {
    process.exit(code);
  });

  script.on("crash", () => {
    process.exit(1);
  });
};

const build = async () => {
  rimraf.sync(paths.BUILD_CLIENT);
  rimraf.sync(paths.BUILD_SERVER);

  const [clientConfig, serverConfig] = webpackConfig;
  const multiCompiler = webpack([clientConfig, serverConfig]);

  const clientCompiler = multiCompiler.compilers.find(
    compiler => compiler.name === "client"
  );
  const serverCompiler = multiCompiler.compilers.find(
    compiler => compiler.name === "server"
  );

  const clientPromise = compilerPromise("client", clientCompiler);
  const serverPromise = compilerPromise("server", serverCompiler);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  serverCompiler.watch({}, (error, stats) => {
    if (!error && !stats.hasErrors()) {
      console.log(stats.toString(serverConfig.stats));
      return;
    }
    console.error(chalk.red(stats.compilation.errors));
  });
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
    await serverPromise;
    await clientPromise;
    await generateStaticHTML();
    logMessage("Done!", "info");
  } catch (error) {
    logMessage(error, "error");
  }
};

build();
