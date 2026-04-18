<template>
  <div class="register-container">
    <div class="register-header">
      <router-link to="/login" class="back-btn">
        <span class="back-icon">←</span>
      </router-link>
      <h1 class="title">注册账号</h1>
      <div class="placeholder"></div>
    </div>
    
    <div class="register-form">
      <div class="input-group">
        <label>手机号</label>
        <input 
          type="tel" 
          v-model="phone" 
          placeholder="请输入手机号"
          maxlength="11"
        />
      </div>
      
      <div class="input-group code-input-group">
        <label>验证码</label>
        <div class="code-input-wrapper">
          <input 
            type="text" 
            v-model="code" 
            placeholder="请输入验证码"
            maxlength="6"
          />
          <button 
            class="send-code-btn" 
            :disabled="countdown > 0 || !isValidPhone"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </button>
        </div>
      </div>
      
      <div class="input-group">
        <label>昵称</label>
        <input 
          type="text" 
          v-model="nickName" 
          placeholder="请输入昵称（选填）"
          maxlength="20"
        />
      </div>
      
      <div class="input-group">
        <label>设置密码</label>
        <input 
          type="password" 
          v-model="password" 
          placeholder="请设置密码"
        />
      </div>
      
      <div class="input-group">
        <label>确认密码</label>
        <input 
          type="password" 
          v-model="confirmPassword" 
          placeholder="请再次输入密码"
        />
      </div>
      
      <button 
        class="btn btn-primary register-btn" 
        :disabled="!canRegister"
        @click="handleRegister"
      >
        注册
      </button>
      
      <div class="agreement">
        <span class="agreement-text">注册即表示同意</span>
        <span class="agreement-link">用户协议</span>
        <span class="agreement-text">和</span>
        <span class="agreement-link">隐私政策</span>
      </div>
    </div>
    
    <div class="toast" :class="{ show: showToast }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../api'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    
    const phone = ref('')
    const code = ref('')
    const nickName = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const countdown = ref(0)
    const showToast = ref(false)
    const toastMessage = ref('')
    
    const isValidPhone = computed(() => {
      return /^1[3-9]\d{9}$/.test(phone.value)
    })
    
    const canRegister = computed(() => {
      if (!isValidPhone.value) return false
      if (code.value.length !== 6) return false
      if (password.value.length < 1) return false
      if (password.value !== confirmPassword.value) return false
      return true
    })
    
    const showToastMessage = (message) => {
      toastMessage.value = message
      showToast.value = true
      setTimeout(() => {
        showToast.value = false
      }, 2000)
    }
    
    const sendCode = async () => {
      if (!isValidPhone.value) {
        showToastMessage('请输入正确的手机号')
        return
      }
      
      try {
        const res = await userApi.sendCode(phone.value)
        if (res.success) {
          showToastMessage('验证码已发送')
          countdown.value = 60
          const timer = setInterval(() => {
            countdown.value--
            if (countdown.value <= 0) {
              clearInterval(timer)
            }
          }, 1000)
        } else {
          showToastMessage(res.errorMsg || '发送失败')
        }
      } catch (error) {
        showToastMessage('发送失败，请稍后重试')
      }
    }
    
    const handleRegister = async () => {
      if (!canRegister.value) return
      
      const userData = {
        phone: phone.value,
        password: password.value
      }
      
      if (nickName.value) {
        userData.nickName = nickName.value
      }
      
      try {
        const res = await userApi.register(userData)
        
        if (res.success) {
          showToastMessage('注册成功，请登录')
          setTimeout(() => {
            router.push('/login')
          }, 1000)
        } else {
          showToastMessage(res.errorMsg || '注册失败')
        }
      } catch (error) {
        showToastMessage('注册失败，请稍后重试')
      }
    }
    
    return {
      phone,
      code,
      nickName,
      password,
      confirmPassword,
      countdown,
      showToast,
      toastMessage,
      isValidPhone,
      canRegister,
      sendCode,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.placeholder {
  width: 32px;
}

.register-form {
  padding: 20px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fff;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-group input:focus {
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.code-input-group .code-input-wrapper {
  display: flex;
  gap: 12px;
}

.code-input-wrapper input {
  flex: 1;
}

.send-code-btn {
  padding: 14px 16px;
  background-color: #fff5f2;
  color: #ff6b35;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  border: 1px solid #ffccbc;
  transition: all 0.3s;
}

.send-code-btn:hover:not(:disabled) {
  background-color: #ff6b35;
  color: #fff;
}

.send-code-btn:disabled {
  background-color: #f5f5f5;
  color: #999;
  border-color: #e0e0e0;
  cursor: not-allowed;
}

.register-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.register-btn:disabled {
  opacity: 0.6;
}

.agreement {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #999;
}

.agreement-text {
  color: #999;
}

.agreement-link {
  color: #ff6b35;
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.toast.show {
  opacity: 1;
}
</style>
