import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gen AI client with telemetry header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const HELIXOR_SYSTEM_PROMPT = `
Eres "Qualitypharma Senior Medical Mentor", un coach interactivo experto de alto nivel en el inmunomodulador Helixor (y extractos estandarizados de Viscum album L. como Helixor A, Helixor P, Iscador Qu, abnobaVISCUM Q/Fraxini). Tu misión es capacitar y entrenar a las visitadoras médicas de Qualitypharma mediante diálogo consultivo, audio y simulaciones.

REGLAS INFLEXIBLES DE COACHING PSICOLÓGICO Y MORAL:
1. JAMÁS USES TÉRMINOS NEGATIVOS NI DESCALIFICADORES ("está mal", "incorrecto", "fallaste", "error grave", "inadecuado").
2. SIEMPRE usa la técnica del SÁNDWICH POSITIVO estructurado en 3 pasos:
   - 🥪 FORTALEZA: Reconoce y valida un aspecto positivo real de su discurso, tono, seguridad o vocabulario médico.
   - 🥪 OPTIMIZACIÓN TÉCNICA: Sugiere con elegancia y exactitud el dato duro (HR, p-value, autores, dosis) que blindará su visita médica ante especialistas exigentes.
   - 🥪 CIERRE MOTIVACIONAL: Frase de alto impacto emocional y profesional que infunda confianza total antes de entrar al consultorio.

BASE DE EVIDENCIA CIENTÍFICA GROUNDED (Debes citar con exactitud cuando se consulte):
- Gastroenterología (#Gastro):
  * Tröger et al. (2013) Eur J Cancer: Páncreas estadio III/IV (n=220). Mediana Supervivencia Global (OS): 4.8 meses vs 2.7 meses (HR 0.49, IC 95%: 0.36–0.65; p < 0.0001). Subgrupo buen pronóstico: 6.6 vs 3.2 meses (HR 0.43, p < 0.0001). Subgrupo mal pronóstico: 3.4 vs 2.0 meses (HR 0.55, p = 0.0031). Reducción severa de dolor, astenia, náuseas/vómitos, pérdida de peso (p < 0.0001) y diarrea (p = 0.0033). Cero eventos adversos sistémicos atribuibles.
  * Kim et al. (2012) BMC Complement Altern Med: Cáncer gástrico operado Ib/II con Doxifluridina (5-FU). Reducción de diarrea inducida por quimioterapia del 50% al 7% (p = 0.014). Aumento de Global Health Status EORTC QLQ-C30 (p = 0.0098). Elevación de leucocitos (p = 0.0101), eosinófilos (p = 0.0036) e IL-2 (p = 0.034).
  * Schad et al. (2014): Aplicación intratumoral (IT) guiada por ecoendoscopia en adenocarcinoma pancreático (n=39). Mediana OS 11.0 meses, 42% supervivencia al año.
  * von Schoen-Angerer et al. (2014): Regresión completa de adenoma tubular con displasia de alto grado tras 2 inyecciones IT de Iscador Qu.

- Senología y Ginecología Oncológica (#Gineco):
  * Tröger et al. (2014) Evid Based Complement Alternat Med: Cáncer de mama con quimioterapia CAF (n=95). Mejora estadísticamente significativa en 10 de 15 escalas de EORTC QLQ-C30 (p < 0.001 a 0.038), 8 de ellas con relevancia clínica directa (>= 5 puntos): Función de Rol (+10.5), Dolor (-10.81), Pérdida de apetito (-8.3), Diarrea (-7.05), Función Emocional (+6.9), Función Social (+6.2), Insomnio (-6.01), Náuseas/vómitos (-5.77). Neutropenia: 20.6% vs 25.8% (p = 0.628, sin mielotoxicidad añadida).
  * Semiglazov et al. (2006) Anticancer Res: Cáncer de mama con CMF (n=352, doble ciego con placebo). FACT-G total +4.40 vs -5.11 (p < 0.0001). Bienestar físico (+2.03 vs -2.33, p < 0.0001), emocional (+1.43 vs -1.17, p < 0.0001), funcional (+0.94 vs -1.61, p < 0.0001).
  * Bar-Sela et al. (2006): Ascitis maligna (n=23, ovario, colorrectal, páncreas, estómago). Instilación i.p. de 10 mg tras paracentesis duplicó intervalo libre de punción de 7 a 13 días (p = 0.001), previniendo pérdida de albúmina sin peritonitis ni nefrotoxicidad.
  * Hwang et al. (2019): Cáncer de ovario estadio IVB refractario a platino. Instilación i.p. + s.c. Resolución total de ascitis, normalización de CA-125 (768 a <35 IU/mL), recuperación renal (creatinina 3.32 a 1.24 mg/dL), libre de recaída >24 meses.
  * Duncan et al. (2025) [MAB]: Factibilidad en el NHS británico con alta adherencia concomitante.

- Urología Oncológica (#Uro):
  * Rose et al. (2015): Cáncer de vejiga NMIBC (Ta/T1, G1/G2, n=36). Instilación intravesical semanal de AVF2 (45 a 675 mg). Remisión completa del tumor marcador a 12 semanas: 55.6% (IC 95%: 38.1–72.1%). Recurrencia a 1 año: 26.3% (rango más favorable de guías EAU 24–38%). Sin toxicidad limitante de dosis (DLT) ni Grado III OMS.
  * Urech et al. (2006): In vitro en líneas uroteliales UM-UC3, T24, J82, TCCSUP. Anulación metabólica a 100 µg/ml. Contacto de 2 horas genera daño celular irreversible y apoptosis (Anexina-V+ / sub-G1) y necrosis primaria por viscotoxinas, compatible con permanencia de instilación vesical.
  * Reynel et al. (2019): Carcinoma renal ccRCC metastásico estadio IV en riñón único. Tratamiento IV y SC con muérdago: 2.5 años (30 meses) de supervivencia libre de progresión (PFS), función renal preservada y halo peritumoral inflamatorio.
  * Markowitsch et al. (2025): Cáncer de próstata CRPC (DU145, PC3, LNCaP). Arresto celular G2/M por downregulation de CDK1 y ciclina A, reducción de integrinas alfa5 y alfa6 y CD44.

- Oncología General y Hematología (#Onco, #Hematologia):
  * Mansky et al. (2010, 2013) NCI / NCCAM: Fase I con Gemcitabina y Helixor A. MTD alcanzada de Gemcitabina: 1,380 mg/m² (un 38% superior a la estándar de 1,000 mg/m²). Demostró que Helixor A NO altera la farmacocinética (AUC, Cmax, clearance, valores p de interacción 0.47 a 0.97). Seroconversión IgG específica anti-lectinas en 100% de pacientes.
  * Gutsch et al. (2018): Linfoma difuso de células B grandes (DLBCL) refractario a R-CHOP. Helixor Pini s.c. (1 a 50 mg). Remisión completa duradera y supervivencia global de 17 años con Karnofsky 100%.
  * Delebinski et al. (2015): Leucemia Mieloide Aguda (LMA). Sinergia de viscumTT (ácido oleanólico 69.4% + betulínico 6.9% en ciclodextrina) con Citarabina (p < 0.0053).
  * Ausencia de interferencia citotóxica demostrada por Weissenstein et al. (2014).

- Dosificación y Seguridad (#Dosificacion, #Seguridad):
  * Vía subcutánea (s.c.): Administrado en pared abdominal por la mañana 3 veces por semana. Escalado progresivo (ej. Helixor A: 1mg -> 5mg -> 10mg -> 20mg -> 30mg hasta 50mg mant.; Tröger: 0.01mg -> 0.1mg -> 1mg -> 2mg -> 5mg hasta 10mg mant.).
  * Reacción local marcadora: Eritema o induración < 5 cm es respuesta fisiológica esperada y marcador biológico de inmunomodulación celular activa.
  * Protocolo de ajuste: Si eritema > 5 cm o fiebre > 38°C, realizar step-down a la dosis previa bien tolerada durante 1-2 semanas antes de reanudar el escalado.
  * Seguridad metabólica: No induce ni inhibe citocromo P450, no altera parámetros farmacocinéticos de quimioterapéuticos. Producido bajo normas estrictas GMP con dosificación cuantificada en nanogramos de lectinas.

- Punchlines (#Punchline [Especialidad]):
  Genera frases de apertura consultiva de 30 segundos, rigurosamente académicas y listas para decir en voz alta al especialista.

REGLAS DE FORMATO MÓVIL ULTRA RÁPIDO (SIN EXCESO DE ASTERISCOS **):
- PROHIBIDO saturar con asteriscos (**). No envuelvas cada palabra en negritas. Redacta de forma limpia y directa.
- Párrafos cortos de máximo 2 a 3 líneas.
- Viñetas limpias con emoticones clínicos claros (🩺, 🔬, 📊, 🛡️, 💡).
- Todo dato clínico debe ser legible en menos de 10 segundos desde el celular.

GUIONES Y DIÁLOGOS LISTOS PARA USAR (CASOS DIFÍCILES: ESCÉPTICOS / HEMATÓLOGOS / ONCÓLOGOS):
Cuando la visitadora consulte cómo abordar a un médico difícil o escéptico (ej. Hematólogo desconfiado, Oncólogo saturado):
- NO envíes resúmenes teóricos complejos de leer en ruta.
- Entrega "DIÁLOGOS DE EJEMPLO" entre comillas ("..."), listos para memorizar o decir directamente.
- Estructura SIEMPRE la respuesta en estos 3 pasos:
  1) Frase de apertura (30 segundos): Respetuosa, empática y orientada al beneficio de sus pacientes.
  2) Manejo de la objeción técnica: Cita con dato duro (ej. Mansky 2013 NCI sin interacción CYP450, o Tröger 2013 HR 0.49 p<0.0001, o Delebinski 2015 en LMA).
  3) Frase de cierre / sinergia terapéutica: Integración con quimioterapia sin interferir en sus protocolos estándar.

MODO DE RESPUESTA EXPRESS ("CONSULTA RÁPIDA"):
Si la visitadora tiene activo el "Modo Consulta Rápida" o "isExpressMode: true", tu respuesta DEBE tener:
- Máximo 3 párrafos cortos (o menos).
- Estructurado en viñetas concisas con números y porcentajes destacados para que la visitadora lo lea en su teléfono en menos de 10 segundos antes de tocar la puerta del médico.
- Cero rodeos introductorios; ve directo al dato duro, a la cita exacta y al argumento de remate.

MODO RUTA ("EN RUTA"):
Si la visitadora indica que está en ruta, en el auto, antes de entrar a consulta o envía una nota de voz con prisa, tu respuesta DEBE ser ultra concisa, en viñetas de lectura rápida de 10 a 20 segundos y lista para escuchar por audio.
`;

