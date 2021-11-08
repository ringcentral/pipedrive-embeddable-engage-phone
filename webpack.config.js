
const webpack = require('webpack')
const sysConfigDefault = require('./config.default')
const path = require('path')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const AntdDayjsWebpackPlugin = require('@electerm/antd-dayjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const pack = require('./package.json')
const cwd = process.cwd()
const stylusSettingPlugin = new webpack.LoaderOptionsPlugin({
  test: /\.styl$/,
  stylus: {
    preferPathResolver: 'webpack'
  }
})

const from = path.resolve(
  __dirname,
  'node_modules/ringcentral-embeddable-extension-common/src/icons'
)
const to1 = path.resolve(
  __dirname,
  'dist/icons'
)
// const to2 = path.resolve(
//   __dirname,
//   'dist-firefox/icons'
// )
// const f2 = path.resolve(
//   __dirname,
//   'node_modules/jsstore/dist/jsstore.min.js'
// )
const f3 = path.resolve(
  __dirname,
  'node_modules/jsstore/dist/jsstore.worker.min.js'
)
const to4 = path.resolve(
  __dirname,
  'dist'
)
const f31 = path.resolve(
  __dirname,
  'node_modules/react/umd/react.production.min.js'
)
const f32 = path.resolve(
  __dirname,
  'node_modules/react-dom/umd/react-dom.production.min.js'
)
const copyPlugin = new CopyWebpackPlugin({
  patterns: [
    {
      from,
      to: to1,
      force: true
    }, /* {
      from: f2,
      to: to4,
      force: true
    }, */ {
      from: f3,
      to: to4,
      force: true
    }, /* {
      from: f2,
      to: to4f,
      force: true
    }, */
    {
      from: f31,
      to: to4,
      force: true
    },
    {
      from: f32,
      to: to4,
      force: true
    }
  ]
})

const config = {
  mode: 'production',
  entry: {
    content: './src/content.js',
    background: './src/background.js',
    manifest: './src/manifest.json'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: '[name].[hash].js',
    libraryTarget: 'var',
    library: 'Rc'
  },
  resolve: {
    extensions: ['.js', '.json', 'jsx'],
    alias: {
      'antd/dist/antd.less$': path.resolve(__dirname, 'src/lib/antd.less')
    }
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  resolveLoader: {
    modules: [
      path.join(cwd, 'node_modules/ringcentral-embeddable-extension-common/loaders'),
      path.join(cwd, 'node_modules')
    ]
  },
  optimization: {
    minimize: sysConfigDefault.minimize
  },
  module: {
    rules: [
      {
        test: /manifest\.json$|manifest-firefox\.json$/,
        use: [
          'manifest-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules\/(?!(ringcentral-embeddable-extension-common)\/).*/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.(png|jpg|svg)$/,
        use: ['url-loader?limit=10192&name=images/[hash].[ext]']
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    stylusSettingPlugin,
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true
    }),
    copyPlugin,
    new AntdDayjsWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.ringCentralConfigs': JSON.stringify(sysConfigDefault.ringCentralConfigs),
      'process.env.thirdPartyConfigs': JSON.stringify(sysConfigDefault.thirdPartyConfigs),
      'process.env.version': JSON.stringify(pack.version)
    })
  ]
}

module.exports = config
