const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");


sendBtn.addEventListener("click", sendMessage);


userInput.addEventListener("keypress", function(event){

    if(event.key==="Enter"){
        sendMessage();
    }

});


async function sendMessage(){

    const message = userInput.value.trim();

    if(message===""){
        return;
    }

    chatBox.innerHTML += `
    <div class="user-message">
        ${message}
    </div>
    `;

    userInput.value="";

    const typing = document.createElement("div");

    typing.className="bot-message";

    typing.innerHTML="Thinking...";

    chatBox.appendChild(typing);

    chatBox.scrollTop = chatBox.scrollHeight;

    try{

        const response = await fetch("/chat",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                message:message
            })

        });

        const data = await response.json();

        typeWriter(typing, data.reply);

        chatBox.scrollTop=chatBox.scrollHeight;

    }

    catch(error){

        typing.innerHTML="Error connecting to AI Assistant.";

        console.log(error);

    }

}
function typeWriter(element, text) {
    element.innerHTML = "";

    let i = 0;

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(type, 20);
        }
    }

    type();
}
function quickQuestion(question){

    userInput.value = question;

    sendMessage();
}
function executeCommand(message){

    const text = message.toLowerCase();

    if(text.includes("projects")){
        document.getElementById("projects").scrollIntoView({
            behavior:"smooth"
        });
        return true;
    }

    if(text.includes("skills")){
        document.getElementById("skills").scrollIntoView({
            behavior:"smooth"
        });
        return true;
    }

    if(text.includes("education")){
        document.getElementById("education").scrollIntoView({
            behavior:"smooth"
        });
        return true;
    }

    if(text.includes("contact")){
        document.getElementById("contact").scrollIntoView({
            behavior:"smooth"
        });
        return true;
    }

    return false;

}