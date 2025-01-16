import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import path from "path";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import pkg from "./package.json" assert { type: "json" };

const resolvePath = p => path.resolve(__dirname, p);

export default {
  input: resolvePath(pkg.source),
  output: [
    {
      file: resolvePath(pkg.main),
      format: "cjs",
      sourcemap: true,
    },
    {
      file: resolvePath(pkg.module),
      format: "es",
      sourcemap: true,
    },
  ],
  external: [
    "react",
    "react-dom",
    "@tarojs/components",
    "@tarojs/runtime",
    "@tarojs/taro",
    "@tarojs/react",
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true, // 使用 TypeScript 配置中的声明文件目录
      tsconfigOverride: {
        compilerOptions: {
          declaration: true, // 生成声明文件
          declarationDir: "dist/types", // 声明文件输出目录
        },
      },
    }),
    terser(),
    copy({
      targets: [
        {
          src: "src/styles",
          dest: resolvePath("dist"),
        },
      ],
      verbose: true,
    }),
  ],
};
