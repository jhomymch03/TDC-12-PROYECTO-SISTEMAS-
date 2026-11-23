export function validateContact(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (name.length < 2) return { valid: false, error: 'El nombre debe tener al menos 2 caracteres.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: 'Ingresa un correo válido.' };
  if (message.length < 10) return { valid: false, error: 'El mensaje debe tener al menos 10 caracteres.' };
  return { valid: true, data: { name, email, message } };
}
