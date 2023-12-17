'use strict'

let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";
let globalActiveHabbitId;

const page = {
    menu: document.querySelector('.menu__list'),
    headerTitle: document.querySelector('.header_title'), 
    progressPrecent: document.querySelector('.progress__percent'),
    progressCoverBar: document.querySelector('.progress__cover-bar'),
    habbitsContainer: document.querySelector('.habbits__container')
}

//utils  

function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

//render 

function reRenderMenu(activeHabbit) {

    for (const habbit of habbits) {

        const exited = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);

        if (!exited) {
            const element = document.createElement('button');
            element.setAttribute("menu-habbit-id", habbit.id);
            element.classList.add('menu__item');

            element.addEventListener('click', () => rerender(habbit.id));
            
            if (habbit.id == activeHabbit.id) {
                element.classList.add('menu__item--active');
            }
            element.innerHTML = `<img src="/images/${habbit.icon}.svg" alt="${habbit.name}">
                                <button class="delete__habbit">
                                <img src="./images/deleteHabbit.svg" alt="" onclick="deleteHabbit(this)">
                                </button>`
            page.menu.appendChild(element);

            continue;
        }

        if (habbit.id == activeHabbit.id) {
            exited.classList.add('menu__item--active');
        } else {
            exited.classList.remove('menu__item--active');
        }
    }
}


function renderHead(activeHabbit) {

    const percent = (activeHabbit.days.length / activeHabbit.target) * 100 > 100 
        ? 100
        : (activeHabbit.days.length / activeHabbit.target) * 100;

    page.progressPrecent.innerHTML = `${percent.toFixed(0)}%`;
    page.progressCoverBar.style.width = `${percent.toFixed(0)}%`;

    page.headerTitle.innerHTML = activeHabbit.name;
}

function createNewDay(countDay) {
    const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `
            <div class="habbit__day">День ${countDay}</div>
            <form class="habbit__form" onsubmit="addDays(event)">
                <input name="comment" class="input" type="text" placeholder="Комментарий">
                <img class="input__icon" src="./images/comment.svg" alt="comment">
                <button class="habbit__done" type="submit">
                    Готово
                </button>
            </form>
        `
    page.habbitsContainer.appendChild(element);
}


function renderContent(activeHabbit) {

    page.habbitsContainer.innerHTML = ''

    let countDay = 1;

    for (const day of activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `
            <div class="habbit__day">День ${countDay}</div>
            <div class="habbit__comment">${day.comment}</div>
            <button class="habbit__delete" onclick="delDay(${countDay - 1})">
                <img src="./images/delete.svg" alt="Удалить день ${countDay}">
            </button>
        `
        page.habbitsContainer.appendChild(element);
        countDay++
    }
    createNewDay(countDay);

}

function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId;
    console.log(`set ${activeHabbitId}`)
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);

    if (!activeHabbit) {
        return;
    }

    document.location.hash = `#${activeHabbitId}`

    reRenderMenu(activeHabbit);
    renderHead(activeHabbit);
    renderContent(activeHabbit)

}


//days

function addDays(event) {
    event.preventDefault();
    
    const form = event.target;

    const data = new FormData(form);
    const comment = data.get('comment');

    form['comment'].classList.remove('error');

    if (!comment) {
        form['comment'].classList.add('error');
        return;
    }

    habbits = habbits.map(habbit => {
        if (habbit.id == globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{comment}])
            }
            
        }
        return habbit;
    })
    console.log(habbits, globalActiveHabbitId)
    form['comment'].value = '';
    rerender(globalActiveHabbitId);

    saveData();

}


function delDay(day) {

    habbits = habbits.map(habbit => {
        if (habbit.id == globalActiveHabbitId) {
            habbit.days.splice(day, 1);
            return habbit;
        }
        return habbit;
    })


    // const day = event.target.alt.split(' ').at(-1);
    // habbits[globalActiveHabbitId - 1].days.splice(day - 1, 1)

    rerender(globalActiveHabbitId);
    saveData(); 


}

//popap

function togglePopap() {
    const element = document.querySelector('#cover');
    element.classList.toggle('cover');
    element.classList.toggle('cover__hidden');
}

function setIcon(context, icon) {
    document.querySelector('.popap__form input[name="icon"]').value = icon;
    const activeIcon = document.querySelector('.icon__select>.menu__item--active');
    activeIcon.classList.remove('menu__item--active');
    context.classList.add('menu__item--active');
}

function valid(form) {
    let done = true
    for (let input of form) {

        if (input[1] == '' && input[0] != 'icon') {
            document.querySelector(`.input[name="${input[0]}"]`).classList.add('error') 
            done = false;

        }
        else {
            document.querySelector(`.input[name="${input[0]}"]`).classList.remove('error')
        }
    }
    return done;
}

function clearForm(form) {
    for (const input of form.keys()) {
        if (input != 'icon') {
            form[input] = ''
        }
    }
}

function addHabbit(event) {
    event.preventDefault();
    const form = new FormData(event.target);

    let done = false

    if (!valid(form.entries())) {
        return;
    }
    
    habbits.push( {
        "id": habbits.length + 1,
        "icon": form.get('icon'),
        "name": form.get('name'),
        "target": form.get('target'),
        "days": []
    })

    saveData();
    clearForm(form);
    togglePopap();
    rerender(habbits.length);
    
}

function deleteHabbit(elem) {
    const thisHabbit = elem.parentNode.parentNode

    const thisHabbitid = thisHabbit.getAttribute('menu-habbit-id')
    habbits.splice(thisHabbitid - 1, 1);
    let count = 1;
    habbits.map(habbit => {
        habbit.id = count;
        count++
    })

    page.menu.innerHTML = '';
    document.location.hash = '';
    globalActiveHabbitId -= 1;
    rerender(globalActiveHabbitId);
    saveData();
    
}


// init

(() => {
    loadData();
    const urlId = document.location.hash.slice(1);
    rerender(Number(urlId) || 1)
})();