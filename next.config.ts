import type { NextConfig } from "next";

// Disable Lightning CSS so builds don't depend on optional native bindings that
// are unavailable in some deployment environments (e.g. CI containers).
process.env.TAILWIND_DISABLE_LIGHTNINGCSS ??= "1";
process.env.NEXT_DISABLE_LIGHTNINGCSS ??= "1";

const nextConfig: NextConfig = {};

export default nextConfig;
