import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,  // 修改为您想要的端口号
    open: true,
    host: '0.0.0.0'  // 允许外部访问
  }
})
