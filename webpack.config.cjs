const glob = require("glob");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const CopyPlugin = require("copy-webpack-plugin");
const siteData = require("./src/data/global.json");

const getSitePages = () => [
    { name: 'index', chunk: 'index' },
    { name: 'works', chunk: 'works/index' },
];

const getScripts = () => {
  const files = [
    ...glob.sync("src/assets/scripts/*.js"),
    ...glob.sync("src/assets/scripts/modules/*.js"),
    ...glob.sync("src/assets/styles/*.scss"),
  ];
  const entries = files.reduce((entries, file) => {
    const name = path.basename(file, path.extname(file));
    entries[name] = path.resolve(__dirname, file);
    return entries;
  }, {});

  return entries;
};

const getConfig = (env, argv) => {
    return {
        mode: argv.mode,
        entry: {
            ...getScripts()
        },
        output: {
            filename: "assets/scripts/[name].min.js",
        },
        resolve: {
            preferRelative: true,
            extensions: ['.js'],
            alias: {
                "@scripts": path.resolve(__dirname, "src/assets/scripts/"),
                "@styles":  path.resolve(__dirname, "src/assets/styles"),
                "@modules": path.resolve(__dirname, "src/assets/scripts/modules"),
            }
        },
        module: {
            rules: [
                {
                    test: /\.s[ca]ss$/i,
                    use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
                },
                {
                    test: /\.njk$/i,
                    use: [
                        {
                            loader: 'html-loader',
                            options: {
                                sources: false
                            }
                        },
                        {
                            loader: 'nunjucks-html-loader',
                            options: {
                                searchPaths: [path.resolve(__dirname, 'src')],
                                context: siteData
                            }
                        }
                    ]
                },
                {
                    test: /\.(png|jpe?g|gif|svg|webp|avif|ico)$/i,
                    type: 'asset/resource'
                }
            ],
        },
        plugins: [
            new RemoveEmptyScriptsPlugin(),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "src/assets/media"),
                        to: "assets/media"
                    }
                ]
            }),
            ...getSitePages().map(page => new HtmlWebpackPlugin({
                template: `./src/pages/${page.name}.njk`,
                filename: `${page.chunk}.html`
            })),
            new MiniCssExtractPlugin({
                filename: "assets/styles/[name].min.css"
            })
        ]
    }
}

module.exports = getConfig;
