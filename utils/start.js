const rimraf = require("rimraf");

const paths = require("../utils/paths");
const { clientOnly } = require("./helpers");

rimraf.sync(paths.BUILD_CLIENT);
rimraf.sync(paths.BUILD_SERVER);

if (clientOnly()) {
  require("./start-client");
} else {
  require("./start-ssr");
}
