# Documentación del Pipeline CI/CD para Frontend

El pipeline de CI/CD del **frontend** está definido en **GitHub Actions** y tiene como objetivo automatizar completamente el proceso de construcción y despliegue del sitio en producción.  
Cada cambio aprobado en la rama principal se construye y publica automáticamente en **Amazon S3**, actualizando el contenido servido por **CloudFront**.

El flujo se ejecuta automáticamente con cada **push o merge a la rama `main`**.

El pipeline consta de un único job principal: `deploy`, que cubre tanto la **integración continua (CI)** como el **despliegue continuo (CD)**.

---

## 1. Job: `deploy`

**Objetivo:**  
Construir el frontend con Vite y desplegar automáticamente los archivos generados en el bucket S3 utilizado por la aplicación en producción, invalidando el caché de CloudFront para reflejar los cambios inmediatamente.

**Steps del job:**

1. **Checkout Code**

   * Acción: `actions/checkout@v4`  
   * Función: Clona el repositorio para acceder al código fuente del frontend.

2. **Set Up Node.js**

   * Acción: `actions/setup-node@v4`  
   * Función: Configura Node.js versión 20 y cachea las dependencias para acelerar futuras ejecuciones.

3. **Install Dependencies**

   * Comando: `npm ci`  
   * Función: Instala las dependencias del proyecto de manera limpia y reproducible.

4. **Build Frontend**

   * Comando: `npm run build`  
   * Función: Genera los archivos estáticos de producción en el directorio `dist/` mediante Vite.

5. **Configure AWS credentials**

   * Acción: `aws-actions/configure-aws-credentials@v4`  
   * Función: Configura las credenciales de AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`) almacenadas en los *secrets* de GitHub para autorizar la publicación en S3 y la invalidación de CloudFront.

6. **Sync to S3**

   * Función: Sincroniza el contenido del directorio `dist/` con el bucket S3 de producción.  

     La opción `--delete` elimina del bucket los archivos que ya no existen en el build actual, asegurando consistencia total.

7. **Invalidate CloudFront Cache**

     ```
   * Función: Limpia la caché de la distribución de CloudFront asociada al sitio, permitiendo que los usuarios vean la versión más reciente de la aplicación. Tal como se realizaba cuando se subia el dist manualmente.
---

## 2. Propósito general

* Automatizar completamente el flujo de **construcción y despliegue del frontend**.  
* Replicar los pasos manuales de deploy mediante comandos del **AWS CLI**.  
* Asegurar que **cualquier cambio en `main`** se refleje inmediatamente en producción (S3 + CloudFront).  
* Mantener el sitio siempre actualizado.

