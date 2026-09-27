# LyricLingo

Una app para practicar idiomas a través de canciones de YouTube. Pega el link 
de una canción, agrega la letra, y mientras escuchas vas traduciendo las palabras 
o frases que te confundan. Cada una se convierte automáticamente en una flashcard 
para repasar después con un sistema de repetición espaciada.

## Cómo funciona

1. **Agrega una canción**: pega el link de YouTube y la letra
2. **Estudia mientras escuchas**: selecciona líneas o palabras y agrega tu propia 
   traducción, o pide una traducción automática como apoyo
3. **Genera flashcards**: lo que te confunda se guarda con contexto (la línea original 
   de la canción) para reforzarlo después
4. **Practica**: repasa tus tarjetas con un sistema de repetición espaciada tipo Anki

Usamos estas tecnologías:
- React + TypeScript: interfaz y lógica de la aplicación.
- Vite + TanStack Router: compilación y navegación entre pantallas.
- Tailwind CSS + shadcn/ui: diseño visual y componentes.
- Capacitor: convierte la aplicación web React en una aplicación Android instalable.
- Java: complemento nativo de Android para la traducción.
- SQLite: guarda canciones, tarjetas, traducciones y progreso dentro del teléfono.
- Google ML Kit Translation: traduce palabras localmente; descarga el modelo del idioma la primera vez y no necesita una API key.
- Gradle/Android SDK: genera el archivo APK.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Android

La aplicación móvil usa Capacitor y guarda canciones, letras, tarjetas y repasos
en una base SQLite local del teléfono. No requiere un backend ni una cuenta.

```sh
npm run android:sync
npm run android:open
```

El APK de depuración se genera desde el proyecto `android` con la tarea
`:app:assembleDebug` y queda en `android/app/build/outputs/apk/debug/app-debug.apk`.
