// JavaScript Document
let allQuestions = [];
let timeup, games;
loadXML();
let currentQuest = 0, score = 0;
let isChecked = false, fail = false, timeout = false;
let time = moment({seconds: 45});

let wildCards = { // Objeto comodines | Vida extra | 15 segundos más | 50:50
    extraLife: false,
    extraLifeUse: false,
    moreTime: false,
    moreTimeUse: false,
    removeOptionUse: false,
}

let startGame = document.getElementById('startGame');
let main = document.getElementById('main');

let colors = {violet: "#7b2cbf", red: "#fc1b13", green: "#5bba6f"}

startGame.addEventListener("click", () => {
    games = CEXT.starNewAttemp();
    score=0;
    let viewGame = `<div class="game">
        <div class="levels">
            <div class="level hidden">6 - Sexta pregunta</div>
            <div class="level hidden">5 - Quinta pregunta</div>
            <div class="level hidden">4 - Cuarta pregunta</div>
            <div class="level hidden">3 - Tercera pregunta</div>
            <div class="level hidden">2 - Segunda pregunta</div>
            <div class="level">1 - Primera pregunta</div>
        </div>
        <div>
            <div class="cancel" onclick="modalAbortGame()">Cancelar partida</div>
        </div>
        <div class="quest" id="quest">
            <div>
                <img src="./media/imagenes/FMRQuestions.png" alt="Logo Mapfre rojo">
                <h2>QUÍEN QUIERE ESTAR ASEGURADO</h2>
                <div class="question">
                    <div>${allQuestions[currentQuest].enunciado}</div>
                    <div class="time" id="time"><span>${time.second()}</span></div>
                </div>
                <div class="options" id="options">
                    <div class="option" onclick="checkQuest(this, 0)">${allQuestions[currentQuest].opciones.opcion[0].text}</div>
                    <div class="option" onclick="checkQuest(this, 1)">${allQuestions[currentQuest].opciones.opcion[1].text}</div>
                    <div class="option" onclick="checkQuest(this, 2)">${allQuestions[currentQuest].opciones.opcion[2].text}</div>
                    <div class="option" onclick="checkQuest(this, 3)">${allQuestions[currentQuest].opciones.opcion[3].text}</div>
                </div>
            </div>
        </div>
        <div class="wildcards">
            <div>
                <div class="wildcard" onclick="activeWildCard('extraLife',0)"><span class='wild-icon'><i class='bx bxs-donate-heart wild-icon'></i></span></div>
                <div class="wildcard" onclick="activeWildCard('moreTime',1)"><span class='wild-icon'><i class='bx bxs-time'></i></span></div>
                <div class="wildcard" onclick="removeOptionWildcard()"><span class='wild-icon'><i class='bx bxs-offer wild-icon'></i></span></div>
            </div>
            <div>
                <div id="score">${score} pts <i class='bx bxs-trophy score-icon'></i> </div>
            </div>
        </div>
    </div>`;
    main.classList.remove("center");
    main.innerHTML = viewGame;
    currentQuestView();
    timer();
})



function checkQuest(elementHtml, option){
    clearInterval(timeup);
    let optionTrue = (allQuestions[currentQuest].opciones.opcion[option].correct === 'true') //Trasforma el 'True' de string a boolean
    let childs = document.getElementById("options").childNodes; //Guarda en una variable todos los elementos HTML que son las opcines de las preguntas
    childs = Object.values(childs).filter(nodo => nodo.nodeName==="DIV");//Al guradarlo tambien se gurada unos elementos #text que los elimino para que solo este el DIV
    if (!isChecked && !timeout){ //Comprueba si no esta conestada
        optionTrue ? elementHtml.style.backgroundColor = colors.green : elementHtml.style.backgroundColor = colors.red;
        elementHtml.style.color="white";
        if(wildCards.extraLife && !optionTrue) elementHtml.className = "optionDisabled";

        if(optionTrue){
            let plusTimer = (time.second());
            if (currentQuest==5){
                if (plusTimer < 6) score += (25 - (45/6));
                score += (25 - (45/plusTimer));
            } else{
                if (plusTimer < 6) score += (15 - (45/6));
                score += (15 - (45/plusTimer));
            }
            score = Math.round(score);
            document.getElementById("score").innerHTML = score + " pts <i class='bx bxs-trophy score-icon'></i>";
            modalCorrect();
        }

        if(!optionTrue && !timeout && !wildCards.extraLife){ //Si no es crrecta la pregunta resalta la que es verdadera de color verde
            let correctQuest = allQuestions[currentQuest].opciones.opcion.findIndex(op => op.correct==='true')
            childs[correctQuest].style.backgroundColor = colors.green
            childs[correctQuest].style.color = "white"
            fail=true;
            modalIncorrect();
        }

        if(!wildCards.extraLife){
            childs.forEach(element => {  //Deshabilita las opciones para que no salga el hover
                element.className = "optionDisabled";
            });
            isChecked = true;
        }
        if(wildCards.extraLife) wildCards.extraLife=false;
    }
}

