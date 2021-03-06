const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const config = require('./src/config');
const assetsPluginInstance = new AssetsPlugin({
    filename: './web/assets.json',
    fullPath: false
});

module.exports = (env, argv) => {
    const productionMode = argv.mode === 'production';
    const HOST = argv.api_host || config[argv.mode || 'development'].apiURL;

    return {
        entry: './src/index.js',
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: 'babel-loader' // ['babel-loader', 'eslint-loader'],
                },
                {
                    test: /\.(css|scss)$/,
                    use: [
                        'css-hot-loader',
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [ {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/images/[hash].[ext]'
                        }
                    }, {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true
                        }
                    } ]
                },
                {
                    test: /\.(ttf|eot|woff|woff2)$/,
                    loader: 'file-loader',
                    options: {
                        name: 'assets/fonts/[name].[ext]'
                    }
                }
            ]
        },
        resolve: {
            extensions: [ '.js', '.jsx' ],
            alias: {
                '@assets': path.join(__dirname, './src/assets'),
                '@const': path.join(__dirname, './src/constants'),
                '@helpers': path.join(__dirname, './src/helpers'),
                '@services': path.join(__dirname, './src/services'),
                '@styles': path.join(__dirname, './src/assets/styles'),
                '@redux': path.join(__dirname, './src/redux'),
                '@components': path.join(__dirname, './src/components')
            }
        },
        output: {
            path: path.join(__dirname, 'web'),
            publicPath: '/',
            filename: `bundle${argv.mode === 'production' ? '-[hash]' : ''}.js`
        },
        plugins: [
            new CleanWebpackPlugin('web', {
                exclude: [
                    'index.php',
                    'manifest.json',
                    'OneSignalSDKUpdaterWorker.js',
                    'OneSignalSDKWorker.js'
                ]
            }),
            new webpack.HotModuleReplacementPlugin(),
            new MiniCssExtractPlugin({ filename: `styles${productionMode ? '-[hash]' : ''}.css` }),
            new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify(argv.mode), HOST: JSON.stringify(HOST) } }),
            new HtmlWebpackPlugin({
                inject: 'body',
                hash: true,
                template: './src/index.html',
                filename: 'index.html'
            }),
            new CopyWebpackPlugin([
                { from: './src/assets/img/favicons/', to: `${__dirname}/web/favicons/` },
                { from: './node_modules/tinymce/skins', to: `${__dirname}/web/skins/` },
                { from: './node_modules/tinymce/icons', to: `${__dirname}/web/icons/` }
            ]),
            new webpack.ProvidePlugin({
                'window._': 'lodash',
                '_': 'lodash',
                'window.moment': 'moment',
                'moment': 'moment',
                'Bem': 'react-bem-helper'
            }),
            assetsPluginInstance
        ],
        devtool: productionMode ? 'source-map' : 'eval',
        devServer: {
            headers: { 'Access-Control-Allow-Origin': '*' },
            contentBase: path.join(__dirname, 'web'),
            hot: true,
            port: 5001,
            historyApiFallback: true,
            quiet: true,
            clientLogLevel: 'error'
        }
    };
};
