const  FROM  =  'example@mail.com'; // E-mail do remetente
const  SUBJECT  =  'assunto do email'; // Assunto do e-mail
const  HAS_ATTACHMENT  =  true; // Se o e-mail tem anexo (meio que é obrigatório)
const  FILENAME  =  'csv'; // Extensão dos arquivos desejados
const  DRIVE_FOLDER_ID  =  "SEU_ID_AQUI"; // Substitua pelo ID da pasta no Google Drive

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

  if (!query.trim()) {
    console.error('Nenhum parâmetro definido para a busca.');
    return null;
  }

  return query.trim();
}

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
    console.error("Erro: A pasta com o ID fornecido não foi encontrada. Verifique o ID e as permissões.");
    return;
  }

  // Criar um mapa com os nomes dos arquivos já existentes na pasta
  const existingFiles = {};
  const files = folder.getFiles();
  while (files.hasNext()) {
    let file = files.next();
    existingFiles[file.getName()] = true; // Armazena os nomes dos arquivos
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
  });

  console.log(`Processo concluído! Total de arquivos salvos: ${totalFilesSaved}`);
}
