import path from 'path';
import webpack from 'webpack';
import memoryfs from 'memory-fs';

const reactHotExportLoader = path.resolve(__dirname, '../../src/loader.js');

export default (fixture, options) => {
  const compiler = webpack({
    context: __dirname,
    mode: 'development',
    entry: fixture,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: options
            ? {
                loader: reactHotExportLoader,
                options: options,
              }
            : reactHotExportLoader,
        },
      ],
    },
  });

  compiler.outputFileSystem = new memoryfs();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(new Error(stats.toJson().errors));

      resolve(stats);
    });
  });
};
