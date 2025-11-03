export function saveToken(token) {
  localStorage.setItem('dc_token', token)
}

export function clearToken() {
  localStorage.removeItem('dc_token')
}
