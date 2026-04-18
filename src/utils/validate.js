export function validatePhone(phone) {
  if (!phone) {
    return { valid: false, message: '请输入手机号' }
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { valid: false, message: '请输入正确的手机号' }
  }
  return { valid: true, message: '' }
}

export function validateCode(code) {
  if (!code) {
    return { valid: false, message: '请输入验证码' }
  }
  if (!/^\d{6}$/.test(code)) {
    return { valid: false, message: '验证码为6位数字' }
  }
  return { valid: true, message: '' }
}

export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: '请输入密码' }
  }
  if (password.length < 6) {
    return { valid: false, message: '密码长度不能少于6位' }
  }
  if (password.length > 20) {
    return { valid: false, message: '密码长度不能超过20位' }
  }
  return { valid: true, message: '' }
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return { valid: false, message: '请确认密码' }
  }
  if (password !== confirmPassword) {
    return { valid: false, message: '两次输入的密码不一致' }
  }
  return { valid: true, message: '' }
}

export function validateNickName(nickName) {
  if (nickName && nickName.length > 20) {
    return { valid: false, message: '昵称长度不能超过20个字符' }
  }
  return { valid: true, message: '' }
}
