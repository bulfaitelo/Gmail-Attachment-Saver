const FROM  =  'example@mail.com'; // E-mail do remetente
const SUBJECT  =  'assunto do email'; // Assunto do e-mail
const HAS_ATTACHMENT  =  true; // Se o e-mail tem anexo (meio que é obrigatório)
const FILENAME  =  'csv'; // Extensão dos arquivos desejados
const AUTO_ARCHIVE = true; // Auto Arquiva os emails executados.
const LABEL_NAME = "Saved"; // Define um label para os emails processados. e ignora os já processados.
const DRIVE_FOLDER_ID  =  "SEU_ID_AQUI"; // Substitua pelo ID da pasta no Google Drive
const DRIVE_FOLDER_UPDATED_ID = "OPCIONAL"; // CAso exista algum processo após (por outro script) verifica em uma segunda pasta se o arquivos já existe. 

/**
 * Prepara com base nos parâmetros a query que será usada para filtrar os emails 
 */
function prepareQueryForMail() {
  var query = ""; // Inicializa corretamente

  if (FROM) {
    query += ' from:(' + FROM + ') ';
  }
  if (SUBJECT) {
    query += ' subject:("' + SUBJECT + '") ';
  }
  if (HAS_ATTACHMENT) {
    query += ' has:attachment ';
    if (FILENAME) {
      query += ' filename:' + FILENAME;
    }  
  }
  if (LABEL_NAME.trim() !== "") {
    query+=' !label:' + LABEL_NAME;
  }

  if (!query.trim()) {
    console.error('Nenhum parâmetro definido para a busca.');
    return null;
  }

  return query.trim();
}

/**
 * Função para testar os emails que serão processados. 
 */
function getEmails() {    
  var query = prepareQueryForMail();
  if (!query) return;

  const threads = GmailApp.search(query);
  
  if (threads.length === 0) {
    console.log("Nenhum e-mail encontrado para os critérios especificados.");
    return;
  }

  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(message => {
      console.log("De:", message.getFrom());
      console.log("Assunto:", message.getSubject());
      console.log("Data:", message.getDate());
      console.log("Anexos:", message.getAttachments().map(a => a.getName()).join(", "));
      console.log("-------------------------------------------------");
    });
  });
}

/**
 * Salva os anexos dos e-mails encontrados na pasta especificada pelo ID do Google Drive,
 * evitando salvar arquivos duplicados.
 */
function saveAttachmentsToDrive() {
  var query = prepareQueryForMail();
  if (!query) return;

  const threads = GmailApp.search(query);

  if (threads.length === 0) {
    console.log("Nenhum e-mail encontrado com anexos para salvar.");
    return;
  }

  let folder;
  try {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } catch (e) {
    console.error("Erro: A pasta com o ID", DRIVE_FOLDER_ID, "fornecido não foi encontrada. Verifique o ID e as permissões.");
    return;
  }

  let subFolder;
  if (DRIVE_FOLDER_UPDATED_ID.trim() !== "") {
    try {
      subFolder = DriveApp.getFolderById(DRIVE_FOLDER_UPDATED_ID);
    } catch (e) {
      console.error("Erro: A pasta com o ID", DRIVE_FOLDER_UPDATED_ID, " fornecido não foi encontrada. Verifique o ID e as permissões.");
      return;
    }
  }

  // Criar um mapa com os nomes dos arquivos já existentes na pasta
  const existingFiles = {};
  const files = folder.getFiles();

  while (files.hasNext()) {
    let file = files.next();
    existingFiles[file.getName()] = true; // Armazena os nomes dos arquivos
  }

  if (DRIVE_FOLDER_UPDATED_ID.trim() !== "") {
    const subFiles = subFolder.getFiles();
    while (subFiles.hasNext()) {
      let file = subFiles.next();
      existingFiles[file.getName()] = true; // Armazena os nomes dos arquivos
    }
  }

  // 🔹 Se LABEL_NAME for definido, buscar ou criar o label
  if (LABEL_NAME.trim() !== "") {
    label = GmailApp.getUserLabelByName(LABEL_NAME);
    if (!label) {
      label = GmailApp.createLabel(LABEL_NAME);
      console.log(`Label "${LABEL_NAME}" criado.`);
    }
  }

  let totalFilesSaved = 0;

  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(message => {
      const attachments = message.getAttachments();
      attachments.forEach(attachment => {
        const fileName = attachment.getName();
        
        // Se o arquivo já existir, ignoramos a adição
        if (existingFiles[fileName]) {
          console.log(`Arquivo ignorado (já existe): ${fileName}`);
        } else {
          folder.createFile(attachment);
          existingFiles[fileName] = true; // Adiciona ao mapa para evitar duplicações futuras
          console.log(`Arquivo salvo: ${fileName}`);
          totalFilesSaved++;
        }
      });
    });
    // 🔹 Se um label foi definido, aplicá-lo ao e-mail
    if (label) {
      thread.addLabel(label);
      console.log(`Label "${LABEL_NAME}" adicionado ao e-mail: ${thread.getFirstMessageSubject()}`);
    }

    // Arquivar e-mail após salvar os anexos
    if (AUTO_ARCHIVE) {
      console.log("E-mail arquivado:", thread.getFirstMessageSubject());
      thread.moveToArchive();
    }
  });

  console.log(`Processo concluído! Total de arquivos salvos: ${totalFilesSaved}`);
}
