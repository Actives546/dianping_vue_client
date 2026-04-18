<template>
  <div class="login-container">
    <div class="login-header">
      <div class="logo">
        <span class="logo-icon">📍</span>
        <span class="logo-text">点评</span>
      </div>
      <p class="slogan">发现身边好店</p>
    </div>
    
    <div class="login-form">
      <div class="login-tabs">
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'code' }"
          @click="loginType = 'code'"
        >
          验证码登录
        </div>
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'password' }"
          @click="loginType = 'password'"
        >
          密码登录
        </div>
      </div>
      
      <div class="input-group" :class="{ error: phoneError }">
        <label>手机号</label>
        <input 
          type="tel" 
          v-model="phone" 
          placeholder="请输入手机号"
          maxlength="11"
          @blur="validatePhoneField"
        />
        <span class="error-msg" v-if="phoneError">{{ phoneError }}</span>
      </div>
      
      <template v-if="loginType === 'code'">
        <div class="input-group code-input-group" :class="{ error: codeError }">
          <label>验证码</label>
          <div class="code-input-wrapper">
            <input 
              type="text" 
              v-model="code" 
              placeholder="请输入验证码"
              maxlength="6"
              @blur="validateCodeField"
            />
            <button 
              class="send-code-btn" 
              :disabled="countdown > 0 || !canSendCode"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </div>
          <span class="error-msg" v-if="codeError">{{ codeError }}</span>
        </div>
      </template>
      
      <template v-else>
        <div class="input-group" :class="{ error: passwordError }">
          <label>密码</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="请输入密码"
            @blur="validatePasswordField"
          />
          <span class="error-msg" v-if="passwordError">{{ passwordError }}</span>
        </div>
      </template>
      
      <button 
        class="btn btn-primary login-btn" 
        :disabled="!canLogin || loading"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
      
      <div class="login-footer">
        <span class="footer-text">还没有账号？</span>
        <router-link to="/register" class="register-link">立即注册</router-link>
      </div>
    </div>
    
    <div class="toast" :class="{ show: showToast }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../api'
import { setToken } from '../utils/auth'
import { validatePhone, validateCode, validatePassword } from '../utils/validate'

const router = useRouter()

const loginType = ref('code')
const phone = ref('')
const code = ref('')
const password = ref('')
const countdown = ref(0)
const showToast = ref(false)
const toastMessage = ref('')
const loading = ref(false)

const phoneError = ref('')
const codeError = ref('')
const passwordError = ref('')

const isValidPhone = computed(() => {
  return /^1[3-9]\d{9}$/.test(phone.value)
})

const canSendCode = computed(() => {
  return isValidPhone.value && countdown.value === 0
})

const canLogin = computed(() => {
  if (!isValidPhone.value) return false
  if (loginType.value === 'code') {
    return code.value.length === 6
  } else {
    return password.value.length >= 6
  }
})

const showToastMsg = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const validatePhoneField = () => {
  const result = validatePhone(phone.value)
  phoneError.value = result.valid ? '' : result.message
}

const validateCodeField = () => {
  const result = validateCode(code.value)
  codeError.value = result.valid ? '' : result.message
}

const validatePasswordField = () => {
  const result = validatePassword(password.value)
  passwordError.value = result.valid ? '' : result.message
}

const handleSendCode = async () => {
  if (!isValidPhone.value) {
    phoneError.value = '请输入正确的手机号'
    return
  }
  
  phoneError.value = ''
  
  try {
    const res = await userApi.sendCode(phone.value)
    if (res.success) {
      showToastMsg('验证码已发送')
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      showToastMsg(res.errorMsg || '发送失败')
    }
  } catch (error) {
    showToastMsg(error.message || '发送失败，请稍后重试')
  }
}

const handleLogin = async () => {
  phoneError.value = ''
  codeError.value = ''
  passwordError.value = ''
  
  let hasError = false
  
  const phoneResult = validatePhone(phone.value)
  if (!phoneResult.valid) {
    phoneError.value = phoneResult.message
    hasError = true
  }
  
  if (loginType.value === 'code') {
    const codeResult = validateCode(code.value)
    if (!codeResult.valid) {
      codeError.value = codeResult.message
      hasError = true
    }
  } else {
    const passwordResult = validatePassword(password.value)
    if (!passwordResult.valid) {
      passwordError.value = passwordResult.message
      hasError = true
    }
  }
  
  if (hasError) return
  
  loading.value = true
  
  try {
    const res = await userApi.login(
      phone.value,
      loginType.value === 'code' ? code.value : null,
      loginType.value === 'password' ? password.value : null
    )
    
    if (res.success) {
      setToken(res.data)
      showToastMsg('登录成功')
      setTimeout(() => {
        router.push('/home')
      }, 1000)
    } else {
      showToastMsg(res.errorMsg || '登录失败')
    }
  } catch (error) {
    showToastMsg(error.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f2 0%, #ffe8e0 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  padding: 60px 0 40px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 36px;
  margin-right: 8px;
}

.logo-text {
  font-size: 28px;
  font-weight: bold;
  color: #ff6b35;
}

.slogan {
  font-size: 14px;
  color: #999;
}

.login-form {
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.login-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding-bottom: 12px;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: #ff6b35;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background-color: #ff6b35;
  border-radius: 1px;
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
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-group input:focus {
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.input-group.error input {
  border-color: #ff4757;
}

.error-msg {
  display: block;
  font-size: 12px;
  color: #ff4757;
  margin-top: 4px;
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

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.login-btn:disabled {
  opacity: 0.6;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
}

.footer-text {
  color: #666;
}

.register-link {
  color: #ff6b35;
  margin-left: 4px;
  font-weight: 500;
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
