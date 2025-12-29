function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Base de Datos Centro Médico") || ss.getSheets()[0];
    var values = sheet.getDataRange().getValues();
    var headers = values[0];
    var result = [];

    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      var record = {};
      for (var j = 0; j < headers.length; j++) {
        // Mantenemos el nombre de la columna tal cual está en el Excel
        record[headers[j].toString().trim()] = row[j];
      }
      result.push(record);
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"error": err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}