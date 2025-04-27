const { override, removeModuleScopePlugin, babelInclude, addBabelPreset, addWebpackModuleRule, addWebpackAlias, addLessLoader, fixBabelImports, addWebpackPlugin, addBundleVisualizer } = require('customize-cra');
const path = require('path');

module.exports = override(
  removeModuleScopePlugin(),
  babelInclude([
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, '../games/game_2048/lib'),
  ]),
  addBabelPreset('@babel/preset-typescript'),
  // support .mjs modules in node_modules
  addWebpackModuleRule({
    test: /\.mjs$/,
    include: /[\\/]node_modules[\\/]/,
    type: 'javascript/auto',
  }),
  // disable fullySpecified for all @mui packages to allow extension-less imports
  addWebpackModuleRule({
    test: /\.js$/,
    include: /[\\/]node_modules[\\/]@mui[\\/]/,
    resolve: { fullySpecified: false },
  }),
  // allow extension-less imports in @mui/x-date-pickers
  addWebpackModuleRule({
    test: /\.js$/,
    include: /[\\/]node_modules[\\/]@mui[\\/]x-date-pickers[\\/]/,
    resolve: { fullySpecified: false },
  }),
  (config, env) => {
    config.resolve.extensions.push('.ts', '.tsx');
    // include both local and monorepo root node_modules in resolution
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
    ];
    // alias game modules for CRA resolution
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'game-2048': path.resolve(__dirname, '../games/game_2048/lib'),
    };
    // Preempt default SCSS loaders for game_2048 library
    const oneOfRule = config.module.rules.find(r => Array.isArray(r.oneOf));
    if (oneOfRule) {
      oneOfRule.oneOf.unshift({
        test: /\.scss$/,
        include: path.resolve(__dirname, '../games/game_2048'),
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: { importLoaders: 2 },
          },
          require.resolve('sass-loader'),
        ],
      });
    }
    return config;
  }
);