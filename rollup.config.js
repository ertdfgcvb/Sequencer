
import { terser } from 'rollup-plugin-terser';

const production = !(process.env.WATCH);

console.log("production = " + production);

const preamble = `/**
 * Sequencer - A fast(?) fullscreen image-sequence player.
 * See README or visit github (link below) for details.
 * @copyright 2012-20
 * @version 3.0.0b
 * @author Andreas Gysin
 *         https://ertdfgcvb.xyz
 *         https://github.com/ertdfgcvb/Sequencer
 */`

module.exports = {
    input: 'sequencer/sequencer.js',

    plugins: production ? [
        terser({
            output : {
                preamble: preamble
            }
        })
    ] : [],
    output: {
        file: 'dist/sequencer.js',
        format: 'es',
        name : "sequencer"
    },
}
