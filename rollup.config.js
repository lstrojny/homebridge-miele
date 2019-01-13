import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'cjs',
    },
    plugins: [
        resolve({ jsnext: true, main: true }),
        commonjs({
            ignore: ['os'],
        }),
        babel({
            exclude: 'node_modules/**',
        }),
    ],
}
