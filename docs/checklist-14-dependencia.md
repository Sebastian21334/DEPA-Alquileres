# Ítem 14 — Dependencia de merge

**Rama:** `fix/checklist-14-cancelaciones`

Antes de mergear esta rama a `main`, mergear primero el **ítem 11**
(`fix/checklist-11-reservas` y su PR correspondiente).

Motivo: el ítem 14 usa el vencimiento de reservas, `pagoDentroDelPlazo()` y
la conciliación de pagos demorados incorporados en el ítem 11. Esta rama ya
incluye ese merge para poder compilar y probar, pero `main` todavía no lo tiene.

Una vez mergeado el ítem 11, actualizar esta rama con `main` antes de abrir o
mergear el PR del ítem 14.
