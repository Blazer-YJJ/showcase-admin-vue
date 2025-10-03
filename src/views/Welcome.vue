<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <div class="welcome-title">
        <h1>欢迎使用管理系统</h1>
      </div>
      <div class="welcome-subtitle">
        <p>请选择您要管理的功能模块</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
  data() {
    return {
    }
  },
  mounted() {
    // 设置页面标题
    document.title = '欢迎 - 管理系统'
  }
}
</script>

<style scoped>
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.welcome-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

.welcome-title h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 300;
  margin: 0 0 1rem 0;
  letter-spacing: 1px;
}

.welcome-subtitle p {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 300;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-title h1 {
    font-size: 2rem;
  }
  
  .welcome-subtitle p {
    font-size: 1rem;
  }
}
</style>
