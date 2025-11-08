import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const PRIVY_PURE_FIX: Plugin = {
  name: 'privy-pure-annotation-fix',
  enforce: 'pre',
  transform(code, id) {
    if (!code.includes('/*#__PURE__*/')) return null
    const normalized = id.replace(/\\/g, '/')
    if (!normalized.includes('/node_modules/')) return null
    const cleaned = code.replace(/\/\*#__PURE__\*\/\s*/g, '')
    return cleaned === code ? null : { code: cleaned, map: null }
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), PRIVY_PURE_FIX],
})
