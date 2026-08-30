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
/* =============================================================
   The additions below are new: mobile nav toggle, scroll-spy nav
   highlighting, a back-to-top button, the hero role-typing effect,
   and 3D tilt-on-hover for cards. Everything above this point
   (chat send/receive, quick questions) is unchanged.
   ============================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// ---- Scroll-spy nav highlighting ----
const spySections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav-link');

if (spySections.length && navAnchors.length) {
    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navAnchors.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    spySections.forEach(section => spyObserver.observe(section));
}

// ---- Back to top ----
const backToTop = document.getElementById('back-to-top');

if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
}

// ---- Hero role typing effect ----
const roleEl = document.querySelector('.typing-role');

if (roleEl) {
    const roles = ['B.Tech CSE Student', 'Full-Stack Developer', 'AI Enthusiast'];

    if (prefersReducedMotion) {
        roleEl.textContent = roles[0];
    } else {
        let roleIndex = 0;
        let charIndex = roles[0].length;
        let deleting = false;

        function tickRole() {
            const current = roles[roleIndex];
            charIndex += deleting ? -1 : 1;
            roleEl.textContent = current.slice(0, charIndex);

            let delay = deleting ? 40 : 70;

            if (!deleting && charIndex === current.length) {
                delay = 1800;
                deleting = true;
            } else if (deleting && charIndex === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                delay = 300;
            }

            setTimeout(tickRole, delay);
        }

        setTimeout(tickRole, 1800);
    }
}

// ---- 3D tilt-on-hover for cards (mouse users only) ----
const tiltCards = document.querySelectorAll('.tilt-card');
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

if (tiltCards.length && hasFinePointer && !prefersReducedMotion) {
    tiltCards.forEach(card => {
        const maxTilt = Number(card.dataset.tiltMax || 8);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rotY = (px - 0.5) * maxTilt * 2;
            const rotX = (0.5 - py) * maxTilt * 2;
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}
