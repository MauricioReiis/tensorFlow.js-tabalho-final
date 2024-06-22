document.addEventListener("DOMContentLoaded", async () => {
    const inputField = document.getElementById("input");
    const messagesContainer = document.getElementById("messages");
    const loadingIndicator = document.getElementById("loading");
    const API_KEY = 'AIzaSyAG1Xtk_vZwZGGC6O_tjzfYD_d2CpBcQ4s'

    // Encoder model tensorflow
    const model = await use.load();

    async function sendMessage() {
        const userMessage = inputField.value;
        if (!userMessage) return;

        addMessage(`Você: ${userMessage}`, "user");
        inputField.value = "";

        loadingIndicator.classList.remove("hidden");

        try {
            const embeddings = await model.embed([userMessage]); // criptografando os dados
            const encodedMessage = embeddings.arraySync()[0];

            console.log("Encoded message:", encodedMessage);  

            const responseMessage = await getLLMResponse(userMessage);

            // Mostrar a resposta da LLM
            addMessage(`Bot: ${responseMessage}`, "bot");
        } catch (error) {
            console.error("Erro ao obter resposta da LLM:", error);
            addMessage("Desculpe, ocorreu um erro ao processar sua mensagem.", "bot");
        } finally {
            // Ocultar indicador de carregamento
            loadingIndicator.classList.add("hidden");
        }
    }

    function addMessage(message, sender) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        messageElement.textContent = message;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll para a última mensagem
    }

    async function getLLMResponse(userMessage) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: userMessage }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts.map(part => part.text).join(' ');
        } else {
            throw new Error("Nenhuma resposta da API.");
        }
    }

    document.querySelector("button").addEventListener("click", sendMessage);
    inputField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});