
//const de catar o modal + funcoes de abrir e fechar modal 

const modal = document.querySelector('.janelaFormModal');

function openModal() {
    modal.classList.add('abrirModal')
}

function fecharModal(){
    modal.classList.remove('abrirModal')
}

//funcionalidade de pdf

//recebimento das infos do form


document.querySelector('.form-submit').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const assinaturaTexto = form.AssinaturaTexto.value.trim();
    const assinaturaFile = form.AssinaturaFile.files[0];

    const dados = {
        nome: form.Nome.value,
        valor: parseFloat(form.Valor.value),
        servico: form.Serviço.value,
        data: form.Data.value,
        forma: form.FormaPagamento.value,
        prestador: form.Prestador.value,
        assinaturaTexto: assinaturaFile || null,
        assinaturaFile: assinaturaTexto || null
    }

    const pdfBytes = await criarReciboPDF(dados);

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob)
    link.download = 'recibocriado.pdf';
    link.click();
})

async function criarReciboPDF({nome, valor, servico, data, forma, prestador, assinaturaTexto, assinaturaFile}){
    const { PDFDocument, rgb, StandardFonts } = PDFlib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.assPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('RECIBO DE PAGAMENTO', {
      x: 180,
      y: 750,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawLine({ start: { x: 50, y: 740 }, end: { x: 550, y: 740 }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });

    page.drawText(`Nome: ${nome}`, { x: 50, y: 700, size: 12, font });
    page.drawText(`Valor: R$ ${valor.toFixed(2)}`, { x: 50, y: 670, size: 12, font });
    page.drawText(`Serviço: ${servico}`, { x: 50, y: 640, size: 12, font });
    page.drawText(`Data: ${data}`, { x: 50, y: 610, size: 12, font });
    page.drawText(`Forma de Pagamento: ${forma}`, { x: 50, y: 580, size: 12, font });
    page.drawText(`Prestador: ${prestador}`, { x: 50, y: 550, size: 12, font });
    if (assinaturaTexto) {
        // Se assinatura for texto, imprime o texto no PDF
        page.drawText(`Assinatura: ${assinaturaTexto}`, { x: 50, y: 500, size: 12, font });
    } else if (assinaturaFile) {
        // Se assinatura for imagem, imprime a imagem no PDF
        const imageBytes = await assinaturaFile.arrayBuffer();
        let image;
        if (assinaturaFile.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes);
        } else if (assinaturaFile.type === 'image/jpeg' || assinaturaFile.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(imageBytes);
        }
        if (image) {
            page.drawImage(image, {
                x: 50,
                y: 450,
                width: 120,
                height: 60,
            });
        }
    }
}

