import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from "@rollup/plugin-commonjs"
import { terser } from "rollup-plugin-terser";

const pkg = require("./package.json");

const name = "leaflet-multi-map";
const banner = `/* @preserve
 * Leaflet Multi Map Plugin v${pkg.version}, a Leaflet plugin that allows you to treat multiple maps as one.
 * (c) 2020 David Southgate 
 */`;


const commonOutput = {
    name: name,
    banner: banner,
    indent: true,
    sourcemap: true
};

export default {
    input: `src/index.js`,
    output: [
        {
            ...commonOutput,
            format: "umd",
            file: `dist/${name}.js`,
        },
        {
            ...commonOutput,
            format: "umd",
            file: `dist/${name}.min.js`,
            plugins: [terser()]
        },
        {
            ...commonOutput,
            format: "es",
            file: `dist/${name}.esm.js`,
        }
    ],
    plugins: [
        commonjs(),
        nodeResolve()
    ],
    external: []
};
