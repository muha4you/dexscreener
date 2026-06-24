function randomNumber(e,t){return Math.floor(Math.random()*(t-e))+e}

function getOrGenerateVotes(){
    const e=localStorage.getItem("votes");
    if(e)return Number(e);
    const t=randomNumber(2700,2800);
    localStorage.setItem("votes",t);
    return t;
}

function updateProgressBar(e){
    e=e||false;
    let t=getOrGenerateVotes();
    if(e)t++;
    if(t>3000){localStorage.removeItem("votes");t=getOrGenerateVotes();}
    localStorage.setItem("votes",t);
    const n=t/3000*100;
    const r=document.querySelector("._7");
    const o=document.querySelector("._c");
    if(r)r.style.width=n+"%";
    if(o)o.textContent=t+" / 3000 votes left";
}

function generateRandomAddress(){
    const info=window.__chainInfo||{addressType:"evm"};
    if(info.addressType==="solana"){
        const c="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        let a="";
        const l=32+Math.floor(Math.random()*12);
        for(let i=0;i<l;i++) a+=c[Math.floor(Math.random()*c.length)];
        return a;
    }
    const e="0123456789abcdef";
    let t="0x";
    for(let n=0;n<40;n++) t+=e.charAt(Math.floor(16*Math.random()));
    return t;
}

function formatAddress(e){
    return e.substring(0,6)+"..."+e.substring(e.length-4);
}

function generateRandomAmount(){
    if(window.__generateChainAmount) return window.__generateChainAmount();
    return (4e-3*Math.random()+5e-4).toFixed(4);
}

function createFeedItem(){
    const info=window.__chainInfo||{currency:"ETH"};
    const addr=generateRandomAddress();
    const amt=generateRandomAmount();
    const currency=info.currency||"ETH";
    const n=document.createElement("div");
    n.className="feed-item";
    n.innerHTML='<span class="feed-address">'+formatAddress(addr)+'</span>'
        +'<span class="feed-action">voted</span>'
        +'<span class="feed-earned">+'+amt+' '+currency+'</span>';
    return n;
}

async function initVoteFeed(){
    // Wait for chain to be detected (resolves when API returns or 4s timeout fires)
    try {
        if(window.__chainReady) await window.__chainReady;
    } catch(e){}

    const feed=document.getElementById("_8");
    if(!feed) return;

    // Populate initial 5 items with correct chain currency
    while(feed.children.length<5){
        feed.appendChild(createFeedItem());
    }

    // Keep rolling new items in
    let first=true;
    while(true){
        await new Promise(function(r){setTimeout(r,randomNumber(5000,7000));});
        if(feed.children.length>=5) feed.removeChild(feed.lastChild);
        const item=createFeedItem();
        feed.insertBefore(item,feed.firstChild);
        updateProgressBar(true);
    }
}

function initFAQ(){
    const questions=document.querySelectorAll("._nb");
    const answers=document.querySelectorAll("._pb");
    const questionList=document.querySelector("._5b");

    function getAnswer(idx){
        for(const a of answers){
            if(Number(a.getAttribute("data-index"))===idx) return a;
        }
        return null;
    }

    function reorder(){
        if(window.innerWidth<=760){
            questions.forEach(function(q){
                const a=getAnswer(parseInt(q.getAttribute("data-index")));
                if(a&&(!q.nextElementSibling||!q.nextElementSibling.classList.contains("faq-answer"))
                    &&a.parentElement!==questionList){
                    questionList.insertBefore(a,q.nextSibling);
                }
            });
        } else {
            const panel=document.querySelector("._gb");
            if(panel) answers.forEach(function(a){if(a.parentElement!==panel)panel.appendChild(a);});
        }
    }

    if(questions.length>0&&answers.length>0){
        questions[0].classList.add("active");
        answers[0].classList.add("active");
    }
    reorder();
    window.addEventListener("resize",reorder);

    questions.forEach(function(q){
        q.addEventListener("click",function(){
            const idx=parseInt(q.getAttribute("data-index"));
            if(q.classList.contains("active")){
                q.classList.remove("active");
                const a=getAnswer(idx);
                if(a)a.classList.remove("active");
            } else {
                questions.forEach(function(x){x.classList.remove("active");});
                answers.forEach(function(x){x.classList.remove("active");});
                q.classList.add("active");
                const a=getAnswer(idx);
                if(a)a.classList.add("active");
            }
        });
    });
}

// Start everything — use both DOMContentLoaded and a direct call in case DOM is already ready
function startApp(){
    updateProgressBar(false);
    initVoteFeed();
    initFAQ();
}

if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", startApp);
} else {
    startApp();
}
