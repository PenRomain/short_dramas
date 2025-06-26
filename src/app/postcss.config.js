const path = require("path");

module.exports = {
  plugins: {
    "postcss-mixins": {
      mixinsFiles: path.resolve(__dirname, "mixins.css"),
    },
    "postcss-nested": {},
    "postcss-flexbugs-fixes": {},
    "postcss-preset-env": {
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 3,
      features: {
        "custom-properties": false,
      },
    },
  },
};