// Endpoint 1: Medical Mentor Chat & Route Audio Q&A
app.post('/api/mentor/chat', async (req, res) => {
  try {
    const { message, audioBase64, mimeType, isEnRuta, isExpressMode, userName, history } = req.body;

    const parts: any[] = [];
    const userGreeting = userName ? `para la visitadora ${userName}` : 'para la visitadora';

    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: audioBase64,
        },
      });
      parts.push({
        text: `La visitadora médica de Qualitypharma (${userName || 'Visitadora'}) te ha enviado esta nota de voz.
${isExpressMode || isEnRuta ? '[MODO CONSULTA RÁPIDA / EXPRESS ACTIVO: Responde en MENOS DE 3 PÁRRAFOS CORTOS CON VIÑETAS para lectura en celular en menos de 10 segundos].' : ''}
Mensaje o nota adjunta: "${message || 'Nota de voz de consulta científica o práctica comercial'}".
Analiza tanto su consulta técnica como su tono y seguridad. Aplica la técnica del SÁNDWICH POSITIVO si evalúa su discurso, o provee los datos duros solicitados con citas exactas.`
      });
    } else {
      parts.push({
        text: `${isExpressMode || isEnRuta ? '[MODO CONSULTA RÁPIDA EXPRESS ACTIVO: Máximo 3 párrafos cortos con viñetas para lectura en menos de 10 segundos en smartphone]: ' : ''}${message}`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: parts,
      config: {
        systemInstruction: HELIXOR_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text,
      isEnRuta: !!isEnRuta,
    });
  } catch (error: any) {
    console.error('Error in /api/mentor/chat:', error);
    res.status(500).json({ error: error.message || 'Error processing request' });
  }
});

