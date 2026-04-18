<template>
  <div class="register-container">
    <div class="register-header">
      <div class="logo">
        <span class="logo-icon">📍</span>
        <span class="logo-text">点评</span>
      </div>
      <p class="slogan">加入我们，发现更多好店</p>
    </div>
    
    <div class="register-form">
      <h2 class="form-title">注册账号</h2>
      
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
      
      <div class="input-group" :class="{ error: nickNameError }">
        <label>昵称（选填）</label>
        <input 
          type="text" 
          v-model="nickName" 
          placeholder="请输入昵称"
          maxlength="20"
          @blur="validateNickNameField"
        />
        <span class="error-msg" v-if="nickNameError">{{ nickNameError }}</span>
      </div>
      
      <div class="input-group" :class="{ error: passwordError }">
        <label>设置密码</label>
        <input 
          type="password" 
          v-model="password" 
          placeholder="请设置密码（6-20位）"
          @blur="validatePasswordField"
        />
        <span class="error-msg" v-if="passwordError">{{ passwordError }}</span>
      </div>
      
      <div class="input-group" :class="{ error: confirmPasswordError }">
        <label>确认密码</label>
        <input 
          type="password" 
          v-model="confirmPassword" 
          placeholder="请再次输入密码"
          @blur="validateConfirmPasswordField"
        />
        <span class="error-msg" v-if="confirmPasswordError">{{ confirmPasswordError }}</span>
      </div>
      
      <button 
        class="btn btn-primary register-btn" 
        :disabled="!canRegister || loading"
        @click="handleRegister"
      >
        {{ loading ? '注册中...' : '注册' }}
      </button>
      
      <div class="register-footer">
        <span class="footer-text">已有账号？</span>
        <router-link to="/login" class="login-link">立即登录</router-link>
      </div>
      
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

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../api'
import { 
  validatePhone, 
  validateCode, 
  validatePassword, 
  validateConfirmPassword,
  validateNickName
} from '../utils/validate'

const router = useRouter()

const phone = ref('')
const code = ref('')
const nickName = ref('')
const password = ref('')
const confirmPassword = ref('')
const countdown = ref(0)
const showToast = ref(false)
const toastMessage = ref('')
const loading = ref(false)

const phoneError = ref('')
const codeError = ref('')
const nickNameError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const isValidPhone = computed(() => {
  return /^1[3-9]\d{9}$/.test(phone.value)
})

const canSendCode = computed(() => {
  return isValidPhone.value && countdown.value === 0
})

const canRegister = computed(() => {
  if (!isValidPhone.value) return false
  if (code.value.length !== 6) return false
  if (password.value.length < 6 || password.value.length > 20) return false
  if (password.value !== confirmPassword.value) return false
  return true
})

watch(password, () => {
  if (confirmPassword.value) {
    validateConfirmPasswordField()
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

const validateNickNameField = () => {
  const result = validateNickName(nickName.value)
  nickNameError.value = result.valid ? '' : result.message
}

const validatePasswordField = () => {
  const result = validatePassword(password.value)
  passwordError.value = result.valid ? '' : result.message
}

const validateConfirmPasswordField = () => {
  const result = validateConfirmPassword(password.value, confirmPassword.value)
  confirmPasswordError.value = result.valid ? '' : result.message
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

const handleRegister = async () => {
  phoneError.value = ''
  codeError.value = ''
  nickNameError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  
  let hasError = false
  
  const phoneResult = validatePhone(phone.value)
  if (!phoneResult.valid) {
    phoneError.value = phoneResult.message
    hasError = true
  }
  
  const codeResult = validateCode(code.value)
  if (!codeResult.valid) {
    codeError.value = codeResult.message
    hasError = true
  }
  
  if (nickName.value) {
    const nickNameResult = validateNickName(nickName.value)
    if (!nickNameResult.valid) {
      nickNameError.value = nickNameResult.message
      hasError = true
    }
  }
  
  const passwordResult = validatePassword(password.value)
  if (!passwordResult.valid) {
    passwordError.value = passwordResult.message
    hasError = true
  }
  
  const confirmPasswordResult = validateConfirmPassword(password.value, confirmPassword.value)
  if (!confirmPasswordResult.valid) {
    confirmPasswordError.value = confirmPasswordResult.message
    hasError = true
  }
  
  if (hasError) return
  
  loading.value = true
  
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
      showToastMsg('注册成功，请登录')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      showToastMsg(res.errorMsg || '注册失败')
    }
  } catch (error) {
    showToastMsg(error.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f2 0%, #ffe8e0 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.register-header {
  text-align: center;
  padding: 40px 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 32px;
  margin-right: 6px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b35;
}

.slogan {
  font-size: 13px;
  color: #999;
}

.register-form {
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
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

.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.footer-text {
  color: #666;
}

.login-link {
  color: #ff6b35;
  margin-left: 4px;
  font-weight: 500;
}

.agreement {
  text-align: center;
  margin-top: 16px;
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
