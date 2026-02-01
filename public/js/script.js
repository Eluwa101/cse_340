// Toggle password visibility (robust lookup + accessibility)
document.addEventListener("click", function (e) {
  if (!e.target.classList.contains("toggle-password")) return

  const btn = e.target
  const form = btn.closest('form')
  if (!form) return

  // find the password input for this form by name or id
  const input = form.querySelector('input[name="account_password"], input#account_password')
  if (!input) return

  const isPassword = input.type === 'password'
  input.type = isPassword ? 'text' : 'password'

  // update button label/icon for clarity and accessibility
  btn.textContent = isPassword ? '🙈' : '👁'
  btn.setAttribute('aria-pressed', String(isPassword))
  btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password')
})
