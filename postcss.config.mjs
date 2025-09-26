if (!process.env.TAILWIND_DISABLE_LIGHTNINGCSS) {
  process.env.TAILWIND_DISABLE_LIGHTNINGCSS = "1";
}

if (!process.env.NEXT_DISABLE_LIGHTNINGCSS) {
  process.env.NEXT_DISABLE_LIGHTNINGCSS = "1";
}

const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
