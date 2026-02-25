module.exports = {
  webpack: {
    configure: (config) => {
      config.ignoreWarnings = [
        {
          module: /react-datepicker/,
          message: /Critical dependency/,
        },
      ];
      return config;
    },
  },
};