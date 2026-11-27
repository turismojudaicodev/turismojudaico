-- Guías que aparecen en la confirmación (rta 3) de las plantillas del equipo.
-- El panel los lista para elegir el guía de cada reserva; la confirmación usa el párrafo de ese guía.
-- Faltan los emails (la tabla los pide): completarlos cuando los tengan.
-- Se puede correr más de una vez: no duplica (compara por nombre).
INSERT INTO guides (full_name, email, phone, city, country)
SELECT * FROM (
  SELECT 'Ariela Bodner' AS full_name, '' AS email, '+54 9 11 6145-3344' AS phone, 'Buenos Aires' AS city, 'Argentina' AS country
  UNION ALL SELECT 'Alberto José Cardoso', '', '+55 21 99997-6569', 'Rio de Janeiro', 'Brasil'
  UNION ALL SELECT 'Edith Vidal', '', '+56 9 8528 5219', 'Santiago', 'Chile'
  UNION ALL SELECT 'Oscar Furman', '', '+56 9 8528 5218', 'Santiago', 'Chile'
  UNION ALL SELECT 'Mijael Aviram', '', '+506 8584 6169', 'San José', 'Costa Rica'
  UNION ALL SELECT 'Patricia Abadi', '', '+507 6889-5422', 'Panama', 'Panamá'
  UNION ALL SELECT 'Isaac Lalo', '', '+507 6671-1849', 'Panama', 'Panamá'
  UNION ALL SELECT 'Raquel Schneider', '', '+51 997 881 643', 'Lima', 'Perú'
  UNION ALL SELECT 'José Benaim', '', '+51 972 626 100', 'Lima', 'Perú'
  UNION ALL SELECT 'Marcy Shub', '', '+1 (787) 565-7236', 'San Juan', 'Puerto Rico'
) AS nuevos
WHERE NOT EXISTS (SELECT 1 FROM guides g WHERE g.full_name = nuevos.full_name);
