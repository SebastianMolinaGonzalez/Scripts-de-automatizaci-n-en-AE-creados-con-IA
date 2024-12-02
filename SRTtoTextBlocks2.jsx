(function () {
    // Función para parsear el archivo SRT
    function parseSRT(srtContent) {
        var subtitles = [];
        var blocks = srtContent.split('\n\n');
        for (var i = 0; i < blocks.length; i++) {
            var lines = blocks[i].split('\n');
            if (lines.length >= 3) {
                var timeCode = lines[1].split(' --> ');
                subtitles.push({
                    start: timeCodeToSeconds(timeCode[0]),
                    end: timeCodeToSeconds(timeCode[1]),
                    text: lines.slice(2).join('\n')
                });
            }
        }
        return subtitles;
    }

    // Función para convertir el código de tiempo a segundos
    function timeCodeToSeconds(timeCode) {
        var parts = timeCode.split(':');
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2].replace(',', '.'));
    }

    // Función para obtener los primeros 20 caracteres del texto
    function getFirstTwentyChars(text) {
        var cleanText = text.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
        return cleanText.length > 20 ? cleanText.substr(0, 20) : cleanText;
    }

    // Función principal
    function createParagraphTextBlocks() {
        var proj = app.project;
        var comp = proj.activeItem;

        if (!comp || !(comp instanceof CompItem)) {
            alert("Por favor, selecciona una composición activa.");
            return;
        }

        // Solicitar al usuario el archivo SRT
        var srtFile = File.openDialog("Selecciona el archivo SRT", "*.srt");
        if (!srtFile) return;

        srtFile.open('r');
        var content = srtFile.read();
        srtFile.close();

        var subtitles = parseSRT(content);

        for (var i = 0; i < subtitles.length; i++) {
            var textLayer = comp.layers.addBoxText([comp.width, comp.height/4]);
            textLayer.name = getFirstTwentyChars(subtitles[i].text);

            // Configurar el tiempo de inicio y duración
            textLayer.startTime = subtitles[i].start;
            textLayer.outPoint = subtitles[i].end;

            // Configurar el texto y sus propiedades
            var textProp = textLayer.property("Source Text");
            var textDocument = textProp.value;
            textDocument.fontSize = 40;
            textDocument.font = "Arial";
            textDocument.fillColor = [1, 1, 1]; // Color blanco
            textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
            textDocument.text = subtitles[i].text;
            textProp.setValue(textDocument);

            // Centrar el texto en la composición
            textLayer.property("Position").setValue([comp.width / 2, comp.height - 100]);
            textLayer.property("Anchor Point").setValue([comp.width / 2, comp.height/8]);
        }

        alert("Se han creado " + subtitles.length + " bloques de texto de párrafo.");
    }

    // Ejecutar la función principal
    createParagraphTextBlocks();
})();
