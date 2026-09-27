package com.lyriclingo.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.mlkit.common.model.DownloadConditions;
import com.google.mlkit.nl.translate.TranslateLanguage;
import com.google.mlkit.nl.translate.Translation;
import com.google.mlkit.nl.translate.Translator;
import com.google.mlkit.nl.translate.TranslatorOptions;

@CapacitorPlugin(name = "OnDeviceTranslation")
public class OnDeviceTranslationPlugin extends Plugin {
    @PluginMethod
    public void translate(PluginCall call) {
        String text = call.getString("text");
        String sourceTag = call.getString("sourceLanguage");
        String targetTag = call.getString("targetLanguage", "es");

        if (text == null || text.trim().isEmpty()) {
            call.reject("Selecciona una palabra o frase para traducir.");
            return;
        }
        if (sourceTag == null) {
            call.reject("No se indicó el idioma de origen.");
            return;
        }

        String sourceLanguage = TranslateLanguage.fromLanguageTag(sourceTag);
        String targetLanguage = TranslateLanguage.fromLanguageTag(targetTag);
        if (sourceLanguage == null || targetLanguage == null) {
            call.reject("Este idioma todavía no es compatible con la traducción local.");
            return;
        }

        TranslatorOptions options = new TranslatorOptions.Builder()
            .setSourceLanguage(sourceLanguage)
            .setTargetLanguage(targetLanguage)
            .build();
        Translator translator = Translation.getClient(options);
        DownloadConditions conditions = new DownloadConditions.Builder().build();

        translator
            .downloadModelIfNeeded(conditions)
            .addOnSuccessListener(unused ->
                translator
                    .translate(text.trim())
                    .addOnSuccessListener(translatedText -> {
                        JSObject result = new JSObject();
                        result.put("translation", translatedText);
                        call.resolve(result);
                        translator.close();
                    })
                    .addOnFailureListener(error -> {
                        call.reject("No se pudo traducir el texto.", error);
                        translator.close();
                    })
            )
            .addOnFailureListener(error -> {
                call.reject("No se pudo descargar el modelo de idioma. Comprueba tu conexión.", error);
                translator.close();
            });
    }
}
