# Documentación del Flujo de CI y CD del Frontend

Este documento describe el flujo completo de **Integración Continua (CI)** y **Despliegue Continuo (CD)** configurado para el proyecto frontend utilizando **GitHub Actions**, **AWS S3** y **AWS CloudFront**.

El flujo de CD se ejecuta automáticamente con cada **push o merge a la rama `main`**, mientras que el flujo de CI se ejecuta con **push, merge o pull request a las ramas `main` y `dev`**.

El pipeline consta de dos archivos, uno que cubre la **integración continua (CI)** y otro que cubre el **despliegue continuo (CD)**.

---

# Flujo de Integración Continua (CI)

Archivo: `.github/workflows/frontend-ci.yml`

La CI se ejecuta automáticamente cuando:

* Se abre un **pull request** hacia `main` o `dev`.
* Se realiza un **push** directo a la rama `dev`.

## Objetivos del CI

1. Asegurar que el código compila sin errores.
2. Validar estilo y calidad mediante **ESLint**.
3. Ejecutar pruebas de performance/accesibilidad con **Lighthouse CI**.

## Pasos del pipeline CI

### 1. **Checkout**

Clona el repositorio en el runner.

### 2. **Setup Node**

Configura Node.js versión 20 y habilita cache de npm.

### 3. **Instalación de dependencias**

Se ejecuta `npm ci` para instalación limpia.

### 4. **Linting**

Corre `npm run lint` usando ESLint para validar calidad de código.

### 5. **Build del proyecto**

Ejecuta `npm run build` asegurando que el proyecto compile correctamente.

### 6. **Lighthouse CI**

Se instala Lighthouse globalmente y se ejecuta con la configuración definida en `lighthouserc.json`.

---

# Flujo de Despliegue Continuo (CD)

Archivo: `.github/workflows/deploy-frontend.yml`

El CD se ejecuta automáticamente cuando:

* Se hace **push a la rama `main`**.

## Objetivos del CD

1. Construir el proyecto para producción.
2. Subir el build al bucket S3.
3. Invalidar la caché de CloudFront para reflejar cambios inmediatamente.

## Pasos del pipeline CD

### 1. **Checkout**

Clona el repositorio.

### 2. **Setup Node**

Configura Node.js versión 20 y cachea dependencias.

### 3. **Instalación de dependencias**

`npm ci` para instalar dependencias de forma determinística.

### 4. **Build del proyecto**

`npm run build` para generar la carpeta `dist/`.

### 5. **Configuración de credenciales AWS**

Utiliza `aws-actions/configure-aws-credentials@v4` con los secretos:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_REGION`

### 6. **Sincronización a S3**

Se sube la carpeta `dist/` al bucket S3 configurado en el secreto `S3_BUCKET`.

Incluye `--delete` para eliminar archivos obsoletos.

### 7. **Invalidación de CloudFront**

Se limpia la caché del CDN para garantizar que los usuarios vean la versión actualizada.
Utiliza:

* `CLOUDFRONT_DISTRIBUTION_ID`

---

# Resumen del Flujo Completo

## CI (dev / pull requests)

* Valida calidad de código → ESLint.
* Verifica que construya sin errores.
* Mide performance → Lighthouse.

## CD (main)

* Compila código para producción.
* Sube el build a S3.
* Actualiza CloudFront con invalidación de caché.

---

# Beneficios del Sistema CI/CD

* **Previene errores antes de mergear** gracias al CI.
* **Despliegue automático y consistente** al pushear a `main`.
* **Tiempo real de actualización** gracias a CloudFront.
* **Mejor calidad y performance** gracias a Lighthouse.