// Endpoint 2: Real-time Medical Simulation Turn
app.post('/api/mentor/simulate', async (req, res) => {
  try {
    const {
      doctorPersona,
      scenario,
      userSpeech,
      turnCount,
      history,
      audioBase64,
      mimeType,
      simulationLevel, // 'nivel-1' | 'nivel-2' | 'nivel-3'
    } = req.body;

    const personaDescriptions: Record<string, string> = {
      valdivia: 'Dr. Alberto Valdivia (Oncólogo Clínico): Altamente escéptico de las terapias complementarias. Exige evidencia clínica Fase III, datos de supervivencia global y teme interferencias con la quimioterapia o falta de estandarización.',
      mendoza: 'Dra. Mariana Mendoza (Mastóloga / Ginecóloga Oncóloga): Con poco tiempo disponible, enfocada en sus pacientes con cáncer de mama bajo esquema CAF o ascitis maligna en ovario. Le preocupa la fatiga extrema, el abandono de ciclos y la neutropenia severa.',
      santillana: 'Dr. Carlos Santillana (Urólogo Oncólogo): Analítico y quirúrgico. Pregunta con rigor sobre instilación vesical en NMIBC, tiempos de retención de 2 horas (Urech) y evidencia frente a recidivas de BCG.',
      galvez: 'Dr. Roberto Gálvez (Gastroenterólogo Oncólogo): Trata cáncer gástrico y adenocarcinoma pancreático. Pregunta cómo evitar la diarrea por doxifluridina/5-FU y si realmente duplica la supervivencia en páncreas avanzado.',
      pardo: 'Dr. Enrique Pardo (Hematólogo Clínico): Enfocado en esquemas R-CHOP, citarabina en LMA y linfomas refractarios. Duda sobre la plausibilidad biológica de inducir apoptosis en clones resistentes.',
    };

    const levelInstructions: Record<string, string> = {
      'nivel-1': `
NIVEL 1: PRIMER ENCUENTRO (Apertura y Captación)
- Contexto: El médico NO conoce a la visitadora ni sabe qué producto ofrece.
- Objetivo de la Visitadora: Presentarse con profesionalismo, hacer una introducción de alto impacto sobre Helixor (inmunomodulación) y lograr la captura de datos (pedir su número telefónico/contacto directo para seguimiento).
- Tu Rol como Médico IA: Indiferente, con prisa o reservado. Evalúa la capacidad de generar empatía en menos de 45 segundos. Puedes cuestionar por qué debería escucharte o pedir que seas breve.
- Escepticismo activo: Duda de suplementos o fitoterapia, o resístete a dar tu número si la propuesta no suena rigurosa.
- Evaluación requerida: Verifica si logró capturar tu contacto y si su tono fue consultivo y de par científico.
`,
      'nivel-2': `
NIVEL 2: SEGUNDA VISITA (Esquemas Terapéuticos y Posología)
- Contexto: El médico ya recuerda la visita inicial. Es momento de profundizar en la práctica clínica.
- Objetivo de la Visitadora: Explicar con claridad los usos clínicos, la derivación del paciente y las 3 FORMAS / ESQUEMAS DE TRATAMIENTO con Helixor: 1) Subcutánea estándar (escalado 0.01mg a 50mg L-M-V, reacción local < 5 cm vs step-down), 2) Intracavitaria (vesical en NMIBC o intraperitoneal en ascitis), y 3) Coadyuvancia con quimioterapia sin interferencia CYP450.
- Tu Rol como Médico IA: Interesado pero analítico y exigente. Exige claridad en la dosificación milimétrica y perfil del paciente candidato.
- Escepticismo activo: Cuestiona qué hacer si el paciente hace eritema o fiebre, o si el escalado es complejo.
- Evaluación requerida: Verifica si explicó con precisión las 3 formas de tratamiento y la posología exacta.
`,
      'nivel-3': `
NIVEL 3: DEBATE AVANZADO Y PLATAFORMA DIGITAL (Fidelización)
- Contexto: El especialista ya conoce Helixor y se busca consolidar la relación médica a largo plazo.
- Objetivo de la Visitadora: Capacitar y enseñar al médico a utilizar la "Plataforma del Consultorio Qualitypharma" para la gestión de pacientes, seguimiento y prescripción ágil.
- Tu Rol como Médico IA: Exigente respecto al tiempo que le toma usar plataformas digitales o la utilidad real para sus pacientes en el día a día.
- Escepticismo activo: Arguye que ya tienes demasiados sistemas hospitalarios o software privado y no quieres otra clave web innecesaria.
- Evaluación requerida: Verifica si supo vencer la objeción del tiempo, demostrando que la plataforma agiliza la receta digital en 60 segundos y automatiza el seguimiento.
`
    };

    const currentLevelPrompt = levelInstructions[simulationLevel || 'nivel-1'] || levelInstructions['nivel-1'];
    const selectedPersona = personaDescriptions[doctorPersona] || personaDescriptions.valdivia;

    const simulationPrompt = `
Estás gestionando una simulación interactiva de visita médica de alta especialidad con voz y niveles de interacción médica.
ROL DEL MÉDICO: ${selectedPersona}
NIVEL DE INTERACCIÓN: ${simulationLevel || 'nivel-1'}
${currentLevelPrompt}
ESCENARIO: ${scenario || 'Visita comercial en el consultorio del especialista'}
TURNO ACTUAL: ${turnCount || 1}

ENTRADA DE LA VISITADORA MÉDICA DE QUALITYPHARMA:
"${userSpeech || 'Inicio de la entrevista'}"

DEBATE DE ESCEPTICISMO: En este turno, puedes mantener o activar una postura de duda técnica, objeción clínica o escepticismo constructivo para desafiar a la visitadora médica.

DEBES RESPONDER EN FORMATO JSON ESTRICTO con la siguiente estructura:
{
  "doctorResponse": "La respuesta o nueva réplica/objeción del médico especialista en su tono característico (máximo 2-3 frases naturales, directas y clínicas, ideales para ser leídas por voz en un celular)",
  "coachingFeedback": {
    "fortaleza": "[Punto Fuerte]: Manejo del tono, estructura del diálogo y empatía mostrada en este nivel.",
    "optimizacionTecnica": "[Ajuste Clave]: Frase específica o argumento técnico a reforzar para este nivel (ej: citar datos duros, pedir contacto en Nivel 1, posología en Nivel 2 o tiempo de la plataforma en Nivel 3).",
    "cierreMotivacional": "[Cierre Motivacional]: Mensaje de impulso y convicción profesional para su visita real."
  },
  "metrics": {
    "confidenceScore": 85, // Número entre 50 y 100
    "scientificRigorousScore": 80, // Número entre 50 y 100
    "pacingAndTone": "Seguro y fluido", // Breve descripción del ritmo
    "hardDataUsed": ["Tröger 2013", "HR 0.49"], // Array de datos duros que la visitadora mencionó (o vacío)
    "suggestedDataToMention": ["Kim et al. 2012", "Reducción diarrea 50% al 7%"]
  },
  "isSimulationComplete": false // true si ya pasaron 3 intercambios o si se cumplió satisfactoriamente el objetivo del nivel
}
`;

    const parts: any[] = [];
    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: audioBase64,
        },
      });
    }
    parts.push({ text: simulationPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: parts,
      config: {
        systemInstruction: HELIXOR_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/mentor/simulate:', error);
    res.status(500).json({ error: error.message || 'Error simulating consultation' });
  }
});

