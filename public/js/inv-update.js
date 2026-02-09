const form = document.querySelector("#updateForm")
if (form) {
  const updateBtn = form.querySelector("button[type='submit']")
  const initialState = new FormData(form)

  if (updateBtn) {
    updateBtn.setAttribute("disabled", "disabled")
  }

  const isDirty = () => {
    const currentState = new FormData(form)
    for (const [key, value] of currentState.entries()) {
      if (initialState.get(key) !== value) {
        return true
      }
    }
    return false
  }

  form.addEventListener("input", function () {
    if (!updateBtn) return
    if (isDirty()) {
      updateBtn.removeAttribute("disabled")
    } else {
      updateBtn.setAttribute("disabled", "disabled")
    }
  })
}
