-- 003: ampliar usuarios.clave para guardar hashes bcrypt (60 caracteres).
-- Opcional pero recomendado. Antes de esto el login acepta las claves en texto plano;
-- después, cada usuario queda con su clave hasheada la próxima vez que entra (no hay que recrear a nadie).
-- OJO: si algún sistema viejo (PHP, etc.) todavía lee `usuarios.clave` en texto plano, deja de funcionar
-- para ese usuario una vez que entra por el panel nuevo.

ALTER TABLE usuarios MODIFY clave VARCHAR(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;

-- Verificación: cuántas claves quedan en texto plano (debería bajar a 0 a medida que entran).
-- SELECT COUNT(*) AS en_texto_plano FROM usuarios WHERE clave NOT LIKE '$2%';
