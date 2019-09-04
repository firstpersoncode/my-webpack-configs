const { clientOnly } = require('./helpers');

if (clientOnly()) {
    require('./build-client');
} else {
    require('./build-ssr');
}
