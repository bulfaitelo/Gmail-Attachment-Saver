# 📩 Gmail Attachment Saver

  

Este script automatiza a busca e o salvamento de anexos de e-mails do Gmail em uma pasta específica do Google Drive.

  

## 🚀 Funcionalidades

- 📥 Busca e-mails do Gmail com base no remetente, assunto e anexos.

- 📂 Salva automaticamente os anexos em uma pasta do Google Drive.

- 🔄 Evita salvar arquivos duplicados na pasta.

- 🔍 Loga os e-mails encontrados no console para depuração.

  

## 📌 Requisitos

- Conta do Google com acesso ao **Google Apps Script**.

- Permissão para acessar o Gmail e o Google Drive.

- ID de uma pasta no Google Drive onde os arquivos serão salvos.

  

## ⚙️ Configuração

  

### 1️⃣ Criar o Script no **Google Apps Script**

1. Acesse o [Google Apps Script](https://script.google.com/).

2. Crie um novo projeto.

3. Copie e cole o código do script no editor.

  

### 2️⃣ Configurar as Variáveis

No início do código, defina os seguintes valores:

  

```javascript

const FROM  =  'example@mail.com'; // E-mail do remetente

const SUBJECT  =  'assunto do email'; // Assunto do e-mail

const HAS_ATTACHMENT  =  true; // Se o e-mail tem anexo (meio que é obrigatório)

const FILENAME  =  'csv'; // Extensão dos arquivos desejados

const AUTO_ARCHIVE = true; // Auto Arquiva os emails executados.

const LABEL_NAME = "Saved"; // Define um label para os emails processados. e ignora os já processados.

const DRIVE_FOLDER_ID  =  "SEU_ID_AQUI"; // Substitua pelo ID da pasta no Google Drive

const DRIVE_FOLDER_UPDATED_ID = "OPCIONAL"; // CAso exista algum processo após (por outro script) verifica em uma segunda pasta se o arquivos já existe. 
```
  
  
### Como  Obter  o  ID  da  Pasta  no  Google  Drive

 
O  ID  da  pasta  é  um  código  único  que  identifica  a  pasta  onde  os  arquivos  serão  salvos.

Passos  para  obter  o  ID  da pasta:

 1. Acesse  o  Google  Drive.
 2. Encontre  a  pasta  onde  deseja  salvar  os  anexos.
 3. Clique  com  o  botão  direito  na  pasta  e  selecione  "Obter link".
 4. Na  caixa  de  diálogo,  clique  em  "Copiar link".
 5. O  link  copiado  terá  o  seguinte formato:

    https://drive.google.com/drive/folders/1ABCDeFGHIjklMnOP

 6. O **ID da pasta** é a parte final da URL, **depois de "folders/"**, por exemplo:

    1ABCDeFGHIjklMnOP
    

 7. Substitua `"SEU_ID_AQUI"` no código pelo ID copiado.