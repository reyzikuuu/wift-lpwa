import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({

    plugins: [tailwindcss(), cloudflare()],

    build: {
        // Target browser yang luas
        target: 'es2015',

        // Tidak ada sourcemap di produksi (hemat bandwidth)
        sourcemap: false,

        // CSS dalam satu file — lebih baik untuk single-page landing page
        cssCodeSplit: false,

        // Inline assets kecil (< 4KB) langsung ke HTML — hemat round-trip request
        assetsInlineLimit: 4096,

        rollupOptions: {
            output: {
                // Pisahkan vendor JS agar bisa di-cache browser lebih lama
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor'
                    }
                },
                // Nama file dengan hash untuk cache busting otomatis
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash].[ext]',
            },
        },
    },
})