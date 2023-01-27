const path = require("path");
const fs = require('fs')

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssPresetEnv = require("postcss-preset-env");
const LiveReloadPlugin = require("webpack-livereload-plugin")

const PATHS = {
    src: path.join(__dirname, 'src'),
    dist: path.join(__dirname, 'dist'),
    pages: path.join(__dirname, 'src', 'pages'),
}
const PAGES = fs.readdirSync(PATHS.pages).filter(fileName => fileName.endsWith('.pug'))

const mode = process.env.NODE_ENV || 'development';
const devMode = mode === 'development'
const target = devMode ? 'web' : 'browserslist';
const devtool = devMode ? 'source-map' : undefined;

module.exports = {
    mode,
    target,
    devtool,
    devServer: {
        port: 3000,
        open: true,
        hot: true,
    },
    entry: [
        '@babel/polyfill',
        path.join(PATHS.src, 'index.js'),
    ],
    output: {
        path: PATHS.dist,
        clean: true,
        filename: '[name].[contenthash].js',
        assetModuleFilename: 'assets/[hash][ext]'
    },
    plugins: [
        ...PAGES.map(page => new HtmlWebpackPlugin({
            template: `${PATHS.pages}/${page}`,
            filename: `./${page.replace(/\.pug/i, '.html')}`
        })),
        new LiveReloadPlugin({
            appendScriptTag: true
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.pug$/i,
                loader: 'pug-loader',
            },
            {
                test: /\.(c|sa|sc)ss$/i,
                use: [
                    devMode ? "style-loader" : MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [postcssPresetEnv]
                            }
                        }
                    },
                    "sass-loader",
                ],
            },
            {
                test: /\.(woff|woff2|ttf)/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext]'
                }
            },
            {
                test: /\.(jpeg|jpg|png|webp|gif|svg|ico)/i,
                use: [
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                            },
                            optipng: {
                                enabled: false,
                            },
                            pngquant: {
                                quality: [0.65, 0.90],
                                speed: 4
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            webp: {
                                quality: 75
                            }
                        }
                    },
                ],
                type: 'asset/resource',
            },
            {
                test: /\.m?js$/i,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
        ],
    },
}