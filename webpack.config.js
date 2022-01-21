const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';
    const port = (argv['PORT'] && parseInt(argv['PORT'])) || 3000;

    return {
        entry: './src/index.tsx',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js'
        },
        devtool: isDevelopment ? 'inline-source-map' : 'source-map',
        devServer: {
            host: '0.0.0.0',
            hot: true,
            port,
        },
        module: {
            rules: [
                { 
                    test: /\.tsx?$/,
                    include: path.join(__dirname, 'src'),
                    use: [
                        isDevelopment && {
                            loader: 'babel-loader',
                            options: { plugins: ['react-refresh/babel'] },
                        },
                        {
                            loader: 'ts-loader',
                            options: { transpileOnly: true },
                        },
                    ].filter(Boolean)
                },
                {
                    test: /\.s[ac]ss|css$/,
                    use: [
                        isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                        "@teamsupercell/typings-for-css-modules-loader",
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2,
                                modules: { auto: true }
                            }
                        },
                        'postcss-loader',
                        'sass-loader',
                    ]
                }
            ],
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js"]
        },
        plugins: [
            isDevelopment && new ReactRefreshPlugin(),
            new ForkTsCheckerWebpackPlugin(),
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin(),
            new HtmlWebpackPlugin({
                template: './src/index.html'
            })
        ].filter(Boolean)
    }
}
