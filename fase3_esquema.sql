-- =================================================================================
-- FASE 3: ESCALABILIDAD (Configuración dinámica)
-- Instrucciones: Ejecuta este script en el SQL Editor de Supabase
-- =================================================================================
-- Agrega la columna de configuración de habitaciones a la tabla sectors
ALTER TABLE sectors
ADD COLUMN IF NOT EXISTS room_config JSONB;
-- Ejemplo opcional de cómo asignar habitaciones (puedes ejecutarlo para probar):
UPDATE sectors
SET room_config = '["121", "122", "123", "124", "125" , "126", "127", "2" , "3" , "4" , "5" , "6" , "7" , "8" , "9", "10"]'::jsonb
WHERE name = 'Guardia';
UPDATE sectors
SET room_config = '["QX 1", "QX 2", "501", "502", "503", "504", "505", "506", "507", "508"]'::jsonb
WHERE name = 'Piso 5';
UPDATE sectors
SET room_config = '["401", "402", "403" , "404" , "405" , "406" , "407" , "408" , "409" , "410" , "411" , "412" , "413" , "414" , "415" , "416", "417", "418", "419", "420", "421" , "422" , "423" , "424"]'::jsonb
WHERE name = 'Piso 4';
UPDATE sectors
SET room_config = '["Qx 1", "Qx 2", "Qx 3", "Qx 4", "Qx 5", "Qx 6", "Qx 7", "Qx 8", "Qx 9", "Qx 10", "Qx 11", "Qx 12"]'::jsonb
WHERE name = 'Quirófano';
UPDATE sectors
SET room_config = '["701", "702", "703", "704", "705", "706", "707", "708", "709", "710", "711", "712", "713", "714", "715", "716", "717", "718", "719", "720", "721", "722", "723", "724"]'::jsonb
WHERE name = 'Piso 7';
UPDATE sectors
SET room_config = '["801", "802", "803", "804", "805", "806", "807", "808", "809", "810", "811", "812", "813", "814", "815", "816", "817", "818", "819", "820", "821", "822", "823", "824"]'::jsonb
WHERE name = 'Piso 8';
UPDATE sectors
SET room_config = '["901", "902", "903", "904", "905", "906", "907", "908", "909", "910", "911", "912", "913", "914", "915", "916", "917", "918", "919", "920", "921", "922", "923", "924"]'::jsonb
WHERE name = 'Piso 9';
UPDATE sectors
SET room_config = '["1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008", "1009", "1010", "1011", "1012", "1013", "1014", "1015", "1016", "1017", "1018", "1019", "1020", "1021", "1022", "1023", "1024"]'::jsonb
WHERE name = 'Piso 10';