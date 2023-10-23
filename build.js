const esbuild = require("esbuild");
const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const chokidar = require('chokidar');
const { sassPlugin } = require('esbuild-sass-plugin');

const isWatch = process.argv.includes("--watch");
const isClean = process.argv.includes("--clean");
const isProduction = process.argv.includes("--prod");

const setup = async () => {
    await fs.emptyDir("./dist");
    await fs.ensureDir("./dist/assets");
    await fs.copy("./static", "./dist/static");
    const htmlFiles = await fs.readdir(".", "utf-8");
    for (const file of htmlFiles) {
        if (path.extname(file) === ".html") {
            await fs.copy(file, path.join("./dist", file));
        }
    }
};

const build = async () => {
    const esbuild_flags = {
        bundle: true,
        splitting: true,
        format: "esm",
        external: ["*.woff2"],
        outdir: "./dist/assets",
        minify: isProduction,
        plugins: [sassPlugin()],
    };

    const files = glob.sync('./src/**/*.{js,css,scss,sass}');

    await esbuild.build({
        ...esbuild_flags,
        entryPoints: files,
    });
};


const watch = () => {
    console.log("Watching for changes...");

    const watcher = chokidar.watch(['./src/**/*.{js,scss,html}', './*.html'], {
        ignored: /(^|[\/\\])\../,  // ignore dotfiles
        persistent: true
    });

    watcher.on('change', async (path) => {
        console.log(`File changed: ${path}. Rebuilding...`);
        await run();
    });
};


const run = async () => {
    if (isClean) {
        await fs.emptyDir("./dist");
        console.log("Cleaned ./dist directory.");
        return;
    }

    await setup();
    await build();
};

if (isWatch) {
    // If the --watch flag is provided, start in watch mode
    run().then(watch).catch(error => {
        console.error(error);
        process.exit(1);
    });
} else {
    // Otherwise, just run the build once
    run().catch(error => {
        console.error(error);
        process.exit(1);
    });
}