async function loadXML(){ //Craga las preguntas del HTML de forma aleatoria, se usa la libreria xml2json y una funciono parseXml que trasforma el texto del XML en uno valido
        const response = await fetch('./xml/cuestionario.xml') // funcion asyncrona por lo tanto tarda en encontrar el xml y enviarlo
		const content = await response.text(); //Lo trasforma a texto por lo tanto hay que usar la funcion que fue copiada de internet
        let dom = parseXml(content);
        let jsonText = xml2json(dom);
        jsonText = jsonText.replace("undefined","");//al inicio del xml salia un undefined que daba problema, se quita para que no problemas la convercion
        let quests = JSON.parse(jsonText);
        allQuestions = quests.quiz.estructura.categoria.pregunta
        allQuestions.sort(function() { return Math.random() - 0.5 });
}

function nextQuest(){ //Salta a la siguiente pregunta si contestaste bien
    if(currentQuest!==5 && !fail){
        currentQuest++;
        isChecked = false, timeout=false;
        time = moment({seconds: 45});
        let quest = document.getElementById('quest')
        let newQuest = `<div>
            <img src="./media/imagenes/FMRQuestions.png" alt="Logo Mapfre rojo">
            <h2>QUÍEN QUIERE ESTAR ASEGURADO</h2>
            <div class="question">
                <div>${allQuestions[currentQuest].enunciado}</div>
                <div class="time" id="time"><span>${time.second()}</span></div>
            </div>
            <div class="options" id="options">
                <div class="option" onclick="checkQuest(this, 0)">${allQuestions[currentQuest].opciones.opcion[0].text}</div>
                <div class="option" onclick="checkQuest(this, 1)">${allQuestions[currentQuest].opciones.opcion[1].text}</div>
                <div class="option" onclick="checkQuest(this, 2)">${allQuestions[currentQuest].opciones.opcion[2].text}</div>
                <div class="option" onclick="checkQuest(this, 3)">${allQuestions[currentQuest].opciones.opcion[3].text}</div>
            </div>
        </div>`;
        quest.innerHTML = newQuest;
        currentQuestView();
        timer();
    }else if(currentQuest==5){
        score += 6;
        modalWinGame();
    }else{
        location.reload();
    }
}

function parseXml(xml) {
    var dom = null;
    if (window.DOMParser) {
        try { 
            dom = (new DOMParser()).parseFromString(xml, "text/xml"); 
        } 
        catch (e) { dom = null; }
    }
    else if (window.ActiveXObject) {
        try {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
          if (!dom.loadXML(xml)) // parse error ..
                window.alert(dom.parseError.reason + dom.parseError.srcText);
        } 
        catch (e) { dom = null; }
    }
    else
        alert("cannot parse xml string!");
    return dom;
}

function timer() {
    timeup = setInterval(() => {
        time.second(time.second()-1);
        document.getElementById('time').innerHTML = `<span>${time.second()}</span>`;
        if(time.second()===0){
            timeout=true;
            fail=true;
            changeOptionForTimeout();
            clearInterval(timeup);
            modalIncorrect();
        } 
    },1000)
}

function changeOptionForTimeout(){
    let childs = document.getElementById("options").childNodes;
    childs = Object.values(childs).filter(nodo => nodo.nodeName==="DIV");
    childs.forEach((element,index) => { 
        let optionTrue = (allQuestions[currentQuest].opciones.opcion[index].correct === "true");
        optionTrue ? element.style.backgroundColor = colors.green : element.style.backgroundColor = colors.red;
        element.style.color = "white";
        element.className = "optionDisabled";
    });
}

function currentQuestView(){
    let levels = document.getElementsByClassName('level');
    levels = Object.assign([], levels).reverse();

    for(let i=0;i<levels.length;i++){
        if(i<currentQuest) {
            levels[i].style.backgroundColor = colors.green;
            levels[i].style.color = "white";
            levels[i].className = " level hidden";
        }else if(i===currentQuest){
            levels[i].style.backgroundColor = colors.violet;
            levels[i].style.color = "white";
            levels[i].className = "level";
        } else {
            levels[i].className = " level hidden";
        }
    }
}

function activeWildCard(wildCard, position){
    if(!wildCards[wildCard+'Use']){
        wildCards[wildCard] = true; 
        wildCards[wildCard+'Use'] = true;
        if(wildCard === "moreTime") time.second(time.second()+15)
    }
    disableWildCard(document.getElementsByClassName('wildcard')[position]);
}

