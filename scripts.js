const pedido = 'Olhe a foto deste comprovante e responda em UMA linha, sem escrever mais nada, com 2 pedaços separados por |. Primeiro pedaço: o emoji da categoria, o nome do estabelecimento dentro de <strong>, e depois cada item comprado com seu valor, um por linha usando <br>. Segundo pedaço: o total pago, só o número, com ponto e sempre com duas casas decimais. As categorias são: 🛒 Mercado, 🚗 Transporte, 🍔 Comida, 💊 Saúde, 🎉 Lazer, 🏠 Casa, 💸 Outros. Exemplo de resposta: 🍔 <strong>Padaria Pão Quente</strong><br>Pão — R$ 5,00<br>Leite — R$ 4,50|9.50';

let total = 0;
let quantidade = 0;
let stream = null;

// Elementos do DOM
const abrirCameraBtn = document.getElementById("abrirCamera");
const tirarFotoBtn = document.getElementById("tirarFoto");
const fecharCameraBtn = document.getElementById("fecharCamera");
const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");

// Evento para abrir a câmera
abrirCameraBtn.addEventListener("click", async () => {
    try {
        // Solicita acesso à câmera
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" } // "environment" = câmera traseira
        });

        // Mostra o vídeo da câmera
        videoElement.srcObject = stream;
        videoElement.style.display = "block";

        // Mostra/oculta botões
        abrirCameraBtn.style.display = "none";
        tirarFotoBtn.style.display = "block";
        fecharCameraBtn.style.display = "block";

    } catch (erro) {
        alert("Erro ao acessar a câmera: " + erro.message);
    }
});

// Evento para tirar foto
tirarFotoBtn.addEventListener("click", async () => {
    // Configura o canvas com o tamanho do vídeo
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Desenha a imagem do vídeo no canvas
    const contexto = canvasElement.getContext("2d");
    contexto.drawImage(videoElement, 0, 0);

    // Converte o canvas para blob (imagem)
    canvasElement.toBlob(async (blob) => {
        // Cria um arquivo a partir do blob
        const arquivo = new File([blob], "foto.jpg", { type: "image/jpeg" });

        // Fecha a câmera
        fecharCamera();

        // Processa a foto como antes
        await processarFoto(arquivo);
    }, "image/jpeg", 0.95);
});

// Evento para fechar a câmera
fecharCameraBtn.addEventListener("click", () => {
    fecharCamera();
});

function fecharCamera() {
    // Para o stream de vídeo
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    // Oculta o vídeo e botões
    videoElement.style.display = "none";
    tirarFotoBtn.style.display = "none";
    fecharCameraBtn.style.display = "none";

    // Mostra botão de abrir câmera
    abrirCameraBtn.style.display = "block";
}

// Função para processar a foto
async function processarFoto(arquivo) {
    try {
        // Chamada assíncrona para a IA
        const resposta = await puter.ai.chat(pedido, arquivo);

        // Pegar a resposta da IA e filtrar para mostrar na tela
        const texto = resposta.message.content;
        const partes = texto.split("|");
        console.log(partes);

        // Colocar na tela
        document.querySelector(".lista").innerHTML += `
        <div class="comprovante">
            <div class="content">
                <div class="itens">${partes[0]}</div>
                <div class="separador"></div>
                <div class="total-nota">Total da nota: R$ ${partes[1]}</div>
            </div>
        </div>
        `;

        total += Number(partes[1]);
        quantidade++;
        document.querySelector(".total-gasto").innerHTML = "R$" + total.toFixed(2);

        const textoComprovante = quantidade === 1 ? "1 comprovante lido" : `${quantidade} comprovantes lidos`;
        document.querySelector(".comprovantes-lidos").innerText = textoComprovante;

    } catch (erro) {
        alert("Erro ao processar a foto: " + erro.message);
    }
}

