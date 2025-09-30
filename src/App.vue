<template>
  <div id="app">
    <header>
      <h1>Vue 3 空白项目</h1>
      <p>欢迎使用 Vue 3 + Vite 构建的项目</p>
    </header>
    
    <main>
      <div class="welcome-card">
        <h2>开始开发</h2>
        <p>这是一个基本的 Vue 3 项目模板，您可以在此基础上开始构建您的应用。</p>
        <button @click="showMessage" class="btn">点击我</button>
        <p v-if="message" class="message">{{ message }}</p>
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const message = ref('')
    
    const showMessage = () => {
      message.value = 'Hello Vue 3! 🎉'
    }
    
    return {
      message,
      showMessage
    }
  }
}
</script>

<style scoped>
#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
}

header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
}

header p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.welcome-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.welcome-card h2 {
  color: #333;
  margin-bottom: 20px;
}

.welcome-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #5a6fd8;
}

.message {
  margin-top: 20px;
  padding: 10px;
  background: #e8f5e8;
  color: #2d5a2d;
  border-radius: 5px;
  font-weight: bold;
}
</style>