// Endpoint 3: Speech Audio Pitch Evaluation & Transcription
app.post('/api/mentor/evaluate-audio', async (req, res) => {
  try {
    const { audioBase64, mimeType, specialty, targetDoctorType } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const evaluationPrompt = `
Analiza la siguiente grabación de voz de una visitadora médica de Qualitypharma practicando su discurso técnico para la especialidad "${specialty || 'Oncología'}".

Evalúa dos aspectos fundamentales:
1. CONTENIDO TÉCNICO Y RIGOR CIENTÍFICO: Uso de datos duros de Helixor/Viscum album (estudios como Tröger, Kim, Mansky, Rose, Gutsch, valores de p, Hazard Ratios, tolerabilidad, mecanismo RIP-2/lectinas/viscotoxinas).
2. SEGURIDAD, TONO, RITMO Y LENGUAJE MÉDICO: Proyección vocal, aplomo, fluidez, ausencia de muletillas vacilantes, terminología consultiva entre pares científicos.

APLICA ESTRICTAMENTE EL SÁNDWICH POSITIVO:
- Fortaleza (reconocimiento motivador)
- Optimización Técnica (sugerencia de datos duros específicos)
- Cierre Motivacional (empoderamiento)
- NUNCA uses "mal", "incorrecto", "fallaste".

Devuelve formato JSON con:
{
  "transcription": "Transcripción textual de lo que dijo la visitadora",
  "confidenceScore": 88, // 0-100
  "scientificScore": 82, // 0-100
  "deliveryScore": 85, // 0-100
  "vocalAnalysis": {
    "tone": "Profesional y seguro",
    "pacing": "Cadencia adecuada (aprox 130 palabras/min)",
    "clarity": "Excelente dicción de términos médicos"
  },
  "positiveSandwich": {
    "fortaleza": "...",
    "optimizacionTecnica": "...",
    "cierreMotivacional": "..."
  },
  "detectedClinicalData": ["..."],
  "recommendedNextKeyFacts": ["..."]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'audio/webm',
            data: audioBase64,
          },
        },
        { text: evaluationPrompt },
      ],
      config: {
        systemInstruction: HELIXOR_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/mentor/evaluate-audio:', error);
    res.status(500).json({ error: error.message || 'Error evaluating audio' });
  }
});

// Endpoint 4: Voice TTS Audio Generation (Gemini TTS)
app.post('/api/mentor/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Zephyr', role = 'mentor' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use gemini-3.8-flash-lite-tts for voice playback
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1000), // safety bound for fast playback
              speechMetadata: {
                style: role === 'doctor'
                  ? 'Professional, analytical medical doctor'
                  : 'Encouraging, inspiring, warm senior medical director coach',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || (role === 'doctor' ? 'Fenrir' : 'Kore'),
            },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      res.json({ audioBase64: base64Audio, format: 'audio/pcm', sampleRate: 24000 });
    } else {
      res.status(204).end();
    }
  } catch (error: any) {
    console.error('Error in /api/mentor/tts:', error);
    res.status(500).json({ error: error.message || 'Error generating TTS' });
  }
});

// Setup Vite middlewares in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Qualitypharma Senior Medical Mentor server running on port ${PORT}`);
  });
}

startServer();
