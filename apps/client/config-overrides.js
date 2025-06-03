const { override, disableEsLint, removeModuleScopePlugin, babelInclude, addBabelPreset, addWebpackModuleRule, addWebpackPlugin, addWebpackResolveAlias, addWebpackExternals } = require('customize-cra');
const path = require('path');

module.exports = override(
  disableEsLint(),
  removeModuleScopePlugin(),
  babelInclude([
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'src/games/game-2048/lib'),
    path.resolve(__dirname, 'src/games/tombala-game/src'),
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
    // remove ESLintWebpackPlugin to fix invalid ESLint options error
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor?.name !== 'ESLintWebpackPlugin'
    );
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
      'game-2048': path.resolve(__dirname, 'src/games/game-2048/lib'),
      'tombala-game': path.resolve(__dirname, 'src/games/tombala-game/src'),
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