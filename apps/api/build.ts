await Bun.build({
  entrypoints: ["src/index.ts"],
  minify: true,
  outdir: "dist",
  sourcemap: true,
  format: "esm",
  target: "bun",
})
