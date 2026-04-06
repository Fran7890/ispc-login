# Django Backend API

API backend con Django REST Framework + JWT + PostgreSQL.

Incluye soporte CORS con django-cors-headers para integración con frontend Angular.

## Requisitos

- Python 3.13+ (o superior)
- PostgreSQL
- Virtual environment (recomendado)
- django-cors-headers (se instala automáticamente con requirements.txt)

## Instalación rápida

```powershell
cd d:\ISPC\ProgramacionIII\ISPC-ProgIII
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Configurar PostgreSQL

Edita `backend/settings.py` si tu usuario/password/host/puerto difieren:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'backend_db',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Crea la base de datos si no existe:

```powershell
psql -U postgres -c "CREATE DATABASE backend_db;"
```

## Migraciones

```powershell
python manage.py makemigrations
python manage.py migrate
```

## Ejecutar servidor

```powershell
python manage.py runserver
```

## Endpoints

### POST `/api/register/`

Body JSON:

```json
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "Testpass123"
}
```

Respuesta (201):

```json
{
  "username": "user1",
  "email": "user1@example.com"
}
```

### POST `/api/login/`

Body JSON:

```json
{
  "username": "user1",
  "password": "Testpass123"
}
```

Respuesta (200):

```json
{
  "refresh": "...",
  "access": "...",
  "user": {
    "id": 1,
    "username": "user1",
    "email": "user1@example.com"
  }
}
```

### Autenticación en APIs protegidas

Enviar header:

```
Authorization: Bearer <access token>
```

## Pruebas (tests)

```powershell
python manage.py test
```

## Notas de seguridad

- La contraseña se guarda como hash seguro (PBKDF2 por defecto).
- La app también usa `django-encrypted-model-fields` para campos sensibles.
- El backend permite solicitudes CORS desde Angular (`localhost:4200`) usando django-cors-headers.

## Estructura de carpetas

- `manage.py` — comandos Django
- `backend/` — configuración del proyecto
- `accounts/` — app con auth/registro/login
- `accounts/tests.py` — tests automáticos

## Para Angular

1) Registrar
2) Loguear y guardar `access`
3) Enviar `Authorization: Bearer <access>` en cada request

Implementación para los nuevos usuarios que tiene que validar su cuenta por primera vez al registarse si no no les deja ingresar:

1. Flujo de Registro y Activación (User Journey A)
Este paso comprueba que nadie pueda entrar al sistema sin validar su identidad primero.

Paso 1.1: Registro de usuario

Endpoint: POST http://localhost:8000/api/register/

Body:  {
    "username": "juan", 
    "email": "juan@gmail.com", 
    "password": "juan123"
    
  }

Qué mirar: En la consola de Django, buscá el mensaje --- VERIFICACIÓN DE CUENTA --- y copiá el código de 6 dígitos.

Paso 1.2: Intento de Login fallido (Prueba de seguridad) esto se puede hacer desde el login de la web 

Endpoint: POST /api/login/

Body: {"username": "juan", "password": "juan123"}

Qué mirar: Debería devolver un error (401 o similar) porque el usuario tiene is_active = False. Esto demuestra que la protección funciona.

Paso 1.3: Verificación de cuenta

Endpoint: POST /api/verify-account/

Body:   {
    "email": "juan@gmail.com", 
    "otp": "815861"
    
  }

Qué mirar: Debería responder "Cuenta activada con éxito".

Paso 1.4: Login exitoso

Repetí el Paso 1.2. Ahora sí deberías recibir los tokens JWT (access y refresh).






Implementación del OTP en la contraseña para cambiar la contraseña si se te olvidó: 

¡Buenísimo! Vamos por partes: primero te explico cómo testearlo (usando Postman o Insomnia) y después te doy la "letra" para que luzcas como un experto cuando te pregunten qué hiciste.

🛠 Cómo comprobar el funcionamiento
Como el TP pide que el código se imprima en consola, vas a tener que estar atento a la terminal donde corre el servidor (python manage.py runserver).

Paso 1: Pedir el OTP
Método: POST

URL: http://127.0.0.1:8000/api/request-otp/

Body (JSON):

JSON
{ "email": "tomas@test.com" }
Resultado: En tu terminal de VS Code o CMD debería aparecer: --- DEBUG OTP --- Código Generado: 123456.

Paso 2: Verificar el OTP
Método: POST

URL: http://127.0.0.1:8000/api/verify-otp/

Body (JSON):

JSON
{ 
  "email": "tomas@test.com",
  "otp": "123456" 
}
Resultado: Deberías recibir un 200 OK con el mensaje de éxito. Esto internamente marca el registro en la DB como is_verified = True.

Paso 3: Cambiar la contraseña
Método: POST

URL: http://127.0.0.1:8000/api/reset-password/

Body (JSON):

JSON
{ 
  "email": "tomas@test.com",
  "new_password": "NuevaPassword123" 
}
Resultado: El servidor busca el OTP verificado, cambia la contraseña del usuario y borra el registro de OTP para que no se pueda usar de nuevo.

🧠 Explicación técnica (para el profesor)
Si te preguntan qué hiciste en las views, podés explicarlo así dividiéndolo en los tres pilares:

1. RequestOTPView (Generación)
Lógica: Buscamos al usuario por su email. Si existe, creamos una instancia del modelo OTP.

Punto clave: Antes de crear uno nuevo, limpiamos los códigos anteriores del mismo usuario para evitar duplicados. Generamos un código aleatorio de 6 dígitos y, como pide el TP, lo mandamos a la consola (simulando un envío de mail).

2. VerifyOTPView (Validación de Identidad)
Lógica: Aquí comparamos el código que mandó el usuario con el que tenemos en la base de datos vinculado a ese email.

Seguridad: Agregamos una validación de tiempo. Si el código tiene más de 10 minutos de antigüedad, lo rebotamos por seguridad. Si es correcto, cambiamos el estado del registro a is_verified = True.

3. ResetPasswordView (Persistencia y Seguridad)
Lógica: Esta es la parte más importante. La vista busca un registro de OTP que ya esté marcado como verificado (is_verified=True).

Seguridad Extra: Si alguien intenta entrar a esta URL directamente sin haber pasado por el paso 2, el sistema le dará un error (403 Forbidden).

Finalización: Usamos el método user.set_password() (que se encarga de hashear la contraseña para que no sea texto plano en la DB) y finalmente eliminamos el registro de OTP para que el flujo sea de "un solo uso".

Resumen para decir en voz alta:

"Implementamos un flujo de recuperación en tres etapas basado en un modelo intermedio OTP. Usamos vistas basadas en clases (APIView) para manejar la lógica de negocio, asegurándonos de que el proceso sea atómico: primero se genera, luego se valida con un estado booleano de seguridad, y finalmente se aplica el cambio de contraseña eliminando los rastros del código temporal."

