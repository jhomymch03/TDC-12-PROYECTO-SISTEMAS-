import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact } from '../../server/validators.js';

test('acepta un mensaje de contacto válido y limpia espacios', () => {
  assert.deepEqual(validateContact({ name: '  Ana  ', email: 'ana@example.com', message: '  Hola, conversemos.  ' }), { valid: true, data: { name: 'Ana', email: 'ana@example.com', message: 'Hola, conversemos.' } });
});
test('rechaza un nombre demasiado corto', () => {
  assert.equal(validateContact({ name: 'A', email: 'ana@example.com', message: 'Mensaje suficientemente largo' }).valid, false);
});
test('rechaza correo inválido y mensaje corto', () => {
  assert.equal(validateContact({ name: 'Ana', email: 'correo', message: 'hola' }).valid, false);
});