function disableWildCard(wildcard){
    wildcard.style.opacity = '0.3'
    wildcard.className += " disableHover";
}

function removeOptionWildcard(){
    if(!wildCards.removeOptionUse){
        let childs = document.getElementById("options").childNodes;
        childs = Object.values(childs).filter(nodo => nodo.nodeName==="DIV");
        let correctQuest = allQuestions[currentQuest].opciones.opcion.findIndex(op => op.correct==='true');
        childs.splice(correctQuest, 1);
        let random = Math.floor(Math.random() * childs.length);
        childs[random].style.backgroundColor = colors.red
        childs[random].style.color = "white"
        childs[random].className = "optionDisabled";
        childs.splice(random, 1);
        random = Math.floor(Math.random() * childs.length);
        childs[random].style.backgroundColor = colors.red
        childs[random].style.color = "white"
        childs[random].className = "optionDisabled";

        disableWildCard(document.getElementsByClassName('wildcard')[2]);
        wildCards.removeOptionUse=true;
    }
}

function modalCorrect(){
    Swal.fire({
        titleText: '¡Enhorabuena!',
        text: '¡Has acertado la pregunta!',
        icon: 'success',
        buttonsStyling: false,
        confirmButtonText: 'Siguiente pregunta'
    }).then((result) => {
        if (result.isConfirmed) {
            nextQuest();
        } 
    })
}

function modalIncorrect(){
    Swal.fire({
        titleText: '¡Has fallado la pregunta!',
        html: `<p>Tu puntuación ha sido de: ${score} puntos</p>`,
        icon: 'error',
        buttonsStyling: false,
        confirmButtonText: 'Volver a empezar'
    }).then((result) => {
        if (result.isConfirmed) {
            finishGame();
            location.reload();
        } 
    })
}

function modalWinGame(){
    Swal.fire({
        titleText: '¡Enhorabuena!',
        html: `<h3>¡Estás asegurado!</h3>`+
        `<p>Tu puntuación ha sido de: ${score} puntos</p>`,
        buttonsStyling: false,
        confirmButtonText: 'Volver al inicio',
    }).then((result) => {
        if (result.isConfirmed) {
            finishGame();
            location.reload();
        } 
    })
}

document.getElementById("instructions").addEventListener("click", () => { modalInstructions(); })

function modalInstructions(){
    Swal.fire({
        titleText: 'Cómo jugar a "¿Quién quiere estar asegurado?"',
        html: `<div>  
                    <h4> 6 preguntas te separan de la victoria </h4> 
                    <h4> Cuentas con 45 segundos por pregunta </h4>
                    <h4> Tres comodines que te ayudarán en tu camino <h4>
                    </br>
                    <h4> <span class='wild-icon'><i class='bx bxs-donate-heart wild-icon'></i></span> Vida extra </h4>
                    <h4> <span class='wild-icon'><i class='bx bxs-time wild-icon'></i></span> 15 segundos más </h4>
                    <h4> <span class='wild-icon'><i class='bx bxs-offer wild-icon'></i></span> 50:50 </h4>
                </div>`,
        buttonsStyling: false,
        showCloseButton: true,
        confirmButtonText: 'Entendido'
    })
}

function modalAbortGame(){
    Swal.fire({
        titleText: '¡Has abandonado el juego!',
        html: `<p>Tu puntuación ha sido de: ${score} puntos</p>`,
        icon: 'error',
        buttonsStyling: false,
        confirmButtonText: 'Volver al inicio'
    }).then((result) => {
        if (result.isConfirmed) {
            finishGame();
            location.reload();
        } 
    })
}

document.getElementById("leaderboard").addEventListener("click", () => { modalLeaderboard(); })

function modalLeaderboard(){
    Swal.fire({
        titleText: 'Tus puntaciones',
        html: `${countGames()}`,
        buttonsStyling: false,
        showCloseButton: true,
        confirmButtonText: 'Entendido'
    })
}

function countGames(){
    let htmlLeaderboard = ``;
    let partidas = CEXT.getNumAttemps();
    for(let i = 1; i <= partidas; i++){
        htmlLeaderboard+= `
            <h4>Partida ${i}: ${CEXT.getAttempPoints(i)} puntos</h4>
        ` 
    }
    return htmlLeaderboard;
}

function finishGame(){
    CEXT.setGlobalPoints(score);
    CEXT.setAttempPoints(CEXT.getCurrentAttemp(),score); // Establece la puntación en la partida actual
    CEXT.setAttempStatus(CEXT.getCurrentAttemp(),true);
    CEXT.setGlobalStatus(true);
}
